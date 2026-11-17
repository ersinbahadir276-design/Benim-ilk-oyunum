// ===================== rigged characters: villagers, merchant, guards, goblins, crocodile =====================
// Each part is modelled in its bone's local space and tagged with the bone index; one draw call per character.
// Bone matrices (3 rows of vec4 each, world space) go to the shader's uB[] array.
const MAXB=22;
function partJ(g,b){const nv=g.P.length/3;g.J=new Float32Array(nv).fill(b);return g}
function rigMerge(list){const g=merge(list.map(p=>p[0]));const J=[];for(const[pg,b]of list){const nv=pg.P.length/3;for(let i=0;i<nv;i++)J.push(b)}g.J=new Float32Array(J);return g}
// forward kinematics: bones=[{p,o}], rot[i]=3x3 local rotation, root position/yaw/scale -> Float32Array(MAXB*12)
function rigFK(def,rot,pos,yaw,sc,out,extra){const n=def.length,WR=def.WR||(def.WR=[]),WP=def.WP||(def.WP=[]);const base=r3m(rY(yaw),extra||R3I);
 for(let i=0;i<n;i++){const b=def[i],R=rot[i]||R3I;if(b.p<0){WR[i]=r3m(base,R);WP[i]=pos.slice()}else{const pr=WR[b.p];WR[i]=r3m(pr,R);const o=r3v(pr,b.o);WP[i]=[WP[b.p][0]+o[0]*sc,WP[b.p][1]+o[1]*sc,WP[b.p][2]+o[2]*sc]}
  const m=WR[i],q=i*12;out[q]=m[0]*sc;out[q+1]=m[1]*sc;out[q+2]=m[2]*sc;out[q+3]=WP[i][0];out[q+4]=m[3]*sc;out[q+5]=m[4]*sc;out[q+6]=m[5]*sc;out[q+7]=WP[i][1];out[q+8]=m[6]*sc;out[q+9]=m[7]*sc;out[q+10]=m[8]*sc;out[q+11]=WP[i][2]}
 return out}
const eul=(x,y,z)=>r3m(rY(y||0),r3m(rX(x||0),rZ(z||0)));
const boneW=(def,i,local,sc)=>{const o=r3v(def.WR[i],local);return[def.WP[i][0]+o[0]*sc,def.WP[i][1]+o[1]*sc,def.WP[i][2]+o[2]*sc]};
// ---------- humanoid skeleton (faces +z, limbs hang along -y)
// 0 hips 1 chest 2 head 3/4/5 left arm/forearm/hand 6/7/8 right 9/10/11 left thigh/shin/foot 12/13/14 right 15 jaw
function humanDef(k){const s=k.sh||.19,hw=k.hw||.095;return[{p:-1,o:[0,0,0]},{p:0,o:[0,.06,0]},{p:1,o:[0,k.torso,0]},
 {p:1,o:[s,k.torso*.88,0]},{p:3,o:[0,-k.ua,0]},{p:4,o:[0,-k.fa,0]},{p:1,o:[-s,k.torso*.88,0]},{p:6,o:[0,-k.ua,0]},{p:7,o:[0,-k.fa,0]},
 {p:0,o:[hw,-.04,0]},{p:9,o:[0,-k.th,0]},{p:10,o:[0,-k.sh2,0]},{p:0,o:[-hw,-.04,0]},{p:12,o:[0,-k.th,0]},{p:13,o:[0,-k.sh2,0]},{p:2,o:[0,.02,.06]}]}
const limbG=(len,r0,r1,col,seg=8)=>tint(tube([[0,.02,0],[0,-len*.5,0],[0,-len,0]],{r:t=>lp(r0,r1,t),seg,n:4}),col);
// kind: villager|villager2|merchant|guard|goblin|bigGoblin
// painted faces for the sculpted humans (front projection: u=.5+x/(2.4hr), v=.5-y/(2.4hr) around the head centre)
const FACES={villager:{iris:'#5a3a1c',brow:'#3a2414',lip:'#a0594c'},villager2:{iris:'#3f7a4a',brow:'#7a4a22',lip:'#c2606a',lash:1,blush:1},merchant:{iris:'#4a3020',brow:'#2c2018',lip:'#9a5448',stache:'#2c2018'},
 guard:{iris:'#4a6080',brow:'#2a2018',lip:'#94564a',stern:1},elder:{iris:'#6a7a8a',brow:'#d8d8d4',lip:'#9a6a60',old:1},smith:{iris:'#3a2a1a',brow:'#1c1410',lip:'#8a4c40',stern:1},
 hunter:{iris:'#4a7a3a',brow:'#7a3a14',lip:'#b86058',lash:1,freckle:1},king:{iris:'#c9d2d8',iris2:'#d41818',brow:'#3a0a0a',lip:'#a04050',lash:1,manhwa:1,scar:1,ex:42,ey:140,es:1.25,by:121,ny:190,my:214,mw:.72},veyra:{iris:'#d4201c',brow:'#5a0c12',lip:'#a83848',lash:1,slit:1,fang:1},priest:{iris:'#4a6aa0',brow:'#a08050',lip:'#c07068',lash:1,blush:1}};
