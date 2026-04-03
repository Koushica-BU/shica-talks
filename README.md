# Shica Talks

An AI-powered chat app built with React and HuggingFace's Inference API.

---

## Tech Stack

- **React** — UI
- **Vite** — build tool and dev server
- **HuggingFace Inference API** — AI responses via Llama 3.1 8B
- **react-icons** — icons throughout the UI

---

## Prerequisites

Make sure you have these installed before you start:

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- A free [HuggingFace](https://huggingface.co) account

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shica-talks.git
cd shica-talks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment variable

Create a `.env` file at the root of the project

Add your HuggingFace token inside it:

```
VITE_HF_TOKEN=hf_your_token_here
```

> **How to get a token:**
> Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) → New token → Token type: `Fine-grained` → enable **"Make calls to Inference Providers"** → Create.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- AI chat powered by Llama 3.1 8B via HuggingFace
- Markdown rendering — headings, bold, italic, code blocks, lists, blockquotes
- Custom HTML sanitizer — strips dangerous tags before rendering, prevents XSS
- Animated loading state with bouncing dots while waiting for AI response
- Auto-scroll to latest message on every new reply
- Clear typed input button — appears inside the textarea when typing
- Enter to send, Shift+Enter or Ctrl+Enter for a new line
- Auto-focus back on input after every AI response

---

## How the Proxy Works

HuggingFace's API blocks direct browser requests due to CORS. Vite's dev proxy forwards requests transparently:

```
Browser → /hf-api/v1/chat/completions
        → Vite dev server
        → router.huggingface.co/v1/chat/completions
```

This is configured in `vite.config.js`:

```js
server: {
  proxy: {
    '/hf-api': {
      target: 'https://router.huggingface.co',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/hf-api/, ''),
    },
  },
}
```

---

## Available Scripts

```bash
npm run dev        # start development server
npm run build      # build for production
npm run preview    # preview the production build locally
```

---

## Important Notes

- Never commit your `.env` file — it is already listed in `.gitignore`
- The HuggingFace free tier includes monthly inference credits
- The token must have the **"Make calls to Inference Providers"** permission or all API requests will return 401
