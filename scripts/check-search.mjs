import fs from 'node:fs';
import assert from 'node:assert/strict';

const js = fs.readFileSync('public/assets/js/main.js', 'utf-8');
const css = fs.readFileSync('public/assets/css/style.css', 'utf-8');
const scss = fs.readFileSync('public/assets/sass/common/_header.scss', 'utf-8');
const sourceHtml = fs.readFileSync('index.html', 'utf-8');

assert.match(js, /function\s+headerSearch\(\)/, 'headerSearch() should exist');
assert.match(js, /focusSearch\(/, 'Clicking the search icon should focus/expand the search field');
assert.match(js, /cs_search_active/, 'Search should expose an active state for styling');
assert.match(js, /No results found/, 'Empty search results should use the requested message');
assert.match(js, /strategy transformation/, 'Static search should include service and page keywords');

assert.match(css, /\.cs_header_search_form\.cs_search_active[\s\S]*?\.cs_header_search_field/, 'Compiled CSS should expand active search fields');
assert.match(scss, /&\.cs_search_active[\s\S]*?\.cs_header_search_field/, 'Source SCSS should define active search field styling');
assert.doesNotMatch(js, /find\('\.cs_toolbox'\)[\s\S]*?addClass\('cs_has_main_nav'\)/, 'Mobile code should not hide the toolbox search');
assert.doesNotMatch(scss, /\.cs_toolbox\.cs_has_main_nav/, 'Mobile CSS should not target the toolbox search as hidden navigation');

assert.match(sourceHtml, /<form action="#" class="cs_header_search_form">/, 'Navbar search form should stay in the source page');
assert.doesNotMatch(sourceHtml, /cs_main_header_right\s*\{\s*display:\s*none;/, 'Homepage mobile CSS should not hide navbar search');

console.log('Search regression checks passed.');
