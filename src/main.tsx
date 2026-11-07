import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {motion,useReducedMotion,useScroll,useSpring} from 'framer-motion';
import {ArrowUpRight,Compass,Maximize2,Minus,Pause,Play,Plus,RotateCcw,Volume2,VolumeX,X} from 'lucide-react';
import {reunion,sources,stops,themes} from './data';
import rivers from './rivers.json';
import chishuiMap from './chishui-map.json';
import {originNotes,eventNotes,spiritNotes} from './exhibit-notes';
import {crossings,crossingOverview} from './crossings';
import {useChapterMotion,type Chapter} from './chapter-motion';
import {captureSharedPhoto,type SharedPhoto} from './shared-photo';
import {loadSoundtrack} from './soundtrack';
import './style.css';

const nav=[['home','首页'],['origin','历史背景'],['events','重要历史'],['route','征途路线'],['spirit','长征精神']] as const;
function currentPage():Chapter{
 const hash=window.location.hash.slice(1);
 if(/^route-(?:[1-9]|10)$/.test(hash))return 'route';
 return nav.find(([id])=>id===hash)?.[0]??'home';
}
const media=(name:string)=>import.meta.env.BASE_URL+'media/'+name+'.webp';
const coordinates=([lon,lat]:[number,number])=>[(lon-96)*36+30,(39-lat)*32+32];
const waypoints: {after:number; name:string; coords:[number,number]}[] = [
 {after:1,name:'黎平',coords:[109.14,26.23]},
 {after:4,name:'安顺场',coords:[102.28,29.23]},
 {after:6,name:'懋功',coords:[102.37,31.0]},
 {after:7,name:'腊子口',coords:[103.84,34.14]},
 {after:7,name:'哈达铺',coords:[104.23,34.23]},
 {after:7,name:'榜罗镇',coords:[105.07,34.89]},
 {after:7,name:'六盘山',coords:[106.20,35.67]},
];
const path=stops.flatMap((s,i)=>[s.coords,...waypoints.filter(point=>point.after===i).map(point=>point.coords)])
 .map((point,i)=>(i?'L':'M')+coordinates(point).join(',')).join(' ');
