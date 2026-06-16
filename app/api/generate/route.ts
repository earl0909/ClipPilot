import { NextResponse } from "next/server";

type GenerateBody = {
  tool?: string;
  input?: Record<string, string>;
};

const defaultModel = "~openai/gpt-latest";
const defaultMaxTokens = 1000;

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || defaultModel;
  const maxTokens = getMaxTokens();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY in .env.local" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as GenerateBody;
    const prompt = buildPrompt(body.tool || "clip-creator", body.input || {});

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-OpenRouter-Title": "ClipPilot AI"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are ClipPilot AI, a practical short-form strategist for streamer clip creators."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.82,
        top_p: 0.95,
        max_tokens: maxTokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenRouter request failed. Check your API key, credits, and model slug." },
        { status: response.status }
      );
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ result: text || "No generation returned. Try adding more clip detail." });
  } catch {
    return NextResponse.json({ error: "Something went wrong while generating. Try again." }, { status: 500 });
  }
}

function getMaxTokens() {
  const configured = Number.parseInt(process.env.OPENROUTER_MAX_TOKENS || "", 10);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return defaultMaxTokens;
}

function buildPrompt(tool: string, input: Record<string, string>) {
  const strategy = `
Use this strategy:
- Strong hook in first 1-2 seconds
- One subject, one question
- Show the craziest moment first
- Remove silence, pauses, dead space, repeated words
- Add pattern interrupts every 2-4 seconds
- Captions must be large, readable, and high contrast
- Focus on curiosity, conflict, emotion, surprise, or transformation
- Keep output practical for streamer clips
- Do not output the transcript as the main result
`;

  if (tool === "clip-creator") {
    return `
You are ClipPilot AI, a short-form strategist for streamer clip creators.
${strategy}

Create a creator-ready package for Instagram Reels and YouTube Shorts.

Streamer name: ${input.streamerName || "Unknown streamer"}
Platform: ${input.platform || "Both"}
Clip transcript: ${input.transcript || "Not provided"}
What really happened: ${input.happened || "Not provided"}
Clip mood: ${input.mood || "funny"}
Target length: ${input.length || "30s"}

Return concise, practical Markdown with exactly these sections:
## 5 Viral Hooks
## Best Hook Recommendation
## Short Title
## Instagram Caption
## YouTube Shorts Title
## Hashtags
## Editing Notes
## First 3 Seconds Plan
## Retention Plan
## What To Cut
## Thumbnail Text Ideas
## Posting Checklist
`;
  }

  const taskMap: Record<string, string> = {
    hooks: "Generate 10 viral short-form hooks and choose the best 3.",
    captions: "Generate Instagram Reels and YouTube Shorts captions plus a short title.",
    hashtags: "Generate focused hashtags, grouped by broad, niche, and clip-specific tags.",
    editnotes: "Generate edit notes, a first 3 seconds plan, retention plan, what to cut, and pattern interrupts."
  };

  return `
You are ClipPilot AI, a short-form strategist for streamer clip creators.
${strategy}

Task: ${taskMap[tool] || taskMap.hooks}

Streamer name: ${input.streamerName || "Unknown streamer"}
Platform: ${input.platform || "Both"}
What really happened: ${input.happened || "Not provided"}
Clip mood: ${input.mood || "funny"}
Target length: ${input.length || "30s"}
Transcript context: ${input.transcript || "Not provided"}

Return concise, creator-ready Markdown. Do not make the transcript the output.
`;
}
