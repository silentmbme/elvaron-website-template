import { compileString } from 'sass';
import { defineConfig, normalizePath, build as buildStandalone } from 'vite';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
// Shared HTML includes are expanded here during development and production builds.
const includePattern = /<include\s+src="([^"]+)"([^>]*)>\s*<\/include>/g;

function expandPartials(html, root, stack = [], dependencies = new Set()) {
  return html.replace(includePattern, (_, source, attributes) => {
    const file = resolve(root, source);
    const path = relative(root, file);
    if (isAbsolute(path) || path.startsWith('..')) throw new Error(`Partial outside project: ${source}`);
    if (stack.includes(file)) throw new Error(`Circular HTML partial: ${source}`);
    dependencies.add(file);
    const values = Object.fromEntries([...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
    const partial = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/{{\s*([\w-]+)\s*}}/g, (_, key) => {
      if (!(key in values)) throw new Error('Missing include value: ' + key + ' in ' + source);
      return values[key];
    });
    return expandPartials(partial, root, [...stack, file], dependencies);
  });
}

function htmlPartials(root) {
  return {
    name: 'sramanova-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const dependencies = new Set();
        const expanded = expandPartials(html, root, [], dependencies);
        return expanded;
      },
    },
    configureServer(server) {
      server.watcher.add(resolve(root, 'html/partials'));
    },
    handleHotUpdate({ file, server }) {
      if (relative(resolve(root, 'html/partials'), file).startsWith('..')) return;
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

const root = fileURLToPath(new URL('.', import.meta.url));
const htmlRoot = resolve(root, 'html');

// Page HTML lives in html/. Shared partials are not standalone entry pages.
function discoverPages(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'partials' ? [] : discoverPages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const pages = discoverPages(htmlRoot);

// In development, expose the existing source assets outside the HTML root.
// Production resolves the same /src paths through the alias below.
function sourceAssets() {
  return {
    name: 'sramanova-source-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.startsWith('/src/')) {
          request.url = `/@fs/${normalizePath(resolve(root))}${request.url}`;
        }
        next();
      });
    },
  };
}


// Remove unused vendor icon mappings while retaining every icon named in source.
function usedIconStyles(enabled = true) {
  const collect = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) return collect(file);
    if (!/\.(html|js|scss)$/.test(entry.name) || file.includes('_remix-icons.scss')) return [];
    return [readFileSync(file, 'utf8')];
  });
  const source = [...collect(htmlRoot), ...collect(resolve(root, 'src'))].join('\n');
  return {
    postcssPlugin: 'elvaron-used-icons',
    Rule(rule) {
      if (!enabled) return;
      const icon = rule.selector.match(/^\.ri-([a-z0-9-]+)::?before$/);
      if (icon && !source.includes(icon[1])) rule.remove();
      // Bootstrap generates utility values at every breakpoint; retain the ones used in source.
      const utility = rule.selector.match(/^\.((?:(?:m|p)[trblxyse]?|gap|row-gap|column-gap|col|offset|row-cols|d|order)(?:-(?:sm|md|lg|xl|xxl))?-(?:auto|none|block|inline|inline-block|flex|inline-flex|grid|table|table-row|table-cell|[0-9]+))$/);
      if (utility && !source.includes(utility[1])) rule.remove();
    },
  };
}