const routeStories=[...stops,reunion];
const reunionPlaces:{name:string;coords:[number,number];label:[number,number]}[]=[
 {name:'会宁',coords:[105.059,35.697],label:[-92,34]},
 {name:'将台堡',coords:[105.84,35.818],label:[31,36]},
];
const mapLocations=[
 ...stops.map((stop,index)=>({
  name:stop.place.split(' · ')[1].replace('一带',''),
  coords:stop.coords,
  label:stop.label??[12,-12],
  index,
 })),
 ...reunionPlaces.map(place=>({...place,index:stops.length})),
];
const battleArt=['yudu','xiang','zunyi','chishui','jinsha','luding','snow','marsh','wuqi','reunion'];
const captions=[
 '中央红军在于都集结，夜渡于都河。',
 '红军强渡湘江，突破第四道封锁线。',
 '中共中央在遵义总结战事，调整军事领导。',
 '中央红军四次渡过赤水，在追击中争取主动。',
 '主力经皎平渡跨过金沙江，跳出包围圈。',
 '红四团夺取泸定桥，为主力渡过大渡河打开通路。',
 '中央红军翻越夹金山，随后在懋功地区会师。',
 '红军穿过川西北水草地，继续向甘南转进。',
 '陕甘支队抵达吴起镇，中央红军长征到达陕北。',
 '红军三大主力在会宁、将台堡相继会师。',
];
function linkedStation(){
 const match=window.location.hash.match(/^#route-([1-9]|10)$/);
 return match?Number(match[1])-1:null;
}
type Exhibit={file:string;label:string;credit?:string;url?:string};
const historyImages:Record<string,Exhibit>={
 archive:{file:'archive',label:'红军干部向部队讲话 · 1930 年代资料照片',credit:'作者不详 · PD-China',url:'https://commons.wikimedia.org/wiki/File:Long-march.jpg'},
 ferry:{file:'origin-yudu-ferry',label:'于都东门渡口 · 2014 年现址照片',credit:'Zhangzhugang · CC BY-SA 3.0 · 裁切',url:'https://commons.wikimedia.org/wiki/File:Yudu_Zhongyang_Hongjun_Changzheng_Diyi_Dukou_2014.05.30_11-12-33.jpg'},
 relief:{file:'conference',label:'长征纪念浮雕 · 2024 年实拍',credit:'Xiquinho Silva · CC BY 4.0 · 裁切',url:'https://commons.wikimedia.org/wiki/File:Zunyi_Conference_Site.jpg'},
 mao:{file:'mao',label:'毛泽东（1937）',credit:'埃德加·斯诺 · CC0',url:'https://commons.wikimedia.org/wiki/File:Mao_Zedong_1937.jpg'},
 zhou:{file:'zhou',label:'周恩来（1937 年 12 月）',credit:'作者不详 · PD-China',url:'https://commons.wikimedia.org/wiki/File:Zhou_Enlai_1937.jpg'},
};
const sourceLink=(i:number,label='查看史料')=><a className="reference" href={sources[i][2]} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={14}/></a>;

function Heading({children}:{children:React.ReactNode}){
 return <header className="section-title"><h2 className="type-chapter" data-title>{children}</h2></header>;
}

function Photo({image,open,className=''}:{image:Exhibit;open:(image:Exhibit)=>void;className?:string}){
 return <figure className={'photo '+className}><button type="button" onClick={()=>open(image)} aria-label={'放大查看 '+image.label}><img src={media(image.file)} alt={image.label} loading="lazy" decoding="async"/><Maximize2 className="expand" size={18}/></button><figcaption><span>{image.label}</span><small>{image.url?<a href={image.url} target="_blank" rel="noreferrer">{image.credit} ↗</a>:image.credit}</small></figcaption></figure>;
}

function CrossingDiagram({step}:{step:number}){
 const arrowId='crossing-direction-arrow';
 const places=chishuiMap.places;
 return <figure className="crossing-cartography">
  <svg viewBox={`0 0 ${chishuiMap.width} ${chishuiMap.height}`} className="crossing-diagram" role="img" aria-label={`${crossings[step].name}赤水地形图，${crossings[step].port}，${crossings[step].direction}，箭头表示渡河方向`}>
   <defs>
    <marker id={arrowId} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#f2c28c"/></marker>
    <linearGradient id="crossing-map-edge" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#15201b" stopOpacity=".24"/><stop offset=".5" stopColor="#17201c" stopOpacity="0"/><stop offset="1" stopColor="#111b18" stopOpacity=".55"/></linearGradient>
   </defs>
   <image href={media('chishui-relief')} width={chishuiMap.width} height={chishuiMap.height}/>
   <g className="terrain-rivers">{chishuiMap.riverPaths.map((river,index)=><g key={index}><path d={river} className="terrain-river-edge"/><path d={river} className="terrain-river-water"/></g>)}</g>
   <rect width={chishuiMap.width} height={chishuiMap.height} fill="url(#crossing-map-edge)"/>
   {chishuiMap.towns.map(town=><text className="terrain-region" key={town.name} x={town.point[0]} y={town.point[1]} transform={`rotate(${town.angle} ${town.point.join(' ')})`}>{town.name}</text>)}
   {places.filter(place=>place.steps.some(index=>index<=step)).map(place=>{
    const active=place.steps.includes(step);
    return <path key={place.id} d={place.crossingPath} className={`terrain-crossing ${active?'is-current':'is-previous'}`} markerEnd={active?`url(#${arrowId})`:undefined}/>;
   })}
   {places.map(place=>{
    const active=place.steps.includes(step);
    const [x,y]=place.point;
    const [dx,dy]=place.label;
    return <g key={place.id} className={`terrain-port ${active?'is-current':''}`} transform={`translate(${x} ${y})`}>
     <path d={`M0 0L${dx*.7} ${dy*.7}H${dx}`} className="terrain-label-line"/>
     <circle r={active?9:5}/>
     <text x={dx} y={dy} textAnchor={place.anchor as 'start'|'end'} dominantBaseline="middle">{place.name}</text>
    </g>;
   })}
   <g className="terrain-north" transform={`translate(${chishuiMap.width-56} 38)`}><text textAnchor="middle" y="0">北</text><path d="M0 61V18M-7 30L0 18L7 30"/></g>
   <g className="terrain-scale" transform={`translate(38 ${chishuiMap.height-40})`}><path d="M0-8V0H99V-8M49.5-5V0"/><text x="0" y="24">0</text><text x="99" y="24" textAnchor="end">10 km</text></g>
  </svg>
  <figcaption><span>赤水河谷 · 渡河方向示意</span><span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> · <a href="https://www.mapzen.com/rights/" target="_blank" rel="noreferrer">Mapzen</a></span></figcaption>
 </figure>;
}

function CrossingPreview(){
 return <svg viewBox={`0 0 ${chishuiMap.width} ${chishuiMap.height}`} aria-hidden="true">
  <image href={media('chishui-relief')} width={chishuiMap.width} height={chishuiMap.height}/>
  {chishuiMap.riverPaths.map((river,index)=><path key={index} d={river} fill="none" stroke="#abc0b5" strokeWidth="12"/>)}
  {chishuiMap.places.map(place=><circle key={place.id} cx={place.point[0]} cy={place.point[1]} r="18" fill="#e7bc83"/>)}
 </svg>;
}

function Route(){
 const [selected,setSelected]=useState(()=>linkedStation()??0);
 const [local,setLocal]=useState(false);
 const [step,setStep]=useState(0);
 const localHeading=useRef<HTMLHeadingElement>(null);
 const localEntry=useRef<HTMLButtonElement>(null);
 const returning=useRef(false);
 useEffect(()=>{
  const syncStation=()=>{
   const station=linkedStation();
   if(station===null)return;
   setSelected(station);setLocal(false);setScale(1);setOffset({x:0,y:0});
  };
  window.addEventListener('hashchange',syncStation);
  return ()=>window.removeEventListener('hashchange',syncStation);
 },[]);
 useEffect(()=>{
  if(local)localHeading.current?.focus();
  else if(returning.current){localEntry.current?.focus();returning.current=false;}
 },[local]);
 function resetMap(){setScale(1);setOffset({x:0,y:0});}
 function returnToOverview(){returning.current=true;setLocal(false);resetMap();}
 function selectStation(index:number){setSelected(index);resetMap();}

 const [scale,setScale]=useState(1);
 const [offset,setOffset]=useState({x:0,y:0});
 const drag=useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
 const stop=routeStories[selected];
 const story=eventNotes[selected];
 const crossing=crossings[step];
 function zoom(value:number){
  const next=Math.max(1,Math.min(2.6,value));
  setScale(next);
  setOffset(({x,y})=>({x:Math.max(-395*(next-1),Math.min(395*(next-1),x)),y:Math.max(-270*(next-1),Math.min(270*(next-1),y))}));
 }
 return <section id="route" className="section route">
  <div className="wrap"><header className="section-title"><h2 className="type-chapter" id="route-title" tabIndex={-1}>山河为证</h2></header>
  
  <div className="atlas">
   <div className="atlas-column">
    <div className="atlas-location">
     <span className="atlas-location-number">{String(selected+1).padStart(2,'0')} / {routeStories.length}</span>
     <strong>{stop.place}</strong>
    </div>
   {local?<div className="crossing-exhibit">
   <div className="crossing-map">
    <div className="crossing-header"><h3 ref={localHeading} tabIndex={-1}>四渡赤水 <small>河谷地形与渡河方向</small></h3><button type="button" className="route-action" onClick={returnToOverview}>← 返回全线</button></div>
    <div className="crossing-steps" role="tablist" aria-label="四次渡河">{crossings.map((item,index)=><button type="button" key={item.name} id={`crossing-tab-${index}`} role="tab" aria-selected={index===step} aria-controls="crossing-story" tabIndex={index===step?0:-1} data-step={index} onClick={()=>setStep(index)} onKeyDown={event=>{
     let next=index;
     if(event.key==='ArrowRight')next=(index+1)%crossings.length;
     else if(event.key==='ArrowLeft')next=(index+crossings.length-1)%crossings.length;
     else if(event.key==='Home')next=0;
     else if(event.key==='End')next=crossings.length-1;
     else return;
     event.preventDefault();setStep(next);
     event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-step="${next}"]`)?.focus();
    }}><span>{item.name}</span><small>{item.shortDate}</small></button>)}</div>
    <CrossingDiagram step={step}/>
   </div>
   <div className="crossing-copy" aria-live="polite"><p className="crossing-direction">{crossing.direction}</p><p>{crossing.note}</p></div>
   <div className="crossing-overview"><h4>{crossingOverview.title}</h4><p>{crossingOverview.significance}</p></div>
  </div>:<div className="atlas-map">
    <div className="map-stamp"><Compass size={23}/> <span>中央红军长征路线<br/><small>1934—1935 · 另标 1936 年会师地</small></span></div>
    <svg className={'atlas-svg '+(scale>1?'is-zoomed':'')} viewBox="0 0 790 540" aria-label="中央红军长征关键地点经纬度示意图"
     onPointerDown={e=>{if(scale===1||(e.target as Element).closest('[role=button]'))return;drag.current={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y};e.currentTarget.setPointerCapture(e.pointerId);}}
     onPointerMove={e=>{if(!drag.current)return;const ratio=790/e.currentTarget.getBoundingClientRect().width;setOffset({x:Math.max(-395*(scale-1),Math.min(395*(scale-1),drag.current.ox+(e.clientX-drag.current.x)*ratio)),y:Math.max(-270*(scale-1),Math.min(270*(scale-1),drag.current.oy+(e.clientY-drag.current.y)*ratio))});}}
     onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
     <defs><pattern id="grid" x="30" y="32" width="72" height="64" patternUnits="userSpaceOnUse"><path d="M 72 0 H 0 V 64" fill="none" stroke="#d1bea4" strokeOpacity=".14"/></pattern></defs>
     <rect width="790" height="540" fill="#242d2b"/>
     <g transform={`translate(${offset.x+395*(1-scale)} ${offset.y+270*(1-scale)}) scale(${scale})`}>
      <image href={media('atlas-relief')} width="790" height="540" preserveAspectRatio="none"/>
      <rect width="790" height="540" fill="url(#grid)"/>
      <g className="atlas-rivers">{rivers.map((river,index)=><path key={index} d={river}/>)}</g>
      {([[97,32,'横断山脉'],[101.4,35.8,'岷 山'],[109.2,33.8,'秦 岭'],[111.5,30.4,'长 江'],[103.5,28.8,'金沙江'],[114,29.35,'鄱阳湖流域']] as const).map(([lon,lat,label])=>{const [x,y]=coordinates([lon,lat]);return <text key={label} className="region-label" x={x} y={y}>{label}</text>;})}
      <path d={path} className="route-shadow" fill="none"/>
      <path d={path} className="route-line" pathLength="1" fill="none"/>
      {waypoints.map(({name,coords})=>{const [x,y]=coordinates(coords);return <g className="atlas-waypoint" key={name} transform={`translate(${x} ${y})`}><circle r="2.8"/><title>{name} · 路线参考点</title></g>;})}
      {[...mapLocations].sort((first,second)=>Number(first.index===selected)-Number(second.index===selected)).map(({name,coords,label:[dx,dy],index})=>{
       const [x,y]=coordinates(coords);
       const active=selected===index;
       const isMeeting=index===stops.length;
       const endpoint=index===0||index===stops.length-1;
       return <g className={`marker ${active?'selected':''} ${endpoint?'endpoint':''} ${isMeeting?'meeting-pin':''}`}
        key={name} transform={`translate(${x} ${y})`} role="button" tabIndex={0}
        aria-label={name+' · '+routeStories[index].title} aria-pressed={active}
        onClick={()=>setSelected(index)} onKeyDown={event=>{
         if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(index);}
        }}>
        <circle r="18" fill="transparent"/>
        <line className="pin-leader" x2={dx*.9} y2={dy*.86}/>
        <circle className="pin-halo" r="10"/>
        <circle className="pin" r="4"/>
        <text className="pin-number" textAnchor="middle" dominantBaseline="central">{index+1}</text>
        <text className="pin-label" x={dx} y={dy}>{name}</text>
       </g>;
      })}
     </g>
    </svg>
    <div className="map-controls">
     <button onClick={()=>zoom(scale+.4)} disabled={scale>=2.6} aria-label="放大地图"><Plus size={18}/></button>
     <button onClick={()=>zoom(scale-.4)} disabled={scale<=1} aria-label="缩小地图"><Minus size={18}/></button>
     <button onClick={resetMap} aria-label="返回全线"><RotateCcw size={15}/></button>
    </div>
   </div>}
   {!local&&<>
    {selected===3&&<button type="button" ref={localEntry} className="crossing-entry" aria-expanded={false} onClick={()=>{setStep(0);setLocal(true);}}>
     <span className="crossing-entry-preview"><CrossingPreview/></span>
     <span className="crossing-entry-copy"><strong>进入四渡赤水图解</strong><span>沿四次渡河，看清战局、选择与结果</span></span>
     <ArrowUpRight size={27} aria-hidden="true"/>
    </button>}
    <div className="station-nav" aria-label="前后站点">
     <button disabled={selected===0} onClick={()=>selectStation(selected-1)}>← 上一站</button>
     <button disabled={selected===routeStories.length-1} onClick={()=>selectStation(selected+1)}>下一站 →</button>
    </div>
    <div className="stop-list" aria-label="路线节点">
     {routeStories.map((station,index)=>(
      <button key={station.title} aria-pressed={selected===index} onClick={()=>selectStation(index)}>
       <small>{String(index+1).padStart(2,'0')}</small>{station.title}
      </button>
     ))}
    </div>
   </>}
   </div>
   <article className={'atlas-text'+(local?' is-crossing-story':'')} aria-live="polite">
    <p className="atlas-date">{stop.date} / {stop.place}</p>
    <h3 className="type-event" tabIndex={-1}>{stop.title}</h3>
    <figure key={selected} className={`station-image battle-${battleArt[selected]}`}>
     <img src={media('battle-'+battleArt[selected])} alt={captions[selected]+'（情境插画）'} decoding="async"/>
    </figure>
    {local?<div className="story-copy crossing-story" id="crossing-story" role="tabpanel" aria-labelledby={`crossing-tab-${step}`}>
     <p className="crossing-story-date">{crossing.name} · {crossing.date}</p>
     <h4>{crossing.heading}</h4>
     <p className="crossing-story-port">{crossing.port}</p>
     <dl className="crossing-analysis">
      <div><dt>当时局势</dt><dd>{crossing.context}</dd></div>
      <div><dt>行动选择</dt><dd>{crossing.decision}</dd></div>
      <div><dt>带来的变化</dt><dd>{crossing.result}</dd></div>
     </dl>
    </div>:<div className="story-copy">
     <h4>{story.heading}</h4>
     {story.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
    </div>}
   </article>
  </div>
  </div>
 </section>;
}

function App(){
 const heroMedia=useRef<HTMLDivElement>(null);
 const main=useRef<HTMLElement>(null);
 const pendingPhoto=useRef<SharedPhoto|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const [enlarged,open]=useState<Exhibit|null>(null);
 const [active,setActive]=useState(currentPage);
 const [scrolled,setScrolled]=useState(false);
 const [playVideo,setPlayVideo]=useState(false);
 const [hasVideo,setHasVideo]=useState(true);
 const [paused,setPaused]=useState(false);
 const video=useRef<HTMLVideoElement>(null);
 const music=useRef<HTMLAudioElement>(null);
 const [musicPlaying,setMusicPlaying]=useState(false);
 const [musicUnavailable,setMusicUnavailable]=useState(false);
 const [musicLoading,setMusicLoading]=useState(false);
 async function toggleMusic(){
  const track=music.current;
  if(!track||musicLoading)return;
  if(!track.paused){
   track.pause();
   return;
  }
  setMusicLoading(true);
  try{
   if(!track.src)track.src=await loadSoundtrack();
   track.volume=.38;
   await track.play();
  }catch(error){
   if(!(error instanceof DOMException&&error.name==='NotAllowedError'))setMusicUnavailable(true);
  }finally{
   setMusicLoading(false);
  }
 }
 const reduce=useReducedMotion();
 useChapterMotion(currentPage,setActive,Boolean(reduce),main,pendingPhoto);
 const {scrollYProgress}=useScroll();
 const spring=useSpring(scrollYProgress,{stiffness:180,damping:40,mass:.25});
 useEffect(()=>{
  const mode=window.matchMedia('(min-width: 850px) and (prefers-reduced-motion: no-preference)');
  const sync=()=>setPlayVideo(mode.matches);
  sync();mode.addEventListener('change',sync);
  return ()=>mode.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{
  const film=video.current;if(!film)return;
  if(active!=='home'||paused)film.pause();else void film.play().catch(()=>{});
 },[active,paused,playVideo]);
 useEffect(()=>{
  const sync=()=>setScrolled(window.scrollY>42);
  sync();window.addEventListener('scroll',sync,{passive:true});
  return ()=>window.removeEventListener('scroll',sync);
 },[]);
 useEffect(()=>{
  if(!enlarged||!dialog.current)return;
  dialog.current.showModal();
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return ()=>{document.body.style.overflow=previous;};
 },[enlarged]);
 function navigateChapter(event:React.MouseEvent<HTMLAnchorElement>){
  if(event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  const hash=event.currentTarget.hash;
  if(hash===window.location.hash)return;
  event.preventDefault();
  if(!reduce&&active==='events'&&hash.startsWith('#route-')){
   pendingPhoto.current=captureSharedPhoto(event.currentTarget);
  }
  // Keep real anchors and browser history, without jumping to the section mid-transition.
  history.pushState(null,'',hash);
  flushSync(()=>window.dispatchEvent(new HashChangeEvent('hashchange')));
 }
 return <div className="site">
  <a className="skip" href={'#'+active}>跳到展览正文</a>
  <motion.div className="progress pointer-events-none" aria-hidden="true" style={{scaleX:reduce?scrollYProgress:spring}}/>
  <header className={'masthead '+(active!=='home'||scrolled?'solid':'')}><a href="#home" className="brand" onClick={navigateChapter}><span className="seal">征</span><span>长征 · 不朽征途</span></a>
   <nav id="site-nav" aria-label="展览导航">{nav.map(([id,label])=><a key={id} href={'#'+id} onClick={navigateChapter} aria-current={active===id?'location':undefined}>{label}</a>)}</nav>
   <button className="music-toggle" type="button" onClick={toggleMusic}
    disabled={musicUnavailable||musicLoading} aria-pressed={musicPlaying} aria-label="展览配乐">
    {musicPlaying?<Volume2 size={17}/>:<VolumeX size={17}/>}
    <span>{musicUnavailable?'配乐不可用':musicLoading?'载入配乐…':musicPlaying?'暂停配乐':'播放配乐'}</span>
   </button>
  </header>
  <audio ref={music} loop preload="none"
   onPlay={()=>setMusicPlaying(true)} onPause={()=>setMusicPlaying(false)}
   onError={()=>{setMusicPlaying(false);setMusicUnavailable(true);}}/>
  <main ref={main}>
   <section hidden={active!=='home'} id="home" className="hero" onPointerMove={e=>{if(reduce||e.pointerType!=='mouse')return;const box=e.currentTarget.getBoundingClientRect();heroMedia.current?.style.setProperty('--mx',((e.clientX/box.width-.5)*15)+'px');heroMedia.current?.style.setProperty('--my',(((e.clientY-box.top)/box.height-.5)*10)+'px');}} onPointerLeave={()=>{heroMedia.current?.style.setProperty('--mx','0px');heroMedia.current?.style.setProperty('--my','0px');}}>
    <div className="hero-layer"><div className="hero-visual" ref={heroMedia}>
     <picture><source media="(max-width: 849px)" srcSet={media('hero-mobile')+'?v=poster'}/><img className="hero-poster" src={media('hero')+'?v=poster'} alt="" fetchPriority="high"/></picture>
     {playVideo&&hasVideo&&<video ref={video} className="hero-film" src={import.meta.env.BASE_URL+'media/hero.webm?v=poster'} poster={media('hero')+'?v=poster'} muted autoPlay={!paused} loop playsInline preload="metadata" aria-hidden="true" onError={()=>setHasVideo(false)}/>}
    </div></div>
    <div className="hero-veil"/><div className="hero-dissolve"/>
    <div className="hero-body wrap">
     
     <h1 className="hero-word type-cover" aria-label="长征"><span className="hero-readable">长</span><span>征</span></h1>
     <div className="hero-caption hero-intro">
      
      <p className="hero-line">从于都到吴起镇，沿九处站点读懂长征的行军选择。</p>
     </div>
    </div>
    <div className="hero-foot wrap hero-intro"><div className="hero-meta">{playVideo&&hasVideo&&<button className="round-arrow" aria-label={paused?'播放背景影像':'暂停背景影像'} onClick={()=>{setPaused(value=>!value)}}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}</div></div>
    <div className="hero-dates hero-intro"><span>1934</span><i/><span>1936</span></div>
   </section>
   <section hidden={active!=='origin'} id="origin" className="section origin">
    <div className="wrap">
     <div className="origin-heading"><Heading>征途的起点</Heading>
      <dl className="origin-facts"><div><dt>集结兵力</dt><dd>8.6<span> 万余人</span></dd></div><div><dt>主力军团</dt><dd>5<span> 个</span></dd></div><div><dt>主要渡口</dt><dd>8<span> 处</span></dd></div></dl>
     </div>
     
     <div className="origin-grid origin-evidence">
      <Photo image={historyImages.ferry} open={open} className="origin-ferry"/>
      <div className="origin-copy"><div className="eyebrow"><span>1934.10</span><i/> 江西于都</div><h3 className="type-chapter">为什么从于都出发</h3>{originNotes.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<div className="origin-sources">{sourceLink(2,'出发地考证')}{sourceLink(11,'渡河计划档案')}</div></div>
      <div className="origin-evidence-pair"><Photo image={historyImages.archive} open={open}/><Photo image={historyImages.relief} open={open}/></div>
     </div>
     <ol className="origin-context" aria-label="从战略转移到转兵黔北">
      <li><time>1934 年秋</time><h3>保存主力</h3><p>第五次反“围剿”失利，原有作战空间缩小，中央红军准备突围转移。</p></li>
      <li><time>1934 年 10 月</time><h3>于都出发</h3><p>主力集结补充，军民协作架桥、摆渡，部队利用夜间分批渡河。</p></li>
      <li><time>1934 年 11—12 月</time><h3>湘江之后</h3><p>突破第四道封锁线付出重大代价，继续向湘西北行军又面临重兵堵截。</p></li>
      <li><time>1934 年 12 月</time><h3>转兵黔北</h3><p>黎平会议决定改向贵州北部。此后渡过乌江、进入遵义，迎来新的转折。</p></li>
     </ol>
     
    </div>
   </section>
   <section hidden={active!=='events'} id="events" className="events" aria-label="重要历史 · 情境插画">
    <div className="history-gallery">
     {routeStories.map((stop,index)=><figure className={'battle-scene battle-'+battleArt[index]} key={stop.title}>
      <img src={media('battle-'+battleArt[index])} alt="" loading={index===0?'eager':'lazy'} decoding="async"/>
      <a className="event-image-link" href={'#route-'+(index+1)} onClick={navigateChapter} tabIndex={-1} aria-hidden="true"/>
      <figcaption>
       <time>{stop.date}</time>
       <h3 className="type-event"><a href={'#route-'+(index+1)} onClick={navigateChapter} aria-label={'到征途路线阅读'+stop.title}>{stop.title} <ArrowUpRight aria-hidden="true"/></a></h3>
       <p>{captions[index]}</p>
      </figcaption>
     </figure>)}
    </div>
   </section>
   <div hidden={active!=='route'}><Route/></div>
   <section hidden={active!=='spirit'} id="spirit" className="spirit">
    <div className="spirit-cover">
     <img src={media('battle-snow')} alt="" loading="lazy" decoding="async"/>
     <div className="wrap"><Heading>长征精神</Heading></div>
    </div>
    <div className="wrap spirit-reading">
     <ol className="spirit-list">
      {themes.map(([first,second],index)=>(
       <li key={first}>
        <span className="spirit-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
        <h3 className="type-spirit">{first}、{second}</h3>
        <div className="spirit-explanation">{spiritNotes[index].map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div>
       </li>
      ))}
     </ol>
     {sourceLink(1,'纪念红军长征胜利 80 周年大会讲话')}
    </div>
   </section>
  </main>
  <dialog ref={dialog} className="lightbox" aria-label="图片查看器" onClose={()=>open(null)} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
   {enlarged&&<figure><button className="close" type="button" onClick={()=>dialog.current?.close()} aria-label="关闭放大图片"><X size={22}/></button><img src={media(enlarged.file)} alt={enlarged.label}/><figcaption>{enlarged.label} <small>{enlarged.url?<a href={enlarged.url} target="_blank" rel="noreferrer">{enlarged.credit} ↗</a>:enlarged.credit}</small></figcaption></figure>}
  </dialog>
 </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
