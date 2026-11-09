export const sources = [
 ['工信部党史学习教育专栏','遵义会议和红军长征的胜利','https://www.miit.gov.cn/ztzl/rdzt/dsxxjyzl/xxzl/art/2021/art_a43d76bc5e694806889c07fc36ec6adc.html'],
 ['人民网 · 新华社受权发布','在纪念红军长征胜利80周年大会上的讲话','https://politics.people.com.cn/n1/2016/1021/c1024-28798453.html'],
 ['中共云南省委党史研究室','红军长征集结地为何选择于都','https://www.ynds.yn.gov.cn/html/jinianhuodong/2025/3/8/27ed00cd-f7b1-4e2f-a117-e4f27748b67a.html'],
 ['应急管理部','1935：生死攸关大转折','https://www.mem.gov.cn/xw/ztzl/2021/dsxxjy/xxfd/202103/t20210329_382216.shtml'],
 ['中共云南省委党史研究室','中央红军巧渡金沙江','https://www.ynds.yn.gov.cn/html/dangshiyanjiu/2023/8/26/86a61fa6-9b91-41d3-9beb-d391554c6980.html'],
 ['中国网信网','三军大会师——红军长征三大主力会师全纪录','https://www.cac.gov.cn/2016-08/22/c_1119432029.htm'],
 ['文化和旅游部','长征国家文化公园陕西段建设','https://www.mct.gov.cn/wlbphone/wlbydd/xxfb/qglb/sx_9787/202407/t20240708_953926.html'],
 ['中国纪检监察杂志','长征中的六次会师','https://zgjjjc.ccdi.gov.cn/bqml/bqxx/201610/t20161025_88539.html'],
 ['Mapzen','地形高程数据及署名','https://www.mapzen.com/rights/'],
 ['Natural Earth','河流数据和使用条款','https://www.naturalearthdata.com/about/terms-of-use/'],
 ['国防部 · 中国国防报','夹金山上吹响胜利号角','https://www.mod.gov.cn/gfbw/gfjy_index/16487940.html'],
 ['中国军网 · 解放军报','两份绝密计划有力证明：红军长征是有组织的战略转移','https://www.81.mil.cn/yw_208727/16478204.html'],
] as const;

type Stop = {place:string; title:string; date:string; coords:[number,number]; image:string; summary:string; significance:string; source:number; label?:[number,number]};
export const stops: Stop[] = [
 {place:'江西 · 于都',title:'夜渡于都河',date:'1934.10',coords:[115.41,25.96],image:'art-yudu',summary:'第五次反“围剿”失利后，中央红军在于都一带集结。当地群众协助筹集木料、搭设浮桥，红军主力陆续渡过于都河。',significance:'一次关乎红军能否保存力量的战略转移由此开始。',source:2,label:[-11,-27]},
 {place:'广西 · 兴安一带',title:'血战湘江',date:'1934.11—12',coords:[110.67,25.61],image:'art-xiang-clean',summary:'中央红军在桂北强渡湘江，掩护中央机关和军委纵队突破第四道封锁线。渡过湘江后，队伍从出发时的八万六千余人锐减到三万多人。',significance:'惨重的损失促使中央重新审视行军方向和军事指挥。',source:0,label:[-26,30]},
 {place:'贵州 · 遵义',title:'遵义会议',date:'1935.01.15—17',coords:[106.93,27.70],image:'art-zunyi-unframed',summary:'中共中央政治局召开扩大会议，总结第五次反“围剿”和长征初期的经验教训，解决当时最迫切的军事和组织问题。',significance:'会议是党的历史上一个生死攸关的转折点。',source:0,label:[13,-20]},
 {place:'川黔交界 · 赤水河',title:'四渡赤水',date:'1935.01—03',coords:[105.98,28.28],image:'art-chishui',summary:'面对多路部队围追堵截，中央红军在川、黔、滇交界地区反复机动，先后四次渡过赤水河。',significance:'红军逐步摆脱被动局面，争取到战略转移的主动权。',source:3,label:[-79,-13]},
 {place:'云南 · 皎平渡',title:'巧渡金沙江',date:'1935.05',coords:[102.51,26.30],image:'art-jinsha-unframed',summary:'中央红军主力经皎平渡跨过金沙江。渡口船只有限，部队组织昼夜摆渡，陆续转至北岸。',significance:'跨越金沙江后，中央红军跳出了敌军围追堵截的包围圈。',source:4,label:[-18,32]},
 {place:'四川 · 泸定',title:'飞夺泸定桥',date:'1935.05.29',coords:[102.23,29.91],image:'collection-luding',summary:'红一军团红四团急行军抵达泸定桥，突击队冒着火力夺取铁索桥，部队随后过桥。',significance:'夺桥保障了主力渡过大渡河，为继续北上打开通路。',source:0,label:[-105,8]},
 {place:'四川 · 夹金山',title:'翻越夹金山',date:'1935.06',coords:[102.72,30.88],image:'art-snow-unframed',summary:'中央红军翻越夹金山。高寒、缺氧和骤变的天气，使行军和伤员转运面临严峻困难。',significance:'翻越雪山后，中央红军在懋功地区与红四方面军会师。',source:0,label:[-90,-5]},
 {place:'川西北 · 松潘草地一带',title:'穿越水草地',date:'1935.08',coords:[102.84,32.96],image:'art-marsh-unframed',summary:'红军进入川西北水草地，泥沼与道路难以分辨，沿途粮食补给不足。队伍在恶劣环境下相互扶助，继续向北。',significance:'走出草地为后续向甘南、陕北转进创造条件。',source:0,label:[-75,-14]},
 {place:'陕西 · 吴起镇',title:'抵达吴起镇',date:'1935.10.19',coords:[108.17,36.93],image:'memorial-wuqi',summary:'陕甘支队抵达吴起镇，进入陕甘根据地，中央红军主力完成了长征。',significance:'陕北成为此后开展革命斗争的重要立足点。',source:0,label:[13,-13]},
];
export const reunion:Stop={place:'甘肃会宁 · 将台堡（今属宁夏）',title:'三大主力会师',date:'1936.10',coords:[105.05,35.69],image:'collection-reunion',summary:'红一、红四方面军在甘肃会宁会师。红二方面军随后在将台堡同红一方面军会师，将台堡今属宁夏西吉。',significance:'各路红军会师，标志着红军长征胜利结束。',source:5};
export const themes = [
 ['坚定理想','百折不挠'],
 ['不怕牺牲','勇往直前'],
 ['独立自主','实事求是'],
 ['顾全大局','严守纪律'],
 ['紧密团结','依靠人民'],
 ['艰苦奋斗','迎难而上'],
] as const;
