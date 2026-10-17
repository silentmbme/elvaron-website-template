export function initBlogArticle() {
  const section = document.querySelector('[data-blog-article]');
  if (!section) return () => {};

  const progress = section.querySelector('.article-reading-progress span');
  const article = section.querySelector('.blog-details-copy');
  const headings = [...section.querySelectorAll('.blog-details-copy h3[id]')];
  const links = [...section.querySelectorAll('.article-toc a[href^="#"]')];
  let frame = 0;

  const updateProgress = () => {
    frame = 0;
    if (!progress || !article) return;
    const rect = article.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const distance = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
    const value = Math.min(100, Math.max(0, ((window.scrollY - start + 120) / distance) * 100));
    progress.style.transform = `scaleX(${value / 100})`;
  };
  const requestProgress = () => {
    if (!frame) frame = window.requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress);
  updateProgress();

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -68% 0px' })
    : null;
  headings.forEach(heading => observer?.observe(heading));

  const shareButton = section.querySelector('[data-article-share]');
  const shareStatus = section.querySelector('[data-article-share-status]');
  shareButton?.addEventListener('click', async () => {
    const shareData = { title: document.title, text: section.querySelector('h2')?.textContent?.trim(), url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareStatus.textContent = 'Story shared.';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        shareStatus.textContent = 'Link copied to clipboard.';
      } else {
        shareStatus.textContent = 'Copy this page link to share the story.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError') shareStatus.textContent = 'Sharing is unavailable right now.';
    }
  });

  section.querySelectorAll('[data-reply-name]').forEach(button => {
    button.addEventListener('click', () => {
      const textarea = section.querySelector('#comment-message');
      if (!textarea) return;
      const mention = `@${button.dataset.replyName} `;
      if (!textarea.value.startsWith(mention)) textarea.value = `${mention}${textarea.value}`;
      textarea.focus();
      textarea.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  const form = section.querySelector('#comment-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const preview = form.querySelector('.comment-preview');
    const name = form.querySelector('#comment-name').value.trim();
    const message = form.querySelector('#comment-message').value.trim();
    preview.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = `${name} | Preview only`;
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    preview.append(heading, paragraph);
    preview.hidden = false;
    form.querySelector('.form-status').textContent = 'Preview only. This comment has not been posted or saved.';
  });

  return () => {
    window.removeEventListener('scroll', requestProgress);
    window.removeEventListener('resize', requestProgress);
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
  };
}
