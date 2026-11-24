// ===================== story: main quest chain, village roles, side quests, manhwa panels, Veyra's choice =====================
// Panels are real in-engine shots (actors posed, camera placed, mood lighting) with speech balloons, narration boxes,
// blue System windows and the armour's red whispers, shown as a vertical-scroll manhwa strip.
let KING=null;const ROLES={},CAGES=[];let SHRINE=null;
const MAIN=[
 {id:'wake',t:'Uyanış',d:'Çimenlerin arasında 40 m yürü',done:()=>SYS.walked>=40},
 {id:'village',t:'Ay Köyü',d:'Köye git, İhtiyar Doran ile konuş',to:()=>ROLES.elder},
 {id:'wolves',t:'Kurt Sürüsü',d:()=>'Yollardaki kurtları avla ('+Math.min(5,SYS.qk||0)+'/5)',done:()=>(SYS.qk||0)>=5},
 {id:'ashmane',t:'Kül Yele',d:'Kuzeybatıdaki kurt ininde Kül Yele\'yi yen',to:()=>({x:DEN[0],z:DEN[1]}),done:()=>SYS.ashmane},
 {id:'report1',t:'Köye Dönüş',d:'İhtiyar Doran\'a haber ver',to:()=>ROLES.elder},
 {id:'chief',t:'Kırık Diş',d:'Doğu kampında goblin şefi Kırık Diş\'i yen',to:()=>CAMPSITES[0],done:()=>SYS.chief},
 {id:'cages',t:'Kayıp Köylüler',d:'Kamptaki kafesleri aç',to:()=>CAGES[0],done:()=>SYS.cagesOpen},
 {id:'princess',t:'Zincirli Prenses',d:'Bataklık tapınağına git',to:()=>SHRINE,done:()=>SYS.veyraFate},
 {id:'dragon',t:'Kül Kanat',d:'Kuzey geçidini tutan ejderhayı yen',to:()=>({x:LAIR[0],z:LAIR[1]}),done:()=>SYS.dragon},
 {id:'tbc',t:'Kül Kale',d:'Geçit açıldı. Şeytan Kral seni bekliyor (yakında)',to:()=>null}];