function faceTex(kind){const F=FACES[kind];if(!F)return null;const c=cnv(256,256),g=c.getContext('2d');g.clearRect(0,0,256,256);
 const ex=F.ex||36,ey=F.ey||127,es=F.es||1,dy=(F.by||108)-108,ny=F.ny||151,my=F.my||178,mw=F.mw||1;g.lineCap='round';
 for(const s of[-1,1]){const x=128+s*ex;// sclera, iris, pupil, highlight, upper lid + lashes, lower lid
  g.save();g.translate(x,ey);g.scale(es,es);g.translate(-x,-ey);
  if(F.manhwa){const eye=()=>{g.beginPath();g.moveTo(x-s*15,ey+1);g.quadraticCurveTo(x-s*3,ey-8.5,x+s*15,ey-2.5);g.quadraticCurveTo(x+s*4,ey+6,x-s*15,ey+1);g.closePath()};
   g.fillStyle='#f2ece6';eye();g.fill();g.save();eye();g.clip();g.fillStyle=(F.iris2&&s>0)?F.iris2:F.iris;g.beginPath();g.arc(x+s*1,ey,6.2,0,7);g.fill();g.fillStyle='#0c0806';g.beginPath();g.ellipse(x+s*1,ey,1.2,5,0,0,7);g.fill();
   g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-16,ey-10,32,5);g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x-s*1.5,ey-2,1.4,0,7);g.fill();g.restore();
   g.strokeStyle='#120a0c';g.lineWidth=2.8;g.beginPath();g.moveTo(x-s*15.5,ey+1.5);g.quadraticCurveTo(x-s*3,ey-9,x+s*16.5,ey-3.5);g.stroke();
   g.lineWidth=1;g.strokeStyle='rgba(30,15,15,.55)';g.beginPath();g.moveTo(x-s*11,ey-8.5);g.quadraticCurveTo(x,ey-13,x+s*14,ey-7);g.stroke();
   g.strokeStyle='rgba(40,20,20,.45)';g.beginPath();g.moveTo(x-s*13,ey+2.5);g.quadraticCurveTo(x+s*4,ey+6.5,x+s*14,ey-1);g.stroke();g.restore()}else{
  g.fillStyle='#f4efe8';g.beginPath();g.ellipse(x,ey,13,7.5,0,0,7);g.fill();
  g.fillStyle=F.iris;g.beginPath();g.arc(x,ey+.5,6.6,0,7);g.fill();g.fillStyle='#0c0806';g.beginPath();if(F.slit)g.ellipse(x,ey+.5,1.4,5.6,0,0,7);else g.arc(x,ey+.5,3,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x-2.4,ey-2.2,1.7,0,7);g.fill();
  g.strokeStyle='#241612';g.lineWidth=F.lash?3.2:2.4;g.beginPath();g.ellipse(x,ey+1.5,13.5,9,0,PI*1.06,PI*1.94);g.stroke();
  if(F.lash){g.lineWidth=1.6;g.beginPath();g.moveTo(x+s*12,ey-4);g.lineTo(x+s*16,ey-7.5);g.stroke()}
  g.strokeStyle='rgba(60,30,20,.35)';g.lineWidth=1.2;g.beginPath();g.ellipse(x,ey-.5,12,7,0,PI*.15,PI*.85);g.stroke();g.restore();}
  // brow
  g.strokeStyle=F.brow;g.lineWidth=F.stern?5.5:4.2;if(F.manhwa){g.lineWidth=2.2;g.beginPath();g.moveTo(x-s*15,108+dy+1);g.quadraticCurveTo(x+s*2,99+dy,x+s*21,106+dy);g.stroke()}else{g.beginPath();g.moveTo(x-s*13,108+dy+(F.stern?3:0));g.quadraticCurveTo(x,101+dy,x+s*14,108+dy-(F.stern?2:0));g.stroke();}
  if(F.old){g.strokeStyle='rgba(70,40,30,.35)';g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(x+s*15,ey+2+k*3);g.lineTo(x+s*21,ey+k*4);g.stroke()}}
  if(F.blush){g.fillStyle='rgba(220,90,90,.22)';g.beginPath();g.ellipse(x+s*4,ey+22,11,6,0,0,7);g.fill()}
  if(F.freckle){g.fillStyle='rgba(120,60,30,.45)';for(let k=0;k<6;k++){g.beginPath();g.arc(x+s*(k%3)*4-s*2,ey+17+(k>>1)*3,1,0,7);g.fill()}}}
 // nose shading and nostrils, lips, chin line
 g.fillStyle='rgba(90,45,30,.22)';g.beginPath();g.ellipse(128,ny+1,6,2.6,0,0,7);g.fill();g.fillStyle='rgba(60,25,20,.4)';for(const s of[-1,1]){g.beginPath();g.ellipse(128+s*4,ny,1.7,1.1,0,0,7);g.fill()}
 if(F.manhwa){g.strokeStyle='rgba(120,60,60,.35)';g.lineWidth=1.4;g.beginPath();g.moveTo(124,ey+10);g.quadraticCurveTo(121,ny-8,124,ny);g.stroke();g.fillStyle='rgba(110,50,50,.35)';g.beginPath();g.ellipse(126,ny+1,6,2.2,0,0,7);g.fill();
  g.fillStyle=F.lip;g.beginPath();g.moveTo(119,my);g.quadraticCurveTo(124,my-3.2,128,my-1.6);g.quadraticCurveTo(132,my-3.2,137,my);g.quadraticCurveTo(128,my+1.2,119,my);g.fill();
  g.fillStyle='rgba(170,70,85,.75)';g.beginPath();g.moveTo(121,my+.6);g.quadraticCurveTo(128,my+6,135,my+.6);g.quadraticCurveTo(128,my+2,121,my+.6);g.fill();g.strokeStyle='rgba(60,15,20,.85)';g.lineWidth=1.1;g.beginPath();g.moveTo(118,my);g.quadraticCurveTo(128,my+1.4,138,my);g.stroke()}else{
 g.save();g.translate(128,my);g.scale(mw,mw);g.translate(-128,-178);
 g.fillStyle=F.lip;g.beginPath();g.moveTo(113,178);g.quadraticCurveTo(128,172,143,178);g.quadraticCurveTo(128,186,113,178);g.fill();
 g.strokeStyle='rgba(60,20,20,.75)';g.lineWidth=1.6;g.beginPath();g.moveTo(112,178);g.quadraticCurveTo(128,(F.stern?179:181),144,178);g.stroke();g.restore();}
 if(F.scar){g.strokeStyle='rgba(150,30,35,.85)';g.lineWidth=2.4;const x0=128-(F.ex||36);g.beginPath();g.moveTo(x0-12,(F.ey||127)-24);g.lineTo(x0+8,(F.ey||127)+28);g.moveTo(x0-16,(F.ey||127)+6);g.lineTo(x0+2,(F.ey||127)-6);g.moveTo(x0+4,(F.ey||127)+18);g.lineTo(x0+16,(F.ey||127)+12);g.stroke()}
 if(F.fang){g.fillStyle='#fffaf0';g.beginPath();g.moveTo(133,my+1);g.lineTo(137,my+1);g.lineTo(135,my+7);g.fill()}
 if(F.stache){g.fillStyle=F.stache;g.beginPath();g.moveTo(108,176);g.quadraticCurveTo(128,160,148,176);g.quadraticCurveTo(128,170,108,176);g.fill()}
 if(F.old){g.strokeStyle='rgba(70,40,30,.3)';g.lineWidth=1.4;for(const s of[-1,1]){g.beginPath();g.moveTo(128+s*12,160);g.quadraticCurveTo(128+s*20,172,128+s*18,184);g.stroke()}g.beginPath();g.moveTo(108,96);g.lineTo(148,96);g.moveTo(112,90);g.lineTo(144,90);g.stroke()}
 return texture(c)}
