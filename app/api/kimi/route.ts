import { NextResponse } from "next/server";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing KIMI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const messages: Message[] = body?.messages;
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
    }
    const validRoles = new Set(["system", "user", "assistant"]);
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return NextResponse.json({ error: "Invalid message object" }, { status: 400 });
      }
      if (!validRoles.has(m.role)) {
        return NextResponse.json({ error: `Invalid role: ${String((m as any).role)}` }, { status: 400 });
      }
      if (typeof m.content !== "string") {
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
      }
    }

    console.log("🚀 Sending request to Kimi", messages);

    const resp = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "kimi-k2-0905-preview",
        messages,
      }),
    });

    console.log("🔥 Kimi response status:", resp.status);
    const data = await resp.json();
    console.log("📦 Kimi raw response:", data);
    if (!resp.ok) {
      return NextResponse.json(
        { error: "Kimi API error", status: resp.status, data },
        { status: resp.status }
      );
    }

    const content: string =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";
    return NextResponse.json({ role: "assistant", content });
  } catch (e: any) {
    console.error("❌ Kimi API Error:", e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
