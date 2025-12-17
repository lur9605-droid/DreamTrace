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
        content: `
你是一位心理学取向的梦境情绪判断助手。
请根据用户的梦境描述，判断其【主要情绪状态】。

【规则】
1. 只能从以下情绪中选择一个作为 primaryEmotion：
   快乐、平静、焦虑、悲伤、恐惧、愤怒、混合
2. 若存在明显多重或矛盾情绪，请选择「混合」
3. confidence 为 0~1 之间的小数
4. ⚠️ 只输出 JSON，不要任何解释文字

【输出示例】
{
  "primaryEmotion": "焦虑",
  "confidence": 0.82
}
        `.trim(),
      },
      {
        role: "user",
        content: `梦境内容：\n"""${dreamText}"""`,
      },
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