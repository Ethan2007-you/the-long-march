import {useEffect, useRef, type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {flySharedPhoto, type SharedPhoto} from './shared-photo';

export type Chapter = 'home' | 'origin' | 'events' | 'route' | 'spirit' | 'people';

export function useChapterMotion(
 readChapter:()=>Chapter,
 commit:(chapter:Chapter)=>void,
 reduced:boolean,
 main:RefObject<HTMLElement|null>,
 pendingPhoto:RefObject<SharedPhoto|null>,
){
 const shown=useRef(readChapter());

 useEffect(()=>{
  const content=main.current;
  if(!content)return;
  const previousScrollRestoration=history.scrollRestoration;
  history.scrollRestoration='manual';
  let cancelFlight:(()=>void)|null=null;
  let cancelChapter:(()=>void)|null=null;
  let revision=0;

  const positionLinkedContent=(chapter:Chapter)=>{
   const hash=window.location.hash;
   if(chapter==='events'&&/^#events-(?:[1-9]|10)$/.test(hash)){
    const target=document.getElementById(hash.slice(1));
    target?.scrollIntoView({block:'start',behavior:'instant'});
    target?.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});
   }else if(chapter==='route'&&/^#route-(?:[1-9]|10)$/.test(hash)){
    content.querySelector<HTMLElement>('.atlas-text h3')?.focus({preventScroll:true});
   }else if(chapter==='home'&&(hash==='#home-route'||history.state?.homeMap)){
    const {homeScroll,homeWidth}=history.state??{};
    if(Number.isFinite(homeScroll)&&homeWidth===window.innerWidth)window.scrollTo({top:Math.max(0,homeScroll),behavior:'instant'});
    else document.getElementById('home-route')?.scrollIntoView({block:'start',behavior:'instant'});
   }else if(chapter==='home'&&hash==='#home'){
    window.scrollTo({top:0,behavior:'instant'});
   }
  };

  const show=(chapter:Chapter, shared=false)=>{
   shown.current=chapter;
   flushSync(()=>commit(chapter));
   const route=chapter==='route'?content.querySelector<HTMLElement>('#route'):null;
   const photo=shared?route?.querySelector<HTMLElement>('.station-image'):null;
   window.scrollTo({top:0,behavior:'instant'});
   const photoBounds=photo?.getBoundingClientRect();
   if(photoBounds&&photoBounds.bottom>window.innerHeight-20){
    const header=document.querySelector('#site-nav')?.getBoundingClientRect().bottom??0;
    const top=Math.max(header+68,(window.innerHeight-photoBounds.height)*.47);
    window.scrollTo({top:Math.max(0,photoBounds.top-top),behavior:'instant'});
   }
   if(route){
    const heading=route.querySelector<HTMLElement>(shared?'.atlas-text h3':'#route-title');
    heading?.focus({preventScroll:true});
   }else{
    const selector=chapter==='home'?'#home h1':'#'+chapter+' h2';
    const heading=content.querySelector<HTMLElement>(selector);
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
   }
   positionLinkedContent(chapter);
   return route;
  };

  function transitionChapter(next:Chapter,from:Chapter,version:number){
   const html=document.documentElement;
   const linkedRoute=next==='route'&&/^#route-(?:[1-9]|10)$/.test(location.hash);
   const backToMap=next==='home'&&(location.hash==='#home-route'||history.state?.homeMap);
   const sharedAtlas=(from==='home'&&linkedRoute)||(from==='route'&&backToMap);
   const marked:{element:HTMLElement;previous:string}[]=[];
   let transition:ViewTransition|null=null;
   let animation:Animation|null=null;
   let finished=false;
   const previousInert=content!.inert;
   content!.inert=true;
   const name=(selector:string,value:string)=>{
    const element=document.querySelector<HTMLElement>(selector);
    if(!element)return;
    marked.push({element,previous:element.style.viewTransitionName});
    element.style.viewTransitionName=value;
   };
   const cleanup=()=>{
    if(finished)return;
    finished=true;
    for(const {element,previous} of marked)element.style.viewTransitionName=previous;
    html.classList.remove('chapter-transition');
    delete html.dataset.chapterTransition;
    content!.inert=previousInert;
    window.removeEventListener('resize',interrupt);
    window.removeEventListener('wheel',interrupt);
    window.removeEventListener('touchmove',interrupt);
    if(version===revision&&shown.current===next){
     const selector=next==='route'?(linkedRoute?'.atlas-text h3':'#route-title')
      :backToMap?'#home-route-title'
      :next==='events'&&/^#events-(?:[1-9]|10)$/.test(location.hash)?location.hash+' h3'
      :next==='home'?'.hero-word':'#'+next+' h2';
     const target=selector?content!.querySelector<HTMLElement>(selector):null;
     if(target){target.tabIndex=-1;target.focus({preventScroll:true});}
    }
    if(cancelChapter===interrupt)cancelChapter=null;
   };
   const interrupt=()=>{
    transition?.skipTransition();
    animation?.cancel();
    if(!transition&&version===revision&&shown.current!==next)show(next,linkedRoute);
    cleanup();
   };
   cancelChapter=interrupt;

   if(document.startViewTransition){
    html.classList.add('chapter-transition');
    html.dataset.chapterTransition=from+':'+next;
    name('.masthead','march-masthead');
    if(sharedAtlas&&matchMedia('(min-width:721px)').matches){
     name(from==='home'?'.home-map-frame':'.route .atlas-map','march-atlas');
    }
    try{
     transition=document.startViewTransition(async()=>{
      if(version!==revision)return;
      show(next,linkedRoute);
      if(finished)return; // A resize can skip snapshots before this callback runs.
      if(sharedAtlas&&matchMedia('(min-width:721px)').matches){
       name(next==='home'?'.home-map-frame':'.route .atlas-map','march-atlas');
      }
      if(next==='route'){
       name('.route .atlas-text','march-route-story');
       name('.route .section-title','march-route-heading');
       const image=content!.querySelector<HTMLImageElement>('.station-image img');
       if(image?.decode){
        let timeout:ReturnType<typeof setTimeout>|undefined;
        try{
         await Promise.race([image.decode().catch(()=>{}),new Promise<void>(resolve=>{timeout=setTimeout(resolve,160);})]);
        }finally{clearTimeout(timeout);}
       }
      }
      if(backToMap){
       // Let the remounted scroll-linked map settle before capturing its pose.
       await new Promise<void>(resolve=>{
        let frame:number;
        const complete=()=>{clearTimeout(timeout);cancelAnimationFrame(frame);resolve();};
        const timeout=setTimeout(complete,150);
        frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(complete);});
       });
      }
     });
     window.addEventListener('resize',interrupt,{passive:true});
     window.addEventListener('wheel',interrupt,{passive:true});
     window.addEventListener('touchmove',interrupt,{passive:true});
     transition.ready.catch(()=>{});
     transition.finished.then(cleanup,cleanup);
     return;
    }catch{cleanup();finished=false;content!.inert=true;}
   }

   // A short opacity handoff keeps older engines smooth without a snapshot API.
   window.addEventListener('resize',interrupt,{passive:true});
   window.addEventListener('wheel',interrupt,{passive:true});
   window.addEventListener('touchmove',interrupt,{passive:true});
   if(!content!.animate){show(next,linkedRoute);cleanup();return;}
   animation=content!.animate([{opacity:1},{opacity:0}],{duration:150,easing:'ease-out',fill:'forwards'});
   cancelChapter=interrupt;
   animation.finished.then(()=>{
    if(version!==revision)return;
    show(next,linkedRoute);
    animation?.cancel();
    animation=content!.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
    animation.finished.then(cleanup,cleanup);
   },()=>{});
  }

  function changeChapter(){
   const version=++revision;
   const next=readChapter();
   const from=shown.current;
   const photo=pendingPhoto.current;
   pendingPhoto.current=null;
   cancelChapter?.();
   cancelFlight?.();
   if(next===shown.current){positionLinkedContent(next);return;}
   if(reduced){
    show(next,next==='route'&&/^#route-(?:[1-9]|10)$/.test(location.hash));
    return;
   }
   if(!photo||from!=='events'||next!=='route'){
    transitionChapter(next,from,version);
    return;
   }

   content!.setAttribute('data-shared-photo','');
   const route=show(next,true);
   if(route){
    cancelFlight=flySharedPhoto(photo,route,()=>{
     content!.removeAttribute('data-shared-photo');
     cancelFlight=null;
    });
   }
   if(!cancelFlight)content!.removeAttribute('data-shared-photo');
  }

  window.addEventListener('hashchange',changeChapter);
  const initialFrame=requestAnimationFrame(()=>positionLinkedContent(readChapter()));
  return ()=>{
   revision+=1;
   history.scrollRestoration=previousScrollRestoration;
   cancelAnimationFrame(initialFrame);
   window.removeEventListener('hashchange',changeChapter);
   cancelFlight?.();
   cancelChapter?.();
  };
 },[readChapter,commit,reduced,main,pendingPhoto]);
}
