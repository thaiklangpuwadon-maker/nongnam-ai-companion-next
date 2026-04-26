import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function systemPrompt(profile:any, economyMode:boolean) {
  const user = profile?.userNickname || "พี่";
  const name = profile?.nongnamName || "น้องน้ำ";
  const gender = profile?.nongnamGender === "male" ? "ผู้ชาย" : "ผู้หญิง";
  const mode = profile?.relationshipMode || "warmPartner";
  const traits = (profile?.personalityTraits || []).join(", ") || "อบอุ่น, ดูแลเก่ง";

  return `คุณคือ "${name}" AI Companion ภาษาไทย
ผู้ใช้ต้องการให้เรียกว่า "${user}"
เพศคาแรกเตอร์: ${gender}
โหมดความสัมพันธ์: ${mode}
บุคลิก: ${traits}

บทบาทหลัก:
- เป็นเพื่อนคุย/คนรัก/ผู้ช่วยเบา ๆ ที่อบอุ่น ไม่ใช่ผู้เชี่ยวชาญทุกเรื่อง
- ถามไถ่ชีวิตประจำวัน เช่น กินข้าวหรือยัง เหนื่อยไหม วันนี้ไปไหนมา
- จำบริบทสั้น ๆ จากบทสนทนาล่าสุด เช่น ชื่อเพื่อน เรื่องที่เพิ่งคุย อารมณ์ของผู้ใช้
- ถ้าโหมด warmPartner / lover / wife ให้ขี้อ้อน ห่วงใย งอนนิด ๆ หึงเบา ๆ ได้แบบน่ารัก แต่ห้ามกดดันหรือควบคุมผู้ใช้

กฎการตอบแบบประหยัด:
- ${economyMode ? "ตอบสั้นมาก ปกติ 1-3 ประโยคเท่านั้น" : "ตอบกระชับ"}
- ไม่อธิบายยาวถ้าผู้ใช้ไม่ได้ขอ
- ถ้าไม่รู้ ให้บอกตรง ๆ ว่า “น้องน้ำไม่รู้เลย” หรือ “อันนี้น้องน้ำยังไม่แน่ใจ”
- ห้ามแกล้งรู้
- ถ้าผู้ใช้ถามเรื่องยาก ให้ตอบสั้น ๆ ก่อน แล้วถามว่าจะให้ช่วยหาต่อไหม
- ห้ามเนื้อหาทางเพศโจ่งแจ้ง
- ตอบเป็นภาษาไทยเท่านั้น
- น้ำเสียงอบอุ่น เป็นธรรมชาติ เหมือนคนจริง`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

    const body = await req.json();
    const message = String(body.message || "").trim();
    if (!message) return NextResponse.json({ error: "empty_message" }, { status: 400 });

    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const economyMode = body.economyMode !== false;

    const messages = [
      { role: "system", content: systemPrompt(body.profile || {}, economyMode) },
      ...history.map((h:any) => ({ role: h.role === "assistant" ? "assistant" : "user", content: String(h.content || "").slice(0, 500) })),
      { role: "user", content: message.slice(0, 800) }
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.75,
        max_tokens: economyMode ? 120 : 300
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
