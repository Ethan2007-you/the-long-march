import React,{useEffect,useRef} from 'react';
import {themes} from './data';
import {spiritFilmScenes} from './spirit-film-data';
import './spirit-film.css';

type Props={hidden:boolean;reduced:boolean};
const media=(name:string)=>import.meta.env.BASE_URL+'media/'+name+'.webp';

/** Desktop dissolves behind natural text; compact layouts attach art to each passage. */
export function SpiritFilm({hidden,reduced}:Props){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(hidden||!root.current)return;
  const host=root.current;
  const scenes=Array.from(host.querySelectorAll<HTMLElement>('.film-scene'));
  const frames=Array.from(host.querySelectorAll<HTMLElement>('.film-frame'));
  const mobilePictures=Array.from(host.querySelectorAll<HTMLImageElement>('.film-mobile-art img'));
  const screen=host.querySelector<HTMLElement>('.film-screen')!;
  let raf=0;
  const draw=()=>{
   raf=0;
   const view=screen.getBoundingClientRect();
   if(!view.height)return;
   // Cross-dissolve at the gap between text passages. Words remain in normal flow.
   const sample=view.top+view.height*.57;
   const bounds=scenes.map(scene=>scene.getBoundingClientRect());
   const position=bounds.reduce((current,box,index)=>box.top<=sample?index:current,0);
   const band=view.height*.2;
   let from=position,to=position,mix=0;
   if(position>0&&sample<bounds[position].top+band){
    from=position-1;to=position;mix=(sample-bounds[position].top+band)/(band*2);
   }else if(position<frames.length-1&&sample>bounds[position+1].top-band){
    from=position;to=position+1;mix=(sample-bounds[position+1].top+band)/(band*2);
   }
   mix=Math.max(0,Math.min(1,mix));
   host.dataset.scene=spiritFilmScenes[mix>=.5?to:from].id;
   frames.forEach((frame,index)=>{
    const distance=(view.top+view.height*.5-(bounds[index].top+bounds[index].height*.5))/Math.max(bounds[index].height,1);
    const opacity=from===to?(index===from?1:0):reduced?(index===(mix>=.5?to:from)?1:0):index===from?1-mix:index===to?mix:0;
    frame.style.opacity=String(opacity);
    frame.style.visibility=opacity>0?'visible':'hidden';
    const picture=frame.firstElementChild as HTMLImageElement;
    picture.style.willChange=!reduced&&opacity>0&&window.innerWidth>720?'transform':'auto';
    picture.style.transform=reduced?'none':`translate3d(0,${Math.max(-1,Math.min(1,distance))*-18}px,0) scale(${1.035+Math.min(1,Math.max(0,distance+.5))*.025})`;
    mobilePictures[index].style.transform=reduced?'none':`translate3d(0,${Math.max(-1,Math.min(1,distance))*-12}px,0) scale(1.04)`;
   });
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(draw);};
  draw();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  const observer=new ResizeObserver(schedule);observer.observe(host);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
 },[hidden,reduced]);
 return <section hidden={hidden} id="spirit" className="spirit spirit-film" ref={root} aria-labelledby="spirit-title">
  <div className="film-screen" aria-hidden="true">
   {spiritFilmScenes.map((scene,index)=><div className={'film-frame frame-'+scene.id+' film-'+scene.side} key={scene.id} style={{opacity:index===0?1:0,visibility:index===0?'visible':'hidden'}}>
    <img src={hidden?undefined:media(scene.image)} alt="" loading="eager" decoding="async"/>
    <div className="film-frame-shade"/>
   </div>)}
   <div className="film-screen-edges"/>
  </div>
  <div className="film-reading">
   {spiritFilmScenes.map((scene,index)=>{
    const [first,second]=themes[scene.theme];
    return <article className={'film-scene scene-'+scene.id+' film-'+scene.side} key={scene.id} aria-labelledby={'film-title-'+scene.id}>
     <div className="film-mobile-art" aria-hidden="true"><img src={hidden?undefined:media(scene.image)} alt="" loading="lazy" decoding="async"/><div/></div>
     {index===0&&<h2 className="type-chapter film-chapter-name" id="spirit-title" tabIndex={-1}>长征精神</h2>}
     <div className="film-composition">
      <h3 className="type-spirit film-theme" id={'film-title-'+scene.id}><span>{first}</span><span>{second}</span></h3>
      <div className="film-story">
       <p className="film-meta"><span>{scene.time}</span><span>{scene.place}</span></p>
       <h4 className="type-detail film-story-title">{scene.title}</h4>
       {scene.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
      </div>
     </div>
     <span className="sr-only">{scene.alt}</span>
    </article>;
   })}
  </div>
 </section>;
}
