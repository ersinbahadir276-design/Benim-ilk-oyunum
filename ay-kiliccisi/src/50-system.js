// ===================== the System: stats, levels, quests, notifications, windows, save =====================
const $=id=>document.getElementById(id);
const SAVE_V=3,SYS={v:SAVE_V,lowShake:0,lv:1,xp:0,pts:0,str:5,agi:5,vit:5,per:5,kills:0,dodges:0,tamed:0,walked:0,gate:0,knight:0,title:'Yok',titles:[],done:{},meat:2,dodgeLv:1,intro:0,cp:null,gold:0,parries:0,takedowns:0,gkills:0,ckills:0,dragon:0,seenGob:0,seenSwamp:0,seenLair:0};
const maxHP=()=>100+(SYS.vit-5)*10,dmgMul=()=>(1+(SYS.str-5)*.07)*(SYS.title==='Kurt Avcısı'?1.1:1),spdMul=()=>1+(SYS.agi-5)*.012,iframes=()=>.36+(SYS.agi-5)*.008+(SYS.dodgeLv-1)*.08,radarR=()=>30+(SYS.per-5)*4,xpNeed=()=>50*SYS.lv*SYS.lv+30;
const QUESTS=[
 {id:'wake',name:'Uyanış',desc:'Çimenlerin arasında 40 m yürü',goal:40,get:()=>SYS.walked,xp:20},
 {id:'hunt1',name:'İlk Av',desc:'Bir kurt öldür',goal:1,get:()=>SYS.kills,xp:60},
 {id:'dodge',name:'Kusursuz Kaçınma',desc:'Kurt atlayışından 3 kez kaçın',goal:3,get:()=>SYS.dodges,xp:90,skill:1},
 {id:'hunt5',name:'Sürü Avcısı',desc:'5 kurt öldür',goal:5,get:()=>SYS.kills,xp:150,title:'Kurt Avcısı'},
 {id:'tame',name:'Yoldaş',desc:'Bir kurdu besleyerek evcilleştir',goal:1,get:()=>SYS.tamed,xp:120},
 {id:'gate',name:'Krallığa Yolculuk',desc:'Krallığın kapısına ulaş',goal:1,get:()=>SYS.gate,xp:150},
 {id:'knight',name:'Unutulmuş Şövalye',desc:'Meydandaki şövalye heykeline yaklaş',goal:1,get:()=>SYS.knight,xp:200,title:'Şövalyenin Varisi',pts:5},
 {id:'parry',name:'Kılıçla Savunma',desc:'3 saldırıyı tam zamanında savuştur (BLOK)',goal:3,get:()=>SYS.parries,xp:150},
 {id:'gob',name:'Goblin Tehdidi',desc:'Bir goblin kampında 5 goblin alt et',goal:5,get:()=>SYS.gkills,xp:200,title:'Kamp Yıkıcı'},
 {id:'silent',name:'Sessiz Gölge',desc:'3 sessiz alt etme yap (arkadan)',goal:3,get:()=>SYS.takedowns,xp:220,title:'Gölge Kılıç'},
 {id:'croc',name:'Bataklık Avı',desc:'Sisli Bataklık’ta bir timsah öldür',goal:1,get:()=>SYS.ckills,xp:150},
 {id:'dragon',name:'Ejderin Dağı',desc:'Kuzey dağlarındaki ejderhayı alt et',goal:1,get:()=>SYS.dragon,xp:500}];
function note(txt,cls){const n=$('notes'),d=document.createElement('div');d.className='note '+(cls||'');d.textContent=txt;n.appendChild(d);while(n.children.length>4)n.removeChild(n.firstChild);
 setTimeout(()=>{d.classList.add('out');setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d)},400)},3800)}
