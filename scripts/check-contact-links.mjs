import fs from 'node:fs';
import assert from 'node:assert/strict';

const contactHtml = fs.readFileSync('contact.html', 'utf-8');

const linkedinHref = 'https://www.linkedin.com/in/dr-prema-k-b28a0882/';
const linkedInBlockMatch = contactHtml.match(/<p>LinkedIn<\/p>[\s\S]*?<h3[\s\S]*?Dr Prema K\.[\s\S]*?<div class="cs_social_btns cs_style_1">[\s\S]*?<\/div>/);

assert.ok(linkedInBlockMatch, 'Contact page should keep the LinkedIn contact block');

const linkedInBlock = linkedInBlockMatch[0];
const linkMatches = [...linkedInBlock.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);

assert.equal(linkMatches.length, 2, 'Dr Prema K. and the LinkedIn icon should each be clickable');

for (const link of linkMatches) {
  assert.match(link, new RegExp(`href="${linkedinHref}"`), 'LinkedIn links should use Dr Prema K. profile URL');
  assert.match(link, /target="_blank"/, 'LinkedIn links should open in a new tab');
  assert.match(link, /rel="noopener noreferrer"/, 'LinkedIn links should use safe external-link rel attributes');
}

assert.doesNotMatch(contactHtml, /replace-with-prema-k-profile|TODO: Replace placeholder LinkedIn URL/, 'Placeholder LinkedIn URL and comment should be removed');

console.log('Contact LinkedIn link checks passed.');
