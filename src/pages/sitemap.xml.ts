import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

const siteUrl = 'https://healthstrat.pages.dev';

const pages = [
  { file: 'index.html', url: '/', priority: '1.00' },
  { file: 'about.html', url: '/about', priority: '0.90' },
  { file: 'expertise.html', url: '/expertise', priority: '0.90' },
  { file: 'health-care-strategy-transformation.html', url: '/health-care-strategy-transformation', priority: '0.80' },
  { file: 'clinical-governance-quality.html', url: '/clinical-governance-quality', priority: '0.80' },
  { file: 'nursing-workforce-development.html', url: '/nursing-workforce-development', priority: '0.80' },
  { file: 'innovation-design-thinking.html', url: '/innovation-design-thinking', priority: '0.80' },
  { file: 'education-training.html', url: '/education-training', priority: '0.80' },
  { file: 'contact.html', url: '/contact', priority: '0.70' },
];

function getLastModifiedDate(file: string) {
  const filePath = path.join(process.cwd(), file);
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function GET() {
  const urls = pages
    .map(({ file, url, priority }) => {
      const loc = `${siteUrl}${url}`;
      const lastmod = getLastModifiedDate(file);

      return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