function humanGeo(kind){const sg=sculptGeo(kind);if(sg){const K0=humanGeoK(kind),def=humanDef(K0);return{def,geo:sg,K:K0,binv:bindInv(def,BINDS[kind]||HBIND),tex:faceTex(kind)}}return humanGeoOld(kind)}
function humanGeoK(kind){return humanGeoOld(kind,true)}
function humanGeoOld(kind,onlyK){const K={villager:{H:1.0,torso:.42,ua:.27,fa:.25,th:.4,sh2:.39,sh:.18,hw:.09,skin:[.92,.75,.62],c1:[.55,.36,.22],c2:[.33,.3,.26],hair:[.3,.2,.12]},
  villager2:{H:1.0,torso:.4,ua:.26,fa:.24,th:.39,sh2:.38,sh:.17,hw:.09,skin:[.95,.8,.68],c1:[.36,.45,.32],c2:[.5,.42,.3],hair:[.55,.38,.2],dress:1},
  merchant:{H:1.0,torso:.42,ua:.27,fa:.25,th:.4,sh2:.39,sh:.19,hw:.1,skin:[.88,.7,.56],c1:[.45,.2,.25],c2:[.28,.22,.18],hair:[.2,.18,.16],hat:1,belly:1},
  guard:{H:1.0,torso:.44,ua:.28,fa:.26,th:.42,sh2:.41,sh:.2,hw:.1,skin:[.9,.72,.6],c1:[.55,.57,.62],c2:[.22,.3,.6],hair:[.2,.16,.12],helm:1,spear:1},
  goblin:{H:1.0,torso:.26,ua:.2,fa:.19,th:.22,sh2:.22,sh:.13,hw:.07,skin:[.42,.58,.26],c1:[.38,.27,.17],c2:[.3,.22,.14],gob:1,dagger:1},
  elder:{H:1.0,torso:.4,ua:.26,fa:.24,th:.39,sh2:.38,sh:.17,hw:.09,skin:[.88,.72,.62],c1:[.32,.28,.38],c2:[.28,.26,.3],hair:[.86,.86,.84],beard:1,staff:1,dress:1},
  smith:{H:1.0,torso:.44,ua:.29,fa:.27,th:.4,sh2:.39,sh:.21,hw:.1,skin:[.82,.6,.48],c1:[.32,.22,.16],c2:[.24,.2,.17],hair:[.14,.1,.08],belly:1,apron:1,hammer:1,beard:1},
  hunter:{H:1.0,torso:.41,ua:.27,fa:.25,th:.41,sh2:.4,sh:.17,hw:.09,skin:[.93,.77,.66],c1:[.24,.34,.2],c2:[.3,.24,.16],hair:[.5,.27,.1],hood:1,bow:1},
  priest:{H:1.0,torso:.4,ua:.26,fa:.24,th:.39,sh2:.38,sh:.16,hw:.085,skin:[.96,.84,.76],c1:[.9,.88,.84],c2:[.82,.8,.74],hair:[.75,.62,.4],dress:1,hood:1},
  king:{H:1.0,torso:0.534,ua:0.323,fa:0.289,th:0.396,sh2:0.444,sh:0.160,hw:0.097,skin:[.14,.08,.14],c1:[.07,.04,.07],c2:[.1,.05,.09],hair:[.05,.03,.05],big:1,king:1,dress:1},
  skeleton:{H:1.0,torso:.42,ua:.27,fa:.25,th:.4,sh2:.39,sh:.18,hw:.09,skin:[.84,.79,.66],c1:[.3,.12,.1],c2:[.44,.27,.15],hair:[.1,.1,.1],gob:1},
  bigGoblin:{H:1.0,torso:.62,ua:.48,fa:.44,th:.5,sh2:.48,sh:.36,hw:.17,skin:[.36,.47,.25],c1:[.32,.24,.16],c2:[.26,.2,.14],gob:1,big:1,club:1}}[kind];
 if(onlyK)return K;const def=humanDef(K),P=[],sk=K.skin,c1=K.c1,c2=K.c2,big=K.big?1:0,gob=K.gob?1:0;
 // hips + lower clothing
 P.push([tint(loft([{y:-.1,rx:.1+big*.13,rz:.08+big*.1},{y:0,rx:.14+big*.15,rz:.1+big*.12},{y:.1,rx:.13+big*.16,rz:.1+big*.14}],12,2),c2),0]);
 if(K.dress)P.push([tint(loft([{y:.06,rx:.15,rz:.12},{y:-.2,rx:.2,rz:.17},{y:-.55,rx:.27,rz:.24}],14,2,{fn:a=>1+.04*Math.sin(a*7)}),c1),0]);
 if(gob)P.push([tint(loft([{y:.02,rx:.15+big*.17,rz:.12+big*.14},{y:-.16-big*.1,rx:.17+big*.2,rz:.14+big*.17}],10,1,{fn:a=>Math.abs(Math.sin(a))>.5?1:.85}),[.45,.33,.2]),0]);
 // torso
 const T=K.torso;P.push([tint(loft([{y:0,rx:.13+big*.15,rz:.1+big*.13},{y:T*.35,rx:.14+big*.2+(K.belly?.04:0),rz:.11+big*.2+(K.belly?.06:0)},{y:T*.75,rx:.17+big*.2,rz:.12+big*.17},{y:T*.95,rx:.15+big*.18,rz:.1+big*.14},{y:T*1.02,rx:.06+big*.08,rz:.06+big*.07}],12,2,{fn:(a,y)=>1+(gob?.04*Math.sin(a*5+y*20):0)}),gob?sk:c1),1]);
 if(!gob){P.push([tint(loft([{y:T*.3,rx:.15+(K.belly?.045:0),rz:.115+(K.belly?.065:0)},{y:T*.38,rx:.15+(K.belly?.045:0),rz:.115+(K.belly?.065:0)}],12,1),[.2,.14,.1]),1]);
  if(kind==='guard')P.push([tint(loft([{y:T*.05,rx:.135,rz:.105},{y:T*.8,rx:.165,rz:.125}],12,1,{fn:a=>Math.sin(a)>-.2?1.03:0.0001}),c2),1]),P.push([tint(sphere(8,6,d=>[d[0]*.04,T*.55+d[1]*.05,.125+d[2]*.01],{c:[0,T*.55,.125]}),[.95,.8,.3]),1]);
  if(kind==='merchant')P.push([tint(loft([{y:T*.62,rx:.15,rz:.12},{y:-.45,rx:.19,rz:.15}],12,1,{fn:a=>Math.sin(a)>0?1.06:.0001}),[.86,.84,.78]),1])}
 else{P.push([tint(tube([[-.14-big*.18,T*.8,0],[0,T*.7,.12+big*.15],[.14+big*.18,T*.8,0]],{r:()=>.025+big*.02,seg:5,n:6}),[.3,.22,.15]),1])}
 // head
 const hr=gob?(big?.17:.15):.105;P.push([tint(tube([[0,-.06,0],[0,.06,0]],{r:()=>.045+big*.05,seg:8,n:2}),sk),2]);
 P.push([tint(sphere(14,10,d=>[d[0]*hr,hr*.95+d[1]*hr*(gob?.9:1.08),d[2]*hr*1.05+(gob?.02:0)],{c:[0,hr*.95,0]}),sk),2]);
 const eyeY=hr*(gob?.95:1.02),eyeZ=hr*(gob?.95:.95);
 for(const s of[-1,1]){P.push([tint(sphere(6,5,d=>[s*hr*.38+d[0]*hr*(gob?.13:.12),eyeY+d[1]*hr*(gob?.11:.15),eyeZ+d[2]*hr*.06],{c:[s*hr*.38,eyeY,eyeZ]}),gob?[1.3,1.1,.2]:[.08,.06,.07]),2]);
  if(!gob){P.push([tint(sphere(5,4,d=>[s*hr*.34+d[0]*hr*.05,eyeY+hr*.06+d[1]*hr*.05,eyeZ+.012+d[2]*hr*.02],{c:[s*hr*.34,eyeY+hr*.06,eyeZ+.012]}),[1.4,1.4,1.4]),2]);P.push([tint(tube([[s*hr*.2,eyeY+hr*.32,eyeZ-.005],[s*hr*.55,eyeY+hr*.3,eyeZ-.02]],{r:()=>.007,seg:4,n:2}),K.hair),2])}
  if(gob)P.push([tint(tube([[s*hr*.85,hr*1.05,-.01],[s*hr*1.7,hr*1.3,-.05],[s*hr*2.6,hr*1.55,-.1]],{r:t=>lp(.05,.004,t)*(1+big*.5),flat:.35,seg:6,n:5,wide:[0,0,1]}),sk),2]);
  else P.push([tint(sphere(6,5,d=>[s*hr*.98+d[0]*.02,hr*.95+d[1]*.03,d[2]*.015],{c:[s*hr*.98,hr*.95,0]}),sk),2])}
 P.push([tint(tube([[0,eyeY-hr*.15,eyeZ-.01],[0,eyeY-hr*.35,eyeZ+hr*(gob?.55:.15)]],{r:t=>lp(gob?.035:.02,gob?.012:.012,t)*(1+big*.5),seg:6,n:3}),sk),2]);
 if(gob&&big)for(const s of[-1,1])P.push([tint(tube([[s*.07,hr*.45,hr*.75],[s*.09,hr*.75,hr*.95]],{r:t=>lp(.025,.004,t),seg:5,n:3}),[.95,.92,.82]),15]);
 if(!gob){P.push([tint(sphere(14,8,d=>[d[0]*hr*1.06,hr*1.0+d[1]*hr*1.1,d[2]*hr*1.1-.008],{c:[0,hr,0],th:u=>PI*(.5+.12*Math.cos(2*PI*(u-.5)))}),K.hair),2]);
  P.push([tint(tube([[-hr*.4,hr*.55,hr*.88],[hr*.4,hr*.55,hr*.88]],{r:()=>.008,seg:4,n:2}),[.45,.25,.22]),15])}
 if(K.hat)P.push([tint(merge([loft([{y:hr*1.75,rx:.2,rz:.2},{y:hr*1.8,rx:.2,rz:.2}],16,1),loft([{y:hr*1.75,rx:.1,rz:.1},{y:hr*2.5,rx:.09,rz:.09},{y:hr*2.55,rx:.001}],12,1)]),[.3,.18,.12]),2]);
 if(K.helm)P.push([tint(merge([sphere(14,8,d=>[d[0]*hr*1.18,hr*1.02+d[1]*hr*1.18,d[2]*hr*1.18],{c:[0,hr,0],th:()=>PI*.55}),tube([[0,hr*1.5,hr*1.12],[0,hr*.55,hr*1.16]],{r:()=>.012,seg:4,n:2})]),[.62,.64,.7]),2]);
 // arms
 for(const[s,u,f,h]of[[1,3,4,5],[-1,6,7,8]]){P.push([tint(sphere(8,6,d=>[d[0]*(.06+big*.07),d[1]*(.06+big*.07),d[2]*(.06+big*.07)],{c:[0,0,0]}),gob?sk:kind==='guard'?[.6,.62,.68]:c1),u]);
  P.push([limbG(K.ua,.048+big*.07,.04+big*.06,gob?sk:c1),u]);P.push([limbG(K.fa,.04+big*.06,.032+big*.05,gob||K.dress?sk:c1),f]);
  P.push([tint(sphere(8,6,d=>[d[0]*(.04+big*.05),-.05-big*.04+d[1]*(.055+big*.06),.01+d[2]*(.035+big*.045)],{c:[0,-.05,0]}),sk),h])}
 // legs
 for(const[s,t,sh,ft]of[[1,9,10,11],[-1,12,13,14]]){P.push([limbG(K.th,.07+big*.08,.052+big*.07,gob?sk:c2),t]);P.push([limbG(K.sh2,.05+big*.07,.038+big*.06,gob?sk:c2),sh]);
  P.push([tint(sphere(8,6,d=>[d[0]*(.05+big*.06),-.025+d[1]*(.04+big*.03),.045+big*.06+d[2]*(.1+big*.08)],{c:[0,-.025,.05]}),gob?sk:[.22,.16,.12]),ft])}
 // role details: beard, hood, apron, bow; the Demon King's crown of horns, burning eyes, spiked mantle and tail
 if(K.beard)P.push([tint(sphere(10,8,d=>[d[0]*hr*.7,hr*.35+d[1]*hr*.55,hr*.75+d[2]*hr*.35],{c:[0,hr*.35,hr*.75]}),K.hair),2]);
 if(K.hood)P.push([tint(sphere(14,9,d=>[d[0]*hr*1.22,hr*1.05+d[1]*hr*1.25,d[2]*hr*1.2-.015],{c:[0,hr,0],th:u=>PI*(.55+.2*Math.cos(2*PI*(u-.5)))}),c1),2]);
 if(K.apron)P.push([tint(loft([{y:T*.55,rx:.17,rz:.135},{y:-.5,rx:.21,rz:.16}],12,1,{fn:a=>Math.sin(a)>0?1.04:.0001}),[.3,.2,.14]),1]);
 if(K.bow)P.push([tint(tube([[.16,T*.95,-.14],[.02,T*.5,-.2],[-.16,T*.05,-.14]],{r:()=>.012,seg:5,n:8}),[.4,.27,.14]),1]);
 if(K.king){for(let i=0;i<7;i++){const a=(i/6-.5)*2.2,hx=Math.sin(a)*hr*.95,hz=Math.cos(a)*hr*.6;P.push([tint(tube([[hx,hr*1.55,hz],[hx*1.3,hr*2.3+(i===3?.12:0),hz*1.2-.04],[hx*1.4,hr*2.9+(i===3?.25:0),hz*1.1-.12]],{r:t=>lp(.035,.003,t),seg:5,n:5}),[.25,.05,.06]),2])}
  for(const s of[-1,1]){P.push([tint(sphere(6,5,d=>[s*hr*.38+d[0]*hr*.16,hr*1.0+d[1]*hr*.08,hr*.9+d[2]*.02],{c:[s*hr*.38,hr,hr*.9]}),[3,.6,.3]),2]);P.push([tint(tube([[s*(.36+.05),T*.98,0],[s*.62,T*1.25,-.05],[s*.78,T*1.45,-.12]],{r:t=>lp(.08,.004,t),seg:6,n:5}),[.2,.04,.05]),1])}
  P.push([tint(tube([[0,-.05,-.25],[0,-.35,-.75],[0,-.6,-1.35],[.2,-.75,-2.0],[.45,-.7,-2.5]],{r:t=>lp(.14,.02,t),seg:8,n:12}),[.12,.05,.1]),0]);P.push([tint(loft([{y:T*.98,rx:.5,rz:.32},{y:-1.1,rx:.7,rz:.55}],16,2,{fn:a=>Math.sin(a)<.1?1:.0001}),[.2,.02,.04]),1])}
 if(K.staff)P.push([tint(tube([[0,-.06,-.9],[0,-.06,.75],[0,-.1,.9]],{r:()=>.02,seg:6,n:3}),[.38,.28,.18]),8]);
 if(K.hammer)P.push([merge([tint(tube([[0,-.06,-.1],[0,-.06,.45]],{r:()=>.02,seg:6,n:2}),[.36,.26,.16]),tint(tube([[-.09,-.06,.45],[.09,-.06,.45]],{r:()=>.05,seg:6,n:2}),[.35,.35,.38])]),8]);
 // props in the right hand (along the hand's local z, which points up/forward when the elbow is bent)
 if(K.spear)P.push([merge([tint(tube([[0,-.06,-.9],[0,-.06,1.35]],{r:()=>.018,seg:6,n:2}),[.45,.32,.2]),tint(tube([[0,-.06,1.35],[0,-.06,1.62]],{r:t=>lp(.035,.002,t),flat:.3,seg:6,n:3,wide:[1,0,0]}),[.8,.82,.88])]),8]);
 if(K.dagger)P.push([merge([tint(tube([[0,-.05,-.06],[0,-.05,.06]],{r:()=>.016,seg:5,n:2}),[.3,.2,.12]),tint(tube([[0,-.05,.06],[0,-.05,.36]],{r:t=>lp(.025,.003,t),flat:.25,seg:5,n:3,wide:[1,0,0]}),[.7,.7,.66])]),8]);
 if(K.club){const cl2=tint(tube([[0,-.08,-.25],[0,-.08,.5],[0,-.08,1.3],[0,-.08,1.75]],{r:t=>lp(.05,.17,t*t)*(1+.15*Math.sin(t*20)),seg:9,n:10}),[.42,.3,.18]);const sp=[];for(let i=0;i<7;i++){const a=i*2.4,z=1.15+i*.08;sp.push(tint(tube([[Math.cos(a)*.12,-.08+Math.sin(a)*.12,z],[Math.cos(a)*.26,-.08+Math.sin(a)*.26,z+.03]],{r:t=>lp(.03,.002,t),seg:4,n:2}),[.75,.72,.68]))}P.push([merge([cl2,...sp]),8])}
 const g=rigMerge(P.map(([pg,b])=>[pg,b]));return{def,geo:geo(g),K}}
