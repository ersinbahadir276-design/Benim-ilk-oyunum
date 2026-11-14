(function(){const TX={},jobs=[];for(const k in PLD.tex)jobs.push([k,PLD.tex[k]]);for(const k in KND.tex)jobs.push(['k_'+k,KND.tex[k]]);DRG.groups.forEach((g,i)=>jobs.push(['d_'+i,g.tex]));let left=jobs.length;
 if(!gl){$('load').textContent='Bu cihaz WebGL desteklemiyor';return}
 const done=()=>{if(--left===0){try{boot(TX)}catch(e){$('load').textContent='Hata: '+e.message;console.error(e)}}};
 jobs.forEach(([k,src])=>{const im=new Image();im.onload=()=>{try{TX[k]=texture(im)}catch(e){}done()};im.onerror=done;im.src=src})})();
