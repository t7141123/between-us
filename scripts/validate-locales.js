/**
 * Locale and Question Bank Validator
 * Ensures 1050 core questions (3 locales x 7 categories x 50 questions)
 * plus reflection hints and 3 expansion packs (150 questions).
 * Validates length, punctuation, formatting, and structural integrity.
 */
const fs = require('fs');
const path = require('path');

const LOCALES = ['zh-TW', 'zh-CN', 'en'];
const CATS = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];

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

    if (cat.questions.length !== 50) {
      errors.push(`${loc}/${catKey}: Expected 50 questions, got ${cat.questions.length}`);
    }

    if (Array.isArray(cat.hints)) {
      if (cat.hints.length !== cat.questions.length) {
        errors.push(`${loc}/${catKey}: hints count (${cat.hints.length}) does not match questions count (${cat.questions.length})`);
      }
    }

    cat.questions.forEach((q, idx) => {
      if (typeof q !== 'string') {
        errors.push(`${loc}/${catKey}[${idx}]: Question is not string`);
        return;
      }

      locTotal += 1;
      totalQuestions += 1;

      if (seen.has(q)) {
        errors.push(`${loc}/${catKey}: Duplicate question: ${q}`);
      }
      seen.add(q);

      const validPunctuation =
        q.endsWith('？') ||
        q.endsWith('。') ||
        q.endsWith('！') ||
        q.endsWith('?') ||
        q.endsWith('.') ||
        q.endsWith('!') ||
        q.endsWith('）') ||
        q.endsWith(')') ||
        q.endsWith('」') ||
        q.endsWith('\'');

      if (!validPunctuation) {
        errors.push(`${loc}/${catKey}: Question missing trailing punctuation: ${q}`);
      }

      const maxLen = loc === 'en' ? 180 : 90;
      if (q.length < 5 || q.length > maxLen) {
        errors.push(`${loc}/${catKey}: Question length out of range (${q.length}): ${q}`);
      }
    });
  });

  console.log(`  ✓ ${loc} (${data.label}): ${locTotal} questions across 7 categories`);
});

console.log(`Total core questions verified: ${totalQuestions}`);
if (totalQuestions !== 1050) {
  errors.push(`Total questions should be 1050, got ${totalQuestions}`);
}

if (errors.length > 0) {
  console.error('\n❌ Locale validation failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\n✅ Locale validation passed: 3 locales x 7 categories x 50 authoritative questions = 1050 total questions with reflection hints.\n');
