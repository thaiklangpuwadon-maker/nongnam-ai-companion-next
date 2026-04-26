import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("audio");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    const fd = new FormData();
    fd.append("file", file, file.name || "speech.webm");
    fd.append("model", "gpt-4o-mini-transcribe");
    fd.append("language", "th");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd
    });

    const raw = await r.text();
    if (!r.ok) return NextResponse.json({ error: "transcribe_failed", detail: raw }, { status: r.status });

    const data = JSON.parse(raw);
    return NextResponse.json({ text: data.text || "" });
  } catch (e:any) {
    return NextResponse.json({ error: "server_error", detail: e?.message || String(e) }, { status: 500 });
  }
}
