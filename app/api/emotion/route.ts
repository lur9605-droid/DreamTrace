import { NextResponse } from "next/server";

const VALID_EMOTIONS = ["快乐", "平静", "焦虑", "悲伤", "恐惧", "愤怒", "混合"];

export async function POST(req: Request) {
  try {
    const apiKey = process.env.KIMI_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing KIMI_API_KEY");
      return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
    }

    const { dreamText } = await req.json();

    if (!dreamText || typeof dreamText !== "string") {
      return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
    }

    const messages = [
      {
        role: "system",
        content: `你是一位敏锐的梦境情绪判断专家。
请根据用户的梦境描述，判断其【主要情绪状态】。

规则：
1. 只能从以下情绪中选择一个作为 primaryEmotion：
   快乐、平静、焦虑、悲伤、恐惧、愤怒、混合
2. 请非常敏锐地捕捉情绪线索：
   - 如果梦境包含追逐、逃跑、不安、担心，请判断为「焦虑」或「恐惧」。
   - 如果梦境包含哭泣、失去、遗憾，请判断为「悲伤」。
   - 如果梦境包含攻击、争吵，请判断为「愤怒」。
   - 只有在梦境确实非常安详、没有任何负面波动时，才选择「平静」。
3. confidence 为 0~1 之间的小数
4. 只输出 JSON`
      },
      {
        role: "user",
        content: `梦境内容：
"""${dreamText}"""`
      }
    ];

    const resp = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "kimi-k2-0905-preview",
        messages,
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      console.error("❌ Kimi API error:", resp.status);
      return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
    }

    const data = await resp.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    console.log("🧠 RAW AI CONTENT:", rawContent);

    if (!rawContent) {
      return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
    }

    // ✅ 核心修复：从任何文本中“强行抠 JSON”
    const jsonMatch = rawContent.match(/\{[\s\S]*?\}/);

    if (!jsonMatch) {
      console.error("❌ No JSON found in AI response");
      return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // ✅ 严格校验
    if (
      typeof parsed.primaryEmotion === "string" &&
      VALID_EMOTIONS.includes(parsed.primaryEmotion) &&
      typeof parsed.confidence === "number"
    ) {
      return NextResponse.json({
        primaryEmotion: parsed.primaryEmotion,
        confidence: Math.min(Math.max(parsed.confidence, 0), 1),
      });
    }

    console.error("❌ Invalid emotion structure:", parsed);
    return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });

  } catch (error) {
    console.error("🔥 Emotion API crashed:", error);
    return NextResponse.json({ primaryEmotion: "混合", confidence: 0.5 });
  }
}