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
   left:bounds.left+positionOffset(x,bounds.width-width),
   top:bounds.top+positionOffset(y,bounds.height-height),
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
 windowFrame.append(photo);
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
 const timeline=gsap.timeline();
 const travel={progress:0};
 const viewportWidth=document.documentElement.clientWidth;
 const viewportHeight=window.innerHeight;
 const between=(from:number,to:number)=>from+(to-from)*travel.progress;

 // The mask corners and the undistorted image plane follow the same progress.
 // The destination is measured before frame zero, so no layout handoff can move the image sideways.
 function draw(){
  const left=between(source.clip.left,dest!.clip.left);
  const top=between(source.clip.top,dest!.clip.top);
  const right=between(source.clip.left+source.clip.width,dest!.clip.left+dest!.clip.width);
  const bottom=between(source.clip.top+source.clip.height,dest!.clip.top+dest!.clip.height);
  windowFrame.style.clipPath=`inset(${top}px ${viewportWidth-right}px ${viewportHeight-bottom}px ${left}px)`;

  const x=between(source.image.left,dest!.image.left);
  const y=between(source.image.top,dest!.image.top);
  const scale=between(1,dest!.image.width/source.image.width);
  photo.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;
 }
 photo.style.width=source.image.width+'px';
 photo.style.height=source.image.height+'px';
 draw();
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
  .to(travel,{progress:1,duration:.84,ease:'power2.out',onUpdate:draw},0)
  .fromTo(veil,{opacity:.82},{opacity:0,duration:.72,ease:'power2.out'},0)
  .fromTo(text,{opacity:0,y:21},{opacity:1,y:0,duration:.5,stagger:.044,ease:'power3.out'},.24);
 if(source.caption)timeline.to(source.caption,{opacity:0,y:-22,duration:.21,ease:'power2.in'},0);
 timeline.eventCallback('onComplete',cleanup);
 return cancel;
}
