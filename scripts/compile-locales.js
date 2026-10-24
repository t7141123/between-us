// Script to compile modular questions data into src/locales/*.json files
const fs = require('fs');
const path = require('path');

const CATEGORIES = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];
const LOCALES = ['zh-TW', 'zh-CN', 'en'];

function main() {
  console.log('Loading modular category questions...');
  const categoryModules = {};
  for (const cat of CATEGORIES) {
    const modPath = path.resolve(__dirname, `questions-data/${cat}.js`);
    const rawList = require(modPath);
    if (!Array.isArray(rawList)) {
      throw new Error(`Expected array in ${modPath}`);
    }
    categoryModules[cat] = {
      'zh-TW': rawList.map((item, idx) => {
        if (!item.tw) throw new Error(`Missing tw at ${cat} index ${idx}`);
        return item.tw;
      }),
      'zh-CN': rawList.map((item, idx) => {
        if (!item.cn) throw new Error(`Missing cn at ${cat} index ${idx}`);
        return item.cn;
      }),
      'en': rawList.map((item, idx) => {
        if (!item.en) throw new Error(`Missing en at ${cat} index ${idx}`);
        return item.en;
      }),
    };
    console.log(`Loaded ${cat}:`, {
      'zh-TW': categoryModules[cat]['zh-TW'].length,
      'zh-CN': categoryModules[cat]['zh-CN'].length,
      'en': categoryModules[cat]['en'].length,
    });
  }

  for (const locale of LOCALES) {
    const localeFilePath = path.resolve(__dirname, `../src/locales/${locale}.json`);
    const raw = fs.readFileSync(localeFilePath, 'utf8');
    const data = JSON.parse(raw);

    for (const cat of CATEGORIES) {
      if (!data.categories[cat]) {
        throw new Error(`Category ${cat} missing in ${locale}.json`);
      }
      const newQuestions = categoryModules[cat][locale];
      if (!newQuestions || newQuestions.length !== 100) {
        throw new Error(`Category ${cat} in ${locale} does not have exactly 100 questions (has ${newQuestions?.length})`);
      }
      data.categories[cat].questions = newQuestions;
    }

    fs.writeFileSync(localeFilePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Successfully updated ${localeFilePath}`);
  }

  console.log('All locale files compiled successfully!');
}

main();
