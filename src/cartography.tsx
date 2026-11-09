import React from 'react';
import {motion,type MotionValue} from 'framer-motion';
import {path,inkRibbon} from './route-geometry';
import './cartography.css';

type SurfaceProps={id:string;width?:number;height?:number;frame?:[number,number,number,number]};
export function MapSurface({id,width=790,height=540,frame=[12,12,width-24,height-24]}:SurfaceProps){
 const [x,y,w,h]=frame;
 return <g className="map-atmosphere" aria-hidden="true" pointerEvents="none">
  <defs>
   <radialGradient id={id+'-light'} cx="48%" cy="43%" r="70%"><stop stopColor="#d1ad70" stopOpacity=".08"/><stop offset=".62" stopColor="#5b5135" stopOpacity=".06"/><stop offset="1" stopColor="#131d18" stopOpacity=".52"/></radialGradient>
   <filter id={id+'-grain'} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width={width} height={height} fill={'url(#'+id+'-light)'}/>
  <rect width={width} height={height} filter={'url(#'+id+'-grain)'} opacity=".07" style={{mixBlendMode:'soft-light'}}/>
  <g className="map-neatline"><rect x={x} y={y} width={w} height={h}/><path d={`M${x} ${y+13}V${y}H${x+13}M${x+w-13} ${y}H${x+w}V${y+13}M${x} ${y+h-13}V${y+h}H${x+13}M${x+w-13} ${y+h}H${x+w}V${y+h-13}`}/></g>
  {width===790&&<g className="map-compass-rose" transform="translate(699 133)">
   <path d="M0-29V29M-29 0H29M-17-17L17 17M-17 17L17-17"/>
   <path d="M0-29L5 0 0 29-5 0ZM-29 0L0-5 29 0 0 5Z"/>
   <path d="M0-29L5 0H0ZM0 29L-5 0H0Z" className="compass-ink"/>
   <text y="-39" textAnchor="middle">北</text>
  </g>}
 </g>;
}

export function InkRoute({id,progress}:{id:string;progress?:MotionValue<number>}){
 return <g className="cartographic-route" aria-hidden="true" pointerEvents="none">
  <defs>
   <linearGradient id={id+'-pigment'} x1="100%" y1="100%" x2="20%" y2="0%"><stop stopColor="#e49d74"/><stop offset=".42" stopColor="#d48561"/><stop offset=".75" stopColor="#d6956d"/><stop offset="1" stopColor="#deb780"/></linearGradient>
   {progress&&<mask id={id+'-reveal'} maskUnits="userSpaceOnUse" x="0" y="0" width="790" height="540"><motion.path d={path} fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" style={{pathLength:progress}}/></mask>}
  </defs>
  <g mask={progress?'url(#'+id+'-reveal)':undefined}>
   <path className="ink-route-ground" d={path}/>
   <path className="ink-route-wash" d={path}/>
   <path className="ink-route-body" d={inkRibbon} fill={'url(#'+id+'-pigment)'}/>
   <path className="ink-route-grain" d={path}/>
  </g>
 </g>;
}
