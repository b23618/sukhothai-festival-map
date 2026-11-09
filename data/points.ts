import { toWorld } from '@/lib/geo';
import { cultureRows, festivalRows, type Row } from './activities';
import { geoToGrid } from '@/lib/georef';
export type Language = 'th' | 'en' | 'zh';
export type Category = 'landmark' | 'activity' | 'facility';
export type Localized = { th: string; en: string; zh: string };
export type ModelType = 'wat-mahathat' | 'wat-chana' | 'noen-prasat' | 'wat-mai' | 'wat-sa-si' | 'traphang-ngoen' | 'monument' | 'pond-feature'
  | 'stage' | 'tent' | 'pavilion' | 'platform' | 'food' | 'rest' | 'arch' | 'floating-pier'
  | 'parking' | 'hospital' | 'wc' | 'bus-stop' | 'vip-tent' | 'hq' | 'gate';
export interface Point {
  id: string; code: string; category: Category;
  /** Layout-grid position (1000x705). World position is derived with pointWorld(). */
  x: number; y: number;
  title: Localized; description: Localized;
  /** true = the landmark NAME was legible on the official plan. Says nothing about position accuracy. */
  verified: boolean;
  /** 'pending' = Chinese text is a machine-assisted draft awaiting native/official review. */
  zhStatus: 'pending' | 'verified';
  model: ModelType; /** Landmarks: approximate real height in METRES (drawn with VEXAG exaggeration). Others: unused. */ height: number; scale: number; focusDistance: number; tags: string[];
  visitorInfo: Localized | null;
  /** Always null until the organizer supplies it. Never invent schedules. */
  schedule: { date: string; start: string; end: string } | null;
  status: 'name-verified' | 'placeholder' | 'generic';
  /** Optional GLB path (e.g. /models/wat-mahathat.glb). When set, it replaces the procedural model; falls back if it fails to load. */
  glb?: string;
  /** Which legend list an activity belongs to on the official plan. */
  series?: 'festival' | 'culture';
  /** Real-world position (WGS84). Source: OpenStreetMap contributors (ODbL). Absent where no verified coordinate exists. */
  geo?: { lat: number; lng: number };
  /** Extra real-world spots when the same number appears at several places on the plan. */
  geoExtra?: { lat: number; lng: number }[];
  /** Times from the official schedule, when published. */
  scheduleText: Localized | null;
  history: Localized | null;
  hours: Localized | null;
  /** Where the facts above came from. */
  sources: { label: string; url: string }[];
}
export const pointWorld = (p: Pick<Point, 'x' | 'y'>) => toWorld(p.x, p.y);
const t = (th: string, en: string, zh: string): Localized => ({ th, en, zh });
const pendingInfo = t('ข้อมูลผู้เยี่ยมชมรอการยืนยันจากผู้จัดงาน', 'Visitor information pending organizer confirmation', '游客信息待主办方确认');
const base = { zhStatus: 'pending' as const, scale: 1, schedule: null, visitorInfo: pendingInfo, history: null, hours: null, scheduleText: null as Localized | null, sources: [] as { label: string; url: string }[] };
const osm = (lat: number, lng: number) => ({ label: 'OpenStreetMap', url: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}` });
const thwiki = (title: string, name: string) => ({ label: `Wikipedia (th): ${name}`, url: `https://th.wikipedia.org/wiki/${encodeURIComponent(title)}` });
const official = { label: 'sukhothailoykrathong.com/about', url: 'https://sukhothailoykrathong.com/about' };
const enwiki = { label: 'Wikipedia: Sukhothai Historical Park', url: 'https://en.wikipedia.org/wiki/Sukhothai_Historical_Park' };
const hours = t('06:00–21:00 น. (ข้อมูลวิกิพีเดีย แหล่งอื่นระบุไม่ตรงกัน โปรดตรวจสอบกับกรมศิลปากร)', '06:00–21:00 (per Wikipedia; other sources differ, confirm with the Fine Arts Department)', '06:00–21:00（据维基百科；其他来源不一致，请向艺术厅核实）');
export const initialPoints: Point[] = [
  { ...base, id: 'A', code: 'A', geo: { lat: 17.0168768, lng: 99.7036978 }, sources: [official, osm(17.01688, 99.7037), thwiki('วัดมหาธาตุ_สุโขทัย', 'วัดมหาธาตุ (สุโขทัย)'), enwiki], history: t('พระอารามหลวงที่ใหญ่ที่สุดในเมืองสุโขทัย สร้างราวพุทธศตวรรษที่ 18 เจดีย์ประธานทรงดอกบัวตูม ฐานกว้างด้านละ 27 ม. สูง 29 ม. มีเจดีย์บริวารล้อมรอบ พระมหาธรรมราชาลิไทโปรดให้หล่อพระพุทธรูปสำริดหน้าตักกว้าง 6.25 ม. ฉลองเมื่อ พ.ศ. 1904', 'The largest temple in Sukhothai, built around the 13th century CE. Its main stupa is a lotus-bud chedi on a 27 m square base, about 29 m high, ringed by smaller stupas. King Lithai commissioned a bronze Buddha with a 6.25 m lap width, consecrated in 1361 CE (BE 1904).', '素可泰最大的寺院，约建于13世纪。主塔为莲花蕾形佛塔，基座边长27米、高约29米，周围环绕小塔。立泰王下令铸造坐姿宽6.25米的青铜佛像，于1361年（佛历1904年）开光。'), category: 'landmark', x: 329, y: 408, verified: true, status: 'name-verified', model: 'wat-mahathat', height: 29, focusDistance: 3.4, tags: ['temple', 'chedi', 'heritage'], title: t('วัดมหาธาตุ', 'Wat Mahathat', '玛哈泰寺'), description: t('โบราณสถานสำคัญภายในอุทยานประวัติศาสตร์สุโขทัย (โมเดล 3 มิติเป็นภาพจำลองเชิงศิลป์)', 'Major historical temple within Sukhothai Historical Park (3D model is an artistic approximation)', '素可泰历史公园内的重要古寺（3D模型为艺术示意）') },
  { ...base, id: 'B', code: 'B', geo: { lat: 17.0185633, lng: 99.7034997 }, sources: [official, osm(17.0186171, 99.7037448), enwiki], history: t('โบราณสถานที่สร้างขึ้นในสมัยอาณาจักรสุโขทัย (รายละเอียดเพิ่มเติมรอตรวจสอบจากกรมศิลปากร)', 'A monument built during the Sukhothai Kingdom (further details await confirmation from the Fine Arts Department).', '建于素可泰王国时期的古迹（更多细节待艺术厅确认）。'), category: 'landmark', x: 321, y: 337, verified: true, status: 'name-verified', model: 'wat-chana', height: 26, focusDistance: 1.4, tags: ['temple', 'chedi', 'island'], title: t('วัดชนะสงคราม', 'Wat Chana Songkhram', '查那颂堪寺'), description: t('โบราณสถานภายในพื้นที่แผนผังงาน', 'Historic site shown on the festival venue map', '节庆地图中的历史遗址') },
  { ...base, id: 'C', code: 'C', geo: { lat: 17.0168803, lng: 99.7055334 }, sources: [official, osm(17.0168772, 99.7055516), enwiki], history: t('ซากพระราชวังของอาณาจักรสุโขทัย ค้นพบโดยเจ้าฟ้ามงกุฎ (รัชกาลที่ 4) เมื่อ พ.ศ. 2376', 'The remains of the royal palace of the Sukhothai Kingdom, discovered by Prince Mongkut in 1833 (BE 2376).', '素可泰王国王宫遗址，1833年（佛历2376年）由蒙固亲王发现。'), category: 'landmark', x: 403, y: 408, verified: true, status: 'name-verified', model: 'noen-prasat', height: 6, focusDistance: 3.2, tags: ['ruins', 'platform'], title: t('เนินปราสาท', 'Noen Prasat', '宫殿遗址'), description: t('จุดโบราณสถานสำคัญในผังงาน', 'A historical site marked on the official venue map', '官方场地地图标注的历史遗址') },
  { ...base, id: 'D', code: 'D', geo: { lat: 17.0194572, lng: 99.7059703 }, sources: [official, osm(17.0194587, 99.7059684)], category: 'landmark', x: 421, y: 300, verified: true, status: 'name-verified', model: 'wat-mai', height: 9, focusDistance: 1.1, tags: ['temple', 'ruins'], title: t('วัดใหม่', 'Wat Mai', '迈寺'), description: t('โบราณสถานในบริเวณจัดงาน', 'Historical temple within the festival area', '节庆区域内的古寺') },
  { ...base, id: 'E', code: 'E', geo: { lat: 17.0197252, lng: 99.7014273 }, sources: [official, osm(17.0197515, 99.7014453), thwiki('วัดสระศรี', 'วัดสระศรี')], hours,  history: t('ตั้งบนเกาะกลางสระตระพังตระกวน มีเจดีย์ประธานทรงระฆังแบบลังกาบนฐานสี่เหลี่ยมยกสูง ฐานกว้างด้านละ 17.20 ม. วิหารด้านตะวันออกมีพระพุทธรูปปูนปั้น และพระอุโบสถบนเกาะเล็กกลางน้ำ ไม่ปรากฏชื่อวัดนี้ในศิลาจารึก กรมศิลปากรขุดค้นปี 2496 และบูรณะหลายครั้ง', 'Set on an island in the large Traphang Trakuan pond. The main stupa is a Lanka-style bell chedi on a raised square base 17.20 m per side; a viharn to the east holds stucco Buddhas, and the ordination hall stands on a small island in the water. The temple is not named in the inscriptions. The Fine Arts Department excavated it in 1953 and restored it several times.', '位于特拉潘特拉宽大池塘中的岛上。主塔为锡兰式钟形佛塔，立于边长17.20米的高方基上；东侧维汉殿供奉灰泥佛像，戒堂建在水中小岛上。碑铭中未见此寺之名。艺术厅于1953年发掘并多次修复。'), category: 'landmark', x: 237, y: 288, verified: true, status: 'name-verified', model: 'wat-sa-si', height: 22, focusDistance: 1.6, tags: ['temple', 'chedi', 'island'], title: t('วัดสระศรี', 'Wat Sa Si', '沙西寺'), description: t('วัดเก่าแก่ภายในอุทยานประวัติศาสตร์สุโขทัย', 'Historic temple inside Sukhothai Historical Park', '素可泰历史公园内的古寺') },
  { ...base, id: 'F', code: 'F', geo: { lat: 17.0168921, lng: 99.7013706 }, sources: [official, osm(17.0166145, 99.6998872), thwiki('วัดตระพังเงิน', 'วัดตระพังเงิน')], hours, history: t('สร้างรอบสระน้ำตระพังเงิน มีเจดีย์ประธานทรงดอกบัวตูม วิหารทางทิศตะวันออก เจดีย์รายทรงวิมานทางทิศเหนือ และอุโบสถบนเกาะกลางสระ ขึ้นทะเบียนโบราณสถาน 8 มีนาคม พ.ศ. 2478', 'Built around the Traphang Ngoen pond: a lotus-bud main chedi, a viharn to the east, a vimana-style chedi to the north, and an ordination hall on an island in the pond. Registered as an ancient monument on 8 March 1935 (BE 2478).', '围绕达潘银池而建：莲花蕾形主塔、东侧维汉殿、北侧宫殿式小塔，以及池中岛上的戒堂。1935年3月8日（佛历2478年）登记为古迹。'), category: 'landmark', x: 235, y: 407, verified: true, status: 'name-verified', model: 'traphang-ngoen', height: 18, focusDistance: 1.2, tags: ['temple', 'mondop', 'island'], title: t('วัดตระพังเงิน', 'Wat Traphang Ngoen', '达潘银寺'), description: t('โบราณสถานสำคัญในผังงาน', 'Historic temple marked on the venue map', '场地地图上的重要古寺') },
  { ...base, id: 'G', code: 'G', geo: { lat: 17.0199519, lng: 99.7046818 }, sources: [official, osm(17.0200098, 99.7046718)], category: 'landmark', x: 369, y: 279, verified: true, status: 'name-verified', model: 'monument', height: 12, focusDistance: 1.0, tags: ['monument', 'statue'], title: t('อนุสาวรีย์พ่อขุนรามคำแหง', 'King Ramkhamhaeng Monument', '兰甘亨国王纪念碑'), description: t('อนุสาวรีย์สำคัญภายในอุทยาน (รูปปั้นเป็นแบบจำลองเชิงสัญลักษณ์)', 'Historic monument within the park (statue is a stylized stand-in)', '公园内的重要纪念碑（雕像为风格化示意）') },
  { ...base, id: 'H', code: 'H', geo: { lat: 17.0184602, lng: 99.7015594 }, sources: [official, osm(17.0184048, 99.7013663)], category: 'landmark', x: 243, y: 341, verified: true, status: 'name-verified', model: 'pond-feature', height: 2, focusDistance: 1.2, tags: ['pond', 'water'], title: t('ตระพังตาล', 'Traphang Tan', '达潘丹池'), description: t('บริเวณสระน้ำในพื้นที่งาน', 'Water feature in the festival grounds', '节庆场地的水域') },
];
const series = { festival: t('กิจกรรมงานลอยกระทง เผาเทียน เล่นไฟ', 'Loy Krathong, candle-burning & fireworks activities', '水灯、烧烛与烟火活动'), culture: t('กิจกรรมประเพณีและวัฒนธรรม', 'Tradition & culture activities', '传统与文化活动') };
export const seriesLabel = series;
const planNote = t('ชื่อ พิกัด และเวลาจากเว็บไซต์ทางการ (ข้อมูล ณ 18 ก.ย. 2569) อาจมีการเปลี่ยนแปลง', 'Name, GPS and times from the official site (data as of 18 Sep 2026); subject to change', '名称、GPS与时间取自官方网站（截至2026年9月18日），可能有变动');
const planSrc = [official, { label: 'Official venue plan (PNG)', url: 'https://sukhothailoykrathong.com/docs/sukhothai-loykrathong-2569-venue-map.png' }];
const mkActs = (rows: Row[], key: 'festival' | 'culture'): Point[] => rows.map((r, i) => { const [x, y] = geoToGrid(...r.geos[0]); return {
  ...base, id: `${key}-${i + 1}`, code: String(i + 1), category: 'activity', series: key, x, y, verified: true, status: 'name-verified', model: r.model as ModelType,
  height: .35, focusDistance: 2.6, tags: ['festival', key], title: t(r.th, r.en, r.zh), description: planNote, sources: planSrc,
  geo: { lat: r.geos[0][0], lng: r.geos[0][1] }, geoExtra: r.geos.slice(1).map(([lat, lng]) => ({ lat, lng })), scheduleText: r.when ? t(...r.when) : null,
}; });
export const activityPoints: Point[] = [...mkActs(festivalRows, 'festival'), ...mkActs(cultureRows, 'culture')];
const fac = (id: string, code: string, model: ModelType, ll: [number, number] | null, fallback: [number, number], th: string, en: string, zh: string, tags: string[]): Point => {
  const [x, y] = ll ? geoToGrid(...ll) : fallback;
  return { ...base, id: `facility-${id}`, code, category: 'facility', x, y, verified: !!ll, status: ll ? 'name-verified' : 'generic', model, height: .25, focusDistance: 2.6, tags, title: t(th, en, zh),
    description: ll ? t('ตำแหน่งตามพิกัดทางการของงาน (เว็บไซต์ทางการ)', 'Position from the official event GPS list', '位置取自官方活动GPS清单') : t('ตำแหน่งโดยประมาณจากผังงาน รอยืนยัน', 'Approximate position from the venue plan; to be confirmed', '位置取自场地图的大致位置，待确认'),
    sources: ll ? [official] : [], ...(ll ? { geo: { lat: ll[0], lng: ll[1] } } : {}) };
};
const list = (id: string, code: string, model: ModelType, pts: [number, number][], th: string, en: string, zh: string, tags: string[]) => pts.map((p, i) => fac(`${id}${i + 1}`, code, model, p, [0, 0], `${th} ${i + 1}`, `${en} ${i + 1}`, `${zh} ${i + 1}`, tags));
export const facilityPoints: Point[] = [
  ...list('p', 'P', 'parking', [[17.0244218, 99.702685], [17.0232945, 99.703167], [17.0228158, 99.705793], [17.0227195, 99.7045741], [17.0219274, 99.7046441], [17.0213141, 99.7012649], [17.0132356, 99.7050237]], 'ที่จอดรถ', 'Parking', '停车场', ['parking']),
  fac('hospital', '✚', 'hospital', [17.0192047, 99.7042602], [0, 0], 'หน่วยปฐมพยาบาล', 'First aid unit', '急救站', ['medical']),
  ...list('hospital-ev', '✚', 'hospital', [[17.0185074, 99.698971], [17.0179634, 99.7043645]], 'หน่วยปฐมพยาบาล (เฉพาะวันที่มีกิจกรรม)', 'First aid unit (event days only)', '急救站（仅活动日）', ['medical']),
  fac('hq', 'HQ', 'hq', [17.0190776, 99.7045349], [0, 0], 'กองอำนวยการ / ตำรวจ / ประชาสัมพันธ์', 'Command post / police / public relations', '指挥部/警察/宣传处', ['service']),
  ...list('wc', 'WC', 'wc', [[17.0207509, 99.7050579], [17.0182357, 99.7063057], [17.0181716, 99.7055927], [17.0179218, 99.7018759], [17.0176664, 99.6995164], [17.0174875, 99.7026438], [17.0172305, 99.7026692], [17.016954, 99.7026849], [17.0167064, 99.7066702], [17.0158594, 99.7055345], [17.0157181, 99.7038392], [17.0149982, 99.7030826], [17.0127501, 99.7051117]], 'ห้องสุขา / รถสุขาเคลื่อนที่', 'Restrooms / mobile toilets', '洗手间/移动厕所', ['restroom']),
  ...list('bus', 'BUS', 'bus-stop', [[17.0215332, 99.7031346], [17.018908, 99.7073147]], 'จุดบริการรับส่งผู้โดยสาร', 'Passenger shuttle point', '乘客接驳点', ['transport']),
  ...list('vip', 'VIP', 'parking', [[17.0180784, 99.7067039], [17.0180033, 99.6989678], [17.0169686, 99.7070911], [17.0155798, 99.7046955]], 'ที่จอดรถ VIP', 'VIP parking', '贵宾停车场', ['vip', 'parking']),
  fac('ob', 'OB', 'parking', [17.0187457, 99.700552], [0, 0], 'จุดจอดรถ OB', 'OB van parking', 'OB转播车停车点', ['parking']),
  fac('gate-w', '⇥', 'gate', null, [36, 268], 'ทางเข้าด้านตะวันตก', 'West entrance', '西入口', ['entrance']),
  fac('gate-e', '⇤', 'gate', null, [562, 346], 'ทางเข้าด้านตะวันออก', 'East entrance', '东入口', ['entrance']),
];
export const allInitialPoints: Point[] = [...initialPoints, ...activityPoints, ...facilityPoints];
