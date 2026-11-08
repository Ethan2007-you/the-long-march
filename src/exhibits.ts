export type Exhibit={file:string;label:string;kind:string;credit:string;url:string;width:number;height:number};
const timeline='https://www.12371.cn/2021/10/21/ARTI1634810104798403.shtml';
const sketches='https://epaper.tianjinwe.com/tjrb/html/2026-09/28/content_143090_3879160.htm';

// Contemporary records precede later artistic interpretations and present-day views.
// Artwork copyrights remain with their respective holders; a source is not an open license.
export const exhibits:Exhibit[]=[
 {file:'evidence-yudu',width:400,height:269,label:'《星夜渡过雩都河》',kind:'亲历者速写',credit:'黄镇 · 天津日报刊载',url:sketches},
 {file:'art-xiang',width:800,height:336,label:'《湘江·1934》',kind:'油画',credit:'张庆涛 · 深圳大学传播学院刊载',url:'https://cmc.szu.edu.cn/info/1127/1762.htm'},
 {file:'art-zunyi',width:1800,height:674,label:'《遵义会议》',kind:'油画',credit:'沈尧伊 · 共产党员网刊载',url:timeline},
 {file:'art-chishui',width:440,height:305,label:'《四渡赤水》',kind:'油画',credit:'申根源、梅肖青、孙向阳、王天任 · 北京组工刊载',url:'https://zt.bjdj.gov.cn/rdztarticle/29714.html'},
 {file:'art-jinsha',width:1800,height:1087,label:'《巧渡金沙江》',kind:'油画',credit:'张漾兮 · 共产党员网刊载',url:timeline},
 {file:'evidence-luding',width:400,height:189,label:'《泸定桥》',kind:'亲历者速写',credit:'黄镇 · 天津日报刊载',url:sketches},
 {file:'art-snow',width:1800,height:681,label:'《红军过雪山》（1957）',kind:'油画',credit:'艾中信 · 共产党员网刊载',url:timeline},
 {file:'art-marsh',width:1800,height:949,label:'《革命理想高于天》（1975）',kind:'油画',credit:'沈尧伊 · 共产党员网刊载',url:timeline},
 {file:'memorial-wuqi',width:400,height:300,label:'吴起胜利山纪念馆会师雕塑',kind:'纪念雕塑实拍',credit:'中国纪检监察报 · 延安纪检监察网刊载',url:'https://yanan.qinfeng.gov.cn/info/1178/27011.htm'},
 {file:'evidence-reunion',width:863,height:493,label:'红一、二、四方面军团以上干部合影（1936，甘肃宫和镇）',kind:'历史照片',credit:'作者不详 · 共产党员网刊载',url:'https://www.12371.cn/2021/10/09/VIDE1633740241787329.shtml'},
];
export const coverExhibit=exhibits[6];
