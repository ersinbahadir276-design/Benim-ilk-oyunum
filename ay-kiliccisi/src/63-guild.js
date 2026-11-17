// ===================== the Adventurers' Guild =====================
// Register with the clerk in the village, take contracts from the board, hand them in for gold, experience and guild
// points. Rank (F → S) rises with guild points AND a real deed for each step, not with character level.
const GRANK=['F','E','D','C','B','A','S'],GPTS=[0,30,80,170,320,550,900];
const GDEED=[null,null,{t:"Kül Yele'yi yen",ok:()=>SYS.ashmane},{t:"Kırık Diş'i yen",ok:()=>SYS.chief},{t:'Ejderha Kül Kanat\'ı yen',ok:()=>SYS.dragon},{t:'10 sandık aç ve 5 sunak yak',ok:()=>(SYS.chestsOpened||0)>=10&&Object.keys(SYS.altars||{}).length>=5},{t:'30 kontrat tamamla',ok:()=>SYS.guild&&SYS.guild.done>=30}];
const GUILD={clerk:null,x:-38,z:-26,ents:{}};
const GT_TEMPL=[// r = minimum rank, kind, target, base count, gold, points
 {r:0,k:'hunt',tg:'wolf',n:4,g:28,p:10,t:'Kurt sürüsü',d:n=>n+' kurt avla'},{r:0,k:'hunt',tg:'gob',n:4,g:32,p:12,t:'Goblin temizliği',d:n=>n+' goblin öldür'},
 {r:0,k:'gather',tg:'pelts',n:2,g:24,p:8,t:'Post siparişi',d:n=>n+' kurt postu getir'},{r:0,k:'gather',tg:'meat',n:4,g:18,p:8,t:'Hanın et siparişi',d:n=>n+' et getir'},
 {r:0,k:'chest',n:2,g:26,p:10,t:'Kayıp ganimet',d:n=>n+' sandık bul ve aç'},{r:0,k:'rescue',n:1,g:45,p:16,t:'Kayıp köylü',d:()=>'Ormanda kaybolan köylüyü bul ve konuş'},
 {r:1,k:'hunt',tg:'archer',n:3,g:48,p:16,t:'Okçu avı',d:n=>n+' okçu goblin öldür'},{r:1,k:'bounty',tg:'gob',n:1,g:85,p:26,t:'Azılı: Tek Göz Rok',d:()=>'Azılı goblin Tek Göz Rok\'u öldür'},
 {r:2,k:'hunt',tg:'big',n:1,g:95,p:30,t:'Dev avı',d:n=>n+' büyük goblin öldür'},{r:2,k:'hunt',tg:'croc',n:3,g:100,p:30,t:'Bataklık temizliği',d:n=>n+' timsah öldür'},
 {r:2,k:'bounty',tg:'wolf',n:1,g:125,p:36,t:'Azılı: Gece Pençe',d:()=>'Azılı kurt Gece Pençe\'yi öldür'},{r:3,k:'altar',n:2,g:110,p:34,t:'Yol açıcı',d:n=>n+' yeni sunak yak'},
 {r:0,k:'hunt',tg:'undead',n:6,g:42,p:14,t:'Mezar temizliği',d:n=>n+' iskelet ya da hortlak yok et (Unutulmuş Mezar)'},{r:1,k:'delve',tg:'crypt',n:2,g:90,p:28,t:'Mezarın dibi',d:()=>"Unutulmuş Mezar'ın 2. katına in"},
 {r:1,k:'hunt',tg:'spider',n:6,g:72,p:22,t:'Ağ yakıcı',d:n=>n+' örümcek öldür (Örümcek İni)'},{r:2,k:'delve',tg:'cave',n:3,g:140,p:38,t:'İnin kalbi',d:()=>"Örümcek İni'nin 3. katına in"},
 {r:3,k:'hunt',tg:'golem',n:2,g:160,p:42,t:'Taş kırıcı',d:n=>n+' taş golem kır (Mühürlü Tapınak)'},{r:4,k:'delve',tg:'temple',n:3,g:220,p:55,t:'Mühürlerin sessizliği',d:()=>"Mühürlü Tapınak'ın 3. katına in"}];