// Keep the production folder self-contained, including assets expanded from partials.
function portableBuild() {
  return {
    name: 'elvaron-portable-build',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const assets = new Map();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.html')) continue;
        output.source = String(output.source)
          .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, tag => tag.replace(/\s+crossorigin(?:="[^"]*")?/g, ''))
          .replace(/(["'])\/src\/assets\/([^"']+)\1/g, (match, quote, assetPath) => {
            if (assetPath.includes('..') || /[?#]/.test(assetPath)) return match;
            if (!assets.has(assetPath)) {
              const file = resolve(root, 'src/assets', assetPath);
              const reference = this.emitFile({ type: 'asset', name: assetPath.split('/').pop(), source: readFileSync(file) });
              assets.set(assetPath, this.getFileName(reference));
            }
            return quote + './' + assets.get(assetPath) + quote;
          })
          .replace(/href="\/([^"#?]*\.html(?:[?#][^"]*)?)"/g, 'href="./$1"');
      }
    },
  };
}


// File previews cannot execute ES modules; provide a classic-script fallback.
function directFilePreview() {
  return {
    name: 'elvaron-direct-file-preview',
    apply: 'build',
    async closeBundle() {
      await buildStandalone({
        configFile: false,
        root: htmlRoot,
        base: './',
        publicDir: false,
        resolve: { alias: { '/src': resolve(root, 'src') } },
        css: {
          postcss: { plugins: [usedIconStyles()] },
          preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions'] } },
        },
        build: {
          outDir: resolve(root, 'dist'),
          emptyOutDir: false,
          cssCodeSplit: false,
          lib: { entry: resolve(root, 'src/js/main.js'), name: 'Elvaron', formats: ['iife'], fileName: () => 'assets/standalone.js', cssFileName: 'assets/standalone' },
          rollupOptions: { output: { inlineDynamicImports: true } },
        },
      });
      for (const page of pages) {
        const file = resolve(root, 'dist', relative(htmlRoot, page));
        let html = readFileSync(file, 'utf8');
        html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, source) => {
          const moduleTag = '<script type="module" src="' + source + '"><' + '/script>';
          const classicTags = '<script defer src="./assets/standalone.js"><' + '/script>';
          return '<script>document.write(location.protocol === "file:" ? ' + JSON.stringify(classicTags).replaceAll('</', '<\\/') + ' : ' + JSON.stringify(moduleTag).replaceAll('</', '<\\/') + ');<' + '/script>';
        });
        const conditionalTag = (condition, tag) => '<script>if (' + condition + ') document.write(' + JSON.stringify(tag).replaceAll('</', '<\\/') + ');<' + '/script>';
        html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, tag => {
          if (tag.includes('data-loader-styles')) return tag;
          const portable = '<link rel="stylesheet" href="./assets/standalone.css">';
          const hostedHref = tag.match(/href="([^"]+)"/)[1];
          return '<script>window.elvaronStylesReady = new Promise(function(resolve) { var link = document.createElement("link"); link.rel = "stylesheet"; link.href = location.protocol === "file:" ? "./assets/standalone.css" : ' + JSON.stringify(hostedHref) + '; link.onload = resolve; link.onerror = resolve; document.head.appendChild(link); });<' + '/script><noscript>' + tag + '</noscript>';
        });
        html = html.replace(/<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*>/g, tag => conditionalTag('location.protocol !== "file:"', tag));
        writeFileSync(file, html);
      }
    },
  };
}


// Generate the small startup stylesheet from its single SCSS source.
function loaderStyles() {
  const source = resolve(root, 'src/scss/components/_loader.scss');
  const compile = () => writeFileSync(resolve(root, 'public/assets/loader.css'), compileString(readFileSync(source, 'utf8'), { style: 'compressed' }).css);
  return {
    name: 'elvaron-loader-styles',
    configResolved: compile,
    configureServer(server) {
      server.watcher.on('change', file => { if (resolve(file) === source) compile(); });
    },
  };
}

export default defineConfig(({ command }) => ({
  root: htmlRoot,
  publicDir: resolve(root, 'public'),
  base: './',
  plugins: [loaderStyles(), sourceAssets(), htmlPartials(root), portableBuild(), directFilePreview()],
  resolve: { alias: { '/src': resolve(root, 'src') } },
  server: { fs: { allow: [root] } },
  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((path) => [relative(htmlRoot, path).replace(/\\/g, '/').replace(/\.html$/, ''), path])),
    },
  },
  css: {
    postcss: { plugins: [usedIconStyles(command === 'build')] },
    preprocessorOptions: {
      // Bootstrap 5 uses the legacy Sass import API. Keep local warnings visible.
      scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'] },
    },
  },
}));
