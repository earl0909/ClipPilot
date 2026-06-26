import { NextResponse } from "next/server";

type Provider = "openai" | "gemini" | "anthropic" | "openrouter";

type GenerateBody = {
  provider?: Provider;
  apiKey?: string;
  input?: {
    platform?: string;
    style?: string;
    videoUrl?: string;
    videoFileName?: string;
    videoFileType?: string;
    videoFileSize?: string;
    manualDescription?: string;
    extraContext?: string;
  };
};

type UrlContext = {
  title?: string;
  author?: string;
  description?: string;
  source?: string;
};

const defaultModels: Record<Provider, string> = {
  openai: "gpt-4.1-mini",
  gemini: "gemini-2.5-flash",
  anthropic: "claude-3-5-sonnet-latest",
  openrouter: "google/gemini-2.5-flash"
};

const providerEnvKeys: Record<Provider, string> = {
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openrouter: "OPENROUTER_API_KEY"
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const provider = body.provider || "openrouter";
    const apiKey = body.apiKey?.trim() || process.env[providerEnvKeys[provider]];

    if (!apiKey) {
      return NextResponse.json(
        { error: `Add an API key in the form or set ${providerEnvKeys[provider]} in .env.local.` },
        { status: 400 }
      );
    }

    const input = body.input || {};
    const urlContext = await getUrlContext(input.videoUrl);
    const hasManualContext = Boolean(input.manualDescription?.trim() || input.extraContext?.trim());
    const hasFileContext = Boolean(input.videoFileName?.trim());
    const hasUrlContext = Boolean(urlContext.title || urlContext.description);

    if (input.videoUrl?.trim() && !hasManualContext && !hasFileContext && !hasUrlContext) {
      return NextResponse.json(
        {
          error:
            "I could not read useful details from that video link. Add a short manual description so the script matches the actual video instead of guessing."
        },
        { status: 422 }
      );
    }

    const prompt = buildViralShortsPrompt(input, urlContext);
    const result = await callProvider(provider, apiKey, prompt);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while generating.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function callProvider(provider: Provider, apiKey: string, prompt: string) {
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: defaultModels.openai,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.72,
        max_output_tokens: 2400
      })
    });
    const data = await response.json();
    ensureOk(response, data, "OpenAI");
    return data.output_text?.trim() || data.output?.[0]?.content?.[0]?.text?.trim() || "No generation returned.";
  }

  if (provider === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${defaultModels.gemini}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.72, maxOutputTokens: 2400 }
        })
      }
    );
    const data = await response.json();
    ensureOk(response, data, "Gemini");
    return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim() || "No generation returned.";
  }

  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: defaultModels.anthropic,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.72,
        max_tokens: 2400
      })
    });
    const data = await response.json();
    ensureOk(response, data, "Anthropic");
    return data.content?.map((part: { text?: string }) => part.text || "").join("").trim() || "No generation returned.";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "ClipPilot Viral Shorts"
    },
    body: JSON.stringify({
      model: defaultModels.openrouter,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.72,
      max_tokens: 2400
    })
  });
  const data = await response.json();
  ensureOk(response, data, "OpenRouter");
  return data.choices?.[0]?.message?.content?.trim() || "No generation returned.";
}

function ensureOk(response: Response, data: unknown, provider: string) {
  if (response.ok) {
    return;
  }

  const payload = data as { error?: { message?: string } | string; message?: string };
  const detail = typeof payload.error === "string" ? payload.error : payload.error?.message || payload.message;
  throw new Error(detail || `${provider} request failed. Check the API key, model access, and credits.`);
}

const systemPrompt = `
You are ClipPilot Viral Shorts, an expert short-form video script strategist.
You never summarize. You build retention-driven narration for TikTok, Reels, and YouTube Shorts.
Use simple English, short sentences, active voice, and a natural creator voice.
Avoid "Guys", "You won't believe", and "Watch until the end".
Never invent video events, objects, characters, animals, vehicles, locations, reactions, or payoffs that are not present in the supplied context.
Your main job is to write voiceover commentary the creator can read out loud over the video.
`;

async function getUrlContext(videoUrl?: string): Promise<UrlContext> {
  const trimmedUrl = videoUrl?.trim();
  if (!trimmedUrl) {
    return {};
  }

  const youtubeId = getYouTubeId(trimmedUrl);
  const oEmbedUrl = youtubeId
    ? `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}&format=json`
    : `https://noembed.com/embed?url=${encodeURIComponent(trimmedUrl)}`;

  const oEmbedContext = await fetchJsonContext(oEmbedUrl);
  if (oEmbedContext.title || oEmbedContext.author) {
    return { ...oEmbedContext, source: youtubeId ? "YouTube oEmbed" : "noembed" };
  }

  return fetchHtmlMetadata(trimmedUrl);
}

function getYouTubeId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v") || url.pathname.match(/\/shorts\/([^/?#]+)/)?.[1] || "";
    }
  } catch {
    return "";
  }

  return "";
}

async function fetchJsonContext(url: string): Promise<UrlContext> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return {};
    }

    const data = (await response.json()) as { title?: string; author_name?: string };
    return {
      title: cleanText(data.title),
      author: cleanText(data.author_name)
    };
  } catch {
    return {};
  }
}

