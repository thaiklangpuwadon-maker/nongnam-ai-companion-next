"use client";
import { useEffect, useRef, useState } from "react";
import { characters, Gender } from "../lib/characters";

type Screen = "welcome"|"gender"|"profile"|"outfit"|"companion";
type Status = "idle"|"recording"|"transcribing"|"thinking"|"speaking";
type Chat = { role:"user"|"assistant"; content:string };

type Offset = { x:number; y:number };

const KEY = "nongnam_next_voice_memory";
const defaultMemory = {
  gender: "female" as Gender,
  outfit: 0,
  unlocked: { female: [0], male: [0] } as Record<Gender, number[]>,
  gems: 120,
  onboardingCompleted: false,
  profile: {
    userNickname: "พี่",
    nongnamName: "น้องน้ำ",
    nongnamAge: "24",
    nongnamBirthday: "24 กรกฎาคม",
    nongnamHeight: "165 cm",
    nongnamWeight: "48 kg",
    relationshipMode: "warmPartner",
    personalityTraits: ["affectionate","sweet","caring"]
  },
  subtitles: [] as string[],
  history: [] as Chat[]
};

const traits = [
  ["affectionate","ขี้อ้อน"],["playful","ขี้เล่น"],["sweet","พูดหวาน"],
  ["caring","ดูแลเก่ง"],["slightlyJealous","ขี้หึงเบา ๆ"],["slightlySulky","ขี้งอนนิด ๆ"]
];

function mimeType() {
  const list = ["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/mpeg"];
  return list.find(t => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) || "";
}

function distance(a:{x:number;y:number}, b:{x:number;y:number}) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function center(a:{x:number;y:number}, b:{x:number;y:number}) {
  return { x:(a.x+b.x)/2, y:(a.y+b.y)/2 };
}
function clamp(n:number, min:number, max:number) { return Math.max(min, Math.min(max, n)); }

