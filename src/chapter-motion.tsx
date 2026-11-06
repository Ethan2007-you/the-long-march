import {useEffect, useRef, type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {flySharedPhoto, type SharedPhoto} from './shared-photo';

export type Chapter = 'home' | 'origin' | 'events' | 'route' | 'spirit';

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
  let cancelFlight:(()=>void)|null=null;

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
   }
   return route;
  };
  function changeChapter(){
   const next=readChapter();
   const photo=pendingPhoto.current;
   pendingPhoto.current=null;
   if(next===shown.current)return;

   cancelFlight?.();
   if(reduced||!photo||shown.current!=='events'||next!=='route'){
    show(next);
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
  return ()=>{
   window.removeEventListener('hashchange',changeChapter);
   cancelFlight?.();
  };
 },[readChapter,commit,reduced,main,pendingPhoto]);
}
