import {gsap} from 'gsap';

type Frame = {left:number; top:number; width:number; height:number};
type PhotoFrame = {clip:Frame; image:Frame; src:string; naturalWidth:number; naturalHeight:number};
export type SharedPhoto = PhotoFrame & {caption?:HTMLElement; captionFrame?:Frame};

function positionOffset(token:string, remainder:number){
 return token.endsWith('%')?remainder*parseFloat(token)/100:parseFloat(token)||0;
}

function framePhoto(
 photo:HTMLImageElement, clip:Frame, naturalWidth=photo.naturalWidth, naturalHeight=photo.naturalHeight,
):PhotoFrame|null{
 const bounds=photo.getBoundingClientRect();
 if(!naturalWidth||!naturalHeight||bounds.width<1||bounds.height<1)return null;
 const cover=Math.max(bounds.width/naturalWidth,bounds.height/naturalHeight);
 const width=naturalWidth*cover;
 const height=naturalHeight*cover;
 const [x,y]=getComputedStyle(photo).objectPosition.split(' ');
 return {
  clip,src:photo.currentSrc||photo.src,naturalWidth,naturalHeight,
  image:{
   left:bounds.left+positionOffset(x,bounds.width-width)-clip.left,
   top:bounds.top+positionOffset(y,bounds.height-height)-clip.top,
   width,height,
  },
 };
}

export function captureSharedPhoto(link:HTMLAnchorElement):SharedPhoto|null{
 const scene=link.closest('figure');
 const photo=scene?.querySelector('img');
 if(!scene||!photo)return null;
 const bounds=scene.getBoundingClientRect();
 const nav=document.querySelector('#site-nav')?.getBoundingClientRect().bottom??0;
 const header=document.querySelector('.masthead')?.getBoundingClientRect().bottom??0;
 const left=Math.max(0,bounds.left);
 const top=Math.max(nav,header,bounds.top);
 const clip={
  left,top,
  width:Math.min(document.documentElement.clientWidth,bounds.right)-left,
  height:Math.min(window.innerHeight,bounds.bottom)-top,
 };
 if(clip.height<50||clip.width<50)return null;
 const frame=framePhoto(photo,clip);
 if(!frame)return null;
 const caption=scene.querySelector('figcaption');
 return {
  ...frame,
  caption:caption?.cloneNode(true) as HTMLElement|undefined,
  captionFrame:caption?.getBoundingClientRect(),
 };
}

export function flySharedPhoto(source:SharedPhoto, route:HTMLElement, done:()=>void){
 const figure=route.querySelector<HTMLElement>('.station-image');
 const image=figure?.querySelector('img');
 if(!figure||!image||new URL(source.src).pathname!==new URL(image.src).pathname)return null;
 const dest=framePhoto(image,figure.getBoundingClientRect(),source.naturalWidth,source.naturalHeight);
 if(!dest)return null;

 const overlay=document.createElement('div');
 overlay.className='shared-flight';
 overlay.setAttribute('aria-hidden','true');
 overlay.inert=true;
 const veil=document.createElement('div');
 veil.className='shared-flight-veil';
 const windowFrame=document.createElement('div');
 windowFrame.className='shared-flight-window';
 const photo=document.createElement('img');
 photo.src=source.src;
 photo.alt='';
 const light=document.createElement('div');
 light.className='shared-flight-light';
 windowFrame.append(photo,light);
 overlay.append(veil,windowFrame);
 if(source.caption&&source.captionFrame){
  source.caption.classList.add('shared-flight-caption');
  const {left,top,width}=source.captionFrame;
  gsap.set(source.caption,{left,top,width});
  overlay.append(source.caption);
 }
 document.body.append(overlay);

 figure.classList.add('shared-photo-target');
 const text=route.querySelectorAll<HTMLElement>('.atlas-text h3, .atlas-text .atlas-date, .story-copy, .atlas-column, .section-title');
 const timeline=gsap.timeline({defaults:{ease:'power3.inOut'}});
 const interruptions=['resize','wheel','touchmove','pointerdown'] as const;

 function cleanup(){
  for(const event of interruptions)window.removeEventListener(event,cancel);
  figure!.classList.add('shared-photo-landed');
  figure!.classList.remove('shared-photo-target');
  gsap.set(text,{clearProps:'transform,opacity'});
  overlay.remove();
  done();
 }
 function cancel(){
  timeline.kill();
  cleanup();
 }
 for(const event of interruptions)window.addEventListener(event,cancel,{passive:true});

 timeline
  .set(windowFrame,source.clip,0)
  .set(photo,source.image,0)
  .to(windowFrame,{...dest.clip,duration:.84},.02)
  .to(photo,{...dest.image,duration:.84},.02)
  .fromTo(veil,{opacity:.82},{opacity:0,duration:.68,ease:'power2.out'},.13)
  .fromTo(light,{opacity:0,xPercent:-120},{opacity:.75,xPercent:125,duration:.55,ease:'power2.inOut'},.16)
  .fromTo(text,{opacity:0,y:21},{opacity:1,y:0,duration:.5,stagger:.044,ease:'power3.out'},.24);
 if(source.caption)timeline.to(source.caption,{opacity:0,y:-22,duration:.21,ease:'power2.in'},0);
 timeline.to(windowFrame,{boxShadow:'0 0 0 1px #e5b27800',duration:.16},.72);
 timeline.eventCallback('onComplete',cleanup);
 return cancel;
}
