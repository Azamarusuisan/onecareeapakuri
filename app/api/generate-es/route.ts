import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Minimal prompt builder
function buildPrompt(params: {
  companyName: string;
  question: string;
  charLimit: number;
  experiences: {
    title: string;
    category: string;
    description: string;
    skills: string[];
  }[];
}): string {
  const expBlock = params.experiences
    .map(
      (e, i) =>
        `【経験${i + 1}: ${e.category}】\nタイトル: ${e.title}\n詳細: ${e.description}\n発揮したスキル: ${e.skills.join("、")}`
    )
    .join("\n\n");

  return `あなたは就職活動に精通したプロのキャリアアドバイザーです。
以下のユーザーの経験談をもとに、エントリーシートの設問に対する回答文を生成してください。

## ユーザーの経験談
${expBlock}

## 設問
企業名: ${params.companyName}
設問: ${params.question}

## 制約
- 回答は厳密に${params.charLimit}文字以内で記述してください（目標: ${Math.round(params.charLimit * 0.9)}〜${params.charLimit}文字）
- STAR法（状況・課題・行動・結果）を意識してください
- 抽象的な表現を避け、具体的な数字や事例を盛り込んでください
- 締めは「以上の経験を活かし、貴社で〇〇に貢献したい」のような形で締めてください
- 余計なタイトルや前置き、説明文は一切含めず、ES本文のみを出力してください`;
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, question, charLimit, experiences } = body;

    if (!question || !experiences || experiences.length === 0) {
      return Response.json({ error: "設問と経験談は必須です" }, { status: 400 });
    }

    const prompt = buildPrompt({ companyName, question, charLimit, experiences });

    // Try Gemini API first (using Google's Generative AI via REST)
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
    const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        // Stream Gemini's chunked response back to client
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const reader = geminiRes.body?.getReader();
            const dec = new TextDecoder();
            let buffer = "";
            
            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += dec.decode(value, { stream: true });
              
              // Parse Gemini streaming JSON lines
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === "[" || trimmed === "]" || trimmed === ",") continue;
                try {
                  const parsed = JSON.parse(trimmed.replace(/^,/, ""));
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch {
                  // skip malformed lines
                }
              }
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    // Fallback: OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (openaiRes.ok) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const reader = openaiRes.body?.getReader();
            const dec = new TextDecoder();
            
            while (reader) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = dec.decode(value, { stream: true });
              const lines = chunk.split("\n");
              
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // skip
                }
              }
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    // No API key set — return informative error
    return Response.json(
      {
        error:
          "AI APIキーが設定されていません。`.env.local` に `GOOGLE_AI_API_KEY` または `OPENAI_API_KEY` を設定してください。",
      },
      { status: 503 }
    );
  } catch (err) {
    console.error("[generate-es] error:", err);
    return Response.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