const gRank=()=>SYS.guild?SYS.guild.rank:0;
function guildSpot(R){for(let i=0;i<60;i++){const a=R()*6.283,d=240+R()*330,x=Math.cos(a)*d,z=Math.sin(a)*d;const zn=zoneAt(x,z);if((zn==='forest'||zn==='dense')&&depthAt(x,z)<=0&&!inField(x,z,6)){const p=collide(x,z,.6);return p}}return[0,260]}
function compassWords(x,z){const d=Math.round(Math.hypot(x,z)/10)*10,a=Math.atan2(x,-z)*180/PI,dir=['kuzey','kuzeydoğu','doğu','güneydoğu','güney','güneybatı','batı','kuzeybatı'][Math.round(((a+360)%360)/45)%8];return'Krallığın '+d+' m '+dir+'inde'}
function newContract(){const G2=SYS.guild,r=G2.rank,pool=GT_TEMPL.filter(t=>t.r<=r+1&&!G2.board.concat(G2.active).some(c=>c.t===t.t)),T=pool[Math.floor(Math.random()*pool.length)];if(!T)return null;
 const sc=1+.35*Math.max(0,r-T.r),n=T.k==='bounty'||T.k==='rescue'?1:Math.round(T.n*sc),c={id:(G2.seq=(G2.seq||0)+1),k:T.k,tg:T.tg||'',t:T.t,d:T.d(n),r:T.r,need:n,have:0,gold:Math.round(T.g*sc),pts:Math.round(T.p*sc),xp:Math.round(T.g*sc*1.5)};
 if(T.k==='bounty'||T.k==='rescue'){const p=guildSpot(Math.random);c.x=Math.round(p[0]);c.z=Math.round(p[1]);c.d+=' ('+compassWords(c.x,c.z)+')'}if(T.k==='chest')c.base=SYS.chestsOpened||0;if(T.k==='altar')c.base=Object.keys(SYS.altars||{}).length;return c}
function fillBoard(){const G2=SYS.guild;if(!G2)return;for(let i=0;i<8&&G2.board.length<4;i++){const c=newContract();if(c)G2.board.push(c)}}
// world entities for a contract (the bounty target with two followers, the lost villager); also rebuilt after loading a save
function guildSpawn(c){if(GUILD.ents[c.id])return;if(c.k==='bounty'){const lv=Math.max(3,regionLevel(c.x,c.z)+2);
  if(c.tg==='wolf'){const w=mkWolf(c.x,c.z,{alpha:true});w.sc=1.45;scaleFoe(w,lv,260);w.bounty=c.id;w.elite=true;w.title=c.t;GUILD.ents[c.id]=[w];for(let i=0;i<2;i++){const p=collide(c.x+3+i*2,c.z+2,.6),o=mkWolf(p[0],p[1]);scaleFoe(o,lv,105);GUILD.ents[c.id].push(o)}}
  else{const g=mkGob(c.x,c.z,false,'bounty'+c.id,CAMPSITES[0]);g.sc=1.3;scaleFoe(g,lv,240);g.bounty=c.id;g.elite=true;g.title=c.t;g.R=rigObj(GOBM,{out:.014,cull:150});g.R.ob.col=[1.15,.8,.75];GUILD.ents[c.id]=[g];
   for(let i=0;i<2;i++){const p=collide(c.x+2+i*2,c.z+2,.4),o=mkGob(p[0],p[1],false,'bounty'+c.id,CAMPSITES[0]);o.archer=i===1;scaleFoe(o,lv,80);o.R=rigObj(GOBM,{out:.014,cull:150});GUILD.ents[c.id].push(o)}}}
 else if(c.k==='rescue'&&!c.found){if(!NPCM.villager)NPCM.villager=humanGeo('villager');const n=mkNpc('villager',c.x,c.z,{yaw:0,post:[c.x,c.z,0]});n.R=rigObj(NPCM.villager,{out:.012,cull:130,outCol:[.12,.1,.1]});n.lost=c.id;n.name='Kayıp köylü';n.role='lost';GUILD.ents[c.id]=[n]}}