function addXP(v,P){SYS.xp+=v;while(SYS.xp>=xpNeed()){SYS.xp-=xpNeed();SYS.lv++;SYS.pts+=3;if(P){P.hp=maxHP();P.flash=1}note('[Sistem] Seviye atladın! Seviye '+SYS.lv+' · +3 stat puanı','gold');if(typeof sfx!=='undefined')sfx.level()}}
function checkQuests(P){for(const q of QUESTS){if(SYS.done[q.id]||q.get()<q.goal)continue;SYS.done[q.id]=1;note('[Sistem] Görev tamamlandı: '+q.name+' · +'+q.xp+' XP','gold');
  if(q.title){SYS.titles.push(q.title);SYS.title=q.title;note('[Sistem] Unvan kazanıldı: «'+q.title+'»','gold')}if(q.pts){SYS.pts+=q.pts;note('[Sistem] +'+q.pts+' stat puanı')}
  if(q.skill){SYS.dodgeLv=2;note('[Sistem] Yetenek gelişti: [Kaçınma Lv.2]')}addXP(q.xp,P);save(P)}}
function save(P){try{if(P)SYS.cp=P.cp;localStorage.setItem('kf2_save',JSON.stringify(SYS))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem('kf2_save')||'null');if(s&&typeof s==='object'){for(const k in SYS)if(k in s)SYS[k]=s[k];if((s.v||1)<2){SYS.lowShake=0}SYS.v=SAVE_V}}catch(e){}}
function drawMap(c){const g=c.getContext('2d'),S=c.width,k=S/(WS*2),T=(x,z)=>[(x+WS)*k,(z+WS)*k];g.fillStyle='#24402a';g.fillRect(0,0,S,S);
 const step=28;for(let x=-WS;x<WS;x+=step)for(let z=-WS;z<WS;z+=step){const zn=zoneAt(x+step/2,z+step/2),col={kingdom:'#a08a64',lair:'#4a3434',lake:'#3d6f9a',river:'#3d6f9a',swamp:'#4b5a36',camp:'#8a6a3e',ruins:'#7c7c74',mountain:'#7a7a78',dense:'#1c3a20',forest:'#2f5a30'}[zn];g.fillStyle=col;const p=T(x,z);g.fillRect(p[0],p[1],step*k+1,step*k+1)}
 g.font='bold 10px system-ui';g.fillStyle='#fff';g.textAlign='center';for(const[n,x,z]of[['Krallık',0,0],['Ejderha Yuvası',LAIR[0],LAIR[1]],['Gümüş Göl',LAKE[0],LAKE[1]],['Bataklık',SWAMP[0],SWAMP[1]],['Kara Orman',-1050,700]]){const p=T(x,z);g.fillText(n,p[0],p[1])}
 for(const c2 of CAMPS){const p=T(c2[0],c2[1]);g.fillStyle='#ffb35a';g.fillText('⚑',p[0],p[1])}for(const r of RUINS){const p=T(r[0],r[1]);g.fillStyle='#ddd';g.fillText('▦',p[0],p[1])}
 const p=T(P.x,P.z);g.fillStyle='#8fd0ff';g.beginPath();g.arc(p[0],p[1],4,0,7);g.fill();g.strokeStyle='#fff';g.stroke()}
function hud(P){$('hpf').style.width=cl(P.hp/maxHP()*100,0,100)+'%';$('hpt').textContent=Math.ceil(P.hp)+' / '+maxHP();$('stf').style.width=cl(P.sta,0,100)+'%';$('stf').style.opacity=P.exhausted?.45:1;$('gdf').style.width=cl(P.guard,0,100)+'%';$('gdf').style.background=P.st==='gbreak'||P.guard<25?'linear-gradient(90deg,#844,#a66)':'';
 $('xpf').style.width=cl(SYS.xp/xpNeed()*100,0,100)+'%';$('lvt').textContent='Sv. '+SYS.lv+(SYS.pts?' · +'+SYS.pts+' puan':'');$('meat').textContent='Et '+SYS.meat+' · Altın '+(SYS.gold||0);
 const q=QUESTS.find(q=>!SYS.done[q.id]);$('quest').innerHTML=q?'<b>GÖREV · '+q.name+'</b><br>'+q.desc+' <span>'+Math.min(q.goal,Math.floor(q.get()))+'/'+q.goal+'</span>':'<b>Tüm görevler tamamlandı</b>'}
