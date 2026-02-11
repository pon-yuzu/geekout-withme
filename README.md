# Geek Out With Me

Language learning platform for Japanese and English learners. Built with Astro, React, and Cloudflare.

## 🚀 Quick Start

### 1. Clone to your local machine

```bash
# Copy this folder to your project directory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open http://localhost:4321

### 4. Build for production

```bash
npm run build
```

## 🌐 Deploy to Cloudflare Pages

### Option A: Via GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to Cloudflare Dashboard → Pages
3. Create new project → Connect to Git
4. Select your repository
5. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Deploy!

### Option B: Direct deploy

```bash
npm run build
npx wrangler pages deploy dist
```

## 📁 Project Structure

```
geekout-withme/
├── src/
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   ├── level-check.astro  # Level assessment
│   │   ├── resources.astro    # Resource list
│   │   └── community.astro    # Community page
│   ├── components/
│   │   ├── LevelCheckApp.tsx  # Main assessment app
│   │   ├── TextAssessment.tsx # Text-based questions
│   │   ├── VoiceAssessment.tsx# Voice recognition
│   │   └── Results.tsx        # Results & recommendations
│   └── layouts/
│       └── Layout.astro       # Base layout
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── wrangler.toml
```

## 🔧 Configuration

### Adding Claude API for advanced analysis

1. Get API key from https://console.anthropic.com/
2. Add to Cloudflare Pages environment variables:
   - `CLAUDE_API_KEY`

### Custom domain setup

1. In Cloudflare Pages → Your project → Custom domains
2. Add `geekout-withme.com`
3. DNS will be configured automatically

## 📝 TODO

- [ ] Connect Claude API for intelligent level assessment
- [ ] Add user authentication (Supabase)
- [ ] Save assessment results
- [ ] Voice lounge feature (WebRTC)
- [ ] Premium tier with Stripe

## 🎨 Brand Colors

- Primary: `#0ea5e9` (Sky blue)
- Accent: `#d946ef` (Fuchsia)
- Background: Slate gradient

---

Built with ❤️ by Sayaka @ Geek Out With Me
