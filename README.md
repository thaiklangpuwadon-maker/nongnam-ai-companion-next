# Nong Nam Next Voice MVP — Real Image + Outfit Switch + Pinch Zoom

เวอร์ชันนี้เพิ่มแล้ว:
- ใช้รูปจริงของน้องน้ำแทนรูปการ์ตูน (อย่างน้อยชุดเริ่มต้นฝั่งผู้หญิง)
- เปลี่ยนชุดได้จากหน้าชุด
- ซูม/เลื่อนรูปได้ด้วยนิ้ว (pinch zoom + pan)
- แตะสองครั้งเพื่อรีเซ็ตมุมมอง
- ปรับข้อความปุ่มไมค์ให้อ่านง่ายขึ้น

## ถ้าจะเปลี่ยนเป็นรูปจริงของพี่เองในอนาคต
แค่เอารูปใหม่ไปแทนไฟล์เดิมใน `public/assets/...` โดยใช้ชื่อไฟล์เดิม เช่น

### ผู้หญิง
- `public/assets/avatars/female/default.jpg`
- `public/assets/outfits/female/level01_student.jpg`
- `public/assets/outfits/female/level02_student.jpg`
- `public/assets/outfits/female/level03_casual.jpg`
- `public/assets/outfits/female/level04_pink.jpg`
- ... ไปเรื่อย ๆ

### ผู้ชาย
- `public/assets/avatars/male/default.jpg`
- `public/assets/outfits/male/level01_student.jpg`
- `public/assets/outfits/male/level02_blue.jpg`
- ... ไปเรื่อย ๆ

## วิธีอัปเดต GitHub ง่ายที่สุด
1. เปิด repo
2. Add file > Upload files
3. ลากไฟล์ทั้งหมดของโปรเจกต์นี้ลงไป
4. Commit changes
5. ไปที่ Vercel แล้ว Redeploy

## หมายเหตุเรื่องชุด
เวอร์ชันนี้เป็นการ "สลับรูปทั้งตัว" เมื่อกดเปลี่ยนชุด
ถ้าอนาคตพี่อยากได้แบบ "ตัวเดิม แต่เสื้อผ้าถูกสวมทับเป็นเลเยอร์" จะต้องทำเป็นระบบ layer PNG โปร่งใสแยกอีกเวอร์ชันหนึ่ง