const curMain=()=>MAIN[Math.min(SYS.main||0,MAIN.length-1)];
function questTarget(){const q=curMain(),t=q.to&&q.to();return t?[t.x,t.z]:null}
function storyInit(){SYS.main=SYS.main||0;
 // role NPCs in the village
 for(const[k,kind,x,z,yaw,name]of[['elder','elder',-6,47,0,'İhtiyar Doran'],['smith','smith',22,-44,PI,'Demirci Hask'],['hunter','hunter',44,66,-PI/2,'Avcı Lena'],['priest','priest',-3,40,0,'Rahibe Mira']]){
  if(!NPCM[kind])NPCM[kind]=humanGeo(kind);const p=collide(x,z,.5),n=mkNpc(kind,p[0],p[1],{yaw,post:[p[0],p[1],yaw]});n.role=k;n.name=name;n.R=rigObj(NPCM[kind],{out:.012,cull:130,outCol:[.12,.1,.1]});ROLES[k]=n}
 // the Demon King (prologue panels; the final battle comes in phase 3)
 const km=humanGeo('king');KING={x:0,z:-1300,y:0,yaw:0,R:rigObj(km,{out:.02,cull:300,outCol:[.03,.02,.04]}),sc:2.4,K:km.K,vis:false};KING.sc=1.0;KING.hair=kingHair();rigHide(KING.R);
 // cages at the eastern goblin camp
 const c=CAMPSITES[0];for(let i=0;i<2;i++){const a=c.gate+PI+(i?.5:-.5),x=c.x+Math.cos(a)*9,z=c.z+Math.sin(a)*9,y=hAt(x,z),g=G();
  for(let k=0;k<10;k++){const b=k/10*2*PI;box(g,Math.cos(b)*.8-.04,0,Math.sin(b)*.8-.04,Math.cos(b)*.8+.04,1.8,Math.sin(b)*.8+.04,[.3,.24,.16])}box(g,-.9,1.8,-.9,.9,1.9,.9,[.28,.2,.14]);
  const ob=obj(geo(g),{shade:.85,pos:[x,y,z],cull:200,out:.015,outCol:[.08,.05,.03]});ob.M=mtrs([x,y,z],[0,0,0]);if(!NPCM.villager)NPCM.villager=humanGeo('villager');
  const v=rigObj(NPCM[i?'villager2':'villager']||NPCM.villager,{out:.012,cull:150});CAGES.push({x,z,y,ob,v})}
 // the swamp shrine: broken pillars and chains where Veyra waits
 let sx=SWAMP[0]-60,sz=SWAMP[1]-40;for(let r=0;r<80&&depthAt(sx,sz)>.02;r+=2)for(let a=0;a<6.28;a+=.4){const x=SWAMP[0]-60+Math.cos(a)*r,z=SWAMP[1]-40+Math.sin(a)*r;if(depthAt(x,z)<.02){sx=x;sz=z;r=99;break}}
 SHRINE={x:sx,z:sz};const g=G(),R=mkRng(9);for(let i=0;i<6;i++){const a=i/6*2*PI,x=sx+Math.cos(a)*4.5,z=sz+Math.sin(a)*4.5,h=hAt(x,z),hh=i%2?1.2+R()*1.5:3+R()*1.5;box(g,x-.35,h-.3,z-.35,x+.35,h+hh,z+.35,[.36,.38,.33],[.4,.45,.35]);addTree(x,z,.45,hh)}
 for(const s of[-1,1]){const px=sx+s*1.6,pz=sz-.6,h=hAt(px,pz);box(g,px-.25,h-.2,pz-.25,px+.25,h+2.6,pz+.25,[.3,.3,.3]);
  const pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push([lp(px,sx+s*.25,t),h+2.2-Math.sin(PI*t)*.5-t*.9,lp(pz,sz+.05,t)])}const ch=tube(pts,{r:()=>.018,seg:4,n:12});tint(ch,[.5,.5,.55]);const o=g.P.length/3;for(const k of['P','N','U','C','W'])for(const v of ch[k])g[k].push(v);for(const v of ch.I)g.I.push(v+o)}
 SHRINE.ob=obj(geo(g),{shade:.8,pos:[sx,0,sz],cull:300,out:.015,outCol:[.08,.08,.08]});SHRINE.chains=!SYS.veyraFate;
 if(!SYS.veyraFate){VEYRA.x=sx;VEYRA.z=sz;VEYRA.yaw=0}
 if(!SYS.prologue)setTimeout(()=>{if(!SYS.intro)return;},0)}
// ---------- quest givers and interactions
function roleNear(r=2.8){let best=null,bd=r;for(const k in ROLES){const n=ROLES[k],d=Math.hypot(n.x-P.x,n.z-P.z);if(d<bd){bd=d;best=n}}return best}
function questFor(n){if(n.role==='elder')return SYS.main===1||SYS.main===4;if(n.role==='hunter')return!SYS.q_pelts||(SYS.q_pelts===1&&(SYS.pelts||0)>=3);if(n.role==='priest')return!SYS.q_legacy||(SYS.q_legacy===1&&Object.keys(SYS.seals||{}).length>=3);if(n.role==='smith')return!SYS.metSmith;return false}
function storyPrompt(){const n=roleNear();if(n)return'ETKİLEŞ: '+n.name+' ile konuş';const c=CAGES.find(c=>Math.hypot(c.x-P.x,c.z-P.z)<2.4);if(c&&SYS.chief&&!SYS.cagesOpen)return'ETKİLEŞ: kafesi aç';
 if(SYS.q_legacy===1&&Object.keys(SYS.seals||{}).length>=3&&Math.hypot(P.x-10,P.z-50)<5)return'ETKİLEŞ: heykele mühürleri yerleştir';if(VEYRA&&VEYRA.down&&Math.hypot(VEYRA.x-P.x,VEYRA.z-P.z)<2.2)return'ETKİLEŞ: Veyra\'yı kaldır';return''}
