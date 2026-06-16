# ClipPilot AI

A Next.js App Router web app for streamer clip creators. Paste a clip transcript, describe what really happened, and generate creator-ready assets for Instagram Reels and YouTube Shorts.

## Setup

```bash
npm install
npm run dev
```

Create `.env.local` in the project root:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=~openai/gpt-latest
OPENROUTER_MAX_TOKENS=1000
```

Then open the local URL printed by Next.js, usually:

```bash
http://localhost:3000
```

To test from a phone on the same Wi-Fi, run:

```bash
npm run dev:host
```

Then find your computer's local IP address and open this on your phone:

```bash
http://YOUR_COMPUTER_IP:3000
```

## Pages

- `/dashboard`
- `/clip-creator`
- `/hooks`
- `/captions`
- `/hashtags`
- `/edit-notes`
- `/tracker`
- `/warmup-guide`

## Notes

- The OpenRouter route is `POST /api/generate`.
- If `.env.local` is missing the key, the API returns: `Missing OPENROUTER_API_KEY in .env.local`.
- `OPENROUTER_MODEL` is optional. If omitted, the app uses `~openai/gpt-latest`.
- `OPENROUTER_MAX_TOKENS` is optional. Lower it if OpenRouter says the request needs more credits.
- Posting tracker data is stored in browser `localStorage`.
