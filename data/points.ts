export type Language='th'|'en'|'zh';
export type Category='landmark'|'activity'|'facility';
export type Localized={th:string;en:string;zh:string};
export interface Point {id:string;code:string;category:Category; x:number; y:number; title:Localized; description:Localized; verified:boolean; icon?:string; }
const t=(th:string,en:string,zh:string):Localized=>({th,en,zh});
// Pixel positions are approximate, measured against the 1000×705 source image.
// Confirm before public launch using edit mode and the official venue organizer.
export const initialPoints:Point[]=[
 {id:'A',code:'A',category:'landmark',x:331,y:406,title:t('วัดมหาธาตุ','Wat Mahathat','玛哈泰寺'),description:t('โบราณสถานสำคัญภายในอุทยานประวัติศาสตร์สุโขทัย','Major historical temple within Sukhothai Historical Park','素可泰历史公园内的重要古寺'),verified:true},
 {id:'B',code:'B',category:'landmark',x:322,y:351,title:t('วัดชนะสงคราม','Wat Chana Songkhram','查那颂堪寺'),description:t('โบราณสถานภายในพื้นที่แผนผังงาน','Historic site shown on the festival venue map','节庆地图中的历史遗址'),verified:true},
 {id:'C',code:'C',category:'landmark',x:409,y:411,title:t('เนินปราสาท','Noen Prasat','宫殿遗址'),description:t('จุดโบราณสถานสำคัญในผังงาน','A historical site marked on the official venue map','官方场地地图标注的历史遗址'),verified:true},
 {id:'D',code:'D',category:'landmark',x:427,y:302,title:t('วัดใหม่','Wat Mai','迈寺'),description:t('โบราณสถานในบริเวณจัดงาน','Historical temple within the festival area','节庆区域内的古寺'),verified:true},
 {id:'E',code:'E',category:'landmark',x:226,y:292,title:t('วัดสระศรี','Wat Sa Si','沙西寺'),description:t('วัดเก่าแก่ภายในอุทยานประวัติศาสตร์สุโขทัย','Historic temple inside Sukhothai Historical Park','素可泰历史公园内的古寺'),verified:true},
 {id:'F',code:'F',category:'landmark',x:237,y:407,title:t('วัดตระพังเงิน','Wat Traphang Ngoen','达潘银寺'),description:t('โบราณสถานสำคัญในผังงาน','Historic temple marked on the venue map','场地地图上的重要古寺'),verified:true},
 {id:'G',code:'G',category:'landmark',x:367,y:277,title:t('อนุสาวรีย์พ่อขุนรามคำแหง','King Ramkhamhaeng Monument','兰甘亨国王纪念碑'),description:t('อนุสาวรีย์สำคัญภายในอุทยาน','Historic monument within the park','公园内的重要历史纪念碑'),verified:true},
 {id:'H',code:'H',category:'landmark',x:268,y:342,title:t('ตระพังตาล','Traphang Tan','达潘丹池'),description:t('บริเวณสระน้ำในพื้นที่งาน','Water feature in the festival grounds','节庆场地的水域'),verified:true},
];
// Provisional positions only. Activity descriptions/schedules MUST be checked with the organizer.
const activityCoords:[number,number][]=[[210,259],[273,249],[367,324],[343,311],[270,336],[289,280],[320,322],[288,359],[307,380],[455,340],[159,344],[360,395],[302,461],[374,335],[305,312],[257,299],[291,331],[370,371],[322,362],[356,362],[406,351],[420,386],[432,385]];
export const activityPoints:Point[]=activityCoords.map(([x,y],i)=>({id:`activity-${i+1}`,code:String(i+1),category:'activity',x,y,verified:false,title:t(`กิจกรรมหมายเลข ${i+1}`,`Activity ${i+1}`,`活动 ${i+1}`),description:t('รอยืนยันชื่อ เวลา และตำแหน่งกับผู้จัดงาน','Name, schedule and precise position awaiting organizer verification','名称、时间及准确位置待主办方确认')}));
export const allInitialPoints=[...initialPoints,...activityPoints];
