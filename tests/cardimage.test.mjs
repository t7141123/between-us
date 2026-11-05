import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCardSvg, charUnits, escapeXml, wrapLines } from '../src/services/cardImageCore.ts';

const style = { bg: '#FAF6F0', ink: '#2C2523', accent: '#C4704F', sub: '#78716C', border: 'rgba(0,0,0,.1)' };

test('charUnits treats CJK as double width', () => {
  assert.equal(charUnits('a'), 1);
  assert.equal(charUnits('你'), 2);
  assert.equal(charUnits('？'), 2);
});

test('wrapLines never exceeds the width and keeps all characters (CJK)', () => {
  const text = '如果必須立刻削減百分之二十的月支出，你最願意先砍掉哪一部分？';
  const lines = wrapLines(text, 20);
  assert.ok(lines.every((l) => [...l].reduce((n, c) => n + charUnits(c), 0) <= 22), 'hanging punctuation may overhang by one character');
  assert.equal(lines.join(''), text);
});

test('wrapLines breaks latin text at spaces and keeps words intact', () => {
  const lines = wrapLines('What is one thing you would love us to try together this year', 24);
  assert.ok(lines.every((l) => l.length <= 24));
  assert.equal(lines.join(' '), 'What is one thing you would love us to try together this year');
  assert.deepEqual(wrapLines('', 10), []);
});

test('escapeXml and a complete, well-formed svg', () => {
  assert.equal(escapeXml(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;');
  const svg = buildCardSvg({ text: 'Is this <b>bold</b> & fine?', label: 'FUN', footer: 'Between Us', style });
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
  assert.ok(svg.includes('&lt;b&gt;') && svg.includes('&amp;'), 'markup characters are escaped');
  assert.ok(!svg.includes('<b>'));
  const long = buildCardSvg({ text: '字'.repeat(600), label: 'L', footer: 'F', style });
  assert.ok((long.match(/<text /g) || []).length <= 18 + 3, 'long text is clipped to a bounded number of lines');
});

test('latin words are never split and closing punctuation never starts a line', () => {
  const lines = wrapLines('在你看來，『親密感（Intimacy）』是否只有在臥室裡才成立？日常對話中哪種交流能帶給你同等強烈的親密感？', 20);
  assert.ok(lines.some((l) => l.includes('Intimacy')), 'Intimacy stays in one piece');
  assert.ok(lines.every((l) => ![...'，。、；：！？）」』'].includes(l[0])), `no line starts with closing punctuation: ${JSON.stringify(lines)}`);
  assert.equal(wrapLines('supercalifragilistic', 8).join(''), 'supercalifragilistic', 'over-long words are split, never lost');
});
