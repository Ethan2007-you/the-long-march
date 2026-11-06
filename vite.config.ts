import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base:'./',
  plugins:[
    tailwindcss(),
    {
      name:'offline-html-entry',
      apply:'build',
      enforce:'post',
      generateBundle(_options,bundle){
        const html=bundle['index.html'];
        if(html?.type!=='asset')return;
        html.source=String(html.source).replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/,
          '<script defer src="$1"></script>').replace(/(<link rel="stylesheet") crossorigin/g,'$1');
      },
    },
  ],
  build:{
    target:'chrome129',
    modulePreload:false,
    rollupOptions:{output:{format:'iife',inlineDynamicImports:true}},
  },
});
