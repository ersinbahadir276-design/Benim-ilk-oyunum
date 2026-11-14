// ===================== loot, equipment, inventory, blacksmith, healing flasks =====================
// Design: every kill can drop something, stronger regions drop stronger things, rarity is visible from afar (light
// beam colour), legendaries are tied to bosses and secrets so they are memorable. Equipment changes numbers AND looks
// (blade colour/size, armour tint) and some legendaries change how you play.
const RAR=[{n:'Sıradan',c:'#c9ccd6',w:60,m:1,af:[0,1]},{n:'Sağlam',c:'#7ddf7d',w:25,m:1.12,af:[1,1]},{n:'Nadir',c:'#6cb8ff',w:10,m:1.28,af:[2,2]},{n:'Destansı',c:'#c77dff',w:4,m:1.48,af:[3,3]},{n:'Efsanevi',c:'#ffa53a',w:1,m:1.75,af:[3,3]}];
const AFFIX={str:{n:'Güç',v:[1,4],int:1},agi:{n:'Çeviklik',v:[1,4],int:1},vit:{n:'Dayanıklılık',v:[1,4],int:1},hp:{n:'Can',v:[10,40],int:1},dmg:{n:'Hasar %',v:[4,12]},crit:{n:'Kritik %',v:[3,9]},
 leech:{n:'Can çalma %',v:[2,5]},sta:{n:'Dayanıklılık yenilenmesi %',v:[8,20]},guard:{n:'Savunma canı %',v:[10,25]},pos:{n:'Duruş kırma %',v:[8,22]},rage:{n:'Öfke kazanımı %',v:[10,25]},exe:{n:'İnfaz hasarı %',v:[15,35]},def:{n:'Zırh',v:[4,14],int:1}};
// bases: weapons are greatswords with their own silhouette; armour tints the plate
const BASES={
 rusty:{slot:'weapon',n:'Paslı Dev Kılıç',dmg:18,look:{len:1.42,wid:.064,col:[.2,.17,.15],edge:[.45,.36,.3]}},
 iron:{slot:'weapon',n:'Demir Dev Kılıç',dmg:22,look:{len:1.5,wid:.068,col:[.13,.13,.15],edge:[.5,.51,.56]}},
 cleaver:{slot:'weapon',n:'Kasap Satırı',dmg:26,look:{len:1.3,wid:.1,col:[.16,.15,.15],edge:[.55,.5,.48]}},
 fang:{slot:'weapon',n:'Kurt Dişi',dmg:30,look:{len:1.55,wid:.06,col:[.2,.2,.22],edge:[.75,.75,.8],glow:[.6,.7,1]}},
 shadow:{slot:'weapon',n:'Gölge Kesen',dmg:36,look:{len:1.62,wid:.058,col:[.06,.06,.1],edge:[.35,.3,.6],glow:[.5,.3,1]}},
 plate:{slot:'armor',n:'Kara Plaka',def:8,look:{tint:[1,1,1]}},
 wolfhide:{slot:'armor',n:'Kurt Postlu Zırh',def:10,look:{tint:[1.15,1.02,.9]}},
 bone:{slot:'armor',n:'Kemik Zırh',def:13,look:{tint:[1.3,1.22,1.05]}},
 ash:{slot:'armor',n:'Kül Zırh',def:16,look:{tint:[.85,.85,.95]}},
 charm:{slot:'charm',n:'Tılsım'},ring:{slot:'ring',n:'Yüzük'}};
