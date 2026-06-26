const fs = await import('node:fs');

const file = 'innovation-design-thinking.html';
const html = fs.readFileSync(file, 'utf-8');

const expectedCards = [
  {
    title: 'AI Integration in Clinical Workflows',
    src: '/assets/img/for_ain_extracted_images/healthstrat_extracted_images/innovation-design-thinking-replacement.webp',
  },
  {
    title: 'Design Thinking Workshops',
    src: '/assets/img/for_ain_extracted_images/healthstrat_extracted_images/page_12_image_02_xref_71.webp',
  },
  {
    title: 'Digital Health Strategy',
    src: '/assets/img/for_ain_extracted_images/healthstrat_extracted_images/page_15_image_02_xref_84.webp',
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const sources = [];

for (const card of expectedCards) {
  const titleIndex = html.indexOf(`<h3>${card.title}</h3>`);
  assert(titleIndex !== -1, `Missing card title: ${card.title}`);

  const beforeTitle = html.slice(Math.max(0, titleIndex - 900), titleIndex);
  const imgMatch = [...beforeTitle.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)].at(-1);
  assert(imgMatch, `Missing image before card title: ${card.title}`);
  assert(imgMatch[1] === card.src, `${card.title}: expected ${card.src}, got ${imgMatch[1]}`);
  assert(/\bcs_strategy_showcase_image\b/.test(beforeTitle), `${card.title}: image container changed`);
  sources.push(imgMatch[1]);
}

assert(new Set(sources).size === expectedCards.length, 'Innovation cards must use three distinct images');

console.log('Innovation card images verified.');
