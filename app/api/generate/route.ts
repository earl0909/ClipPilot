import { NextResponse } from "next/server";
import { moodEmojiMap } from "@/components/moodOptions";

type GenerateBody = {
  tool?: string;
  input?: Record<string, string>;
};

const model = "google/gemini-2.5-flash";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY in .env.local" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as GenerateBody;
    const prompt = buildPrompt(body.tool || "hooks", body.input || {});

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ClipPilot OS"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are ClipPilot OS, a practical strategist for streamer clippers and Whop campaign creators. Return concise Markdown that is ready to copy."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.72,
        max_tokens: 1400
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenRouter request failed. Check your API key, credits, and model access." },
        { status: response.status }
      );
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ result: text || "No generation returned. Add more detail and try again." });
  } catch {
    return NextResponse.json({ error: "Something went wrong while generating. Try again." }, { status: 500 });
  }
}

function buildPrompt(tool: string, input: Record<string, string>) {
  const moodContext = buildMoodContext(input);
  const strategy = `
Streamer clipping strategy:
- Hook must happen in the first 1-2 seconds.
- One subject, one question.
- Show the craziest moment first.
- Remove silence, pauses, repeated words, and dead space.
- Add pattern interrupts every 2-4 seconds.
- Captions should be large, readable, and high contrast.
- Focus on curiosity, conflict, emotion, surprise, or transformation.
- Output must be practical and ready to copy.
- Do not dump or rewrite the full transcript.
`;

  if (tool === "hooks") {
    return `
${strategy}

Generate hooks for this streamer clip.

Transcript:
${input.transcript || "Not provided"}

What happened in the clip:
${input.happened || "Not provided"}

${moodContext}
Platform: ${input.platform || "Both"}

Return Markdown with exactly these sections:
## 10 Viral Hooks
For each hook, include:
- Emoji version
- No emoji version
## Best Hook Recommendation
## Curiosity Score
## Retention Score
`;
  }

  if (tool === "clip-analyzer") {
    return `
${strategy}

Analyze this streamer clip for posting potential.

Transcript:
${input.transcript || "Not provided"}

What happened in the clip:
${input.happened || "Not provided"}

Streamer/creator name: ${input.streamerName || "Unknown creator"}
Platform: ${input.platform || "Both"}
${moodContext}

Return Markdown with exactly these sections:
## Viral Potential Score
Give one number from 0-100.
## Recommendation
Say POST or SKIP, then one short reason.
## Strengths
## Weaknesses
## Best Hook
## Thumbnail Text
Include Emoji version and No emoji version. Keep thumbnail text short, punchy, and readable.
## Caption
## Hashtags
## What To Cut
## Editing Notes
Include on-screen text recommendations with Emoji version and No emoji version.
`;
  }

  if (tool === "youtube-seo") {
    return `
${strategy}

Generate a complete YouTube Shorts SEO package optimized for CTR, retention, discoverability, and engagement.

Clip Summary:
${input.clipSummary || "Not provided"}

Hook Used In Video:
${input.hookUsed || "Not provided"}

Ending / Payoff:
${input.payoff || "Not provided"}

Game / Topic:
${input.topic || "Not provided"}

Creator / Streamer Name:
${input.streamerName || "Not provided"}

${moodContext}

Special optimization rules:
- Prioritize curiosity, watch time, retention, replayability, and YouTube Shorts discoverability.
- For streamer clips, focus on reactions, fails, instant regret, challenges, drama, and shock moments.
- For gaming clips, focus on clutch moments, fails, impossible plays, and funny reactions.
- For mystery/horror clips, focus on suspense, unanswered questions, and curiosity loops.
- Avoid misleading clickbait.

Return Markdown with exactly these sections:
## Viral Title
- Emoji version: under 100 characters, clickable, natural emoji use.
- No emoji version: under 100 characters.
## Viral Description
Feel exciting, tell a mini-story, and do not spoil everything immediately.
## Key Moment Bullets
Generate 4-6 bullets. Use emojis only if enabled.
## Engagement Question
Generate one comment-driving question.
## Hashtag Block
Generate 10-15 relevant hashtags including topic hashtags, creator hashtags, and broad Shorts hashtags.
## SEO Score
Give one score from 0-100.
## CTR Potential
## Retention Potential
## Discoverability
## Alternative Titles
Generate 5 extra title options. Include Emoji version and No emoji version when emojis are enabled.
`;
  }

  if (tool === "campaign-analyzer") {
    return `
${strategy}

Extract the rules from these Whop or clipping campaign instructions. Be strict and practical.

Campaign instructions:
${input.campaignText || "Not provided"}

Return Markdown with exactly these sections:
## Campaign Name
## Platform
## CPM
## Max Payout
## Required Hashtags
## Required Tags
## Required Visual/Logo Requirements
## Do's
## Don'ts
## Rejection Risks
## Submission Checklist
## Estimated Difficulty
## Estimated Earning Potential
`;
  }

  return `
${strategy}

Find the strongest short-form structure inside this transcript.

Transcript:
${input.transcript || "Not provided"}

Short description of what happened:
${input.happened || "Not provided"}

${moodContext}

Return Markdown with exactly these sections:
## Best Hook Moment
## Best Payoff Moment
## Best Thumbnail Text
Include Emoji version and No emoji version.
## Best Caption
## Best Title
Include Emoji version and No emoji version.
## On-Screen Text
Include Emoji version and No emoji version.
## Suggested Clip Length
## Suggested Timeline
- Hook:
- Build-up:
- Conflict:
- Payoff:
- Reaction:
- Loop Ending:
`;
}

function buildMoodContext(input: Record<string, string>) {
  const primaryMood = input.mood || "Funny";
  const secondaryMood = input.secondaryMood || "None";
  const useEmojis = input.useEmojis !== "false";
  const emojiOptions = [...(moodEmojiMap[primaryMood] || []), ...(moodEmojiMap[secondaryMood] || [])];
  const uniqueEmojiOptions = Array.from(new Set(emojiOptions)).join(" ");

  return `
Mood direction:
- Primary Mood: ${primaryMood}
- Secondary Mood: ${secondaryMood}
- Use these moods to influence hook generation, viral score analysis, thumbnail text, caption generation, editing recommendations, and retention recommendations.
- If Primary Mood is Pain and Secondary Mood is Instant Regret, hooks can use an angle like "He instantly regretted this".
- If Primary Mood is Mystery and Secondary Mood is Suspense, hooks can use an angle like "What was inside the box?"
- If Primary Mood is Rage and Secondary Mood is Drama, hooks can use an angle like "This argument got out of control..."
- Match the emotional promise of the hook to the thumbnail, caption, pacing, cuts, pattern interrupts, and payoff.

Emoji rules:
- Use Emojis: ${useEmojis ? "Enabled" : "Disabled"}
- Recommended emojis for the selected mood combination: ${uniqueEmojiOptions || "None"}
- Do not spam emojis.
- Use 0-2 emojis maximum per hook, title, thumbnail text, or on-screen text.
- Emojis must match the selected mood.
- When emojis are enabled, generate both an Emoji version and a No emoji version for hooks, titles, thumbnail text, and on-screen text.
- When emojis are disabled, do not include emojis in the generated text.
`;
}