function guildInit(){if(!NPCM.merchant)NPCM.merchant=humanGeo('merchant');const p=collide(GUILD.x,GUILD.z,.5),n=mkNpc('merchant',p[0],p[1],{yaw:PI/2,post:[p[0],p[1],PI/2]});n.role='guild';n.name='Lonca Görevlisi Selin';n.R=rigObj(NPCM.merchant,{out:.012,cull:130,outCol:[.12,.1,.1]});n.R.ob.col=[.8,.95,1.25];GUILD.clerk=n;
 // the contract board: two posts, planks, pinned papers, a banner
 const g=G(),bx=p[0],bz=p[1]-3.2,by=hAt(bx,bz),wd=[.4,.28,.16];box(g,bx-1.5,by,bz-.1,bx-1.3,by+2.6,bz+.1,wd);box(g,bx+1.3,by,bz-.1,bx+1.5,by+2.6,bz+.1,wd);box(g,bx-1.4,by+.9,bz-.06,bx+1.4,by+2.3,bz+.06,[.5,.36,.2]);box(g,bx-1.7,by+2.5,bz-.2,bx+1.7,by+2.7,bz+.2,[.3,.2,.12]);
 for(let i=0;i<5;i++){const x=bx-1.1+i*.52,y=by+1.15+(i%2)*.5;box(g,x,y,bz+.06,x+.38,y+.5,bz+.075,[.9,.86,.72])}box(g,bx+1.75,by+1.2,bz-.03,bx+2.5,by+2.6,bz+.03,[.2,.3,.6]);box(g,bx+1.7,by,bz-.06,bx+1.8,by+2.9,bz+.06,wd);
 obj(geo(g),{shade:.8,pos:[bx,0,bz],cull:200,out:.02,outCol:[.08,.05,.03]});addBox(bx-1.6,bz-.25,bx+1.6,bz+.25,2.6);GUILD.bx=bx;GUILD.bz=bz;
 if(SYS.guild){for(const c of SYS.guild.active)guildSpawn(c);fillBoard()}}
