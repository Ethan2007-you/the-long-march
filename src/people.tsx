import React,{useEffect,useState} from 'react';
import {AnimatePresence,motion} from 'framer-motion';
import {peopleStories} from './people-stories';
import {personScenes} from './exhibit-interactions';
import {revealCompactContent,useCompactLayout} from './mobile-experience';

type Props={hidden:boolean;reduced:boolean};
const media=(name:string)=>import.meta.env.BASE_URL+'media/'+name+'.webp';

export function People({hidden,reduced}:Props){
 const [selected,setSelected]=useState(0);
 const compact=useCompactLayout();
 const person=peopleStories[selected],scene=personScenes[person.id];
 function choose(index:number){setSelected(index);}
 function moveTab(event:React.KeyboardEvent<HTMLButtonElement>,index:number){
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%peopleStories.length;
  else if(event.key==='ArrowLeft')next=(index+peopleStories.length-1)%peopleStories.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=peopleStories.length-1;
  else return;
  event.preventDefault();choose(next);document.getElementById('cast-tab-'+next)?.focus();
 }
 useEffect(()=>{const image=new Image();image.src=media(scene.backdrop);void image.decode().catch(()=>{});},[scene.backdrop]);
 return <section hidden={hidden} id="people" className="section people-chapter people-cinema" aria-labelledby="people-title">
  <div className="wrap">
   <header className="section-title people-heading">
    <h2 className="type-chapter" id="people-title" tabIndex={-1}>征途群像</h2>
   </header>
   <div className="cast-selector" role="tablist" aria-label="选择长征人物">{peopleStories.map((item,index)=><button type="button" role="tab" aria-selected={index===selected} aria-controls="person-stage" id={'cast-tab-'+index} tabIndex={index===selected?0:-1} onClick={()=>choose(index)} onKeyDown={event=>moveTab(event,index)} key={item.id}>
    <img src={media(item.portrait)} alt="" width="48" height="64" loading="eager"/><span className="type-detail">{item.name}</span>
   </button>)}</div>
   <div id="person-stage" role="tabpanel" aria-labelledby={'cast-tab-'+selected} className="cast-stage">
    <AnimatePresence initial={false}><motion.img key={person.id} className="cast-backdrop" src={media(scene.backdrop)} alt="" initial={{opacity:0,scale:1.08}} animate={{opacity:.64,scale:1}} exit={{opacity:0}} transition={{duration:reduced?0:.7,ease:[.22,.8,.25,1]}}/></AnimatePresence>
    <div className="cast-shade"/>
    <div className="cast-composition">
     <AnimatePresence initial={false} mode="wait"><motion.figure key={person.id} className="cast-portrait" initial={{opacity:0,x:-28,rotate:-2}} animate={{opacity:1,x:0,rotate:0}} exit={{opacity:0,x:-12}} transition={{duration:reduced?0:.36}}>
      <img src={media(person.portrait)} alt={person.portraitAlt} width="600" height="800" decoding="async"/>
     </motion.figure></AnimatePresence>
     <div className="cast-scene-copy">
      <p className="cast-meta">{person.time} / {person.place}</p>
      <h3 className="type-event cast-name">{person.name}</h3><p className="cast-role">{person.role}</p>
      <div className="cast-facts">{scene.frames.map(item=><section className="cast-fact" key={item.title}><h4 className="type-detail">{item.title}</h4><p>{item.text}</p></section>)}</div>
     </div>
    </div>
   </div>
   <article className="person-full-story" aria-labelledby="person-reading-title">
    <div><h3 className="type-detail" id="person-reading-title">{person.title}</h3><div className="people-narrative">{person.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></div>
    <div className="people-character"><h4 className="type-detail">{person.quality}</h4><p>{person.meaning}</p></div>
   </article>
   {compact&&<button type="button" className="mobile-people-return" onClick={()=>revealCompactContent(document.querySelector<HTMLElement>('.cast-selector'),document.querySelector<HTMLButtonElement>('.cast-selector [aria-selected="true"]'))}>返回人物选择 ↑</button>}
   <span className="sr-only" role="status" aria-live="polite">当前人物：{person.name}</span>
  </div>
 </section>;
}