// legendary uniques (named, fixed effects) — earned from bosses and secrets
const UNIQ={
 ashmane:{slot:'charm',n:"Kül Yele'nin Dişi",fx:'bleed',d:'Ağır saldırılar kanatır (5 sn boyunca hasar).',mods:{dmg:10,str:3}},
 brokenfang:{slot:'ring',n:"Kırık Diş'in Halkası",fx:'posture',d:'Duruş kırma +%35, İnfaz sonrası dayanıklılık dolar.',mods:{pos:35,vit:3}},
 dragonbone:{slot:'weapon',n:'Ejder Kemiği',dmg:58,fx:'fire',d:'Ağır saldırı yerde alev izi bırakır.',mods:{dmg:15},look:{len:1.7,wid:.075,col:[.3,.1,.06],edge:[1,.55,.2],glow:[1,.4,.1]}},
 oath:{slot:'weapon',n:"Aldren'in Yemini",dmg:52,fx:'oath',d:'Savuşturma penceresi +%50, İnfaz %20 can yeniler.',mods:{agi:4,exe:30},look:{len:1.6,wid:.062,col:[.75,.78,.85],edge:[1,1,1],glow:[.7,.85,1]}},
 heart:{slot:'charm',n:"Hırlayan'ın Kalbi",fx:'rage2',d:'Öfke iki kat hızlı dolar. Zırh fısıldıyor.',mods:{rage:100,dmg:8}},
 veyra:{slot:'ring',n:'Kızıl Kor Mührü',fx:'ember',d:"Veyra'nın hediyesi: vuruşlar küçük alev patlamaları çıkarır.",mods:{crit:8,leech:3}}};
let itemSeq=1;
function rollRarity(tier){let w=RAR.map((r,i)=>r.w*(i<tier?0:1)*(i===tier?2:1));const t=w.reduce((a,b)=>a+b,0);let x=Math.random()*t;for(let i=0;i<w.length;i++){x-=w[i];if(x<=0)return i}return 0}
function makeItem(baseKey,lv,rar,uniq){const id=itemSeq++;if(uniq){const U=UNIQ[uniq];return{id,uniq,slot:U.slot,name:U.n,rar:4,lv,dmg:U.dmg?Math.round(U.dmg*(1+.06*(lv-1))):0,def:0,mods:Object.assign({},U.mods),up:0,look:U.look||null}}
 const B=BASES[baseKey],R=RAR[rar],it={id,base:baseKey,slot:B.slot,name:B.n,rar,lv,dmg:0,def:0,mods:{},up:0,look:B.look||null};
 if(B.dmg)it.dmg=Math.round(B.dmg*(1+.07*(lv-1))*R.m);if(B.def)it.def=Math.round(B.def*(1+.06*(lv-1))*R.m);
 const keys=Object.keys(AFFIX).filter(k=>!(B.slot==='armor'&&k==='def')),n=R.af[0]+Math.floor(Math.random()*(R.af[1]-R.af[0]+1))+((B.slot==='charm'||B.slot==='ring')?1:0);
 for(let i=0;i<n;i++){const k=keys[Math.floor(Math.random()*keys.length)],A=AFFIX[k],v=lp(A.v[0],A.v[1],Math.random())*(1+.04*(lv-1))*R.m;it.mods[k]=(it.mods[k]||0)+(A.int?Math.max(1,Math.round(v)):Math.round(v))}
 const pre=['','Sağlam ','Keskin ','Lanetli ','Kadim '][rar];if(B.slot==='charm'||B.slot==='ring'){const t=Object.keys(it.mods)[0];it.name=(pre+(t?AFFIX[t].n+' ':'')+B.n).replace(' %','')}else it.name=pre+B.n;return it}
function randomDrop(lv,tier){const r=rollRarity(tier),pool=lv<5?['rusty','iron','plate','charm','ring']:lv<10?['iron','cleaver','plate','wolfhide','charm','ring']:lv<15?['cleaver','fang','wolfhide','bone','charm','ring']:['fang','shadow','bone','ash','charm','ring'];
 return makeItem(pool[Math.floor(Math.random()*pool.length)],lv,r)}
