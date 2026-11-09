// Names, GPS and times from the official site https://sukhothailoykrathong.com/about (plan data as of 18 Sep 2569 / 2026).
// English/Chinese are our translations (not official). Where a number appears at several spots, geos[0] is the primary one.
// 3D model types are stand-ins chosen from the activity's meaning, not architectural records.
export type LL = [lat: number, lng: number];
export type Row = { model: string; th: string; en: string; zh: string; geos: LL[]; when?: [string, string, string] };
const dly = (th: string, en: string, zh: string): [string, string, string] => [th, en, zh];
const market = dly('ตลาด: ทุกวัน 10:00 และ 16:00 น.', 'Markets: daily at 10:00 and 16:00', '市集：每天10:00和16:00');
const expo = dly('จัดแสดงสินค้า: ทุกวัน 09:00–10:00 น.', 'Product displays: daily 09:00–10:00', '产品展示：每天09:00–10:00');
/** Orange series (1–20): Loy Krathong / candle-burning / fireworks. */
export const festivalRows: Row[] = [
  { model: 'floating-pier', th: 'จุดปล่อยเรือสำหรับขบวนเรือท้าวศรีจุฬาลักษณ์', en: 'Boat launch point for the Thao Sri Chulalak boat procession', zh: '杜瓦·西朱拉拉花船游行放船点', geos: [[17.0204962, 99.7007834]] },
  { model: 'platform', th: 'การเล่นไฟ การแสดงพลุ และดอกไม้ไฟ', en: 'Fire play, fireworks and firework displays', zh: '烟火表演与焰火', geos: [[17.0206908, 99.702368], [17.0205697, 99.7034589], [17.0201797, 99.7035519], [17.0197938, 99.7036458]], when: dly('ทุกคืน 15–23 พ.ย. 22:00 น. · 24 พ.ย. 23:00 น. (ตระพังตระกวน)', 'Nightly 15–23 Nov at 22:00 · 24 Nov at 23:00 (Traphang Trakuan)', '11月15–23日每晚22:00 · 11月24日23:00（特拉潘特拉宽池）') },
  { model: 'platform', th: 'พิธีเผาเทียน', en: 'Candle-burning ceremony', zh: '烧烛仪式', geos: [[17.0196286, 99.7046188]], when: dly('24 พ.ย. 21:00 น. (ลานหน้าอนุสาวรีย์พ่อขุนรามคำแหง)', '24 Nov at 21:00 (in front of the King Ramkhamhaeng Monument)', '11月24日21:00（兰甘亨国王纪念碑前）') },
  { model: 'pavilion', th: 'การประกวดกระทงใหญ่ กระทงเล็ก โคมชัก โคมแขวน พนมหมาก และพนมดอกไม้', en: 'Contests: large and small krathong, pull and hanging lanterns, betel and flower arrangements', zh: '大小水灯、拉灯、挂灯、槟榔与花塔评选', geos: [[17.0192657, 99.7050181]], when: dly('15 พ.ย. 09:00 น. ประกวดพนมหมาก', '15 Nov at 09:00: betel-arrangement contest', '11月15日09:00：槟榔花塔评选') },
  { model: 'floating-pier', th: 'ท่าน้ำประกวดกระทงใหญ่', en: 'Pier for the large krathong contest', zh: '大水灯评选码头', geos: [[17.0186296, 99.7022554], [17.0182879, 99.7009121]], when: dly('15 พ.ย. รอบ 1 13:30 น. · รอบ 2 18:00 น.', '15 Nov: round 1 at 13:30 · round 2 at 18:00', '11月15日：第一轮13:30 · 第二轮18:00') },
  { model: 'platform', th: 'กระทงใหญ่', en: 'Large krathong', zh: '大水灯', geos: [[17.0199732, 99.7027709]] },
  { model: 'pavilion', th: 'ที่ประดิษฐานพระประทีปพระราชทาน', en: 'Enshrinement of the royal lamp', zh: '御赐灯供奉处', geos: [[17.0191164, 99.7016204]] },
  { model: 'floating-pier', th: 'ท่าน้ำพิธีลอยพระประทีปพระราชทาน', en: 'Pier for the royal lamp floating ceremony', zh: '御赐灯放灯仪式码头', geos: [[17.0190235, 99.7021053]], when: dly('24 พ.ย. 22:00 น. (ตระพังตระกวน)', '24 Nov at 22:00 (Traphang Trakuan)', '11月24日22:00（特拉潘特拉宽池）') },
  { model: 'food', th: 'จุดจำหน่ายกระทง (กระจายตามพื้นที่ต่างๆ ภายในบริเวณงานฯ)', en: 'Krathong sales points (scattered around the venue)', zh: '水灯销售点（分布于场内各处）', geos: [[17.0188971, 99.7039213], [17.0182514, 99.7039873]] },
  { model: 'arch', th: 'จุดรวมขบวนแห่จาก 4 ปากประตูหลวง', en: 'Assembly point for processions from the 4 royal gates', zh: '四座王门游行集合点', geos: [[17.0183325, 99.70688]], when: dly('15 พ.ย. 16:00 น. ขบวนแห่ · 24 พ.ย. 16:00 น. ขบวนหลวง ขบวนนางนพมาศ และขบวน 9 อำเภอ', '15 Nov at 16:00 procession · 24 Nov at 16:00 royal, Nang Nopphamat and 9-district processions', '11月15日16:00游行 · 11月24日16:00王家、娘诺帕玛丝及9县游行') },
  { model: 'stage', th: 'การแสดงศิลปวัฒนธรรม', en: 'Arts and culture performances', zh: '文化艺术表演', geos: [[17.0176868, 99.7049134]] },
  { model: 'stage', th: 'Light and Sound', en: 'Light and Sound', zh: '光影声音秀', geos: [[17.0172056, 99.7044101]], when: dly('ทุกคืน 19:00 น. (15–23 พ.ย.) · 24 พ.ย. 19:00 และ 20:30 น. · ราว 45 นาที · บัตร 1,200 / 900 / 500 บาท · โทร 06-1242-8555 (วัดมหาธาตุ)', 'Nightly 19:00 (15–23 Nov) · 24 Nov at 19:00 and 20:30 · about 45 min · tickets 1,200 / 900 / 500 THB · tel 06-1242-8555 (Wat Mahathat)', '每晚19:00（11月15–23日）· 11月24日19:00与20:30 · 约45分钟 · 票价1,200/900/500泰铢 · 电话06-1242-8555（玛哈泰寺）') },
  { model: 'tent', th: 'จุดตั้งขบวน', en: 'Procession staging area', zh: '游行集结区', geos: [[17.0156524, 99.7030162]] },
  { model: 'arch', th: 'ซุ้มทางเข้างาน', en: 'Event entrance arch', zh: '活动入口拱门', geos: [[17.0188594, 99.7062642], [17.0174454, 99.7066228]] },
  { model: 'floating-pier', th: 'จุดลอยกระทงสำหรับนักท่องเที่ยว (ประชาชน)', en: 'Krathong floating point for visitors (public)', zh: '游客（公众）放水灯点', geos: [[17.0192032, 99.703524], [17.0191728, 99.7031298], [17.0191122, 99.7027246]] },
  { model: 'stage', th: 'การแสดงตำนานท้าวศรีจุฬาลักษณ์', en: 'Legend of Thao Sri Chulalak performance', zh: '杜瓦·西朱拉拉传说演出', geos: [[17.0195703, 99.7020468]] },
  { model: 'arch', th: 'จุดหัวขบวนแห่', en: 'Head of the procession', zh: '游行队首', geos: [[17.0181449, 99.7051198]] },
  { model: 'stage', th: 'มหาลอยกระทง', en: 'Maha Loy Krathong (grand krathong floating)', zh: '盛大水灯节', geos: [[17.0185788, 99.704728]], when: dly('ทุกวัน 17:00 น.', 'Daily at 17:00', '每天17:00') },
  { model: 'tent', th: 'จุดจอดรถขบวนประทีปพระราชทาน', en: 'Parking for the royal lamp procession floats', zh: '御赐灯游行彩车停放点', geos: [[17.0179738, 99.7036381]] },
  { model: 'pavilion', th: 'นิทรรศการนานาชาติ', en: 'International exhibition', zh: '国际展览', geos: [[17.0179423, 99.7047542]] },
];
/** Purple series (1–23): tradition & culture. */
export const cultureRows: Row[] = [
  { model: 'platform', th: 'รับรุ่งอรุณแห่งความสุข', en: 'Welcoming the dawn of happiness', zh: '迎接幸福的黎明', geos: [[17.0179009, 99.7094388]], when: dly('ทุกวัน 06:00 น. (วัดตระพังทอง) · 15 พ.ย. 05:00 น.', 'Daily at 06:00 (Wat Traphang Thong) · 15 Nov at 05:00', '每天06:00（达潘通寺）· 11月15日05:00') },
  { model: 'food', th: 'การจัดแสดงและจำหน่ายสินค้า ผลิตภัณฑ์ชุมชน และผลิตภัณฑ์ OTOP', en: 'Community and OTOP product exhibition and sales', zh: '社区产品与OTOP产品展销', geos: [[17.0188607, 99.7057749]], when: expo },
  { model: 'pavilion', th: 'พิธีบวงสรวงบูรพกษัตริย์สุโขทัยทุกพระองค์', en: 'Ceremony honouring all former kings of Sukhothai', zh: '祭祀素可泰历代先王仪式', geos: [[17.0194747, 99.705302]], when: dly('15 พ.ย. 07:09 น.', '15 Nov at 07:09', '11月15日07:09') },
  { model: 'stage', th: 'พิธีเปิดงานประเพณีลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย', en: 'Opening ceremony of the Sukhothai Loy Krathong, Candle-Burning and Fireworks Festival', zh: '素可泰水灯烧烛烟火节开幕式', geos: [[17.0195804, 99.7050241]], when: dly('15 พ.ย. 16:00 น. (หน้าวัดสระศรี)', '15 Nov at 16:00 (in front of Wat Sa Si)', '11月15日16:00（沙西寺前）') },
  { model: 'rest', th: 'พื้นที่ชมขบวน', en: 'Procession viewing area', zh: '游行观赏区', geos: [[17.0185999, 99.7010854]] },
  { model: 'pavilion', th: 'การจำลองวิถีชีวิต สมัยกรุงสุโขทัย', en: 'Recreation of everyday life in the Sukhothai era', zh: '素可泰时代生活情景再现', geos: [[17.0180139, 99.7023269]] },
  { model: 'stage', th: 'การแสดงโขน ละคร หุ่น และการแสดงดนตรีไทยของนักเรียน', en: 'Khon, drama, puppet and Thai music performances by students', zh: '学生演出：孔剧、戏剧、木偶与泰国音乐', geos: [[17.0189007, 99.7035931]] },
  { model: 'food', th: 'ตลาดบ้านบ้านโขทัย', en: 'Ban Ban Sukhothai market', zh: '班班素可泰市集', geos: [[17.0179222, 99.7026041]], when: market },
  { model: 'food', th: 'ตลาดดงตาล', en: 'Dong Tan market', zh: '栋丹市集', geos: [[17.0177653, 99.7051667]], when: market },
  { model: 'food', th: 'ตลาดแลกเบี้ย', en: 'Cowrie-exchange market', zh: '贝币交换市集', geos: [[17.0176314, 99.7003231]], when: market },
  { model: 'stage', th: 'การประกวดนางนพมาศ', en: 'Nang Nopphamat beauty contest', zh: '娘诺帕玛丝选美', geos: [[17.0185267, 99.6994067]], when: dly('เปิดตัว 15 พ.ย. 19:30 · รอบแรก 18 พ.ย. · รอบคัดเลือก 20 พ.ย. · รอบตัดสิน 22 พ.ย. (เวลา 19:30 น. โรงละครกลางแจ้ง)', 'Intro 15 Nov · round 1 on 18 Nov · selection on 20 Nov · final on 22 Nov (all 19:30, open-air theatre)', '11月15日亮相 · 18日首轮 · 20日选拔 · 22日决赛（均为19:30，露天剧场）') },
  { model: 'food', th: 'ตลาดโบราณ วันวานที่คิดถึง', en: 'Old-time market "Yesterday We Miss"', zh: '怀旧古风市集', geos: [[17.0178257, 99.7014987]], when: market },
  { model: 'pavilion', th: 'มหกรรมสินค้าสหกรณ์', en: 'Cooperatives products fair', zh: '合作社产品博览会', geos: [[17.0191262, 99.7054161]], when: expo },
  { model: 'tent', th: 'การแสดงและจำหน่ายสินค้าทองเงิน สุโขทัยและผ้าไทย สาธิตการทำเครื่องเงินและการทอผ้า', en: 'Sukhothai gold and silverware and Thai textiles; silversmith and weaving demonstrations', zh: '素可泰金银器与泰国织物展销，银器制作与织布演示', geos: [[17.0185882, 99.7050688]], when: expo },
  { model: 'tent', th: 'การท่องเที่ยวชุมชนเชิงสร้างสรรค์', en: 'Creative community tourism', zh: '创意社区旅游', geos: [[17.0184183, 99.7027825]] },
  { model: 'pavilion', th: 'นิทรรศการเกี่ยวกับรางวัลด้านการท่องเที่ยวของสุโขทัย และการแสดงศิลปะ', en: 'Exhibition of Sukhothai tourism awards and art displays', zh: '素可泰旅游奖项展与艺术展示', geos: [[17.0171093, 99.70654]] },
  { model: 'pavilion', th: 'นิทรรศการ "35 ปี มรดกโลกสุโขทัย"', en: 'Exhibition "35 Years of Sukhothai World Heritage"', zh: '“素可泰世界遗产35周年”展', geos: [[17.0187334, 99.7027759]] },
  { model: 'pavilion', th: 'ลานเทศน์ ลานธรรม คณะสงฆ์จังหวัดสุโขทัย', en: 'Sermon and Dhamma ground, Sukhothai Sangha', zh: '素可泰僧团说法广场', geos: [[17.0171465, 99.7052836]] },
  { model: 'tent', th: 'ออมสิน 113 ปี สืบสานประเพณีเผาเทียน เล่นไฟ', en: 'GSB 113 years: continuing the candle-burning and fireworks tradition', zh: '政府储蓄银行113年：传承烧烛烟火传统', geos: [[17.0182084, 99.7004793]] },
  { model: 'food', th: 'ตลาดปสาน', en: 'Pasan market', zh: '帕散市集', geos: [[17.0175853, 99.7010038]], when: market },
  { model: 'food', th: 'ตลาดนัดพระเครื่อง พระบูชา', en: 'Amulet and Buddha image market', zh: '佛牌与佛像集市', geos: [[17.0180915, 99.7060598]], when: dly('ทุกวัน 08:00 น. (ดงตาล)', 'Daily at 08:00 (Dong Tan)', '每天08:00（栋丹）') },
  { model: 'stage', th: 'การแสดงพื้นบ้าน', en: 'Folk performances', zh: '民间表演', geos: [[17.0173468, 99.7056376]] },
  { model: 'food', th: 'ตลาดรถไส', en: 'Rot Sai market', zh: '洛赛市集', geos: [[17.0174082, 99.7062832]] },
];