const nearClerk=(r=3)=>GUILD.clerk&&Math.hypot(GUILD.clerk.x-P.x,GUILD.clerk.z-P.z)<r||GUILD.bx!==undefined&&Math.hypot(GUILD.bx-P.x,GUILD.bz+.8-P.z)<2.6;
function cDone(c){if(c.k==='gather')return(SYS[c.tg]||0)>=c.need;if(c.k==='chest')return(SYS.chestsOpened||0)-c.base>=c.need;if(c.k==='altar')return Object.keys(SYS.altars||{}).length-c.base>=c.need;if(c.k==='rescue')return!!c.found;if(c.k==='delve')return((SYS.dun&&SYS.dun.deep&&SYS.dun.deep[c.tg])||0)>=c.need;return c.have>=c.need}
function cProg(c){const h=c.k==='gather'?Math.min(c.need,SYS[c.tg]||0):c.k==='chest'?Math.min(c.need,(SYS.chestsOpened||0)-c.base):c.k==='altar'?Math.min(c.need,Object.keys(SYS.altars||{}).length-c.base):c.k==='rescue'?(c.found?1:0):Math.min(c.need,c.have);return h+'/'+c.need}
function guildPrompt(){if(nearClerk())return SYS.guild?'R1: Lonca — kontratlar':'R1: Maceracılar Loncası\'na kaydol';const n=NPCS.find(o=>o.lost&&Math.hypot(o.x-P.x,o.z-P.z)<2.8);return n?'R1: kayıp köylüyle konuş':''}
function guildInteract(){const n=NPCS.find(o=>o.lost&&Math.hypot(o.x-P.x,o.z-P.z)<2.8);if(n){const c=SYS.guild&&SYS.guild.active.find(c=>c.id===n.lost);if(c){c.found=true;note('Köylü: "Tanrılara şükür! Kurtlar peşimdeydi. Köye dönüyorum."','gold');note('[Lonca] «'+c.t+'» tamam — loncaya haber ver.','gold')}rigHide(n.R);NPCS.splice(NPCS.indexOf(n),1);save(P);return true}
 if(!nearClerk())return false;const k=GUILD.clerk;k.st='watch';k.t=0;k.ls=[P.x,P.z];
 if(!SYS.guild){SYS.guild={rank:0,pts:0,done:0,active:[],board:[],seq:0,no:1000+Math.floor(Math.random()*9000)};fillBoard();save(P);
  showManhwa([{h:.7,st:{eye:[k.x+2.4,1.7,k.z+1.6],at:[k.x,1.4,k.z],fov:42},say:[{who:'Selin',txt:'Maceracılar Loncası\'na hoş geldin. Kayıt için adın yeter.'},{who:'Kael',txt:'Kael.'},{who:'Selin',txt:'F rütbesinden başlıyorsun. Rütbe seviyeyle değil, yaptıklarınla yükselir.'}]},
   {h:.5,black:true,sys:['Maceracı kaydı tamamlandı.','Kimlik No: '+SYS.guild.no,'Rütbe: F','Görev panosu açıldı.']}],()=>{note('[Lonca] Panodan kontrat al: SİSTEM → LONCA','gold');openWin('lonca')});return true}
 guildTurnIn();openWin('lonca');return true}
function guildTurnIn(){const G2=SYS.guild;let any=false;for(const c of G2.active.slice())if(cDone(c)){any=true;if(c.k==='gather')SYS[c.tg]-=c.need;G2.active.splice(G2.active.indexOf(c),1);G2.done++;G2.pts+=c.pts;SYS.gold=(SYS.gold||0)+c.gold;addXP(c.xp,P);delete GUILD.ents[c.id];
   note('[Lonca] «'+c.t+'» teslim edildi: +'+c.gold+' altın, +'+c.pts+' lonca puanı','gold');sfx.rare();if(G2.done%4===0){const it=randomDrop(Math.max(SYS.lv,2),Math.min(3,1+G2.rank));giveItem(it);note('[Lonca] Sadakat ödülü: '+it.name,'gold')}}
 // promotion: enough points AND the deed of the next rank
 while(G2.rank<6&&G2.pts>=GPTS[G2.rank+1]&&(!GDEED[G2.rank+1]||GDEED[G2.rank+1].ok())){G2.rank++;note('[Lonca] RÜTBE ATLADIN: '+GRANK[G2.rank]+' sınıfı maceracı!','gold');sfx.level();addXP(60*G2.rank,P)}
 fillBoard();if(any)save(P);return any}
function guildAccept(id){const G2=SYS.guild,c=G2.board.find(c=>c.id===id);if(!c)return;if(!nearClerk(6)){note('Kontrat almak için lonca panosuna git.');return}if(G2.active.length>=3){note('En fazla 3 kontrat taşıyabilirsin.');return}
 G2.board.splice(G2.board.indexOf(c),1);G2.active.push(c);if(c.k==='chest')c.base=SYS.chestsOpened||0;if(c.k==='altar')c.base=Object.keys(SYS.altars||{}).length;guildSpawn(c);note('[Lonca] Kontrat alındı: «'+c.t+'»','gold');sfx.chest();save(P)}