// ---------- crocodile: body, chest, head, jaw, 4 tail segments, 4 sprawled legs (upper+lower)
function crocDef(){return[{p:-1,o:[0,0,0]},{p:0,o:[0,0,.55]},{p:1,o:[0,.05,.55]},{p:2,o:[0,-.04,.02]},{p:0,o:[0,0,-.55]},{p:4,o:[0,0,-.6]},{p:5,o:[0,0,-.55]},{p:6,o:[0,0,-.5]},
 {p:1,o:[.22,-.04,.1]},{p:8,o:[.28,0,0]},{p:1,o:[-.22,-.04,.1]},{p:10,o:[-.28,0,0]},{p:0,o:[.24,-.04,-.25]},{p:12,o:[.3,0,0]},{p:0,o:[-.24,-.04,-.25]},{p:14,o:[-.3,0,0]}]}
function crocGeo(){const skin=[.27,.35,.2],bel=[.66,.65,.48],dk=[.17,.22,.13],P=[],cc=(v,a)=>{const t=(1-Math.sin(a))/2;return mix3(bel,mix3(skin,dk,sst(.6,1,t)*.6),sst(.25,.5,t))};
 const seg=(z0,z1,r0,r1,b)=>P.push([bake(loft([{y:z0,rx:r0*1.25,rz:r0*.62},{y:z1,rx:r1*1.25,rz:r1*.62}],12,1,{col:cc,fn:(a,y)=>1+(Math.sin(a)>.6?.08*Math.abs(Math.sin(y*30)):0)}),mtrs([0,0,0],[PI/2,0,0])),b]);
 seg(-.6,.05,.25,.28,0);seg(-.05,.62,.28,.22,1);seg(0,.62,.22,.16,4);seg(0,.62,.16,.11,5);seg(0,.57,.11,.06,6);seg(0,.52,.06,.012,7);
 // scutes along the back
 const sc=[];for(let i=0;i<14;i++){const z=.5-i*.17;for(const s of[-1,1])sc.push([tint(tube([[s*.07,.15,z],[s*.08,.22,z-.02]],{r:t=>lp(.035,.004,t),seg:4,n:2}),dk),z>-.05?0:z>-.6?4:5])}for(const s of sc)P.push(s);
 // head (upper jaw) and lower jaw: long flat snout
 P.push([bake(loft([{y:-.05,rx:.17,rz:.11},{y:.18,rx:.15,rz:.1},{y:.55,rx:.1,rz:.065},{y:.78,rx:.085,rz:.06},{y:.8,rx:.05,rz:.04}],12,2,{col:cc}),mtrs([0,.04,0],[PI/2,0,0])),2]);
 for(const s of[-1,1]){P.push([tint(sphere(6,5,d=>[s*.1+d[0]*.035,.13+d[1]*.03,.1+d[2]*.03],{c:[s*.1,.13,.1]}),[1.2,1,.3]),2]);
  for(let i=0;i<7;i++)P.push([tint(tube([[s*(.085-i*.006),.0,.2+i*.085],[s*(.087-i*.006),-.05,.2+i*.085]],{r:t=>lp(.012,.002,t),seg:4,n:2}),[.95,.93,.85]),2])}
 P.push([bake(loft([{y:0,rx:.15,rz:.05},{y:.5,rx:.09,rz:.04},{y:.75,rx:.075,rz:.035}],10,1,{col:()=>bel}),mtrs([0,-.02,0],[PI/2,0,0])),3]);
 for(let i=0;i<6;i++)for(const s of[-1,1])P.push([tint(tube([[s*(.08-i*.006),.0,.15+i*.09],[s*(.082-i*.006),.05,.15+i*.09]],{r:t=>lp(.011,.002,t),seg:4,n:2}),[.95,.93,.85]),3]);
 // legs: upper along +-x, lower bends down
 for(const[s,u,l]of[[1,8,9],[-1,10,11],[1,12,13],[-1,14,15]]){P.push([tint(tube([[0,0,0],[s*.15,0,0],[s*.29,0,0]],{r:t=>lp(.08,.06,t),seg:7,n:3}),skin),u]);
  P.push([merge([tint(tube([[0,0,0],[0,-.12,0],[0,-.22,.02]],{r:t=>lp(.06,.045,t),seg:7,n:3}),skin),tint(sphere(7,5,d=>[d[0]*.07,-.24+d[1]*.025,.06+d[2]*.09],{c:[0,-.24,.06]}),dk)]),l])}
 const g=rigMerge(P);return{def:crocDef(),geo:geo(g)}}