async function fetchHtmlMetadata(url: string): Promise<UrlContext> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return {};
    }

    const html = await response.text();
    return {
      title: cleanText(readMeta(html, "og:title") || readTitle(html)),
      description: cleanText(readMeta(html, "og:description") || readMeta(html, "description")),
      source: "page metadata"
    };
  } catch {
    return {};
  }
}

function readMeta(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const propertyPattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const contentFirstPattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedName}["'][^>]*>`, "i");
  return html.match(propertyPattern)?.[1] || html.match(contentFirstPattern)?.[1] || "";
}

function readTitle(html: string) {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
}

function cleanText(value?: string) {
  return value
    ?.replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function buildViralShortsPrompt(input: NonNullable<GenerateBody["input"]>, urlContext: UrlContext) {
  return `
Create a complete viral short-form video script package.

INPUT
Platform: ${input.platform || "TikTok, Instagram Reels, and YouTube Shorts"}
Script style: ${input.style || "Simple Viral Commentary"}
Video URL: ${input.videoUrl || "Not provided"}
URL content context source: ${urlContext.source || "No readable URL metadata"}
URL title: ${urlContext.title || "Not available"}
URL author/channel: ${urlContext.author || "Not available"}
URL description: ${urlContext.description || "Not available"}
Uploaded file metadata: ${input.videoFileName || "No file uploaded"} ${input.videoFileType ? `(${input.videoFileType}, ${input.videoFileSize})` : ""}
Manual video description: ${input.manualDescription || "Not provided"}
Extra creator notes: ${input.extraContext || "Not provided"}

IMPORTANT VIDEO ANALYSIS LIMIT
- Use only supplied context: manual description, extra notes, URL title/description/channel, and uploaded file metadata.
- Do not invent unrelated subjects. If the URL says a cooking video, do not mention cars, cats, pranks, soldiers, houses, or other topics unless supplied.
- If the URL metadata is the only context, generate a conservative script concept based on the title/description and clearly avoid frame-specific claims.
- If only file metadata is provided and no accessible transcript/description is available, say what cannot be verified from the upload alone, then generate from the manual notes and URL context. Do not pretend you watched frames you did not receive.

PROMPT PIPELINE
1. Analyze the video description, URL context, and uploaded-video notes.
2. Extract a scene timeline with actions, characters, objects, reactions, transitions, and ending payoff.
3. Identify the strongest hook moment, emotional payoff, biggest surprise, curiosity gap, conflict, and resolution.
4. Build curiosity loops.
5. Generate multiple hooks.
6. Score each hook for Topic Clarity, Curiosity, Relevance, Simplicity, and Retention Potential.
7. If any score is below 8, rewrite that hook before final output.
8. Select the highest-scoring hook.
9. Write commentary synchronized with the timeline.
10. Self-critique the final script and rewrite weak lines.

HOOK RULES
- Reveal the topic within 1 second.
- No delay. Never start with "Guys", "You won't believe", or "Watch until the end".
- Use simple English at about sixth-grade reading level.
- Make the viewer care with "you", "your", questions, pain points, or relatable stakes when natural.
- Create curiosity with contrast: old expectation vs new surprising reality.
- Every hook must have Topic Clarity, On-target Curiosity, Relevance, Simplicity, and Retention Potential.

COMMENTARY RULES
- Formula: Hook -> Immediate Setup -> Complication -> Escalation -> Payoff.
- Narrate what viewers see. Stay synchronized with the footage.
- Never over explain.
- Every sentence must add new action, surprise, emotion, tension, or story movement.
- Use retention words naturally: but, until, however, instead, then, suddenly, even, except, because, yet, which.
- End with the strongest emotional, satisfying, surprising, or shocking payoff.
- Write the voiceover as spoken lines, not paragraphs.
- Each line should be easy to say in one breath.
- Mark quick delivery notes in brackets only when useful, like [pause], [faster], [drop voice], or [emphasize].
- The first voiceover line must be the strongest hook. It must immediately name the topic.
- Keep the voiceover synchronized with the visible action. Do not reveal the payoff before the viewer sees it.
- Avoid generic narration like "This is amazing" unless paired with a specific visible action.

Return Markdown with exactly these sections:
## Video Analysis
Scene timeline, strongest hook moment, emotional payoff, biggest surprise, curiosity gap, conflict, and resolution.
## Hook Scores
Score the selected hook out of 10 for Topic Clarity, Curiosity, Relevance, Simplicity, and Retention Potential.
## On-screen Text Hook
## Strong Hook Options
Give 5 voiceover hook openings. Each must be short, spoken, and scored.
## Commentary Voiceover Script
Write the exact voiceover the creator should read. Use timestamp-style beats like 0:00-0:02. Each beat must include:
- Spoken line:
- Delivery:
- Visual it matches:
## Shorter Voiceover Version
Rewrite the same story in a faster 20-30 second version.
## On-Screen Caption Timing
List the most important caption words and when they should appear.
## Caption
## Hashtags
## Thumbnail Text
## Title Variations
Give 5.
## Alternative Hooks
Give 5, each with a one-line score.
## Alternative Endings
Give 3.
## Editing Suggestions
Include where to zoom, add captions, pause, slow motion, sound effects, emphasis, and cut dead space.
## Script Analyzer
Hook Score, Delay Score, Confusion Score, Curiosity Score, Commentary Flow, Retention Score, Overall Viral Potential, and improvement suggestions.
`;
}
