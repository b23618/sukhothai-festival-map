import type { Localized } from './points';
const t = (th: string, en: string, zh: string): Localized => ({ th, en, zh });
/** Daily programme transcribed from the official PDF "sukhothai-loykrathong-2569-schedule" (sukhothailoykrathong.com/about#schedule, plan dated 1 Oct 2569).
 *  Thai titles/locations/organisers are verbatim; English/Chinese are translations by the maker (Chinese pending review). Times may change. */
export const SCHEDULE_SOURCE = { label: 'sukhothailoykrathong.com/about#schedule', url: 'https://sukhothailoykrathong.com/about#schedule' };
export const DAYS = ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24'] as const;
export type DayKey = (typeof DAYS)[number];
export interface ScheduleItem { time: string; title: Localized; place: Localized; by?: string; key?: boolean; extra?: boolean;
  /** Stall/market/exhibition that stays open (assumed until 22:00; the PDF gives start times only). */ stay?: boolean;
  /** Show length in minutes when known; otherwise 60 is assumed for live status. */ dur?: number }
// ── locations ─────────────────────────────────────────────────────────────
const L = {
  trapangThong: t('วัดตระพังทอง', 'Wat Traphang Thong', '达潘通寺'),
  monument: t('ลานพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'King Ramkhamhaeng Monument plaza', '兰甘亨大帝纪念碑广场'),
  monumentFront: t('ด้านหน้าพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'In front of the King Ramkhamhaeng Monument', '兰甘亨大帝纪念碑前'),
  monumentSide: t('ข้างลานพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'Beside the monument plaza', '纪念碑广场旁'),
  newTemple: t('ลานข้างวัดใหม่', 'Lawn beside Wat Mai', '新寺旁草坪'),
  dongtan: t('ดงตาล', 'Dong Tan (palm grove)', '棕榈林（Dong Tan）'),
  dongtanToilet: t('ดงตาล (ระหว่างห้องน้ำด้านอุทยานประวัติศาสตร์สุโขทัย)', 'Dong Tan (by the park-side restrooms)', '棕榈林（公园侧洗手间之间）'),
  dongtanRoad: t('ดงตาล (ริมถนนฝั่งตรงข้ามวัดมหาธาตุ)', 'Dong Tan (roadside opposite Wat Mahathat)', '棕榈林（玛哈泰寺对面路边）'),
  dongtanPrasat: t('ดงตาล (ฝั่งเนินปราสาท)', 'Dong Tan (Noen Prasat side)', '棕榈林（宫殿丘一侧）'),
  leelawadee: t('ดงลีลาวดี หน้าทางเข้าบริเวณลานด้านหน้าพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'Dong Leelawadee, at the entrance to the monument plaza', '鸡蛋花林，纪念碑广场入口处'),
  salaMuang: t('ศาลาป่าม่วง ด้านหลังวัดมหาธาตุ', 'Mango-grove pavilion behind Wat Mahathat', '玛哈泰寺后芒果林凉亭'),
  saSri: t('บริเวณหน้าวัดสระศรี', 'In front of Wat Sa Si', '沙西寺前'),
  road: t('ถนนภายในอุทยานประวัติศาสตร์สุโขทัย', 'Roads inside the historical park', '历史公园内道路'),
  salaFour: t('ศาลาสี่หลัง', 'Four-pavilion hall', '四亭堂'),
  sraYaiPeng: t('ด้านข้างสระยายเพิ้ง', 'Beside Sa Yai Phueng pond', '雅彭池旁'),
  mainRoad: t('พื้นที่ริมถนนสายหลักเมือง และวัดชนะสงคราม', 'Main road and Wat Chana Songkhram', '主干道及战胜寺一带'),
  behindChana: t('หลังวัดชนะสงคราม', 'Behind Wat Chana Songkhram', '战胜寺后'),
  behindChanaB: t('ด้านหลังวัดชนะสงคราม', 'Behind Wat Chana Songkhram', '战胜寺后'),
  behindChedi: t('ด้านหลังเจดีย์เชื่อมต่อระหว่างตลาดโบราณ วันวานที่คิดถึง กับตลาดแลกเบี้ย', 'Behind the chedi linking the old market and the cowrie market', '连接复古集市与贝币集市的佛塔后方'),
  chana: t('วัดชนะสงคราม', 'Wat Chana Songkhram', '战胜寺'),
  semicircle: t('เวทีครึ่งวงกลม ด้านหน้าวัดมหาธาตุ', 'Semicircular stage in front of Wat Mahathat', '玛哈泰寺前半圆舞台'),
  besideKing: t('ด้านข้างกระดิ่งพ่อขุน', 'Beside the King\'s Bell', '国王之钟旁'),
  betweenTrapang: t('ลานระหว่างตระพังเงินและตระพังตาล', 'Lawn between Traphang Ngoen and Traphang Tan', '银池与棕榈池之间草坪'),
  mahathat: t('วัดมหาธาตุ', 'Wat Mahathat', '玛哈泰寺'),
  mahathatFront: t('ด้านหน้าวัดมหาธาตุ', 'In front of Wat Mahathat', '玛哈泰寺前'),
  traphangTan: t('สระตระพังตาล ด้านหน้าพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'Traphang Tan pond, in front of the monument', '棕榈池（纪念碑前）'),
  centerStage: t('โรงละครกลางแจ้ง', 'Open-air theatre', '露天剧场'),
  saSriTemple: t('วัดสระศรี', 'Wat Sa Si', '沙西寺'),
  trakuan: t('ตระพังตระกวน', 'Traphang Trakuan', '特拉宽池'),
  trakuanTown: t('หน้าเทศบาลเมืองสุโขทัยธานี และตระพังตระกวน', 'Sukhothai Thani Municipality and Traphang Trakuan', '素可泰他尼市政厅及特拉宽池'),
  municipality: t('บริเวณหน้าสำนักงานเทศบาลเมืองสุโขทัยธานี', 'In front of Sukhothai Thani Municipality office', '素可泰他尼市政厅前'),
  monumentWhole: t('พระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'King Ramkhamhaeng Monument', '兰甘亨大帝纪念碑'),
  raknakhwan: t('เวทีแรกนาขวัญ ตลาดสินค้าสหกรณ์ (ข้างลานพระบรมราชานุสาวรีย์ฯ)', 'Raknakhwan Stage, Cooperative Goods Market (beside the monument plaza)', '农耕祈福舞台·合作社商品市场（纪念碑广场旁）'),
};
// ── activities (title + place + organiser, written once) ──────────────────
const A = {
  dawn: (time: string): ScheduleItem => ({ time, title: t('รับรุ่งอรุณแห่งความสุข', 'Welcome the happy dawn', '迎接幸福黎明'), place: L.trapangThong, by: 'สำนักงานวัฒนธรรมจังหวัดสุโขทัย' }),
  amulet: { time: '08:00', title: t('ตลาดนัดพระเครื่อง พระบูชา', 'Amulet and Buddha-image market', '佛牌与佛像集市'), place: L.dongtanToilet, by: 'กลุ่มอนุรักษ์พระบูชา พระเครื่องจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  coop: { time: '09:00', title: t('การแสดงและจำหน่ายสินค้าสหกรณ์', 'Cooperative goods display and sale', '合作社商品展销'), place: L.monumentSide, by: 'สำนักงานสหกรณ์จังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  otop: { time: '09:00', title: t('การจัดแสดงและจำหน่ายสินค้าหนึ่งตำบล หนึ่งผลิตภัณฑ์', 'OTOP products display and sale', '“一村一品”展销'), place: L.newTemple, by: 'สำนักงานพัฒนาชุมชนจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  commerce: { time: '10:00', title: t('ตลาดการค้าพาณิชย์', 'Commerce market', '商贸集市'), place: L.dongtan, by: 'สำนักงานพาณิชย์จังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  silk: { time: '10:00', title: t('การแสดงและจำหน่ายสินค้าทองเงินสุโขทัยและผ้าไทย การสาธิตการทำเครื่องเงิน และสาธิตการทอผ้า', 'Sukhothai gold/silverware and Thai textiles: display, sale, silver-making and weaving demonstrations', '素可泰金银器与泰国织物展销，银饰制作与织布演示'), place: L.leelawadee, by: 'สำนักงานอุตสาหกรรมจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  dongtanMkt: { time: '10:00', title: t('ตลาดดงตาล', 'Dong Tan market', '棕榈林集市'), place: L.dongtanRoad, by: 'กลุ่มผู้ประกอบการร้านค้าอุทยานประวัติศาสตร์สุโขทัย' , stay: true } as ScheduleItem,
  sermon: { time: '13:00', title: t('ลานเทศน์ ลานธรรม คณะสงฆ์จังหวัดสุโขทัย', 'Dhamma lawn: sermons by the Sukhothai Sangha', '佛法广场：素可泰僧团讲经'), place: L.dongtanPrasat, by: 'สำนักงานพระพุทธศาสนาจังหวัดสุโขทัย' } as ScheduleItem,
  // 16:00 block
  life: { time: '16:00', title: t('จำลองวิถีชีวิตสมัยกรุงสุโขทัย', 'Sukhothai-era way of life (recreated)', '素可泰时代生活再现'), place: L.salaFour, by: 'สำนักงานวัฒนธรรมจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  cowrie: { time: '16:00', title: t('ตลาดแลกเบี้ย', 'Cowrie-shell exchange market', '贝币兑换集市'), place: L.sraYaiPeng, by: 'สำนักงานการท่องเที่ยวและกีฬาจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  krathongSale: { time: '16:00', title: t('การจำหน่ายกระทง', 'Krathong sales', '水灯销售'), place: L.mainRoad, by: 'อุทยานประวัติศาสตร์สุโขทัย' , stay: true } as ScheduleItem,
  bannan: { time: '16:00', title: t('ตลาดบ้านบ้าน โชทัย', 'Ban-Ban Chotai market', '“Ban-Ban Chotai”集市'), place: L.behindChana, by: 'หอการค้าจังหวัดสุโขทัย' , stay: true } as ScheduleItem,
  pasan: { time: '16:00', title: t('ตลาดปสาน', 'Pasan market', '帕赞集市'), place: L.behindChedi, by: 'สมาคมสื่อสารมวลชนสุโขทัย' , stay: true } as ScheduleItem,
  maha: { time: '17:00', title: t('มหาลอยกระทง', 'Maha Loy Krathong', '盛大放水灯'), place: L.chana, by: 'การท่องเที่ยวแห่งประเทศไทย สำนักงานสุโขทัย' } as ScheduleItem,
  expo35: { time: '17:30', title: t('นิทรรศการ “35 ปี มรดกโลกสุโขทัย”', 'Exhibition “35 years of Sukhothai World Heritage”', '“素可泰世界遗产35年”展览'), place: L.behindChanaB, by: 'อุทยานประวัติศาสตร์สุโขทัย' , stay: true } as ScheduleItem,
  culture: { time: '17:30', title: t('การแสดงศิลปวัฒนธรรม', 'Cultural performance', '文化艺术表演'), place: L.semicircle, by: 'วิทยาลัยนาฏศิลปสุโขทัย' } as ScheduleItem,
  krungthai: { time: '17:30', title: t('60 ปีกรุงไทย ทุกก้าวเพื่อล้านอนาคต ร่วมสืบสานลอยกระทงสุโขทัย สู่ความงดงามที่ยั่งยืน', 'Krungthai 60 years: sustaining Sukhothai Loy Krathong', '泰京银行60年：传承素可泰水灯节'), place: L.besideKing, by: 'ธนาคารกรุงไทย' , stay: true } as ScheduleItem,
  thaiMusic: { time: '18:00', title: t('การแสดงดนตรีไทยของนักเรียน', 'Student Thai music performance', '学生泰国音乐表演'), place: L.chana, by: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาสุโขทัย' } as ScheduleItem,
  muay: { time: '18:00', title: t('การแสดงมวยไทยคาดเชือก การแสดงกระบี่กระบอง และรำวงย้อนยุค', 'Muay Thai (rope-bound), krabi-krabong and retro ramwong dance', '缠绳泰拳、剑棍表演与怀旧圆圈舞'), place: L.dongtan, by: 'มหาวิทยาลัยการกีฬาแห่งชาติ วิทยาเขตสุโขทัย' } as ScheduleItem,
  oldMkt: { time: '18:00', title: t('ตลาดโบราณ วันวานที่คิดถึง', 'Old market “Wan-wan thi khit thueng”', '复古集市“难忘的昨日”'), place: L.betweenTrapang, by: 'เทศบาลตำบลเมืองเก่า' } as ScheduleItem,
  community: { time: '18:00', title: t('การท่องเที่ยวชุมชนเชิงสร้างสรรค์', 'Creative community tourism', '创意社区旅游'), place: L.behindChana, by: 'สำนักงานพื้นที่พิเศษเพื่อการท่องเที่ยวอย่างยั่งยืน อุทยานประวัติศาสตร์สุโขทัย-ศรีสัชนาลัย-กำแพงเพชร' } as ScheduleItem,
  gsb: { time: '18:00', title: t('ออมสิน 113 ปี สืบสานประเพณี เผาเทียน เล่นไฟ', 'GSB 113 years: preserving the candle and fire tradition', '政府储蓄银行113年：传承烧烛玩火传统'), place: L.sraYaiPeng, by: 'ธนาคารออมสิน' , stay: true } as ScheduleItem,
  ls: (time = '19:00', round?: string): ScheduleItem => ({ time, title: t(`การแสดงแสง เสียง Light and Sound${round ? ` (รอบที่ ${round})` : ''}`, `Light and Sound show${round ? ` (round ${round})` : ''}`, `光影声音秀${round ? `（第${round}场）` : ''}`), place: L.mahathat, by: 'บริษัท สุโขทัยพัฒนาเมือง จำกัด' }),
  heritageArt: { time: '20:00', title: t('การแสดงศิลปะและหัตถกรรมเมืองมรดกโลกและเมืองสร้างสรรค์นานาชาติ', 'World-heritage and international creative-city arts and crafts show', '世界遗产与国际创意城市艺术手工艺展演'), place: L.mahathatFront, by: 'สำนักงานการท่องเที่ยวและกีฬาจังหวัดสุโขทัย' } as ScheduleItem,
  lamp: { time: '20:00', title: t('ร่วมจุดตะคันถวายอาลัย สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง และสมเด็จพระเจ้าลูกเธอ เจ้าฟ้าพัชรกิติยาภา นเรนทิราเทพยวดี กรมหลวงราชสาริณีสิริพัชร มหาวัชรราชธิดา', 'Join the lamp-lighting in tribute to Queen Sirikit the Queen Mother and Princess Bajrakitiyabha (order: 20:00 gather · 20:20 light lamps · 20:30 tribute, 1-minute silence, group photo, lamps placed)', '悼念诗丽吉王太后与帕差拉吉蒂雅帕公主点灯仪式（20:00集合 · 20:20点灯 · 20:30致哀与默哀1分钟、合影、供灯）'), place: L.monumentFront } as ScheduleItem,
  khon: { time: '20:30', title: t('การแสดงโขน ละคร หุ่น', 'Khon, drama and puppet show', '孔剧、戏剧与木偶表演'), place: L.chana, by: 'วิทยาลัยนาฏศิลปสุโขทัย' } as ScheduleItem,
  legend: { time: '21:30', title: t('การแสดงตำนานท้าวศรีจุฬาลักษณ์', 'Legend of Thao Sri Chulalak (performance)', '室利朱拉拉克传说表演'), place: L.saSriTemple, by: 'วิทยาลัยนาฏศิลปสุโขทัย' } as ScheduleItem,
  fire: (time = '22:00', note = ''): ScheduleItem => ({ time, title: t(`การเล่นไฟ การแสดงพลุ และดอกไม้ไฟ${note ? ' (หลังพิธีลอยพระประทีปพระราชทาน)' : ''}`, `Fire play, fireworks and sparklers${note ? ' (after the royal lamp floating)' : ''}`, `火戏、烟花与焰火${note ? '（御赐灯放灯仪式之后）' : ''}`), place: L.trakuan, by: 'องค์การบริหารส่วนจังหวัดสุโขทัย', key: !!note }),
};
const common16 = [A.life, A.cowrie, A.krathongSale, A.bannan, A.pasan];
const common18 = [A.thaiMusic, A.muay, A.oldMkt, A.community, A.gsb];
const mornings = (dawn: string, withSermon = true) => [A.dawn(dawn), A.amulet, A.coop, A.otop, A.commerce, A.silk, A.dongtanMkt, ...(withSermon ? [A.sermon] : [])];
const evening17 = [A.maha, A.expo35, A.culture, A.krungthai];
const nights = (o: { art?: boolean; ls?: ScheduleItem; fire?: ScheduleItem } = {}) => [...(o.art ? [A.heritageArt] : []), A.lamp, A.khon, A.legend, o.fire ?? A.fire()];
const regular = (o: { art?: boolean; extra?: ScheduleItem[] } = {}): ScheduleItem[] => [...mornings('06:00'), ...common16, ...evening17, ...common18, A.ls(), ...(o.extra ?? []), ...nights({ art: o.art })];
const contest = (time: string, th: string, en: string, zh: string, place = L.centerStage): ScheduleItem => ({ time, title: t(th, en, zh), place, by: 'สำนักงานจังหวัดสุโขทัย', key: true });
const sortItems = (a: ScheduleItem[]) => a.map((x, i) => [x, i] as const).sort((p, q) => p[0].time.localeCompare(q[0].time) || p[1] - q[1]).map(x => x[0]);
/** Items per day (sorted by time). `key:true` = official highlight (orange band in the PDF). */
export const SCHEDULE: Record<DayKey, ScheduleItem[]> = {
  '2026-11-15': sortItems([
    A.dawn('05:00'), { time: '07:09', title: t('พิธีบวงสรวงบูรพกษัตริย์สุโขทัยทุกพระองค์', 'Ceremony honouring all Sukhothai kings', '祭祀素可泰历代君王仪式'), place: L.monumentWhole, key: true },
    A.amulet, { ...A.coop, time: '09:00' }, A.otop,
    { time: '09:00', title: t('ประกวดพนมหมาก พนมดอกไม้ และกระทงเล็ก', 'Betel-arrangement, flower-arrangement and small-krathong contests', '槟榔花塔、花塔与小水灯评选'), place: t('ด้านหน้าพระบรมราชานุสาวรีย์พ่อขุนรามคำแหงมหาราช', 'In front of the King Ramkhamhaeng Monument', '兰甘亨大帝纪念碑前'), by: 'วิทยาลัยอาชีวศึกษาสุโขทัย', key: true },
    A.commerce, A.silk, A.dongtanMkt,
    { time: '13:30', title: t('ประกวดกระทงใหญ่ (รอบที่ 1) และประกวดโคมชัก โคมแขวน (รอบที่ 1)', 'Large-krathong contest (round 1) and khom chak / khom khwaen lantern contest (round 1)', '大水灯评选（第1轮）与拉灯、挂灯评选（第1轮）'), place: L.salaMuang, by: 'วิทยาลัยอาชีวศึกษาสุโขทัย', key: true },
    { time: '16:00', title: t('พิธีเปิดงานประเพณีลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย ประจำปี 2569', 'Opening ceremony of the Sukhothai Loy Krathong, Candle-Burning & Fireworks Festival 2026', '2026年素可泰水灯节·烧烛·烟火开幕式'), place: L.saSri, key: true },
    { time: '16:00', title: t('ขบวนแห่กระทงใหญ่ กระทงเล็ก โคมชัก โคมแขวน พนมหมาก พนมดอกไม้ นางนพมาศ และขบวนแห่วัฒนธรรมประเพณีและวิถีชีวิตของชาวท้องถิ่นและวันเพ็ญเดือน 12', 'Procession of large and small krathong, lanterns, flower arrangements, Nang Nopphamat and local culture for the full moon of the 12th month', '大小水灯、灯笼、花塔、娘诺帕玛丝及地方文化游行（农历十二月望日）'), place: L.road, by: 'ที่ทำการปกครองจังหวัดสุโขทัย', key: true },
    ...common16, ...evening17,
    { ...contest('18:00', 'ประกวดกระทงใหญ่ (รอบที่ 2) และประกวดโคมชัก โคมแขวน (รอบที่ 2)', 'Large-krathong contest (round 2) and lantern contest (round 2)', '大水灯评选（第2轮）与灯笼评选（第2轮）', L.traphangTan), by: 'วิทยาลัยอาชีวศึกษาสุโขทัย' },
    ...common18, A.ls(),
    { time: '19:30', title: t('เปิดตัวผู้เข้าประกวดนางนพมาศ ประจำปี 2569', 'Nang Nopphamat 2026 contestants introduced', '2026年娘诺帕玛丝选手亮相'), place: L.centerStage, by: 'สำนักงานจังหวัดสุโขทัย', key: true },
    ...nights(),
  ]),
  '2026-11-16': sortItems(regular()),
  '2026-11-17': sortItems(regular()),
  '2026-11-18': sortItems(regular({ extra: [contest('19:30', 'ประกวดนางนพมาศ รอบแรก', 'Nang Nopphamat contest: first round', '娘诺帕玛丝评选：首轮')] })),
  '2026-11-19': sortItems(regular({ art: true })),
  '2026-11-20': sortItems(regular({ art: true, extra: [contest('19:30', 'ประกวดนางนพมาศ รอบคัดเลือก', 'Nang Nopphamat contest: selection round', '娘诺帕玛丝评选：选拔赛')] })),
  '2026-11-21': sortItems(regular({ art: true })),
  '2026-11-22': sortItems([
    ...mornings('06:00'), ...common16, ...evening17, ...common18,
    { time: '19:00', title: t('พิธีมอบถ้วยรางวัลรองชนะเลิศอันดับ 1 และรองชนะเลิศอันดับ 2 การประกวดกระทงใหญ่ กระทงเล็ก โคมชัก โคมแขวน พนมหมาก พนมดอกไม้', 'Trophy ceremony for the 1st and 2nd runners-up of the krathong, lantern and flower-arrangement contests', '大小水灯、灯笼、花塔评选一、二名亚军颁奖'), place: L.centerStage, key: true },
    A.ls(), contest('19:30', 'ประกวดนางนพมาศ รอบตัดสิน', 'Nang Nopphamat contest: final round', '娘诺帕玛丝评选：决赛'),
    ...nights({ art: true }),
    { time: '20:30', title: t('พิธีมอบรางวัลถ้วยพระราชทานสมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา เจ้าฟ้ามหาจักรีสิรินธร ฯ สำหรับผู้ชนะการประกวดนางนพมาศ และผู้ชนะเลิศการประกวดกระทงเล็ก โคมชัก โคมแขวน พนมหมาก พนมดอกไม้ และกระทงใหญ่', 'Royal-cup awards (HRH Princess Maha Chakri Sirindhorn) for the Nang Nopphamat winner and the winners of the krathong, lantern and flower-arrangement contests', '诗琳通公主御赐奖杯颁奖：娘诺帕玛丝冠军及水灯、灯笼、花塔评选冠军'), place: L.centerStage, key: true },
  ]),
  '2026-11-23': sortItems([
    ...mornings('06:00'), ...common16, ...evening17, ...common18,
    { time: '19:00', title: t('พิธีรับไฟพระฤกษ์และพระประทีปพระราชทาน', 'Ceremony receiving the royal flame and royal lamp', '迎接御赐圣火与灯仪式'), place: L.municipality, by: 'สำนักศิลปากรที่ 6 สุโขทัย', key: true },
    A.ls(), ...nights({ art: true }),
  ]),
  '2026-11-24': sortItems([
    A.dawn('06:00'), A.amulet,
    { time: '09:00', title: t('ขบวนแห่ไฟพระฤกษ์และพระประทีปพระราชทานจากเทศบาลเมืองสุโขทัยธานี ไปประดิษฐาน ณ ตระพังตระกวน', 'Procession of the royal flame and lamp from Sukhothai Thani Municipality to Traphang Trakuan', '圣火与御赐灯从素可泰他尼市政厅游行至特拉宽池安奉'), place: L.trakuanTown, by: 'สำนักศิลปากรที่ 6 สุโขทัย', key: true },
    A.coop, A.otop, A.commerce, A.silk, A.dongtanMkt,
    { time: '16:00', title: t('ขบวนหลวง ขบวนนางนพมาศ และขบวนแห่ประเพณีวัฒนธรรม 9 อำเภอ', 'Royal procession, Nang Nopphamat procession and the 9-district cultural procession', '王家游行、娘诺帕玛丝游行与9县文化游行'), place: L.road, by: 'ที่ทำการปกครองจังหวัดสุโขทัย', key: true },
    ...common16, ...evening17, ...common18,
    A.ls('19:00', '1'), A.lamp,
    { ...A.ls('20:30', '2'), key: true },
    A.khon,
    { time: '20:30', title: t('โชว์ อ้น ภานุวัฒน์ — ชิงช้าสวรรค์ (20:30–21:30)', 'Show by Aun Phanuwat (20:30–21:30)', '阿恩·帕努瓦演出（20:30–21:30）'), place: L.raknakhwan, extra: true, dur: 60 },
    { time: '21:00', title: t('พิธีเผาเทียน', 'Candle-burning ceremony', '烧烛仪式'), place: L.monumentWhole, by: 'สำนักงานส่งเสริมการปกครองท้องถิ่นจังหวัดสุโขทัย และเทศบาลเมืองสุโขทัยธานี', key: true },
    A.legend,
    { time: '22:00', title: t('พิธีลอยพระประทีปพระราชทาน', 'Royal lamp-floating ceremony', '御赐灯放灯仪式'), place: L.trakuan, by: 'สำนักศิลปากรที่ 6 สุโขทัย', key: true },
    A.fire('23:00', 'after'),
  ]),
};
/** Daily constants from the PDF. */
export const DAY_BADGE: Partial<Record<DayKey, Localized>> = { '2026-11-15': t('วันเปิดงาน', 'Opening day', '开幕日'), '2026-11-24': t('วันลอยกระทง', 'Loy Krathong day', '水灯节') };