function say(who,txt){note(who+': "'+txt+'"')}
function storyInteract(){const n=roleNear();if(n){n.st='watch';n.t=0;n.ls=[P.x,P.z];
  if(n.role==='elder'){if(SYS.main===1){SYS.main=2;SYS.qk=0;showManhwa(PANELS.ch1(),()=>note('[Görev] Kurt Sürüsü: yollardaki 5 kurdu avla.','gold'));return true}
   if(SYS.main===4){SYS.main=5;showManhwa(PANELS.ch2(),()=>note('[Görev] Kırık Diş: doğu kampına git.','gold'));return true}say(n.name,'«'+curMain().t+'» — '+(typeof curMain().d==='function'?curMain().d():curMain().d));return true}
  if(n.role==='hunter'){if(!SYS.q_pelts){SYS.q_pelts=1;say(n.name,'Bana 3 kurt postu getir, sana kurt postundan bir zırh dikerim. Kurtlardan düşer.');return true}
   if(SYS.q_pelts===1&&(SYS.pelts||0)>=3){SYS.q_pelts=2;SYS.pelts-=3;const it=makeItem('wolfhide',Math.max(3,SYS.lv),2);giveItem(it);addXP(120,P);say(n.name,'İşte. Kurt kokusu seni saklar.');return true}
   say(n.name,SYS.q_pelts===2?'Kül Yele\'nin ini kuzeybatıda, yaşlı ağaçların arasında.':'Postlar: '+(SYS.pelts||0)+'/3');return true}
  if(n.role==='priest'){if(!SYS.q_legacy){SYS.q_legacy=1;SYS.quests=SYS.quests||{};SYS.quests.legacy=1;say(n.name,'Meydandaki şövalye... Usta Aldren. Üç harabede onun mührü saklı. Mühürleri getir, heykel sana mirasını verir.');note('[Gizli Görev] Ustanın Mirası: üç harabede mavi ışıklı mühürleri bul.','gold');return true}
   const cost=100*(SYS.flaskMax-2);if(SYS.flaskMax<6&&(SYS.gold||0)>=cost){SYS.gold-=cost;SYS.flaskMax++;SYS.flasks=SYS.flaskMax;say(n.name,'Ay ışığı şişene dolsun. (İksir: '+SYS.flaskMax+')');return true}
   say(n.name,SYS.flaskMax<6?'İksir şişeni büyütebilirim: '+cost+' altın.':'Ay seni korusun.');return true}
  if(n.role==='smith'){SYS.metSmith=1;say(n.name,'Getir o paslı kılıcı. Altın ve demir parçasıyla her şeyi keskinleştiririm.');openWin('smith');return true}
  npcTalk(n);return true}
 const c=CAGES.find(c=>Math.hypot(c.x-P.x,c.z-P.z)<2.4);if(c&&SYS.chief&&!SYS.cagesOpen){SYS.cagesOpen=1;sfx.chest();showManhwa(PANELS.cages(),()=>note('[Görev] Zincirli Prenses: bataklık tapınağına git.','gold'));return true}
 if(SYS.q_legacy===1&&Object.keys(SYS.seals||{}).length>=3&&Math.hypot(P.x-10,P.z-50)<5){SYS.q_legacy=2;giveItem(makeItem(null,Math.max(8,SYS.lv),4,'oath'));addXP(400,P);note('[Sır] Heykel aralandı: «Aldren\'in Yemini»!','gold');sfx.level();return true}
 if(VEYRA&&VEYRA.down&&Math.hypot(VEYRA.x-P.x,VEYRA.z-P.z)<2.2){BUF.inter=GT.clock;return true}
 return false}
function questEvent(kind,f){if(kind==='kill'){if(isWolf(f)&&SYS.main===2)SYS.qk=(SYS.qk||0)+1;
 if(f.boss&&isWolf(f)){SYS.ashmane=1;giveItem(makeItem(null,Math.max(4,f.lv),4,'ashmane'));unlockSkill('spin');setTimeout(()=>showManhwa(PANELS.ashmane(),()=>{}),900)}
 if(f.chief){SYS.chief=1;giveItem(makeItem(null,Math.max(7,f.lv),4,'brokenfang'));unlockSkill('roar')}
 if(f===DRAGON){giveItem(makeItem(null,18,4,'dragonbone'));setTimeout(()=>showManhwa(PANELS.dragon(),()=>{}),1500)}}}
function updateStory(dt){const q=curMain();if(q.done&&q.done()){SYS.main++;const n=curMain();note('[Görev] '+n.t+': '+(typeof n.d==='function'?n.d():n.d),'gold');addXP(40+SYS.main*25,P);save(P)}
 if(SYS.main===7&&!SYS.veyraFate&&SHRINE&&Math.hypot(P.x-SHRINE.x,P.z-SHRINE.z)<9&&!GT.inStory)showManhwa(PANELS.princess(),null)
 // cages: villagers kneel inside until freed
 for(const c of CAGES){if(SYS.cagesOpen||!SYS.main||Math.hypot(c.x-P.x,c.z-P.z)>120){rigHide(c.v);continue}const q2={LhX:-1.4,LkX:2.2,RhX:-1.3,RkX:2.2,spP:.3,hdP:.3,LsX:-.6,RsX:-.6};rigDraw(c.v,c.x,c.y+.42,c.z,0,1.05,humanPose(q2),.3,null)}}