let winOpen=false;
function renderWin(P){const row=(k,n,d)=>'<div class="st"><span>'+n+'</span><b>'+SYS[k]+'</b><i>'+d+'</i>'+(SYS.pts>0?'<button data-k="'+k+'">+</button>':'')+'</div>';
 $('winb').innerHTML='<div class="wt">DURUM PENCERESİ</div><div class="wr"><span>İsim</span><b>Selene</b></div><div class="wr"><span>Sınıf</span><b>Ay Kılıççısı</b></div><div class="wr"><span>Unvan</span><b>'+SYS.title+'</b></div>'+
  '<div class="wr"><span>Seviye</span><b>'+SYS.lv+'</b></div><div class="wr"><span>XP</span><b>'+SYS.xp+' / '+xpNeed()+'</b></div><div class="wr"><span>Can</span><b>'+Math.ceil(P.hp)+' / '+maxHP()+'</b></div>'+
  '<div class="wt2">STATLAR'+(SYS.pts?' · dağıtılacak '+SYS.pts+' puan':'')+'</div>'+row('str','Güç','hasar +%7')+row('agi','Çeviklik','hız, kaçınma süresi')+row('vit','Dayanıklılık','can +10')+row('per','Algı','radar menzili')+
  '<div class="wt2">YETENEKLER</div><div class="sk">[Kaçınma Lv.'+SYS.dodgeLv+'] · [Üçlü Kesik] · [Ağır Saldırı: SALDIR’ı basılı tut] · [Koşarak Saldırı] · [Zıplayarak Saldırı] · [Kılıçla Blok ve Savuşturma] · [Gizli Saldırı ×2] · [Sessiz Alt Etme] · [Yoldaş Bağı '+SYS.tamed+'/5]</div>'+
  '<div class="wt2">HARİTA</div><canvas id="wmap" width="300" height="300" style="width:100%;max-width:300px;display:block;margin:0 auto;border:1px solid var(--line);border-radius:6px"></canvas>'+
  '<div class="wt2">GÖREVLER</div>'+QUESTS.map(q=>'<div class="qs'+(SYS.done[q.id]?' dn':'')+'">'+(SYS.done[q.id]?'✔ ':'◆ ')+q.name+' — '+q.desc+' ('+Math.min(q.goal,Math.floor(q.get()))+'/'+q.goal+')</div>').join('')+
  '<div class="wr" style="margin-top:8px"><span>Öldürülen kurt</span><b>'+SYS.kills+'</b></div><div class="wr"><span>Sarsıntıyı azalt</span><button id="shk">'+(SYS.lowShake?'AÇIK':'KAPALI')+'</button></div>'+
  '<div class="wt2">MODELLER VE LİSANSLAR</div><div class="cr" style="opacity:.85;font-size:11px;line-height:1.4">Selene: «Anime 001» — Element (VRoid), oyuncunun eklediği model; kıyafet, saç ve kılıç oyunda kodla uyarlandı.<br>'+
  'Ejderha: «Tarisland - Dragon (High Poly)» — Doctor A. (Sketchfab), CC BY 4.0; oyuncunun eklediği model, sadeleştirildi. Not: tasarım Tarisland oyununa aittir.<br>'+
  'Meydan heykeli: «The Forgotten Knight» — dark_igorek, CC BY 4.0, sadeleştirildi.<br>Kurtlar, goblinler, köylüler, tüccarlar, muhafızlar, timsahlar, dünya ve sesler: bu oyun için kodla üretildi.</div><button id="winx">KAPAT</button>';
 $('winb').querySelectorAll('button[data-k]').forEach(b=>b.addEventListener('click',()=>{if(SYS.pts>0){SYS[b.dataset.k]++;SYS.pts--;if(b.dataset.k==='vit')P.hp+=10;save(P);renderWin(P)}}));
 $('shk').addEventListener('click',()=>{SYS.lowShake=SYS.lowShake?0:1;save(P);renderWin(P)});try{drawMap($('wmap'))}catch(e){}$('winx').addEventListener('click',()=>toggleWin(P))}
function toggleWin(P){winOpen=!winOpen;$('win').style.display=winOpen?'flex':'none';if(winOpen)renderWin(P)}
