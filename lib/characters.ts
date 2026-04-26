
export type Gender = "female" | "male";
export type OutfitCategory = "regular" | "special20";
export type Outfit = {
  id:string;
  name:string;
  desc:string;
  price:number;
  locked:boolean;
  image:string;
  category:OutfitCategory;
  gender:Gender;
  ageRestricted:boolean;
};

export const DEV_UNLOCK_ALL = true;
export const DEV_SKIP_AGE_GATE = true;
export const DEV_START_GEMS = 1200;

function makeOutfit(gender:Gender, category:OutfitCategory, id:string, name:string, desc:string, price:number, locked:boolean, ageRestricted=false): Outfit {
  const folder = category === "special20" ? "special20" : gender;
  return {
    id,
    name,
    desc,
    price,
    locked: DEV_UNLOCK_ALL ? false : locked,
    image: `/assets/outfits/${folder}/${id}.jpg`,
    category,
    gender,
    ageRestricted
  };
}

export const characters: Record<Gender, { avatar:string; outfits:Outfit[] }> = {
  female: {
    avatar: "/assets/avatars/female/default.jpg",
    outfits: [
      makeOutfit("female","regular","level01_student","ชุดสุภาพเริ่มต้น","เรียบร้อย อบอุ่น",0,false),
      makeOutfit("female","regular","level02_student","ชุดนักศึกษา","สุภาพ น่ารัก",200,false),
      makeOutfit("female","regular","level03_casual","ชุดลำลอง","สบาย ๆ อบอุ่น",400,false),
      makeOutfit("female","regular","level04_pink","เดรสลำลอง","ดูดี น่ารัก",600,false),
      makeOutfit("female","regular","level05_soft","เดรสเรียบหรู","สวย สุภาพ",800,false),
      makeOutfit("female","regular","level06_sleep","ชุดผ่อนคลาย","อบอุ่น ผ่อนคลาย",1000,false),
      makeOutfit("female","regular","level07_black","ชุดพรีเมียม","มั่นใจ",1200,false),
      makeOutfit("female","regular","level08_sheer","ชุดพิเศษ","บางเบา สวยหรู",1400,false),
      makeOutfit("female","regular","level09_swim1","วันพีซ","สไตล์ทะเล",1600,false),
      makeOutfit("female","regular","level10_swim2","ทูพีซสดใส","ทะเล สดใส",1800,false),
      makeOutfit("female","regular","level11_swim3","ทูพีซพรีเมียม","มั่นใจ",2000,false),
      makeOutfit("female","regular","level12_swim4","ลิมิเต็ดบีช","ลิมิเต็ด",2500,false),

      makeOutfit("female","special20","sp20_01_sleep_lace","20+ ชุดนอนหวาน","โรแมนติก ผู้ใหญ่",10000,false,true),
      makeOutfit("female","special20","sp20_02_lounge_black","20+ ชุดลาวน์จดำ","หรู ดูแพง",10000,false,true),
      makeOutfit("female","special20","sp20_03_romantic_room","20+ ห้องโรแมนติก","อบอุ่น เป็นส่วนตัว",10000,false,true),
      makeOutfit("female","special20","sp20_04_silk_night","20+ ซิลก์ไนท์","นุ่ม ละมุน",10000,false,true),
      makeOutfit("female","special20","sp20_05_premium_red","20+ พรีเมียมเรด","ลิมิเต็ด",10000,false,true),
      makeOutfit("female","special20","sp20_06_private_gold","20+ ไพรเวตโกลด์","พิเศษ",10000,false,true)
    ]
  },
  male: {
    avatar: "/assets/avatars/male/default.jpg",
    outfits: [
      makeOutfit("male","regular","level01_student","ชุดสุภาพเริ่มต้น","เริ่มต้นใหม่ไปด้วยกัน",0,false),
      makeOutfit("male","regular","level02_blue","เชิ้ตฟ้า","สุภาพ สดใส",200,false),
      makeOutfit("male","regular","level03_beige","สเวตเตอร์อบอุ่น","นุ่มนวล",400,false),
      makeOutfit("male","regular","level04_black","เชิ้ตดำ","มั่นใจ",600,false),
      makeOutfit("male","regular","level05_suit","สูทสุภาพ","มืออาชีพ",800,false),
      makeOutfit("male","regular","level06_jacket","แจ็กเก็ตเบจ","อบอุ่น",1000,false),
      makeOutfit("male","regular","level07_black2","เชิ้ตพรีเมียม","ดูดี",1200,false),
      makeOutfit("male","regular","level08_coat","โค้ทเบจ","เรียบร้อย",1400,false),
      makeOutfit("male","regular","level09_dark","สูทดำ","พรีเมียม",1600,false),
      makeOutfit("male","regular","level10_beach","เชิ้ตทะเล","วันหยุด",1800,false),
      makeOutfit("male","regular","level11_swim","สไตล์ทะเล","ลิมิเต็ด",2000,false),
      makeOutfit("male","regular","level12_swim2","สปอร์ตทะเล","ลิมิเต็ด",2500,false)
    ]
  }
};