function guildDrop(id){const G2=SYS.guild,c=G2.active.find(c=>c.id===id);if(!c)return;G2.active.splice(G2.active.indexOf(c),1);for(const e of GUILD.ents[c.id]||[]){if(e.lost){rigHide(e.R);const i=NPCS.indexOf(e);if(i>=0)NPCS.splice(i,1)}else if(!e.dead){e.dead=1;e.deadT=999;e.st='dead'}}delete GUILD.ents[c.id];note('Kontrat bırakıldı.');fillBoard();save(P)}
function guildKill(f){const G2=SYS.guild;if(!G2)return;const kind=isWolf(f)?'wolf':GOBS.includes(f)?(f.big?'big':f.archer?'archer':'gob'):CROCS.includes(f)?'croc':f.T?(/^sk|ghoul|knight|boneking/.test(f.type)?'undead':/spider|brood/.test(f.type)?'spider':/golem|keeper/.test(f.type)?'golem':f.type):'';
 for(const c of G2.active){const before=cDone(c);if(c.k==='bounty'){if(f.bounty===c.id)c.have=1}else if(c.k==='hunt'&&(c.tg===kind||c.tg==='gob'&&kind==='archer'))c.have++;if(!before&&cDone(c))note('[Lonca] «'+c.t+'» tamam — loncaya dön.','gold')}}
function guildHtml(){const G2=SYS.guild;if(!G2)return'<div class="wt">MACERACILAR LONCASI</div><p>Henüz kayıtlı değilsin. Köyde, demircinin batısındaki görev panosunun yanında <b>Lonca Görevlisi Selin</b> ile konuş.</p>';
 const nx=G2.rank<6?G2.rank+1:6,dd=GDEED[nx],card='<div class="gcard"><div><b>MACERACI KİMLİĞİ</b> · No '+G2.no+'</div><div class="grank">'+GRANK[G2.rank]+'</div><div>Kael · Kara Zırh · Sv.'+SYS.lv+'</div><div>Tamamlanan kontrat: '+G2.done+'</div></div>';
 let h='<div class="wt">MACERACILAR LONCASI</div>'+card+(G2.rank<6?'<div class="wr"><span>'+GRANK[nx]+' rütbesi için</span><b>'+G2.pts+' / '+GPTS[nx]+' puan</b></div>'+(dd?'<div class="wr"><span>Gereken başarı</span><b>'+(dd.ok()?'✔ ':'✘ ')+dd.t+'</b></div>':''):'<div class="wr"><span>En yüksek rütbe</span><b>S</b></div>');
 const row=(c,btn)=>'<div class="item'+(cDone(c)&&btn==='x'?' sel':'')+'"><b>['+GRANK[c.r]+'] '+c.t+'</b><i>'+c.d+(btn==='x'?' · '+cProg(c):'')+'</i><i>Ödül: '+c.gold+' altın · '+c.pts+' lonca puanı · '+c.xp+' XP</i>'+(btn==='a'?'<button data-ga="'+c.id+'">KABUL ET</button>':'<button data-gd="'+c.id+'">BIRAK</button>')+'</div>';
 h+='<div class="wt2">ÜSTLENDİKLERİN ('+G2.active.length+'/3)</div>'+(G2.active.map(c=>row(c,'x')).join('')||'<p>Kontrat yok.</p>')+(G2.active.some(cDone)?'<button data-gt="1">TAMAMLANANLARI TESLİM ET</button>':'');
 h+='<div class="wt2">GÖREV PANOSU'+(nearClerk(6)?'':' (kabul etmek için panoya git)')+'</div>'+(G2.board.map(c=>row(c,'a')).join('')||'<p>Pano boş. Bir sunakta dinlenince yeni kontratlar gelir.</p>');return h}
function guildBind(el){el.querySelectorAll('[data-ga]').forEach(b=>b.addEventListener('click',()=>{guildAccept(+b.dataset.ga);renderWin(P)}));el.querySelectorAll('[data-gd]').forEach(b=>b.addEventListener('click',()=>{guildDrop(+b.dataset.gd);renderWin(P)}));
 el.querySelectorAll('[data-gt]').forEach(b=>b.addEventListener('click',()=>{if(nearClerk(6))guildTurnIn();else note('Teslim için loncaya dön.');renderWin(P)}))}
