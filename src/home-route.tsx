import React, {useRef,useState} from 'react';
import {motion,useScroll,useTransform} from 'framer-motion';
import {ArrowUpRight,Compass} from 'lucide-react';
import rivers from './rivers.json';
import {coordinates,mapLocations,path,routeStories,waypoints} from './route-geometry';
import {warmStation} from './station-media';

type Props={navigate:(event:React.MouseEvent<HTMLAnchorElement|SVGAElement>)=>void;reduced:boolean};
const media=(name:string)=>import.meta.env.BASE_URL+'media/'+name+'.webp';

export function HomeRoute({navigate,reduced}:Props){
 const scene=useRef<HTMLElement>(null);
 const [selected,setSelected]=useState(()=>{
  const index=history.state?.homeStation;
  return Number.isInteger(index)&&index>=0&&index<routeStories.length?index:0;
 });
 const {scrollYProgress}=useScroll({target:scene,offset:['start end','end end']});
 const scale=useTransform(scrollYProgress,[0,.52,1],[.88,1,1]);
 const titleY=useTransform(scrollYProgress,[0,.5],[50,0]);
 const drawing=useTransform(scrollYProgress,[.12,.8],[0,1]);
 const selectedStop=routeStories[selected];
 const select=(index:number)=>{setSelected(index);void warmStation(index);};
 return <>
  <section id="home-route" ref={scene} className="home-route" aria-labelledby="home-route-title">
   <div className="home-route-stage wrap">
    <motion.header className="home-route-heading" style={reduced?undefined:{y:titleY}}>
     <p className="eyebrow">沿着红色的足迹 / 1934—1936</p>
     <h2 id="home-route-title">万水千山，<br className="mobile-break"/>一程一故事。</h2>
     <p>从于都河畔到陕北吴起，从出发到会师。<br/>点击地图上的地点，沿「征途路线」走进这一站。</p>
    </motion.header>
    <motion.div className="home-atlas" style={reduced?undefined:{scale}}>
     <div className="home-map-frame">
      <div className="home-map-heading"><Compass size={23}/><span>中央红军长征路线<small>九个行军节点 · 另标 1936 年会师地</small></span><span className="home-map-north" aria-hidden="true">北 ↑</span></div>
      <svg className="home-route-svg" viewBox="120 65 670 455" role="group" aria-label="长征路线示意图，点击地点进入征途路线对应站点">
       <defs><linearGradient id="home-map-shade" x1="0" x2="1"><stop stopColor="#111813" stopOpacity=".4"/><stop offset="1" stopColor="#111813" stopOpacity=".05"/></linearGradient></defs>
       <image href={media('atlas-relief')} width="790" height="540"/>
       <rect width="790" height="540" fill="url(#home-map-shade)"/>
       <g className="home-map-rivers">{rivers.map((river,index)=><path key={index} d={river}/>)}</g>
       {([[98.6,32.3,'横断山脉'],[104.5,31.3,'四川'],[108.5,28.7,'贵州'],[101,25.6,'云南'],[113.7,27.7,'江西'],[110.1,34,'秦岭'],[103.4,37.7,'甘肃'],[110.4,37.8,'陕西']] as const).map(([lon,lat,name])=>{
        const [x,y]=coordinates([lon,lat]);return <text key={name} className="home-map-region" x={x} y={y}>{name}</text>;
       })}
       <path d={path} className="home-route-track"/>
       <motion.path d={path} className="home-route-drawing" style={reduced?undefined:{pathLength:drawing}}/>
       {waypoints.map(({name,coords})=>{const [x,y]=coordinates(coords);return <circle key={name} cx={x} cy={y} r="2" className="home-waypoint"><title>{name+' · 途经地点'}</title></circle>;})}
       {mapLocations.map(({name,coords,label:[dx,dy],index})=>{
        const [x,y]=coordinates(coords);
        return <a key={name} href={'#route-'+(index+1)} onClick={navigate} onMouseEnter={()=>select(index)} onFocus={()=>select(index)} aria-label={name+'：'+routeStories[index].title+'，进入征途路线对应站点'} className={'home-map-stop'+(selected===index?' is-selected':'')+(index===9?' is-reunion':'')}>
         <title>{name+' · '+routeStories[index].date+' · '+routeStories[index].title}</title>
         <circle cx={x} cy={y} r="17" className="home-stop-target"/>
         <path d={`M${x} ${y}l${dx*.75} ${dy*.75}`} className="home-stop-leader"/>
         <circle cx={x} cy={y} r="7" className="home-stop-ring"/>
         <circle cx={x} cy={y} r="2.5" className="home-stop-dot"/>
         <text x={x+dx} y={y+dy} className="home-stop-label">{name}</text>
        </a>;
       })}
      </svg>
      <div className="home-map-legend"><span><i/>1934—1935 中央红军行军主线</span><span><i/>1936 会师地（不连接为同一行军线）</span></div>
     </div>
     <aside className="home-stop-preview" aria-label="地点预览">
      <span className="eyebrow">{String(selected+1).padStart(2,'0')} / 10</span>
      <time>{selectedStop.date}</time>
      <h3>{selectedStop.title}</h3>
      <p className="home-preview-place">{selectedStop.place}</p>
      <p>{selectedStop.significance}</p>
      <a className="home-read-story" href={'#route-'+(selected+1)} onClick={navigate}>走进这一站 <ArrowUpRight size={19}/></a>
      <div className="home-atlas-note">地形与河流仅供地理参照。路线依历史先后连接关键地点，省略实际绕行，并非精确行军轨迹。</div>
     </aside>
    </motion.div>
    <ol className="home-route-index" aria-label="地点目录，与地图节点对应">{routeStories.map((stop,index)=><li key={stop.title}><a href={'#route-'+(index+1)} onClick={navigate} onMouseEnter={()=>select(index)} onFocus={()=>select(index)}><span>{String(index+1).padStart(2,'0')}</span>{stop.title}<ArrowUpRight size={13}/></a></li>)}</ol>
    <p className="home-map-source">地理底图：<a href="https://www.mapzen.com/rights/" target="_blank" rel="noreferrer">Mapzen 高程数据</a> · <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth 河流数据</a> · 地点按近似经纬度标注</p>
   </div>
  </section>
  <section className="home-chapters wrap" aria-labelledby="home-chapters-title">
   <header><p className="eyebrow">继续观展 / EXPLORE</p><h2 id="home-chapters-title">在历史里，读懂征途。</h2></header>
   <div className="home-chapter-panels">
    {([
     ['origin','历史背景','为什么出发','origin-yudu-ferry','于都东门渡口现址照片，Zhangzhugang，CC BY-SA 3.0'],
     ['events','重要历史','十个关键时刻','archive','红军资料照片，作者不详，公有领域'],
     ['route','征途路线','山河为证','atlas-relief','依据 Mapzen 高程数据绘制的现代地形图'],
     ['spirit','长征精神','信念的力量','conference','纪念浮雕实拍，Xiquinho Silva，CC BY 4.0'],
    ] as const).map(([chapter,title,subtitle,image,alt],index)=><motion.a className="home-chapter-panel" href={'#'+chapter} onClick={navigate} key={chapter} initial={reduced?false:{opacity:0,y:45}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.65,delay:reduced?0:index*.08}}>
     <img src={media(image)} alt={alt} loading="lazy" decoding="async"/>
     <span className="panel-number">{String(index+2).padStart(2,'0')}</span><h3>{title}</h3><span className="panel-subtitle">{subtitle}<ArrowUpRight size={18}/></span>
    </motion.a>)}
   </div>
  </section>
 </>;
}
