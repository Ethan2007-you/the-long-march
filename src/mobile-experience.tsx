import React,{useEffect,useRef,useState} from 'react';
import {routeStories} from './route-geometry';

export function useCompactLayout(){
 const [compact,setCompact]=useState(()=>window.matchMedia('(max-width:720px)').matches);
 useEffect(()=>{
  const query=window.matchMedia('(max-width:720px)');
  const change=()=>setCompact(query.matches);
  change();query.addEventListener('change',change);
  return()=>query.removeEventListener('change',change);
 },[]);
 return compact;
}

/** Keep a destination below the fixed masthead without changing desktop navigation. */
export function revealCompactContent(target:HTMLElement|null,focus?:HTMLElement|null){
 if(!target||!target.getClientRects().length||!window.matchMedia('(max-width:720px)').matches)return;
 requestAnimationFrame(()=>{
  focus?.focus({preventScroll:true});
  const bottom=document.getElementById('site-nav')?.getBoundingClientRect().bottom??106;
  window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-bottom-18),behavior:'instant'});
 });
}

export function MobileHistoryIndex(){
 const [selected,setSelected]=useState(()=>{
  const linked=location.hash.match(/^#events-(\d+)$/);
  return linked?Number(linked[1])-1:0;
 });
 const rail=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const line=(rail.current?.getBoundingClientRect().bottom??170)+20;
   const scenes=Array.from(document.querySelectorAll<HTMLElement>('.battle-scene'));
   const found=scenes.findIndex(scene=>scene.getBoundingClientRect().bottom>line);
   if(found>=0)setSelected(found);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();window.addEventListener('scroll',schedule,{passive:true});
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);};
 },[]);
 function jump(event:React.ChangeEvent<HTMLSelectElement>){
  const index=Number(event.currentTarget.value);
  setSelected(index);
  history.replaceState(history.state,'','#events-'+(index+1));
  const scene=document.getElementById('events-'+(index+1));
  requestAnimationFrame(()=>{
   if(!scene)return;
   const bottom=(document.getElementById('site-nav')?.getBoundingClientRect().bottom??106)+(rail.current?.offsetHeight??58);
   scene.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});
   window.scrollTo({top:Math.max(0,window.scrollY+scene.getBoundingClientRect().top-bottom-14),behavior:'instant'});
  });
 }
 return <div className="mobile-history-index" ref={rail}>
  <label htmlFor="mobile-history-stop">历史节点 <span>{String(selected+1).padStart(2,'0')} / 10</span></label>
  <select id="mobile-history-stop" value={selected} onChange={jump}>
   {routeStories.map((stop,index)=><option value={index} key={stop.title}>{String(index+1).padStart(2,'0')} · {stop.title}</option>)}
  </select>
 </div>;
}
