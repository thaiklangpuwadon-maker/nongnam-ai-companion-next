export type Gender = "female" | "male";
export type Outfit = { id:string; name:string; desc:string; price:number; locked:boolean; image:string; };

export const characters: Record<Gender, { avatar:string; outfits:Outfit[] }> = {
  female: {
    avatar: "/assets/avatars/female/default.jpg",
    outfits: [
      ["level01_student","ชุดสุภาพเริ่มต้น","เรียบร้อย อบอุ่น",0,false],
      ["level02_student","ชุดนักศึกษา","สุภาพ น่ารัก",200,true],
      ["level03_casual","ชุดลำลอง","สบาย ๆ อบอุ่น",400,true],
      ["level04_pink","เดรสลำลอง","ดูดี น่ารัก",600,true],
      ["level05_soft","เดรสเรียบหรู","สวย สุภาพ",800,true],
      ["level06_sleep","ชุดผ่อนคลาย","อบอุ่น ผ่อนคลาย",1000,true],
      ["level07_black","ชุดพรีเมียม","มั่นใจ",1200,true],
      ["level08_sheer","ชุดพิเศษ","บางเบา",1400,true],
      ["level09_swim1","วันพีซ","สไตล์ทะเล",1600,true],
      ["level10_swim2","บิกินี่ขาว","สดใส",1800,true],
      ["level11_swim3","บิกินี่ดำ","พรีเมียม",2000,true],
      ["level12_swim4","บิกินี่แดง","ลิมิเต็ด",2500,true]
    ].map(([id,name,desc,price,locked]) => ({
      id: id as string, name: name as string, desc: desc as string, price: price as number, locked: locked as boolean,
      image: `/assets/outfits/female/${id}.jpg`
    }))
  },
  male: {
    avatar: "/assets/avatars/male/default.jpg",
    outfits: [
      ["level01_student","ชุดสุภาพเริ่มต้น","เริ่มต้นใหม่ไปด้วยกัน",0,false],
      ["level02_blue","เชิ้ตฟ้า","สุภาพ สดใส",200,true],
      ["level03_beige","สเวตเตอร์อบอุ่น","นุ่มนวล",400,true],
      ["level04_black","เชิ้ตดำ","มั่นใจ",600,true],
      ["level05_suit","สูทสุภาพ","มืออาชีพ",800,true],
      ["level06_jacket","แจ็กเก็ตเบจ","อบอุ่น",1000,true],
      ["level07_black2","เชิ้ตพรีเมียม","ดูดี",1200,true],
      ["level08_coat","โค้ทเบจ","เรียบร้อย",1400,true],
      ["level09_dark","สูทดำ","พรีเมียม",1600,true],
      ["level10_beach","เชิ้ตทะเล","วันหยุด",1800,true],
      ["level11_swim","สไตล์ทะเล","ลิมิเต็ด",2000,true],
      ["level12_swim2","สปอร์ตทะเล","ลิมิเต็ด",2500,true]
    ].map(([id,name,desc,price,locked]) => ({
      id: id as string, name: name as string, desc: desc as string, price: price as number, locked: locked as boolean,
      image: `/assets/outfits/male/${id}.jpg`
    }))
  }
};
