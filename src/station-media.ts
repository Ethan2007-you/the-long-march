import {exhibits} from './exhibits';

const cached=new Map<number,{image:HTMLImageElement;ready:Promise<void>}>();

/** Warm only visited/hovered stations, keeping at most four decoded artworks. */
export function warmStation(index:number):Promise<void>{
 const exhibit=exhibits[index];
 if(!exhibit)return Promise.resolve();
 const existing=cached.get(index);
 if(existing)return existing.ready;
 const image=new Image();
 image.src=import.meta.env.BASE_URL+'media/'+exhibit.file+'.webp';
 const ready=image.decode().catch(()=>{});
 cached.set(index,{image,ready});
 if(cached.size>4)cached.delete(cached.keys().next().value!);
 return ready;
}

/** Never delay navigation indefinitely for a slow or failed image. */
export async function prepareStation(index:number){
 let timeout:ReturnType<typeof setTimeout>|undefined;
 try{
  await Promise.race([warmStation(index),new Promise<void>(resolve=>{timeout=setTimeout(resolve,250);})]);
 }finally{clearTimeout(timeout);}
}