// ---------- inventory state lives in SYS (saved)
function invInit(){if(!SYS.inv){SYS.inv=[];SYS.eq={weapon:null,armor:null,charm:null,ring:null};const w=makeItem('rusty',1,0),a=makeItem('plate',1,0);SYS.inv.push(w,a);SYS.eq.weapon=w.id;SYS.eq.armor=a.id}
 SYS.flaskMax=SYS.flaskMax||3;if(SYS.flasks===undefined)SYS.flasks=SYS.flaskMax;SYS.shards=SYS.shards||0;itemSeq=Math.max(itemSeq,...SYS.inv.map(i=>i.id+1),1)}
const eqItem=(slot)=>SYS.inv.find(i=>i.id===SYS.eq[slot])||null;
// total of an affix over equipped items (+5% per upgrade level on the item's numbers)
function gear(k){let t=0;for(const s of['weapon','armor','charm','ring']){const it=eqItem(s);if(it&&it.mods[k])t+=it.mods[k]*(1+.05*it.up)}return t}
function hasFx(fx){for(const s of['weapon','armor','charm','ring']){const it=eqItem(s);if(it&&it.uniq&&UNIQ[it.uniq].fx===fx)return true}return false}
const weaponDmg=()=>{const w=eqItem('weapon');return w?w.dmg*(1+.08*w.up):14};
const armorDef=()=>{const a=eqItem('armor');return(a?a.def*(1+.08*a.up):0)+gear('def')};
const stat=k=>SYS[k]+Math.round(gear(k));
function itemLines(it){const L=[];if(it.dmg)L.push('Hasar '+Math.round(it.dmg*(1+.08*it.up)));if(it.def)L.push('Zırh '+Math.round(it.def*(1+.08*it.up)));for(const k in it.mods)L.push('+'+Math.round(it.mods[k]*(1+.05*it.up))+' '+AFFIX[k].n);if(it.uniq)L.push('★ '+UNIQ[it.uniq].d);return L}
function itemScore(it){return(it.dmg||0)*2+(it.def||0)*2+Object.values(it.mods).reduce((a,b)=>a+b,0)}
function equip(it){SYS.eq[it.slot]=it.id;applyLooks();note('[Sistem] Kuşanıldı: '+it.name,'gold');save(P)}
function giveItem(it,quiet){if(SYS.inv.length>=48){const junk=SYS.inv.filter(i=>!Object.values(SYS.eq).includes(i.id)).sort((a,b)=>a.rar-b.rar||itemScore(a)-itemScore(b))[0];if(junk){salvage(junk,true)}}
 SYS.inv.push(it);if(!quiet){note('[Ganimet] '+it.name+' ('+RAR[it.rar].n+')',it.rar>=3?'gold':'');if(it.rar>=3)sfx.rare()}
 // first weapon/armour upgrade gets equipped automatically so early players feel the jump
 const cur=eqItem(it.slot);if(!cur||(SYS.autoEq!==0&&it.rar>=cur.rar&&itemScore(it)>itemScore(cur)*1.15&&it.lv<=SYS.lv+2)){if(!cur||it.slot==='weapon'||it.slot==='armor')equip(it)}}
function salvage(it,quiet){if(Object.values(SYS.eq).includes(it.id))return;SYS.inv=SYS.inv.filter(i=>i!==it);const n=1+it.rar*2;SYS.shards+=n;if(!quiet)note('Parçalandı: +'+n+' demir parçası')}
function upgradeCost(it){return{gold:30*(it.up+1)*(1+it.rar),shards:3*(it.up+1)+it.rar*2}}
function upgrade(it){if(it.up>=5){note('En yüksek seviye (+5)');return false}const c=upgradeCost(it);if((SYS.gold||0)<c.gold||SYS.shards<c.shards){note('Gerekli: '+c.gold+' altın, '+c.shards+' demir parçası');return false}
 SYS.gold-=c.gold;SYS.shards-=c.shards;it.up++;note('[Demirci] '+it.name+' +'+it.up,'gold');sfx.anvil();applyLooks();save(P);return true}