// ---------- per-character render object (one skinned draw + blob shadow)
// sculpted models are bound in an A-pose (arms out, legs apart): skin matrix = bone world x inverse bind
const HBIND={3:[0,0,.55],6:[0,0,-.55],9:[0,0,.06],12:[0,0,-.06]};
// the Demon Queen is the imported elf body: bound in its own A-pose (measured by tools/sculpt/import_elf.mjs)
const BINDS={king:{3:[0,0,0.365],6:[0,0,-0.365],9:[0,0,-0.032],12:[0,0,0.032]}};
function bindInv(def,bind){const WR=[],WP=[],out=new Float32Array(def.length*12);for(let i=0;i<def.length;i++){const b=def[i],e=bind&&bind[i],R=e?eul(e[0],e[1],e[2]):R3I;
  if(b.p<0){WR[i]=R;WP[i]=[0,0,0]}else{WR[i]=r3m(WR[b.p],R);WP[i]=vadd(WP[b.p],r3v(WR[b.p],b.o))}const m=WR[i],q=i*12;
  out[q]=m[0];out[q+1]=m[3];out[q+2]=m[6];out[q+4]=m[1];out[q+5]=m[4];out[q+6]=m[7];out[q+8]=m[2];out[q+9]=m[5];out[q+10]=m[8];
  out[q+3]=-(m[0]*WP[i][0]+m[3]*WP[i][1]+m[6]*WP[i][2]);out[q+7]=-(m[1]*WP[i][0]+m[4]*WP[i][1]+m[7]*WP[i][2]);out[q+11]=-(m[2]*WP[i][0]+m[5]*WP[i][1]+m[8]*WP[i][2])}return out}
