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
    if (['service', 'project', 'article', 'member'].some(key => params.has(key))) {
      document.title = `${title} | Elvaron`;
    }
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
  if (document.querySelector('.team-profile-page')) {
    const people = [
      ['Jordan Ellis', 'Creative Director', 1, 'I connect ambitious ideas with a clear creative direction, helping brands find their voice and turn it into experiences people remember.'],
      ['Maya Chen', 'Brand Strategist', 2, 'I help teams find the story at the heart of their brand, connecting audience understanding with a position that feels clear, relevant, and distinctive.'],
      ['Samira Patel', 'Digital Designer', 5, 'I turn complex ideas into approachable digital experiences, balancing visual craft with the everyday needs of the people who use them.'],
      ['Leo Martinez', 'Motion Designer', 6, 'I bring stories to life through movement, using rhythm, detail, and thoughtful transitions to give brands an expressive digital presence.'],
      ['Avery Brooks', 'Growth Strategist', 3, 'I connect audience insight with practical experiments, helping teams identify opportunities and build a clearer path toward sustainable growth.'],
      ['Nina Okafor', 'Content Lead', 4, 'I help brands communicate with clarity and personality, shaping useful content that connects a strong idea with the people it needs to reach.'],
      ['Theo Bennett', 'Paid Media Specialist', 7, 'I bring a curious, considered approach to paid media, connecting creative ideas with audience insights and learning from every campaign.'],
      ['Lena Fischer', 'Client Partnerships Lead', 8, 'I make collaboration feel clear and connected, bringing the right people together and keeping every conversation focused on what matters to the project.'],
    ];
    const person = people[index('member')] || people[0];
    document.querySelectorAll('[data-profile-name]').forEach(element => { element.textContent = person[0]; });
    setText('[data-profile-role]', person[1]);
    setText('[data-profile-bio]', person[3]);
    const portrait = document.querySelector('[data-profile-image]');
    portrait.src = new URL(`../../assets/images/team/${person[2]}.webp`, import.meta.url).href;
    portrait.alt = person[0] + ', ' + person[1];
    document.title = person[0] + ' - ' + person[1] + ' | Elvaron';
    const description = 'Meet ' + person[0] + ', ' + person[1] + ' at Elvaron. Explore their perspective on creative work, thoughtful design, and collaborative projects.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }
}
