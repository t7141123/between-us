# Between Us · 在我們之間

A couples conversation card deck: 2100 questions (3 languages × 700), 7 themes. Draw, flip, talk.

Zero-dependency single-file SPA (`index.html`), deployed on Cloudflare Pages, designed for couples, partners, and intimate relationships.

## Live URL
👉 https://love-between-us.pages.dev

## What is this project?

"Between Us" is a conversation card app designed for two-person relationships. It includes 2100 carefully written questions across three languages, 700 per language, covering 7 themes with 100 questions per category:

- **Values & Future** (100 per language) — future planning, life goals, family values
- **Heart & Emotions** (100 per language) — emotional needs, inner world, emotional connection
- **Family & Finance** (100 per language) — money mindset, budgeting, financial planning
- **Intimacy & Connection** (100 per language) — intimate relationships, romance, body and mind connection
- **Daily & Companionship** (100 per language) — leisure, shared interests, everyday moments
- **Growth & Conversation** (100 per language) — communication, conflict resolution, relationship growth
- **Christian Faith** (100 per language) — faith life, prayer, spiritual growth

Suitable for date nights, couples conversations, premarital counseling, or any occasion to deepen your relationship.

## Key Features

- **Multi-language switching**: Traditional Chinese, Simplified Chinese, English — both UI and question bank switch with language
- **Card flip**: Click cards to 3D flip; front shows question and number, back shows cover art and hint
- **Category filtering**: 7 theme chips, select individual themes or show all
- **Favorites**: Add favorite questions to favorites, persisted via localStorage
- **Question drawer**: Fuzzy search all questions, supports "Favorites only" filter, clicking auto-switches category
- **5-minute timer**: Window timer with end sound, for timed conversations
- **Sound toggle**: Web Audio sound effects with mute switch
- **Paper confetti**: Celebration effect after conversations
- **Keyboard shortcuts**: Space to flip, → next question, F favorite, T timer
- **Mobile-first responsive**: Works on phones and desktops

## Project Structure

```
index.html              Final single-file SPA (multi-language question bank embedded, ready to open or deploy)
dist/index.html         Deployment payload (index.html only)
src/
  index.template.html   Template source (__ALL_LANGS__ placeholder for multi-language question bank)
  app.js                App logic (multi-language, rendering, timer, sound, favorites, drawer)
  lang/
    zh-TW/questions.json  Traditional Chinese question bank (700 questions)
    zh-CN/questions.json  Simplified Chinese question bank (700 questions)
    en/questions.json     English question bank (700 questions)
build_bank.py           Generate per-language questions.json (question bank source and slicing)
build_site.py           Inject multi-language question bank into template, generate index.html and dist/
validate.py             Question bank validation (count, categories, duplicates, banned topics, length)
```

## Rebuild and Deploy

```bash
# 1. Generate per-language question banks (700 per language, 7 categories × 100 per category)
python3 build_bank.py

# 2. Generate the multi-language single-file SPA
python3 build_site.py

# 3. Validate the question bank
python3 validate.py

# 4. Deploy to Cloudflare Pages (Between Us project)
CLOUDFLARE_ACCOUNT_ID=4a9d7d8a3cf4e6361ff78b54e157881c \
  npx wrangler pages deploy dist --project-name love-between-us --branch main
```

## Technical Details

- Zero dependencies: only uses CDN-loaded Tailwind CSS, Lucide icons, and canvas-confetti
- Data storage: uses localStorage only (favorites, mute, category preference, language setting) — no backend or database
- Deployment: Cloudflare Pages static hosting
- License: Open source, Fork and contributions welcome

## License

MIT License