// ---------- looks: weapon geometry + armour tint follow the equipped items
let swordSkin=null;
function applyLooks(){const a=eqItem('armor'),t=a&&a.look?a.look.tint.slice():[1,1,1];if(HERO.armor){if(HERO.armor.pbr){HERO.armor.tintM=t;HERO.armor.col=[1,1,1]}else HERO.armor.col=t}buildSword()}
function buildSword(){const w=eqItem('weapon'),L=(w&&w.look)||BASES.rusty.look,H=HB;
 if(swordSkin){const i=skins.indexOf(swordSkin.s);if(i>=0)skins.splice(i,1);unobj(swordSkin.o);const j=pObjs.indexOf(swordSkin.o);if(j>=0)pObjs.splice(j,1);freeGeo(swordSkin.s.geo);if(swordSkin.og){unobj(swordSkin.og);const k=pObjs.indexOf(swordSkin.og);if(k>=0)pObjs.splice(k,1);const m=skins.indexOf(swordSkin.sg);if(m>=0)skins.splice(m,1)}swordSkin=null}
 const save=SK.R.map(r=>r);for(let i=0;i<SK.n;i++)SK.R[i]=R3I;for(const f of['Index','Middle','Ring','Little'])for(const[seg,a]of[['Proximal',1.1],['Intermediate',1.2],['Distal',.7]])SK.R[H['right'+f+seg]]=rZ(a);
 SK.root=[0,0,0];skUpdate();const GP=SK.GP,fc=[];
 for(const f of['Index','Middle','Ring','Little']){const a=GP[H['right'+f+'Proximal']],b=GP[H['right'+f+'Intermediate']],c=GP[H['right'+f+'Distal']],t=vadd(c,vmul(vsub(c,b),.8));fc.push(vmul(vadd(vadd(a,b),vadd(c,t)),.25))}
 for(let i=0;i<SK.n;i++)SK.R[i]=save[i];
 const ax=vnorm(vsub(fc[0],fc[3])),cen=vmul(vadd(vadd(fc[0],fc[1]),vadd(fc[2],fc[3])),.25),up=vnorm(vsub([0,1,0],vmul(ax,ax[1]))),sd=vcross(up,ax);
 const Q=(dx,dy,dz)=>vadd(cen,vadd(vadd(vmul(sd,dx),vmul(up,dy)),vmul(ax,dz))),L0=.16,L1=L.len,Wd=L.wid,sw=[];
 sw.push(tint(tube([Q(0,0,L0),Q(0,0,L1*.45),Q(0,0,L1-.2),Q(0,0,L1)],{r:t=>Wd*(t<.86?1-t*.18:(1-t)/.14*.84),flat:.2,seg:6,n:16,wide:up}),L.col));
 for(const s of[-1,1])sw.push(tint(tube([Q(0,s*Wd*.92,L0+.02),Q(0,s*Wd*.8,L1-.25),Q(0,s*.012,L1-.02)],{r:()=>.007,seg:4,n:6}),L.edge));
 sw.push(tint(tube([Q(0,-.2,.1),Q(0,-.13,.135),Q(0,0,.14),Q(0,.13,.135),Q(0,.2,.1)],{r:t=>.026-.008*Math.abs(t-.5),seg:6,n:10,wide:ax}),KC.iron));
 sw.push(tint(tube([Q(0,0,-.26),Q(0,0,.12)],{r:()=>.021,seg:6,n:2}),KC.leather));sw.push(tint(sphere(8,6,d=>vadd(Q(0,0,-.29),vmul(d,.032)),{c:Q(0,0,-.29)}),KC.bronze));
 const g=merge(sw),nv=g.P.length/3,J=new Uint8Array(nv*4),Wt=new Float32Array(nv*4);for(let i=0;i<nv;i++){J[i*4]=H.rightHand;Wt[i*4]=1}
 const o=addSkin(g,J,Wt,{out:.004,outCol:[.04,.04,.06],shade:.9});swordSkin={o,s:skins[skins.length-1]};
 if(L.glow){const gg=tint(tube([Q(0,0,L0+.05),Q(0,0,L1-.3)],{r:()=>.012,flat:.5,seg:4,n:2,wide:up}),[1,1,1]),n2=gg.P.length/3,J2=new Uint8Array(n2*4),W2=new Float32Array(n2*4);for(let i=0;i<n2;i++){J2[i*4]=H.rightHand;W2[i*4]=1}
  swordSkin.og=addSkin(gg,J2,W2,{unlit:1,col:L.glow,shade:0});swordSkin.sg=skins[skins.length-1]}
 SK.tipRest=Q(0,0,L1-.05);SK.midRest=Q(0,0,L1*.55);SK.gripRest=cen;SK.gripAx=ax;SK.bladeLen=L1}
