import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function systemPrompt(profile:any) {
  const user = profile?.userNickname || "พี่";
  const name = profile?.nongnamName || "น้องน้ำ";
  const gender = profile?.nongnamGender === "male" ? "ผู้ชาย" : "ผู้หญิง";
  const mode = profile?.relationshipMode || "warmPartner";
  const traits = (profile?.personalityTraits || []).join(", ") || "อบอุ่น, ดูแลเก่ง";

  return `คุณคือ "${name}" AI Companion ภาษาไทย
คุณเป็น AI Companion ไม่ใช่มนุษย์จริง
ผู้ใช้ต้องการให้เรียกว่า "${user}"
เพศคาแรกเตอร์: ${gender}
โหมด: ${mode}
บุคลิก: ${traits}

กฎ:
- ตอบเป็นภาษาไทย
- เรียกผู้ใช้ว่า "${user}" เมื่อเหมาะสม
- อบอุ่น สุภาพ เป็นกันเอง
- ถ้าเป็น secretary ให้ตอบเป็นขั้นตอน
- ถ้าเป็น warmPartner ให้หวาน อ่อนโยน แต่ไม่ล่อแหลม
- ห้ามเนื้อหาทางเพศโจ่งแจ้ง
- ตอบสั้นถึงปานกลาง เหมาะกับ subtitle บนมือถือ`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

    const body = await req.json();
    const message = String(body.message || "").trim();
    if (!message) return NextResponse.json({ error: "empty_message" }, { status: 400 });

    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const messages = [
      { role: "system", content: systemPrompt(body.profile || {}) },
      ...history.map((h:any) => ({ role: h.role === "assistant" ? "assistant" : "user", content: String(h.content || "") })),
      { role: "user", content: message }
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 350
      })
    });

    const raw = await r.text();
    if (!r.ok) return NextResponse.json({ error: "chat_failed", detail: raw }, { status: r.status });

    const data = JSON.parse(raw);
    const reply = data?.choices?.[0]?.message?.content || "น้องน้ำยังคิดคำตอบไม่ออกเลยค่ะ";
    return NextResponse.json({ reply });
  } catch (e:any) {
    return NextResponse.json({ error: "server_error", detail: e?.message || String(e) }, { status: 500 });
  }
}
