const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:4321';

const pages = [
  '/',
  '/about/',
  '/expertise/',
  '/health-care-strategy-transformation/',
  '/clinical-governance-quality/',
  '/nursing-workforce-development/',
  '/innovation-design-thinking/',
  '/education-training/',
];

const servicePages = new Set([
  '/health-care-strategy-transformation/',
  '/clinical-governance-quality/',
  '/nursing-workforce-development/',
  '/innovation-design-thinking/',
  '/education-training/',
]);
const expertisePages = new Set(['/expertise/']);

const expectedButtons = [
  {
    label: 'Book a Strategy Discussion',
    href: 'contact.html',
    classes: ['cs_healthstrat_final_cta_btn', 'cs_healthstrat_final_cta_primary', 'cs_w_100_sm'],
    icons: ['fa-regular fa-calendar-days', 'fa-solid fa-arrow-right'],
  },
  {
    label: 'WhatsApp Us',
    href: 'https://wa.me/6591176220',
    classes: ['cs_healthstrat_final_cta_btn', 'cs_healthstrat_final_cta_whatsapp', 'cs_w_100_sm'],
    icons: ['fa-brands fa-whatsapp'],
  },
];

const expectedExpertiseButtons = [
  {
    label: 'Book a Strategy Discussion',
    href: 'contact.html',
    classes: ['cs_healthstrat_expertise_cta_btn', 'cs_healthstrat_expertise_cta_primary'],
    icons: ['fa-regular fa-calendar-days', 'fa-solid fa-arrow-right'],
  },
  {
    label: 'WhatsApp Us',
    href: 'https://wa.me/6591176220',
    classes: ['cs_healthstrat_expertise_cta_btn', 'cs_healthstrat_expertise_cta_secondary'],
    icons: ['fa-brands fa-whatsapp'],
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function finalCta(html, page) {
  const footerIndex = html.search(/<footer\b/i);
  assert(footerIndex !== -1, `${page}: footer not found`);

  const beforeFooter = html.slice(0, footerIndex);
  const marker = '<!-- Start CTA Section -->';
  const markerIndex = beforeFooter.lastIndexOf(marker);
  assert(markerIndex !== -1, `${page}: final CTA marker not found`);

  return beforeFooter.slice(markerIndex);
}

function anchors(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    attrs: match[1],
    body: match[2],
  }));
}

function attr(attrs, name) {
  return attrs.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] || '';
}

function text(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasIcon(html, icon) {
  return [...html.matchAll(/<i\b([^>]*)>/gi)].some((match) => {
    const classes = attr(match[1], 'class').split(/\s+/);
    return icon.split(' ').every((className) => classes.includes(className));
  });
}

for (const page of pages) {
  const response = await fetch(new URL(page, baseUrl));
  assert(response.ok, `${page}: expected HTTP 200, got ${response.status}`);

  const html = await response.text();
  const cta = finalCta(html, page);
  const expectedPageButtons = expertisePages.has(page) ? expectedExpertiseButtons : expectedButtons;
  const ctaAnchors = anchors(cta).filter((anchor) =>
    expectedPageButtons.some((button) => text(anchor.body) === button.label),
  );
  const actionsClass = cta.match(/<div class="([^"]*\bcs_healthstrat_cta_actions\b[^"]*)">/i)?.[1] || '';
  const hasServiceStyles =
    /\.cs_healthstrat_service_cta_actions\s*{[^}]*flex-direction:\s*column/i.test(html) &&
    /\.cs_healthstrat_service_cta_actions\s*{[^}]*align-items:\s*center/i.test(html) &&
    /\.cs_healthstrat_service_cta_actions\s+\.cs_healthstrat_final_cta_primary\s*{[^}]*width:\s*100%/i.test(html) &&
    /\.cs_healthstrat_service_cta_actions\s+\.cs_healthstrat_final_cta_whatsapp\s*{[^}]*width:\s*auto/is.test(html);
  const hasExpertiseStyles =
    /\.cs_healthstrat_expertise_cta_actions\s*{[^}]*justify-content:\s*flex-start/i.test(html) &&
    /\.cs_healthstrat_expertise_cta_actions\s*{[^}]*flex-wrap:\s*nowrap/i.test(html) &&
    /\.cs_healthstrat_expertise_cta_btn\s*{[^}]*min-height:\s*56px[^}]*white-space:\s*nowrap/is.test(html) &&
    /\.cs_cta\.cs_style_3\.cs_expertise_cta::before\s*{[^}]*rgba\(0,\s*59,\s*113,\s*0\.68\)/is.test(html) &&
    /\.cs_healthstrat_expertise_cta_primary\s*{[^}]*background:\s*#fff[^}]*color:\s*#003b71/is.test(html) &&
    /\.cs_healthstrat_expertise_cta_secondary\s*{[^}]*background:\s*#2f9f44[^}]*color:\s*#fff/is.test(html) &&
    /\.cs_healthstrat_expertise_cta_arrow\s*{[^}]*color:\s*#60a030/i.test(html) &&
    !/\bcs_healthstrat_expertise_cta_actions[\s\S]*\bcs_healthstrat_final_cta_whatsapp\b/i.test(cta);

  assert(ctaAnchors.length === 2, `${page}: expected 2 CTA buttons, got ${ctaAnchors.length}`);
  assert(
    servicePages.has(page) === actionsClass.split(/\s+/).includes('cs_healthstrat_service_cta_actions'),
    `${page}: service CTA stacking class mismatch`,
  );
  assert(
    servicePages.has(page) === hasServiceStyles,
    `${page}: service CTA stacked style mismatch`,
  );
  assert(
    expertisePages.has(page) === actionsClass.split(/\s+/).includes('cs_healthstrat_expertise_cta_actions'),
    `${page}: expertise CTA horizontal class mismatch`,
  );
  assert(
    expertisePages.has(page) === hasExpertiseStyles,
    `${page}: expertise CTA horizontal style mismatch`,
  );

  expectedPageButtons.forEach((button, index) => {
    const anchor = ctaAnchors[index];
    const classes = attr(anchor.attrs, 'class').split(/\s+/);

    assert(text(anchor.body) === button.label, `${page}: button ${index + 1} label mismatch`);
    assert(attr(anchor.attrs, 'href') === button.href, `${page}: ${button.label} href mismatch`);

    for (const className of button.classes) {
      assert(classes.includes(className), `${page}: ${button.label} missing class ${className}`);
    }

    for (const icon of button.icons) {
      assert(hasIcon(anchor.body, icon), `${page}: ${button.label} missing icon ${icon}`);
    }
  });
}

console.log(`CTA buttons verified on ${pages.length} pages.`);