// ---------- ground loot: light beams coloured by rarity, auto pick-up when you walk over them
const LOOT=[];let beamGeo=null;
function dropLoot(x,z,items,gold){for(const it of items){const a=Math.random()*6.28,r=.6+Math.random()*.9,lx=x+Math.cos(a)*r,lz=z+Math.sin(a)*r;
  if(!beamGeo){const g=G();for(let k=0;k<6;k++){const a0=k/6*2*PI,a1=(k+1)/6*2*PI;const o=g.P.length/3;g.P.push(Math.cos(a0)*.08,0,Math.sin(a0)*.08,Math.cos(a1)*.08,0,Math.sin(a1)*.08,Math.cos(a1)*.02,3,Math.sin(a1)*.02,Math.cos(a0)*.02,3,Math.sin(a0)*.02);for(let q=0;q<4;q++){g.N.push(0,1,0);g.C.push(1,1,1);g.U.push(0,0);g.W.push(0)}g.I.push(o,o+1,o+2,o,o+2,o+3)}beamGeo=geo(g)}
  const c=RAR[it.rar].c,col=[parseInt(c.slice(1,3),16)/255,parseInt(c.slice(3,5),16)/255,parseInt(c.slice(5,7),16)/255];const ob=obj(beamGeo,{unlit:1,blend:1,noOff:1,col,shade:0,pos:[lx,0,lz],cull:250,ds:1});ob.alpha=.55;ob.M=mtrs([lx,hAt(lx,lz),lz],[0,0,0]);
  LOOT.push({x:lx,z:lz,it,ob,t:0})}
 if(gold){SYS.gold=(SYS.gold||0)+gold;floatText(x,hAt(x,z)+1.4,z,'+'+gold+' altın','gold')}}
function updateLoot(dt){for(let i=LOOT.length-1;i>=0;i--){const l=LOOT[i];l.t+=dt;const s=1+.15*Math.sin(l.t*4);l.ob.M=mtrs([l.x,hAt(l.x,l.z),l.z],[0,l.t,0]);l.ob.M[0]*=s;l.ob.M[10]*=s;l.ob.M[5]*=1+.1*Math.sin(l.t*3);
  if(P.alive&&Math.hypot(P.x-l.x,P.z-l.z)<1.7){giveItem(l.it);unobj(l.ob);LOOT.splice(i,1)}else if(l.t>600){unobj(l.ob);LOOT.splice(i,1)}}}
// enemy death -> loot roll (tier: 0 normal, 1 elite, 2 mini boss, 3 boss)
function lootFor(f,tier,goldBase){const lv=f.lv||1,items=[];const chance=[.16,.6,1,1][tier];if(Math.random()<chance)items.push(randomDrop(lv,Math.min(4,tier)));if(tier>=2&&Math.random()<.5)items.push(randomDrop(lv,tier));
 if(Math.random()<.25)SYS.shards+=1+tier;dropLoot(f.x,f.z,items,Math.round((goldBase||2)*(1+.15*(lv-1))*(.7+Math.random()*.6)))}
// ---------- healing flask (refilled at altars)
function drinkFlask(){if(P.st!=='move'||!P.alive)return;if(SYS.flasks<=0){note('İksir kalmadı — bir sunakta dinlen');return}SYS.flasks--;P.st='drink';P.t=0;sfx.drink();save(P)}
