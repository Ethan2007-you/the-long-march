import {stops,reunion} from './data';
export const coordinates=([lon,lat]:[number,number])=>[(lon-96)*36+30,(39-lat)*32+32];
export const waypoints: {after:number; name:string; coords:[number,number]}[] = [
 {after:1,name:'黎平',coords:[109.14,26.23]},
 {after:4,name:'安顺场',coords:[102.28,29.23]},
 {after:6,name:'懋功',coords:[102.37,31.0]},
 {after:7,name:'腊子口',coords:[103.84,34.14]},
 {after:7,name:'哈达铺',coords:[104.23,34.23]},
 {after:7,name:'榜罗镇',coords:[105.07,34.89]},
 {after:7,name:'六盘山',coords:[106.20,35.67]},
];
// The existing geographic anchors and their order are unchanged. The curves are
// schematic connections, not reconstructed survey tracks between these anchors.
export const routePoints=stops.flatMap((stop,index)=>[
 stop.coords,...waypoints.filter(point=>point.after===index).map(point=>point.coords),
]).map(point=>coordinates(point) as [number,number]);
type Point=[number,number];
const length=(a:Point,b:Point)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const round=(v:number)=>Math.round(v*100)/100;
const pair=(p:Point)=>p.map(round).join(',');
const tangents=routePoints.map((point,index)=>{
 const before=routePoints[Math.max(0,index-1)],after=routePoints[Math.min(routePoints.length-1,index+1)];
 const dx=after[0]-before[0],dy=after[1]-before[1],norm=Math.hypot(dx,dy)||1;
 const limit=Math.min(index?length(before,point):Infinity,index<routePoints.length-1?length(point,after):Infinity)*.28;
 return [dx/norm*limit,dy/norm*limit] as Point;
});
const samples:Point[]=[routePoints[0]];
let smooth='M'+pair(routePoints[0]);
for(let index=1;index<routePoints.length;index++){
 const start=routePoints[index-1],end=routePoints[index];
 const a:Point=[start[0]+tangents[index-1][0],start[1]+tangents[index-1][1]];
 const b:Point=[end[0]-tangents[index][0],end[1]-tangents[index][1]];
 smooth+=' C'+pair(a)+' '+pair(b)+' '+pair(end);
 const count=Math.max(8,Math.ceil(length(start,end)/2));
 for(let step=1;step<=count;step++){
  const t=step/count,u=1-t;
  samples.push([u*u*u*start[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t*t*t*end[0],u*u*u*start[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*end[1]]);
 }
}
export const path=smooth;
// A pressure-varying ink silhouette follows the same centerline. The small width
// variation is purely visual; it introduces no extra geographic control points.
let distance=0;
const lengths=samples.map((point,index)=>{
 if(index)distance+=length(samples[index-1],point);
 return distance;
});
// Individually tapered pigment marks, with an irregular but deterministic cadence.
// This is the rendering of a schematic trail, never extra terrain or route data.
const marks:string[]=[];
let markStart=0,markNumber=0;
while(markStart<distance){
 const markLength=6.8+2.1*(1+Math.sin(markNumber*1.73));
 const markEnd=Math.min(distance,markStart+markLength);
 const indices=lengths.flatMap((value,index)=>value>=markStart&&value<=markEnd?[index]:[]);
 if(indices.length>1){
  const sides=indices.map((index,part)=>{
   const point=samples[index],before=samples[Math.max(0,index-1)],after=samples[Math.min(samples.length-1,index+1)];
   const dx=after[0]-before[0],dy=after[1]-before[1],norm=Math.hypot(dx,dy)||1;
   const taper=.24+.76*Math.sin(Math.PI*(part+.35)/(indices.length-.3));
   const pressure=(.9+.17*Math.sin(lengths[index]*.4))*taper;
   return [[point[0]-dy/norm*pressure,point[1]+dx/norm*pressure],[point[0]+dy/norm*pressure,point[1]-dx/norm*pressure]] as [Point,Point];
  });
  marks.push('M'+sides.map(edge=>pair(edge[0])).join(' L')+' L'+sides.map(edge=>pair(edge[1])).reverse().join(' L')+' Z');
 }
 markStart=markEnd+1.5+.9*(1+Math.cos(markNumber*2.31));markNumber++;
}
export const inkRibbon=marks.join(' ');
export const routeStories=[...stops,reunion];
const reunionPlaces:{name:string;coords:[number,number];label:[number,number]}[]=[
 {name:'会宁',coords:[105.059,35.697],label:[-92,34]},
 {name:'将台堡',coords:[105.84,35.818],label:[31,36]},
];
export const mapLocations=[
 ...stops.map((stop,index)=>({
  name:stop.place.split(' · ')[1].replace('一带',''),
  coords:stop.coords,
  label:stop.label??[12,-12],
  index,
 })),
 ...reunionPlaces.map(place=>({...place,index:stops.length})),
];