function ZoomableImage({ src, alt, className="" }:{ src:string; alt:string; className?:string }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x:0, y:0 });
  const pointers = useRef(new Map<number, {x:number; y:number}>());
  const gesture = useRef({
    mode: "none" as "none"|"pan"|"pinch",
    startScale: 1,
    startOffset: { x:0, y:0 },
    startPoint: { x:0, y:0 },
    startCenter: { x:0, y:0 },
    startDistance: 0
  });

  function resetView() {
    setScale(1);
    setOffset({ x:0, y:0 });
  }

  function onPointerDown(e:any) {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x:e.clientX, y:e.clientY });

    if (pointers.current.size === 1) {
      gesture.current = {
        ...gesture.current,
        mode: "pan",
        startOffset: offset,
        startPoint: { x:e.clientX, y:e.clientY }
      };
    }

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      gesture.current = {
        mode: "pinch",
        startScale: scale,
        startOffset: offset,
        startPoint: { x:0, y:0 },
        startCenter: center(pts[0], pts[1]),
        startDistance: Math.max(1, distance(pts[0], pts[1]))
      };
    }
  }

  function onPointerMove(e:any) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x:e.clientX, y:e.clientY });

    if (pointers.current.size >= 2) {
      const pts = [...pointers.current.values()].slice(0, 2);
      const nowCenter = center(pts[0], pts[1]);
      const nowDistance = Math.max(1, distance(pts[0], pts[1]));
      const nextScale = clamp(gesture.current.startScale * (nowDistance / gesture.current.startDistance), 1, 4);
      const dx = nowCenter.x - gesture.current.startCenter.x;
      const dy = nowCenter.y - gesture.current.startCenter.y;
      setScale(nextScale);
      setOffset({ x: gesture.current.startOffset.x + dx, y: gesture.current.startOffset.y + dy });
      return;
    }

    if (gesture.current.mode === "pan" && scale > 1) {
      const dx = e.clientX - gesture.current.startPoint.x;
      const dy = e.clientY - gesture.current.startPoint.y;
      setOffset({ x: gesture.current.startOffset.x + dx, y: gesture.current.startOffset.y + dy });
    }
  }

  function onPointerUp(e:any) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) {
      const pt = [...pointers.current.values()][0];
      gesture.current = {
        ...gesture.current,
        mode: "pan",
        startPoint: { x: pt.x, y: pt.y },
        startOffset: offset
      };
    }
    if (pointers.current.size === 0) {
      gesture.current = { ...gesture.current, mode:"none", startScale:scale, startOffset:offset };
      if (scale <= 1.02) {
        setScale(1);
        setOffset({ x:0, y:0 });
      }
    }
  }

  function onWheel(e:any) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.16 : -0.16;
    setScale(prev => {
      const next = clamp(prev + delta, 1, 4);
      if (next === 1) setOffset({ x:0, y:0 });
      return next;
    });
  }

  return (
    <div className={`zoom-wrap ${className}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel} onDoubleClick={resetView}>
      <img src={src} alt={alt} draggable={false} style={{ transform:`translate(${offset.x}px, ${offset.y}px) scale(${scale})` }} />
      <div className="zoom-help">จีบ/กาง 2 นิ้วเพื่อซูม • ลากเพื่อเลื่อน • แตะสองครั้งเพื่อรีเซ็ต</div>
      {scale > 1 && <button className="reset-zoom" onClick={resetView}>รีเซ็ตมุมมอง</button>}
    </div>
  );
}

export default function Page() {
  const [mem,setMem] = useState(defaultMemory);
  const [ready,setReady] = useState(false);
  const [screen,setScreen] = useState<Screen>("welcome");
  const [status,setStatus] = useState<Status>("idle");
  const [input,setInput] = useState("");
  const [toast,setToast] = useState("");
  const [ms,setMs] = useState(0);

  const rec = useRef<MediaRecorder|null>(null);
  const stream = useRef<MediaStream|null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const startAt = useRef(0);
  const timer = useRef<any>(null);

  const gender = mem.gender;
  const outfits = characters[gender].outfits;
  const outfit = outfits[mem.outfit] || outfits[0];
  const avatar = outfit?.image || characters[gender].avatar;
  const p = mem.profile;

  useEffect(()=> {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const parsed = JSON.parse(s);
        setMem({...defaultMemory, ...parsed, profile:{...defaultMemory.profile, ...(parsed.profile||{})}});
        setScreen(parsed.onboardingCompleted ? "companion" : "welcome");
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(()=> {
    if (ready) localStorage.setItem(KEY, JSON.stringify(mem));
  }, [mem, ready]);

  function save(patch:any) { setMem(prev => ({...prev, ...patch})); }
  function saveProfile(patch:any) { setMem(prev => ({...prev, profile:{...prev.profile, ...patch}})); }
  function notify(t:string) { setToast(t); setTimeout(()=>setToast(""),2600); }
  function greeting(m=mem) { return `${m.profile.userNickname} กลับมาแล้วเหรอ${m.gender==="female"?"คะ":"ครับ"} ${m.profile.nongnamName} รออยู่เลย 💗`; }
  function addSub(t:string) { setMem(prev => ({...prev, subtitles:[...prev.subtitles,t].slice(-8)})); }
  function addHistory(role:"user"|"assistant", content:string) { setMem(prev => ({...prev, history:[...prev.history,{role,content}].slice(-12)})); }

  function selectGender(g:Gender) {
    setMem(prev => ({...prev, gender:g, outfit:0}));
  }

  function toggleTrait(id:string) {
    const arr = p.personalityTraits;
    saveProfile({ personalityTraits: arr.includes(id) ? arr.filter(x=>x!==id) : [...arr,id] });
  }

  function selectOutfit(i:number) {
    if (!mem.unlocked[gender].includes(i)) return notify(`ชุดนี้ยังล็อกอยู่ ต้องใช้เครดิต ${outfits[i]?.price || 0} 💎`);
    save({ outfit:i });
    notify(`เปลี่ยนเป็น ${outfits[i].name} แล้ว`);
  }

  function completeOnboarding() {
    setMem(prev => ({...prev, onboardingCompleted:true, subtitles:[greeting(prev)], history:[]}));
    setScreen("companion");
  }

  function resetAll() {
    if (!confirm("ลบความจำทั้งหมดไหม?")) return;
    localStorage.removeItem(KEY);
    setMem(defaultMemory);
    setScreen("welcome");
  }

  function speak(t:string) {
    if (!("speechSynthesis" in window)) return setStatus("idle");
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/[💗💕✨🥺🤗😊🥰📋🍚🌸😮‍💨]/g,""));
    u.lang = "th-TH";
    u.pitch = gender === "female" ? 1.12 : .9;
    u.rate = 1.03;
    u.onstart = () => setStatus("speaking");
    u.onend = () => setStatus("idle");
    u.onerror = () => setStatus("idle");
    speechSynthesis.speak(u);
  }

  async function sendToAI(text:string) {
    const message = text.trim();
    if (!message) return;
    addHistory("user", message);
    setStatus("thinking");
    try {
      const r = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message,
          profile: {...p, nongnamGender:gender},
          history: mem.history.slice(-8)
        })
      });
      const data = await r.json();
      if (!r.ok) {
        console.error(data);
        addSub(data.error || "น้องน้ำตอบไม่ได้ในตอนนี้");
        return setStatus("idle");
      }
      addSub(data.reply);
      addHistory("assistant", data.reply);
      speak(data.reply);
    } catch(e) {
      console.error(e);
      addSub("ระบบเชื่อมต่อ AI ไม่สำเร็จค่ะ");
      setStatus("idle");
    }
  }

  async function sendText() {
    const t = input.trim();
    if (!t) return;
    setInput("");
    await sendToAI(t);
  }

  function cleanup() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach(t=>t.stop());
    stream.current = null;
    rec.current = null;
    chunks.current = [];
    setMs(0);
  }

  async function startRecording(e:any) {
    e.preventDefault(); e.stopPropagation();
    if (status === "recording") return;
    if (!navigator.mediaDevices?.getUserMedia) return notify("เครื่องนี้ยังใช้ไมค์ในเว็บไม่ได้ค่ะ");
    try {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      chunks.current = [];
      const s = await navigator.mediaDevices.getUserMedia({audio:true});
      stream.current = s;
      const mt = mimeType();
      const r = mt ? new MediaRecorder(s,{mimeType:mt}) : new MediaRecorder(s);
      rec.current = r;
      r.ondataavailable = ev => { if (ev.data?.size) chunks.current.push(ev.data); };
      r.onstop = async () => {
        const elapsed = Date.now() - startAt.current;
        const type = r.mimeType || "audio/webm";
        const blob = new Blob(chunks.current,{type});
        cleanup();
        if (elapsed < 500 || blob.size < 1000) {
          setStatus("idle");
          return notify("เสียงสั้นเกินไป กดค้างแล้วพูดให้นานขึ้นนิดนึงนะคะ");
        }
        await transcribe(blob, type);
      };
      startAt.current = Date.now();
      r.start(250);
      setStatus("recording");
      timer.current = setInterval(()=>setMs(Date.now()-startAt.current),100);
    } catch(e) {
      console.error(e);
      cleanup();
      setStatus("idle");
      notify("ยังเปิดไมค์ไม่ได้ กรุณาอนุญาตไมค์ใน Safari/Chrome ก่อนนะคะ");
    }
  }

  function stopRecording(e:any) {
    e.preventDefault(); e.stopPropagation();
    if (rec.current && rec.current.state !== "inactive") {
      setStatus("transcribing");
      rec.current.stop();
    }
  }

  function cancelRecording(e:any) {
    e.preventDefault();
    cleanup();
    setStatus("idle");
  }

  async function transcribe(blob:Blob, type:string) {
    setStatus("transcribing");
    try {
      const ext = type.includes("mp4") ? "m4a" : type.includes("mpeg") ? "mp3" : "webm";
      const form = new FormData();
      form.append("audio", new File([blob], `speech.${ext}`, {type}));
      const r = await fetch("/api/transcribe", { method:"POST", body:form });
      const data = await r.json();
      if (!r.ok) {
        console.error(data);
        addSub("ถอดเสียงไม่สำเร็จค่ะ ลองพูดใหม่อีกครั้งนะคะ");
        return setStatus("idle");
      }
      const text = String(data.text || "").trim();
      if (!text) {
        addSub("น้ำยังถอดเสียงไม่ออกค่ะ ลองพูดชัด ๆ อีกทีนะคะ");
        return setStatus("idle");
      }
      addSub(`พี่พูดว่า: ${text}`);
      await sendToAI(text);
    } catch(e) {
      console.error(e);
      addSub("ระบบถอดเสียงเชื่อมต่อไม่สำเร็จค่ะ");
      setStatus("idle");
    }
  }

  const statusText = status==="recording" ? `กำลังอัดเสียง ${(ms/1000).toFixed(1)} วิ... ปล่อยเพื่อส่ง`
    : status==="transcribing" ? "กำลังถอดเสียง..."
    : status==="thinking" ? "น้องน้ำกำลังคิด..."
    : status==="speaking" ? "น้องน้ำกำลังพูด..."
    : "พร้อมคุยกับพี่แล้ว ✨";

  if (!ready) return null;

  return <main className="app">
    {screen==="welcome" && <section className="screen"><div className="hero">
      <div className="badge">🌸 Nong Nam AI · Real Outfit Ready</div>
      <h1>สร้าง<br/><em>น้องน้ำ</em>ของคุณ</h1>
      <p>เวอร์ชันนี้พร้อมแล้วสำหรับการใส่ “รูปจริง” เข้าแอป พร้อมเปลี่ยนชุด และซูมดูใกล้ ๆ ด้วยการจีบ/กางนิ้ว</p>
      <button className="primary" onClick={()=>setScreen(mem.onboardingCompleted?"companion":"gender")}>เริ่มใช้งาน →</button>
      <button className="secondary" onClick={resetAll}>รีเซ็ตข้อมูลทั้งหมด</button>
    </div></section>}

    {screen==="gender" && <section className="screen">
      <div className="top"><button className="icon" onClick={()=>setScreen("welcome")}>←</button><div className="brand"><h2>เลือกน้องน้ำ</h2><p>น้องน้ำของคุณคือผู้หญิงหรือผู้ชาย?</p></div><div style={{width:48}}/></div>
      <div className="grid">
        <div className={`card ${gender==="female"?"selected":""}`} onClick={()=>selectGender("female")}><div className="preview"><img src={characters.female.avatar}/></div><h3>น้องน้ำ ♀</h3><p>อบอุ่น อ่อนโยน</p></div>
        <div className={`card ${gender==="male"?"selected":""}`} onClick={()=>selectGender("male")}><div className="preview"><img src={characters.male.avatar}/></div><h3>น้องน้ำ ♂</h3><p>สุภาพ พึ่งพาได้</p></div>
      </div>
      <div className="bottom-next"><button className="primary full" onClick={()=>setScreen("profile")}>ต่อไป →</button></div>
    </section>}

    {screen==="profile" && <section className="screen">
      <div className="top"><button className="icon" onClick={()=>setScreen("gender")}>←</button><div className="brand"><h2>ตั้งค่าน้องน้ำ</h2><p>ข้อมูลนี้จะจำไว้ในเครื่อง</p></div><div style={{width:48}}/></div>
      <div className="form">
        <label>อยากให้น้องน้ำเรียกคุณว่าอะไร</label><input value={p.userNickname} onChange={e=>saveProfile({userNickname:e.target.value})}/>
        <label>ตั้งชื่อน้องน้ำ</label><input value={p.nongnamName} onChange={e=>saveProfile({nongnamName:e.target.value})}/>
        <div className="row"><div><label>อายุ</label><input value={p.nongnamAge} onChange={e=>saveProfile({nongnamAge:e.target.value})}/></div><div><label>วันเกิด</label><input value={p.nongnamBirthday} onChange={e=>saveProfile({nongnamBirthday:e.target.value})}/></div></div>
        <div className="row"><div><label>ส่วนสูง</label><input value={p.nongnamHeight} onChange={e=>saveProfile({nongnamHeight:e.target.value})}/></div><div><label>น้ำหนัก</label><input value={p.nongnamWeight} onChange={e=>saveProfile({nongnamWeight:e.target.value})}/></div></div>
        <label>โหมดความสัมพันธ์</label><select value={p.relationshipMode} onChange={e=>saveProfile({relationshipMode:e.target.value})}><option value="friend">เพื่อนคุย</option><option value="secretary">เลขาส่วนตัว</option><option value="warmPartner">ฟีลแฟนอบอุ่น</option></select>
        <label>บุคลิก</label><div className="traits">{traits.map(([id,label])=><button type="button" key={id} className={`trait ${p.personalityTraits.includes(id)?"active":""}`} onClick={()=>toggleTrait(id)}>{label}</button>)}</div>
      </div>
      <div className="bottom-next"><button className="primary full" onClick={()=>setScreen("outfit")}>บันทึกและเลือกชุด →</button></div>
    </section>}

    {screen==="outfit" && <section className="screen">
      <div className="top"><button className="icon" onClick={()=>setScreen("profile")}>←</button><div className="brand"><h2>เลือกชุด</h2><p>กดชุดเพื่อสลับลุคทันที</p></div><button className="icon" onClick={()=>setScreen("companion")}>✓</button></div>
      <div className="stage">
        <div className="stage-pill">แตะค้าง/จีบเพื่อดูใกล้ ๆ</div>
        <div className="stage-name">{p.nongnamName}</div>
        <ZoomableImage src={avatar} alt={p.nongnamName} className="stage-zoom"/>
      </div>
      <div className="outfits">{outfits.map((o,i)=>{const unlocked=mem.unlocked[gender].includes(i);return <div key={o.id} className={`outfit ${i===mem.outfit&&unlocked?"selected":""}`} onClick={()=>selectOutfit(i)}><div className="mini"><img src={o.image}/>{!unlocked&&<div className="lock">🔒</div>}</div>{i===mem.outfit&&unlocked&&<div className="tick">✓</div>}<div className="info"><b>LEVEL {i+1}: {o.name}</b><span>{o.desc}</span><div className={`price ${o.price===0?"free":""}`}>{o.price===0?"ฟรี":`💎 ${o.price}`}</div></div></div>})}</div>
      <div className="bottom-next"><button className="primary full" onClick={completeOnboarding}>เริ่มคุย →</button></div>
    </section>}

    {screen==="companion" && <section className="screen companion">
      <div className="companion-stage">
        <div className={`avatar ${status==="speaking"?"speaking":""}`}><ZoomableImage src={avatar} alt={p.nongnamName} /></div>
        <div className="float-top"><button className="icon" onClick={()=>setScreen("outfit")}>☰</button><div className="pill">{p.nongnamName} AI</div><div className="pill">💎 {mem.gems}</div></div>
        <div className="name">{p.nongnamName}</div>
        <div className={`status ${status}`}>{statusText}</div>
        <div className="subs">{(mem.subtitles.length?mem.subtitles:[greeting()]).slice(-3).reverse().map((t,i)=><div key={i} className={`subline ${i===1?"old1":""} ${i===2?"old2":""}`}>{t}</div>)}</div>
        <div className="quick"><button onClick={()=>sendToAI("คิดถึง")}>💗 คิดถึง</button><button onClick={()=>sendToAI("วันนี้เหนื่อย")}>😮‍💨 วันนี้เหนื่อย</button><button onClick={()=>sendToAI("ช่วยวางแผน")}>📋 ช่วยวางแผน</button><button onClick={()=>sendToAI("คุยเล่น")}>😊 คุยเล่น</button></div>
        <div className="bottom"><button className="side" onClick={()=>setScreen("outfit")}>👗 ชุด</button><div className="center">
          <button className={`mic ${status==="recording"?"listening":""}`} onPointerDown={startRecording} onPointerUp={stopRecording} onPointerCancel={cancelRecording} onContextMenu={e=>e.preventDefault()}>{status==="recording"?"🔴":"🎙"}</button>
          <div className="hint">{status==="recording"?"ปล่อยนิ้วเพื่อส่งเสียง":"กดค้างไว้แล้วพูด"}</div>
          <div className="inputrow"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="พิมพ์คุยกับน้องน้ำ..." onKeyDown={e=>{if(e.key==="Enter")sendText()}}/><button className="send" onClick={sendText}>➤</button></div>
        </div><button className="side" onClick={()=>setScreen("profile")}>⚙️ ตั้งค่า</button></div>
      </div>
    </section>}

    {toast && <div className="toast show">{toast}</div>}
  </main>;
}