// ---------- Veyra's fate
function chooseFate(free){SYS.veyraFate=free?'freed':'killed';const V=VEYRA;if(free){V.on=true;V.st='follow';V.hp=V.max;SYS.trust=5;note('[Sistem] Veyra yoldaşın oldu.','gold');addXP(300,P)}
 else{V.on=false;V.hidden=true;rigHide(V.R);giveItem(makeItem(null,Math.max(9,SYS.lv),4,'heart'));note('[Öfke] "Güzel. Çok güzel, Kael."','red');addXP(300,P)}SHRINE.chains=false;save(P)}
// ---------- manhwa renderer
// panels render at a fixed size (same framing in portrait and landscape); eye/at heights are above the ground unless abs
function shot(st,h){const rel=(p)=>st.abs?p:[p[0],p[1]+hAt(p[0],p[2]),p[2]],eye=rel(st.eye),at=rel(st.at),fov=(st.fov||50)*PI/180,CW=cv.width,CH=cv.height;cv.width=720;cv.height=Math.round(720*(h||.7));const save={x:P.x,z:P.z,y:P.y,yaw:P.yaw,ps:P.ps,rag:Object.assign({},P.rag),lift:P.lift};
 try{if(st.hero){P.x=st.hero.x;P.z=st.hero.z;P.y=hAt(P.x,P.z);P.yaw=st.hero.yaw;P.ps=Object.assign({},POSE0,st.hero.pose||{});P.rag.ang=st.hero.lie||0;P.rag.fx=0;P.rag.fz=-1}
  applyPose(P.ps);PM=playerMatrix(0);updateCape(PM,0);if(st.hero&&st.hero.lie)PM[13]+=.12;for(const o of pObjs){o.M=PM;o.flash=0;o.vis=!st.noHero}setHelm(st.hero&&st.hero.helm===0?true:SYS.helmOff)
  if(st.setup)st.setup();streamForest(at[0],at[2],99);
  const L=mlook(eye,at,[0,1,0]),VP=mmul(mpersp(fov,cv.width/cv.height,.25,620),L.m),env=Object.assign({fogC:[.6,.72,.85],sun:[1,1,1],fog:[60,300],focus:at},st.env||{}),light=vnorm(vadd(vadd(vmul(L.r,-.45),vmul(L.u,.62)),vmul(L.f,-.62)));
  skinAll();drawWolves(P,GT.time);drawGobs(GT.time);drawNpcs(GT.time);drawCrocs(GT.time);drawDragon();drawVeyra(GT.time);drawKing();drawAll(VP,eye,light,GT.time,env);
  return cv.toDataURL('image/jpeg',.8)}finally{cv.width=CW;cv.height=CH;if(st.teardown)st.teardown();setHelm(SYS.helmOff);Object.assign(P,{x:save.x,z:save.z,y:save.y,yaw:save.yaw,ps:save.ps,lift:save.lift});P.rag=save.rag}}
// the queen's hair (data/hair.js): a scalp cap and alpha-cut hair cards, carried by the head bone
function kingHair(){if(typeof HAIRDATA==='undefined')return null;const d=(b,T)=>new T(Uint8Array.from(atob(b),c=>c.charCodeAt(0)).buffer),mk=(h,o)=>{const nv=h.nv,C=new Float32Array(nv*3).fill(1);return obj(geo({P:d(h.P,Float32Array),N:d(h.N,Float32Array),U:d(h.U,Float32Array),C,W:new Float32Array(nv),I:d(h.I,Uint16Array)}),o)};
 const im=new Image();const cards=mk(HAIRDATA.cards,{shade:.9,ds:1,cut:.45,col:[1.05,.95,.95],pos:[0,0,0],cull:300}),cap=mk(HAIRDATA.cap,{shade:.9,col:[.36,.07,.07],pos:[0,0,0],cull:300});cards.vis=cap.vis=false;
 im.onload=()=>{cards.tex=texture(im)};im.src=HAIRTEX;return{cards,cap}}