function applyBinv(B,V,n){for(let i=0;i<n;i++){const q=i*12,a=B.slice(q,q+12);for(let r=0;r<3;r++){const o=q+r*4,a0=a[r*4],a1=a[r*4+1],a2=a[r*4+2];
  B[o]=a0*V[q]+a1*V[q+4]+a2*V[q+8];B[o+1]=a0*V[q+1]+a1*V[q+5]+a2*V[q+9];B[o+2]=a0*V[q+2]+a1*V[q+6]+a2*V[q+10];B[o+3]=a0*V[q+3]+a1*V[q+7]+a2*V[q+11]+a[r*4+3]}}}
function sculptGeo(name){const m=MODEL[name];return m?geo({P:m.P,N:m.N,C:m.C,M:m.M,J:m.J,K:m.K,U:m.U,W:m.Wm,I:m.I}):null}
function rigObj(model,o={}){const ob=obj(model.geo,{bones:new Float32Array(MAXB*12),out:model.binv?Math.min(o.out||.012,.006):(o.out||.012),outCol:o.outCol||[.08,.08,.1],shade:.9,pos:[0,0,0],cull:o.cull||140,pbr:model.binv?1:0});
 const sh=obj(WG.shadow,{unlit:1,blend:1,col:[0,0,.03],noOff:0,shade:0,pos:[0,0,0],cull:o.cull||140});sh.alpha=.3;if(model.tex)ob.tex=model.tex;return{ob,sh,def:model.def.map(b=>({p:b.p,o:b.o})),rot:[],binv:model.binv||null}}
