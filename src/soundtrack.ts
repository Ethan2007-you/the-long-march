const partCount=18;

function loadPart(index:number):Promise<Uint8Array<ArrayBuffer>>{
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=import.meta.env.BASE_URL+'media/helios/'+String(index).padStart(2,'0')+'.js';
  script.onload=()=>{
   const encoded=script.dataset.audio;
   script.remove();
   if(encoded)resolve(Uint8Array.from(atob(encoded),character=>character.charCodeAt(0)));
   else reject(new Error('Soundtrack part is empty'));
  };
  script.onerror=()=>{
   script.remove();
   reject(new Error('Soundtrack part could not load'));
  };
  document.head.append(script);
 });
}

export async function loadSoundtrack(){
 // Classic scripts keep the audio available when the offline exhibit is opened from disk.
 const parts=await Promise.all(Array.from({length:partCount},(_,index)=>loadPart(index)));
 return URL.createObjectURL(new Blob(parts,{type:'audio/mpeg'}));
}