function placeKingHair(){const H=KING.hair;if(!H)return;const on=KING.vis;H.cards.vis=on&&!!H.cards.tex;H.cap.vis=false;if(!on)return;const d=KING.R.def,R=d.WR[2],p=d.WP[2],sc=KING.sc,M=new Float32Array(16);
 M[0]=R[0]*sc;M[1]=R[3]*sc;M[2]=R[6]*sc;M[4]=R[1]*sc;M[5]=R[4]*sc;M[6]=R[7]*sc;M[8]=R[2]*sc;M[9]=R[5]*sc;M[10]=R[8]*sc;M[12]=p[0];M[13]=p[1];M[14]=p[2];M[15]=1;H.cards.M=H.cap.M=M;H.cards.pos=H.cap.pos=[KING.x,0,KING.z]}
function drawKing(){if(!KING)return;if(!KING.vis){rigHide(KING.R);placeKingHair();return}const q={hdP:.15,LsX:-.2,RsX:-.9,ReX:-1,LeX:-.4,...(KING.pose||{})};const K=KING.K,hipH=(K.th+K.sh2+.06)*KING.sc;rigDraw(KING.R,KING.x,hAt(KING.x,KING.z)+hipH,KING.z,KING.yaw,KING.sc,humanPose(q),1.2,null);placeKingHair()}
const FIRE_PROPS=[];function fires(on,pts){for(const f of FIRE_PROPS)f.vis=false;if(!on)return;pts.forEach(([x,z,s],i)=>{let o=FIRE_PROPS[i];if(!o){o=obj(FIREGEO(),{unlit:1,col:[1,.5,.15],shade:0,pos:[0,0,0],cull:900});FIRE_PROPS.push(o)}o.vis=true;o.M=mtrs([x,hAt(x,z),z],[0,i,0]);for(const k of[0,5,10])o.M[k]*=s;o.pos=[x,0,z]})}
const RED={fogC:[.32,.07,.06],sun:[1.1,.55,.45],fog:[25,160]},DUSK={fogC:[.25,.2,.35],sun:[.8,.75,.95],fog:[30,200]},NIGHT={fogC:[.06,.08,.16],sun:[.55,.6,.85],fog:[20,140]};
const PANELS={
 prologue:()=>[
  {h:.62,st:{eye:[52,26,92],at:[0,10,0],env:RED,noHero:true,setup:()=>fires(true,[[-30,-34,9],[34,-30,8],[30,34,10],[-34,30,7],[0,0,12],[-14,40,6],[16,55,7]]),teardown:()=>fires(false)},nar:'Krallık düştü.',nar2:'Gökyüzü yanıyordu.'},
  {h:.8,st:{eye:[1.9,1.15,17.4],at:[0,1.25,12.7],fov:44,env:RED,hero:{x:0,z:14.6,yaw:PI,helm:0,pose:{LthX:-1.45,Lkn:1.7,RthX:.15,Rkn:2.0,pel:.25,spX:.45,hdX:.5,RaZ:.9,RaX:.4,Rel:.3,LaZ:.6,LaX:.3}},setup:()=>{KING.vis=true;KING.x=0;KING.z=12;KING.yaw=0;fires(true,[[-8,8,6],[9,9,5],[0,2,8]])},teardown:()=>{KING.vis=false;fires(false)}},
   nar:'Kael o gece surlardaki binlerce askerden biriydi.',nar2:'Şeytan Kraliçe ona bakmadı bile.'},
  {h:.7,st:{eye:[4.6,1.7,19.6],at:[2.2,1.45,17],fov:40,env:RED,noHero:true,setup:()=>{Object.assign(VEYRA,{x:2.2,z:17,y:hAt(2.2,17),yaw:PI*.85,forceShow:true,hidden:false,forcePose:{RsX:-1.6,ReX:-.4,LsX:-.3,hdP:-.05}});fires(true,[[-6,6,2.6],[7,5,2.2]])},teardown:()=>{VEYRA.forceShow=false;VEYRA.forcePose=null;fires(false);if(!SYS.veyraFate&&SHRINE){VEYRA.x=SHRINE.x;VEYRA.z=SHRINE.z;VEYRA.yaw=0}}},
   nar:'Yangının içinde boynuzlu bir kız gördü. Kılıcı kor gibiydi. Sonra her şey karardı.',say:[{who:'Kael',txt:'Demek böyle bitiyor...',x:12,y:70}]},
  {h:.45,black:true,sys:['Ölüm algılandı.','Koşul sağlandı: «Pişmanlık»','Geri dönüş başlatılıyor...']},
  {h:.72,st:{eye:[SPAWN[0]+1.5,3.2,SPAWN[2]+2.4],at:[SPAWN[0],.5,SPAWN[2]],env:{fogC:[.8,.82,.78],sun:[1.1,1.05,.95],fog:[60,260]},hero:{x:SPAWN[0],z:SPAWN[2],yaw:PI,lie:1.45,helm:0,pose:{LaZ:.5,RaZ:.6,hdX:-.2}}},
   nar:'Sabah. Orman.',say:[{who:'Kael',txt:'Üç yıl önce mi?.. Krallık hâlâ ayakta.',x:46,y:14}]},
  {h:.6,st:{eye:[SPAWN[0]+.35,1.9,SPAWN[2]-1.7],at:[SPAWN[0],1.8,SPAWN[2]],fov:30,env:{fogC:[.2,.08,.08],sun:[1,.75,.7],fog:[4,40]},hero:{x:SPAWN[0],z:SPAWN[2],yaw:PI,pose:{hdX:.15}},setup:()=>{if(HERO.glow)HERO.glow.col=[2.4,.5,.3]},teardown:()=>{if(HERO.glow)HERO.glow.col=[1,.25,.15]}},
   whisper:'Bu sefer daha çok kan, Kael.',sys:['Sınıf: Kara Zırh','Uyarı: zırh lanetlidir.']}],
 ch1:()=>[{h:.7,st:{eye:[ROLES.elder.x+2.2,1.8,ROLES.elder.z+2.6],at:[ROLES.elder.x,1.4,ROLES.elder.z],fov:42},say:[{who:'Doran',txt:'Yollar kurt kaynıyor. Sürüyü külrengi yeleli bir canavar yönetiyor.',x:8,y:8}]},
  {h:.6,st:{eye:[DEN[0]+14,6,DEN[1]+18],at:[DEN[0],2,DEN[1]],env:NIGHT,noHero:true},nar:'Kuzeybatıdaki in. Kül Yele.',say:[{who:'Kael',txt:'Önce köpekleri. Sonra efendilerini.',x:50,y:62}]}],
 ashmane:()=>[{h:.6,st:{eye:[P.x+2.5,2.2,P.z+3],at:[P.x,1.2,P.z],env:DUSK},whisper:'Daha çok, Kael. Daha çok.',sys:['Yetenek: Dönen Kesik']}],
 ch2:()=>[{h:.7,st:{eye:[ROLES.elder.x+2.2,1.8,ROLES.elder.z+2.6],at:[ROLES.elder.x,1.4,ROLES.elder.z],fov:42},say:[{who:'Doran',txt:'Goblinler köylülerimizi kaçırdı. Doğudaki kampın şefi Kırık Diş...',x:8,y:8}]},
  {h:.55,st:{eye:[CAMPSITES[0].x+20,8,CAMPSITES[0].z+20],at:[CAMPSITES[0].x,2,CAMPSITES[0].z],env:DUSK,noHero:true},nar:'Doğu kampı. Davullar.'}],
 cages:()=>[{h:.7,st:{eye:[CAGES[0].x+2.4,1.6,CAGES[0].z+2.4],at:[CAGES[0].x,1,CAGES[0].z],fov:42},say:[{who:'Köylü',txt:'Bataklıktaki tapınakta... zincirli bir iblis kız var. Boynuzları...',x:6,y:10},{who:'Kael',txt:'Boynuzları.',x:58,y:66}]}],
 princess:()=>[{h:.7,st:{eye:[SHRINE.x+.6,1.4,SHRINE.z+3.4],at:[SHRINE.x,.9,SHRINE.z],fov:40,env:DUSK,noHero:true},nar:'Zincirler. Kızıl saç. O gözler.',say:[{who:'Veyra',txt:'...Sen kimsin? Annem mi yolladı?',x:52,y:10}]},
  {h:.75,st:{eye:[SHRINE.x+3,2.2,SHRINE.z+4.5],at:[SHRINE.x,1.2,SHRINE.z+1],env:DUSK,hero:{x:SHRINE.x,z:SHRINE.z+2,yaw:PI,pose:{two:1,RaZ:-1.4,RaX:-1.0,Rel:.6,RaY:.2,chX:-.2}}},
   whisper:'Bu o. Krallığı yakanların kızı. Kes.',say:[{who:'Kael',txt:'Krallık yanarken seni gördüm. Yangının ortasındaydın.',x:6,y:70}],choice:true}],
 dragon:()=>[{h:.65,st:{eye:[LAIR[0]+20,14,LAIR[1]+40],at:[LAIR[0],4,LAIR[1]-60],env:DUSK,noHero:true},nar:'Kül Kanat düştü. Kuzey geçidi açık.',sys:['Ana görev: Kül Kale (yakında)']}]};