function rigDraw(R,x,y,z,yaw,sc,rot,shadowR,extraRoot){const d=R.def;rigFK(d,rot,[x,y,z],yaw,sc,R.ob.bones,extraRoot);if(R.binv)applyBinv(R.ob.bones,R.binv,d.length);R.ob.pos=[x,y,z];R.ob.vis=true;
 R.sh.M=mtrs([x,hAt(x,z)+.06,z],[0,yaw,0]);const s=shadowR*sc;R.sh.M[0]*=s;R.sh.M[2]*=s;R.sh.M[8]*=s*1.3;R.sh.M[10]*=s*1.3;R.sh.pos=[x,0,z];R.sh.vis=true}
function rigHide(R){R.ob.vis=false;R.sh.vis=false}
// humanoid pose from a small parameter set; q fields default 0
function humanPose(q){const r=[];r[0]=eul(q.hipP||0,q.hipY||0,q.roll||0);r[1]=eul(q.spP||0,q.spY||0,q.spR||0);r[2]=eul(q.hdP||0,q.hdY||0,q.hdR||0);
 r[3]=eul(q.LsX||0,q.LsY||0,(q.LsZ||0)+.12);r[4]=eul(q.LeX||0,0,0);r[5]=eul(q.LwX||0,0,0);r[6]=eul(q.RsX||0,q.RsY||0,-(q.RsZ||0)-.12);r[7]=eul(q.ReX||0,0,0);r[8]=eul(q.RwX||0,0,0);
 r[9]=eul(q.LhX||0,0,q.LhZ||0);r[10]=eul(q.LkX||0,0,0);r[11]=eul(q.LfX||0,0,0);r[12]=eul(q.RhX||0,0,-(q.RhZ||0));r[13]=eul(q.RkX||0,0,0);r[14]=eul(q.RfX||0,0,0);r[15]=eul(q.jaw||0,0,0);return r}
