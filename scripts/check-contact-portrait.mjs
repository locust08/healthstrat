import fs from 'node:fs';
import assert from 'node:assert/strict';

const contactHtml = fs.readFileSync('contact.html', 'utf-8');

const portraitImageMatch = contactHtml.match(
  /<div class="cs_half_white">[\s\S]*?<div class="container">[\s\S]*?<img src="\/assets\/img\/for_ain_extracted_images\/healthstrat_extracted_images\/dr-prema-contact-landscape\.png" alt="Dr Prema K\." class="cs_radius_50_50_0_0" style="[^"]*width:\s*100%;[^"]*aspect-ratio:\s*1672 \/ 941;[^"]*height:\s*auto;[^"]*object-fit:\s*cover;[^"]*object-position:\s*center center;[^"]*">[\s\S]*?<\/div>[\s\S]*?<\/div>/,
);

assert.ok(portraitImageMatch, 'Contact image should use Dr Prema K. landscape portrait in the original Bione contact image area');
assert.doesNotMatch(
  contactHtml,
  /cs_contact_portrait_card/,
  'Contact image should not use the portrait-card wrapper when matching the Bione contact image size',
);
assert.doesNotMatch(
  contactHtml,
  /<img src="assets\/img\/healthstrat\/generated\/global-contact-consultation\.png" alt="Contact" class="cs_radius_50_50_0_0">/,
  'Contact hero image should no longer use the generic consultation image',
);

console.log('Contact portrait image checks passed.');
