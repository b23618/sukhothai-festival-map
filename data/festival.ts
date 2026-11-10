import type { Localized } from './points';
const t = (th: string, en: string, zh: string): Localized => ({ th, en, zh });
/** Festival-level facts taken from the official site https://sukhothailoykrathong.com (fetched 2026-11-09). Anything not listed there is left empty. */
export const festival = {
  title: t('งานลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย 2569', 'Sukhothai Loy Krathong, Candle-Burning & Fireworks Festival 2026', '素可泰水灯节·烧烛·烟火 2026'),
  dates: { start: '2026-11-15', end: '2026-11-24' },
  datesText: t('15–24 พฤศจิกายน 2569', '15–24 November 2026', '2026年11月15日–24日'),
  loyKrathongDay: t('วันลอยกระทง: 24 พฤศจิกายน 2569 (ขึ้น 15 ค่ำ เดือน 12)', 'Loy Krathong day: 24 November 2026 (full moon of the 12th lunar month)', '水灯节当天：2026年11月24日（农历十二月十五）'),
  venue: t('อุทยานประวัติศาสตร์สุโขทัย จังหวัดสุโขทัย', 'Sukhothai Historical Park, Sukhothai Province', '素可泰历史公园，素可泰府'),
  phone: '055-611-619',
  site: 'https://sukhothailoykrathong.com',
  /** Venue centre (OpenStreetMap-derived midpoint of landmarks A–H). */
  center: { lat: 17.0185, lng: 99.7035 },
  activities: [
    t('ขบวนแห่นางนพมาศ', 'Nang Nopphamat procession', '娘诺帕玛丝游行'),
    t('เผาเทียนเล่นไฟ', 'Candle-burning and fire play', '烧烛与烟火表演'),
    t('แสง สี เสียง สุดตระการตา', 'Light, colour and sound show', '光影声音秀'),
    t('ลอยกระทง', 'Krathong floating', '放水灯'),
    t('ตลาดย้อนยุค อาหารพื้นเมือง', 'Retro market with local food', '复古集市与地方美食'),
    t('การแสดงศิลปะวัฒนธรรม', 'Cultural arts performances', '文化艺术表演'),
  ],
  /** Key dates from https://sukhothailoykrathong.com/about (fetched 2026-11-09). */
  timeline: [
    { date: t('15 พ.ย.', '15 Nov', '11月15日'), text: t('รับรุ่งอรุณ 05:00 · บวงสรวง 07:09 · ประกวดพนมหมาก 09:00 · ประกวดกระทงใหญ่ 13:30 และ 18:00 · ขบวนแห่และพิธีเปิดงาน 16:00 (หน้าวัดสระศรี) · เปิดตัวผู้ประกวดนางนพมาศ 19:30', 'Dawn welcome 05:00 · offering ceremony 07:09 · betel-arrangement contest 09:00 · large krathong contest 13:30 & 18:00 · procession and opening 16:00 (in front of Wat Sa Si) · Nang Nopphamat contestants introduced 19:30', '05:00迎接黎明 · 07:09祭祀 · 09:00槟榔花塔评选 · 13:30与18:00大水灯评选 · 16:00游行与开幕式（沙西寺前）· 19:30娘诺帕玛丝选手亮相') },
    { date: t('18 / 20 / 22 พ.ย.', '18 / 20 / 22 Nov', '11月18/20/22日'), text: t('ประกวดนางนพมาศ รอบแรก / คัดเลือก / ตัดสิน เวลา 19:30 · 22 พ.ย. พิธีมอบถ้วยรางวัล 19:00 และถ้วยพระราชทาน 20:30', 'Nang Nopphamat contest: first round / selection / final at 19:30 · 22 Nov trophy ceremony 19:00 and royal cup 20:30', '娘诺帕玛丝：首轮/选拔/决赛19:30 · 11月22日颁奖19:00，御赐奖杯20:30') },
    { date: t('19 พ.ย.', '19 Nov', '11月19日'), text: t('โชว์ อ๊อฟ สุรพล ที่เวทีแรกนาขวัญ ตลาดสินค้าสหกรณ์ (ยังไม่ระบุเวลา)', 'Show by Off Surapol at Raknakhwan Stage, Cooperative Goods Market (time not announced;)', '奥夫·苏拉蓬在农耕祈福舞台（合作社商品市场）演出（时间未公布）') },
    { date: t('23 พ.ย.', '23 Nov', '11月23日'), text: t('พิธีรับไฟพระฤกษ์และพระประทีปพระราชทาน 19:00 น. หน้าสำนักงานเทศบาลเมืองสุโขทัยธานี (นอกอุทยานฯ)', 'Ceremony receiving the royal flame and lamp, 19:00, in front of Sukhothai Thani Municipality (outside the park)', '19:00在素可泰他尼市政厅前举行迎接御赐圣火与灯仪式（公园外）') },
    { date: t('24 พ.ย. (วันลอยกระทง)', '24 Nov (Loy Krathong day)', '11月24日（水灯节）'), text: t('09:00 ขบวนแห่ไฟพระฤกษ์ไปตระพังตระกวน · 16:00 ขบวนหลวง ขบวนนางนพมาศ ขบวน 9 อำเภอ · 19:00 และ 20:30 Light and Sound (วัดมหาธาตุ) · 21:00 พิธีเผาเทียน · 22:00 ลอยพระประทีปพระราชทาน · 23:00 เล่นไฟ พลุ ดอกไม้ไฟ · 20:30–21:30 โชว์ อ้น ภานุวัฒน์ (เวทีแรกนาขวัญ ตลาดสินค้าสหกรณ์ ข้างลานพระบรมราชานุสาวรีย์พ่อขุนรามคำแหง)', '09:00 royal-flame procession to Traphang Trakuan · 16:00 royal, Nang Nopphamat and 9-district processions · 19:00 & 20:30 Light and Sound (Wat Mahathat) · 21:00 candle burning · 22:00 royal lamp floating · 23:00 fire play and fireworks · 20:30–21:30 show by Aun Phanuwat (Raknakhwan Stage, Cooperative Goods Market, beside the King Ramkhamhaeng Monument plaza)', '09:00圣火游行至特拉潘特拉宽池 · 16:00王家/娘诺帕玛丝/9县游行 · 19:00与20:30光影声音秀（玛哈泰寺）· 21:00烧烛 · 22:00御赐灯放灯 · 23:00烟火 · 20:30–21:30 阿恩·帕努瓦（农耕祈福舞台，合作社商品市场，位于兰甘亨大帝纪念碑广场旁）') },
    { date: t('ทุกวัน 15–24 พ.ย.', 'Daily 15–24 Nov', '每天11月15–24日'), text: t('รับรุ่งอรุณ 06:00 (วัดตระพังทอง) · ตลาดนัดพระเครื่อง 08:00 · ตลาดต่าง ๆ 10:00 และ 16:00 · มหาลอยกระทง 17:00 · Light and Sound 19:00 (15–23 พ.ย.) · เล่นไฟ 22:00 (15–23 พ.ย.)', 'Dawn welcome 06:00 (Wat Traphang Thong) · amulet market 08:00 · markets 10:00 & 16:00 · Maha Loy Krathong 17:00 · Light and Sound 19:00 (15–23 Nov) · fire play 22:00 (15–23 Nov)', '06:00迎接黎明（达潘通寺）· 08:00佛牌集市 · 10:00与16:00市集 · 17:00盛大水灯节 · 19:00光影声音秀（11月15–23日）· 22:00烟火（11月15–23日）') },
  ],
  /** Royal-flame ceremony venue, outside the park (~12 km east). Confirm with organizers before travelling. */
  flameCeremony: { lat: 17.014321, lng: 99.8217948 },
  lightSound: t('Light and Sound: บัตร 1,200 / 900 / 500 บาท · โทร 06-1242-8555', 'Light and Sound tickets 1,200 / 900 / 500 THB · tel 06-1242-8555', '光影声音秀票价 1,200 / 900 / 500 泰铢 · 电话 06-1242-8555'),
  note: t('ข้อมูลจากเว็บไซต์ทางการ ณ 9 พ.ย. 2569 (ผังงาน ณ 18 ก.ย.) อาจเปลี่ยนแปลง โปรดตรวจสอบกับ ททท./จังหวัดสุโขทัย', 'From the official site as of 9 Nov 2026 (plan as of 18 Sep); subject to change. Confirm with TAT / Sukhothai province.', '取自官网（2026年11月9日；场地图截至9月18日），可能有变动，请向泰国旅游局/素可泰府核实。'),
};
/** Getting-there info from https://sukhothailoykrathong.com/places (fetched 2026-11-09). Names are verbatim Thai; English/Chinese are translations. */
export const places = {
  source: { label: 'sukhothailoykrathong.com/places', url: 'https://sukhothailoykrathong.com/places' },
  shuttle: t('รถคอกหมูรับ-ส่งฟรี จากที่จอดรถหลังร้านสินวนาและสนามบอลโรงเรียนลิไทฯ ทุก 20 นาที 16:00–24:00 ช่วงเทศกาล · จุดรับ-ส่งหลัก: ประตูทางเข้าอุทยานประวัติศาสตร์สุโขทัย', 'Free "Khok Mu" truck shuttle from the Sinwana-shop rear lot and the Likhai School football field, every 20 min, 16:00–24:00 during the festival · main drop-off: the Sukhothai Historical Park entrance gate', '免费“Khok Mu”接驳车：从Sinwana商店后停车场和Likhai学校足球场出发，节庆期间16:00–24:00每20分钟一班 · 主要上下车点：素可泰历史公园入口'),
  hubs: [
    t('สนามบินสุโขทัย — Bangkok Airways ราว 1 ชม. 20 นาทีจากสุวรรณภูมิ แล้วต่อรถอีกราว 41 กม.', 'Sukhothai Airport — Bangkok Airways, about 1 h 20 min from Suvarnabhumi, then about 41 km by road', '素可泰机场 — 曼谷航空，从素万那普约1小时20分钟，再乘车约41公里'),
    t('สนามบินพิษณุโลก — จากดอนเมือง แล้วต่อรถอีกราว 80 กม.', 'Phitsanulok Airport — from Don Mueang, then about 80 km by road', '彭世洛机场 — 从廊曼出发，再乘车约80公里'),
    t('หมอชิต 2 / สถานีขนส่งสุโขทัย — รถโดยสารหลายเที่ยวต่อวัน รถรับ-ส่งอุทยาน 06:00–18:00 ทุกวัน', 'Mo Chit 2 / Sukhothai Bus Terminal — several buses daily; park shuttle daily 06:00–18:00', '莫奇2站/素可泰客运站 — 每日多班大巴；公园接驳车每日06:00–18:00'),
    t('สถานีรถไฟพิษณุโลก — สถานีที่ใกล้ที่สุด (สุโขทัยไม่มีสถานีรถไฟ)', 'Phitsanulok Railway Station — nearest station (Sukhothai has none)', '彭世洛火车站 — 最近的火车站（素可泰没有火车站）'),
  ],
  contacts: [
    { label: t('ข้อมูลงาน/อุทยาน', 'Festival / park info', '活动/公园咨询'), tel: '055697310' }, { label: t('ตำรวจท่องเที่ยว', 'Tourist police', '旅游警察'), tel: '1155' }, { label: t('ศูนย์บริการนักท่องเที่ยว', 'Tourist service center', '游客服务中心'), tel: '1672' },
    { label: t('การแพทย์ฉุกเฉิน', 'Medical emergency', '医疗急救'), tel: '1669' }, { label: t('แจ้งเหตุด่วน ตำรวจ', 'Police emergency', '警察报警'), tel: '191' }, { label: t('ดับเพลิง', 'Fire', '消防'), tel: '199' },
  ],
};