// walk/run cycle helper: ph = phase, a = amplitude 0..1, run = 0..1
function gaitPose(q,ph,a,run){const s=Math.sin(ph),c=Math.cos(ph),A=a*(.55+run*.35),B=a*(.9+run*.6);q.LhX=(q.LhX||0)-s*A;q.RhX=(q.RhX||0)+s*A;q.LkX=(q.LkX||0)+.08+Math.max(0,c)*B;q.RkX=(q.RkX||0)+.08+Math.max(0,-c)*B;
 q.LfX=(q.LfX||0)-Math.max(0,-c)*.25*a;q.RfX=(q.RfX||0)-Math.max(0,c)*.25*a;q.LsX=(q.LsX||0)+s*A*.8;q.RsX=(q.RsX||0)-s*A*.8;q.LeX=(q.LeX||0)-.25-run*.9*a;q.ReX=(q.ReX||0)-.25-run*.9*a;
 q.spY=(q.spY||0)+s*.12*a;q.spP=(q.spP||0)+run*.18*a;q.bob=-Math.abs(s)*(.02+run*.04)*a;return q}
function lerpPose(p,q,k){for(const n in q){if(n in p)p[n]+=(q[n]-p[n])*k;else p[n]=q[n]}for(const n in p)if(!(n in q))p[n]+=(0-p[n])*k;return p}