let mhTok=0;const MHQ=[];
// one strip at a time: a strip that arrives while another is open waits its turn
function showManhwa(panels,done){const ov=$('manhwa');if(ov.style.display==='block'&&GT.inStory){MHQ.push([panels,done]);return}const tok=++mhTok;GT.inStory=true;GT.paused=true;ov.innerHTML='<div class="mh-load">Sahne çiziliyor…</div><button class="mh-skip">ATLA</button>';ov.style.display='block';ov.scrollTop=0;
 const end=()=>{if(tok!==mhTok)return;mhTok++;ov.style.display='none';ov.innerHTML='';GT.inStory=false;GT.paused=false;if(done)done();if(MHQ.length){const[p,d]=MHQ.shift();setTimeout(()=>showManhwa(p,d),60)}};ov.querySelector('.mh-skip').onclick=()=>{if(!panels.some(p=>p.choice))end()};
 const imgs=[];let i=0;const next=()=>{if(tok!==mhTok)return;if(i<panels.length){const p=panels[i++];imgs.push(p.black?null:shot(p.st,p.h));setTimeout(next,0)}else build()};setTimeout(next,30);
 function build(){if(tok!==mhTok)return;let h='';panels.forEach((p,k)=>{const slant=k%2?'polygon(0 0,100% 4%,100% 100%,0 96%)':'polygon(0 4%,100% 0,100% 96%,0 100%)';
   h+='<div class="mh-p'+(p.black?' mh-b':'')+'" style="aspect-ratio:1/'+p.h+';clip-path:'+slant+'">'+(imgs[k]?'<img src="'+imgs[k]+'" alt="">':'');
   if(p.nar)h+='<div class="mh-n">'+p.nar+(p.nar2?'<br>'+p.nar2:'')+'</div>';for(const s of p.say||[])h+='<div class="mh-s" style="left:'+s.x+'%;top:'+s.y+'%"><b>'+s.who+'</b>'+s.txt+'</div>';
   if(p.sys)h+='<div class="mh-sys">'+p.sys.map(t=>'<div>[Sistem] '+t+'</div>').join('')+'</div>';if(p.whisper)h+='<div class="mh-w">'+p.whisper+'</div>';h+='</div><div class="mh-gap"></div>'});
  const ch=panels.some(p=>p.choice);h+=ch?'<div class="mh-ch"><button id="mhFree">Zincirlerini kır</button><button id="mhKill">Kılıcını indir</button></div>':'<button class="mh-next">DEVAM</button>';
  ov.innerHTML=h+'<button class="mh-skip">'+(ch?'':'ATLA')+'</button>';ov.querySelector('.mh-skip').style.display=ch?'none':'block';ov.querySelector('.mh-skip').onclick=end;
  if(ch){$('mhFree').onclick=()=>{ov.style.display='none';chooseFate(true);showManhwa([{h:.65,st:{eye:[SHRINE.x+2.5,1.6,SHRINE.z+2.2],at:[SHRINE.x,1,SHRINE.z],env:DUSK,setup:()=>{VEYRA.forcePose={LsX:-.3,RsX:-.4,hdP:-.1}},teardown:()=>{VEYRA.forcePose=null}},say:[{who:'Veyra',txt:'Neden?.. Ben bir iblisim.',x:50,y:8},{who:'Kael',txt:'Bu sefer başka türlü bitecek.',x:6,y:72}]}],()=>{note('[Görev] Kül Kanat: kuzeydeki ejderhayı yen.','gold');if(done)done()})};
   $('mhKill').onclick=()=>{ov.style.display='none';chooseFate(false);showManhwa([{h:.55,black:true,whisper:'Güzel.',sys:['Hırlayan güçlendi: Öfke daha hızlı dolar.']}],()=>{note('[Görev] Kül Kanat: kuzeydeki ejderhayı yen.','gold');if(done)done()})}}
  else ov.querySelector('.mh-next').onclick=end}}
