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
export const path=stops.flatMap((s,i)=>[s.coords,...waypoints.filter(point=>point.after===i).map(point=>point.coords)])
 .map((point,i)=>(i?'L':'M')+coordinates(point).join(',')).join(' ');
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
