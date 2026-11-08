// Concise map-side readings derived from the corresponding eventNotes entries.
// These are phases of a decision, not additional georeferenced routes.
export type RouteContext = {
 stages: readonly [string,string,string];
 terrain:string;
 choice:string;
};
export const routeContexts:readonly RouteContext[]=[
 {stages:['苏区受压','夜间渡河','向西突围'],terrain:'于都后方相对稳定，丘陵便于隐蔽；河面通行则依赖浮桥与船只。',choice:'先分散驻扎、补充物资，再按计划夜渡，使警戒、船运和行军保持衔接。'},
 {stages:['重兵追堵','掩护渡江','转兵黔北'],terrain:'湘江渡口与两岸道路相互制约，任何一侧失守都可能切断通过的通道。',choice:'以外围阻击争取主力渡江时间；重大损失之后，重新判断原定前进方向。'},
 {stages:['初期受挫','检讨指挥','机动作战'],terrain:'转入黔北后，遵义提供了整顿与筹粮的空间，北上道路仍受敌军控制。',choice:'总结此前军事指挥的失误，调整领导，以实际战局决定下一步行动。'},
 {stages:['北渡受阻','四渡机动','转向云南'],terrain:'赤水河谷与川黔边界的山地，让渡口控制和敌军调动直接影响通行机会。',choice:'反复转换渡河方向，调动追兵，再把机动争取到的机会接续为西进。'},
 {stages:['追兵逼近','集中摆渡','继续北上'],terrain:'金沙江水急，渡口条件各异；是否有船、能否控制对岸，比直线距离更重要。',choice:'在多路抢渡中比较条件，将主力集中到已取得船只与北岸立足点的皎平渡。'},
 {stages:['船渡受限','沿河夺桥','打开通路'],terrain:'安顺场渡船运力有限，追兵又在逼近，主力不能长时间停留河谷等待摆渡。',choice:'两岸分兵向北推进，以夺桥建立连续通道，解决整支队伍通过的问题。'},
 {stages:['争取会合','翻越雪山','懋功会师'],terrain:'通向会合地区的道路受到封锁，夹金山又以高寒、缺氧增加行军困难。',choice:'选择翻山接近红四方面军，在组织互助和救护中维持队伍向北前进。'},
 {stages:['北上部署','穿越草地','走向甘南'],terrain:'水草地少聚落、难补给，泥沼与河沟使辨路、宿营和保持联络格外困难。',choice:'依靠组织协作穿越草地，随后夺取北进要点，为进入甘南打开通道。'},
 {stages:['获知陕北','确定落脚','依托根据地'],terrain:'草地之后，部队既需休整，也需一个能够补给、接应并继续发展的地区。',choice:'结合陕北红军和根据地的新信息确定方向，使转移与保卫、扩大根据地相衔接。'},
 {stages:['各路北上','相继会师','长征胜利'],terrain:'三大主力从不同地区北上，会宁与将台堡分别承接两次重要会师。',choice:'红一方面军从陕甘地区接应，红二、红四方面军分别北上，最终在两处相继会合。'},
];
