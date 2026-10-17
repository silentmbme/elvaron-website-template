import { services, projects, posts } from '../utils/page-data.js';
export function initPageContent() {
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  const params = new URLSearchParams(location.search);
  const index = key => { const raw = params.get(key); return raw !== null && /^\d+$/.test(raw) ? Number(raw) : 0; };
  const setTitle = title => {
    setText('.page-hero h1', title);
    setText('.breadcrumb-item.active', title);
    document.title = `${title} â€” Elvaron`;
  };
  if (location.pathname.endsWith('/service-details.html')) {
    const service = services[index('service')] || services[0];
    setTitle(service[1]);
    setText('#service-title', service[1]);
    setText('#service-summary', service[2]);
    setText('.page-hero .container > p:last-child', service[2]);
  }
  if (/\/(case-study|portfolio)-details\.html$/.test(location.pathname)) {
    const project = projects[index('project')] || projects[0];
    setTitle(project[1]);
    setText('.page-hero .container > p:last-child', project[3]);
    const img = document.querySelector('.detail-image img');
    if (img) img.src = new URL(`../../assets/images/${project[0]}.webp`, import.meta.url).href;
    if (img) img.alt = project[1] + ' from the Elvaron collection';
  }
  if (location.pathname.endsWith('/blog-details.html')) {
    const post = posts[index('article')] || posts[0];
    setTitle(post[1]);
    setText('.prose h2', post[1]);
    setText('.prose .lead', post[3]);
  }
  if (location.pathname.endsWith('/team-details.html')) {
    const people = [['The Elvaron team','Product curator'],['Elvaron curator','Collection designer'],['Elvaron designer','Customer experience']];
    const person = people[index('member')] || people[0];
    setTitle(person[0]);
    const eyebrow = document.querySelector('.page-hero .eyebrow');
    if (eyebrow?.lastChild) eyebrow.lastChild.textContent = person[1].toUpperCase();
    setText('.prose > p', `${person[0]} helps shape the Elvaron collection with attention to useful design, considered details, and everyday comfort.`);
  }
}
