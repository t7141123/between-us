/**
 * Locale and Question Bank Validator
 * Ensures 2100 questions (3 locales x 7 categories x 100 questions)
 * Validates length, punctuation, formatting, and banned sensitive words.
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['zh-TW', 'zh-CN', 'en'];
const CATS = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];
const BANNED = ['末日', '超能力', '荒島', '平行宇宙', '轉世', '時光機', '外星', '魔法', '平行世界', '丧尸', '僵尸'];

const localesDir = path.join(__dirname, '..', 'src', 'locales');
let errors = [];
let totalQuestions = 0;

LOCALES.forEach((loc) => {
  const filePath = path.join(localesDir, `${loc}.json`);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing locale file: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data.ui) {
    errors.push(`${loc}: Missing ui translations`);
  }
  if (!data.categories) {
    errors.push(`${loc}: Missing categories`);
    return;
  }

  const seen = new Set();
  let locTotal = 0;

  CATS.forEach((catKey) => {
    const cat = data.categories[catKey];
    if (!cat) {
      errors.push(`${loc}: Missing category ${catKey}`);
      return;
    }

    if (!Array.isArray(cat.questions)) {
      errors.push(`${loc}/${catKey}: questions is not an array`);
      return;
    }

    if (cat.questions.length !== 100) {
      errors.push(`${loc}/${catKey}: Expected 100 questions, got ${cat.questions.length}`);
    }

    cat.questions.forEach((q, idx) => {
      if (typeof q !== 'string') {
        errors.push(`${loc}/${catKey}[${idx}]: Question is not string`);
        return;
      }

      locTotal += 1;
      totalQuestions += 1;

      BANNED.forEach((bad) => {
        if (q.includes(bad)) {
          errors.push(`${loc}/${catKey}: Contains banned word "${bad}": ${q}`);
        }
      });

      if (seen.has(q)) {
        errors.push(`${loc}/${catKey}: Duplicate question: ${q}`);
      }
      seen.add(q);

      if (!q.endsWith('？') && !q.endsWith('。') && !q.endsWith('?') && !q.endsWith('.')) {
        errors.push(`${loc}/${catKey}: Question missing trailing punctuation: ${q}`);
      }

      const maxLen = loc === 'en' ? 140 : 60;
      if (q.length < 6 || q.length > maxLen) {
        errors.push(`${loc}/${catKey}: Question length out of range (${q.length}): ${q}`);
      }
    });
  });

  console.log(`  ✓ ${loc} (${data.label}): ${locTotal} questions across 7 categories`);
});

console.log(`Total questions verified: ${totalQuestions}`);
if (totalQuestions !== 2100) {
  errors.push(`Total questions should be 2100, got ${totalQuestions}`);
}

if (errors.length > 0) {
  console.error('\n❌ Locale validation failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\n✅ Locale validation passed: 3 locales x 7 categories x 100 questions = 2100 total questions.\n');
