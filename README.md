# Nong Nam Next Voice MVP

ระบบใหม่:
- กดไมค์ค้างไว้ = อัดเสียง
- ปล่อยนิ้ว = ส่งเสียงไป /api/transcribe
- OpenAI ถอดเสียงเป็นข้อความ
- ส่งข้อความไป /api/chat
- น้องน้ำตอบกลับ
- ใช้ browser TTS พูดตอบก่อน

Vercel Environment Variable ที่ต้องมี:
OPENAI_API_KEY

วิธีใช้:
1. อัปโหลดไฟล์ทั้งหมดใน ZIP นี้แทนโปรเจกต์เดิมใน GitHub
2. Vercel จะ detect เป็น Next.js
3. Deploy ใหม่
4. เปิดเว็บ กดไมค์ค้างแล้วพูด
