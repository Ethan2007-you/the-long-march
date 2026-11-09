import React,{useEffect,useRef} from 'react';
import {coverExhibit} from './exhibits';
import './hero-artwork.css';

/** A bounded, input-driven drift. No idle loop, rotation, or repeated camera sway. */
export function HeroArtwork({active,reduced}:{active:boolean;reduced:boolean}){
 const layer=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const image=layer.current,host=image?.closest<HTMLElement>('.hero');
  if(!image||!host)return;
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  let frame=0,x=0,y=0,targetX=0,targetY=0;
  const paint=()=>{
   frame=0;x+=(targetX-x)*.11;y+=(targetY-y)*.11;
   const settled=Math.abs(targetX-x)<.008&&Math.abs(targetY-y)<.008;
   if(settled){x=targetX;y=targetY;}
   image.style.setProperty('--hero-pan-x',x.toFixed(3)+'px');
   image.style.setProperty('--hero-pan-y',y.toFixed(3)+'px');
   if(!settled)frame=requestAnimationFrame(paint);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  const reset=()=>{targetX=0;targetY=0;schedule();};
  const move=(event:PointerEvent)=>{
   if(!active||reduced||!finePointer.matches||event.pointerType!=='mouse')return;
   const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;
   // Each side moves at most 4px horizontally and 2.5px vertically.
   targetX=(Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))-.5)*8;
   targetY=(Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))-.5)*5;
   schedule();
  };
  if(active&&!reduced){host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',reset);finePointer.addEventListener('change',reset);}
  return()=>{cancelAnimationFrame(frame);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',reset);finePointer.removeEventListener('change',reset);image.style.removeProperty('--hero-pan-x');image.style.removeProperty('--hero-pan-y');};
 },[active,reduced]);
 return <div className="hero-parallax" ref={layer}><img className="hero-landscape" src={import.meta.env.BASE_URL+'media/hero-snow-mountains.webp'} alt="" aria-hidden="true" fetchPriority="high" decoding="async"/><div className="hero-figure-plane"><img className="hero-poster" src={import.meta.env.BASE_URL+'media/'+coverExhibit.file+'.webp'} alt={coverExhibit.label} width={coverExhibit.width} height={coverExhibit.height} fetchPriority="high" decoding="async"/></div></div>;
}
