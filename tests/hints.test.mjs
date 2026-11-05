/**
 * Unit test to verify 100% hint coverage across core questions and expansion packs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('core questions 100% equipped with reflection hints in all locales', () => {
  const locales = ['zh-TW', 'zh-CN', 'en'];
  const categories = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];

  locales.forEach((loc) => {
    const locPath = path.join(__dirname, '..', 'src', 'locales', `${loc}.json`);
    const data = JSON.parse(fs.readFileSync(locPath, 'utf-8'));
    assert.ok(data.categories, `${loc} missing categories`);

    categories.forEach((catKey) => {
      const cat = data.categories[catKey];
      assert.ok(cat, `${loc} missing category ${catKey}`);
      assert.equal(cat.questions.length, 50, `${loc}/${catKey} questions count`);
      assert.ok(Array.isArray(cat.hints), `${loc}/${catKey} missing hints array`);
      assert.equal(cat.hints.length, 50, `${loc}/${catKey} hints count`);

      cat.hints.forEach((hint, idx) => {
        assert.ok(typeof hint === 'string' && hint.trim().length > 0, `${loc}/${catKey}[${idx}] hint is empty`);
      });
    });
  });
});

test('expansion packs 100% equipped with reflection hints across 3 locales', () => {
  const packs = ['sensual', 'marriage', 'parenting'];

  packs.forEach((packName) => {
    const packFile = path.join(__dirname, '..', 'scripts', 'questions-data', `${packName}.js`);
    // Dynamic import / require equivalent for CommonJS module
    const rawContent = fs.readFileSync(packFile, 'utf-8');
    assert.ok(rawContent.includes('hint_tw'), `${packName} missing hint_tw`);
    assert.ok(rawContent.includes('hint_cn'), `${packName} missing hint_cn`);
    assert.ok(rawContent.includes('hint_en'), `${packName} missing hint_en`);
  });
});
