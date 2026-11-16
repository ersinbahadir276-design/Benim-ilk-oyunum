// ===================== canonical humanoid skeleton built from measured proportions =====================
// Only the PROPORTIONS of the user's rigs are used (data/rigs.js). Every character is laid out here in our own
// T-pose (faces +z, left = +x, arms along +-x, legs straight down), with the bone names the pose code expects.
// Returns {bones:[{n,p,r}], hum:{humanName:index}} - r = rest position in model space (meters).
function makeHumanRig(L){const B=[],hum={},add=(n,p,r,h)=>{B.push({n,p,r});const i=B.length-1;if(h)hum[h]=i;return i};
 const hipY=L.hipY,spY=hipY+L.spine,chY=spY+L.chest,ucY=chY+L.uc,nkY=L.neckY,hdY=nkY+L.head;
 const root=add('Root',-1,[0,0,0]),hips=add('Hips',root,[0,hipY,0],'hips'),spine=add('Spine',hips,[0,spY,0],'spine'),chest=add('Chest',spine,[0,chY,0],'chest'),
  uc=add('UpperChest',chest,[0,ucY,0],'upperChest'),neck=add('Neck',uc,[0,nkY,0],'neck'),head=add('Head',neck,[0,hdY,0],'head');
 add('LeftEye',head,[.035,hdY+L.eyeY,L.eyeZ],'leftEye');add('RightEye',head,[-.035,hdY+L.eyeY,L.eyeZ],'rightEye');
 for(const[s,S]of[[1,'left'],[-1,'right']]){const y=L.shY,x0=L.shX,x1=x0+L.ua,x2=x1+L.la;
  const sh=add(S+'Shoulder',uc,[s*L.clavX,y-.01,0],S+'Shoulder'),ua=add(S+'UpperArm',sh,[s*x0,y,0],S+'UpperArm'),la=add(S+'LowerArm',ua,[s*x1,y,0],S+'LowerArm'),hd=add(S+'Hand',la,[s*x2,y,0],S+'Hand');
  // fingers spread front to back along z (palm down in the T-pose); segment lengths from the measured rig
  for(const[F,z]of[['Index',L.fz[0]],['Middle',L.fz[1]],['Ring',L.fz[2]],['Little',L.fz[3]]]){const seg=L.fing[F];let x=x2+seg[0],p=hd;
   for(const[k,n]of[[1,'Proximal'],[2,'Intermediate'],[3,'Distal']]){p=add(S+F+n,p,[s*x,y-.004,z],S+F+n);x+=seg[k]||seg[seg.length-1]*.8}}
  let p=hd;const T=L.fing.Thumb;let tx=x2+T[0]*.45,tz=T[0]*.55;for(const[k,n]of[[1,'Proximal'],[2,'Intermediate'],[3,'Distal']]){p=add(S+'Thumb'+n,p,[s*tx,y-.012,tz],S+'Thumb'+n);tx+=(T[k]||T[1]*.8)*.6;tz+=(T[k]||T[1]*.8)*.8}
  const ul=add(S+'UpperLeg',hips,[s*L.legX,L.legY,0],S+'UpperLeg'),ll=add(S+'LowerLeg',ul,[s*L.legX,L.legY-L.thigh,0],S+'LowerLeg'),
   ft=add(S+'Foot',ll,[s*L.legX,L.legY-L.thigh-L.shin,0],S+'Foot');add(S+'Toes',ft,[s*L.legX,.035,L.foot],S+'Toes')}
 return{bones:B,hum}}
// hero proportions from berserk_armor.glb (heights are absolute, the rig is ~2 m tall); extra values chosen by us
function heroProportions(){const R=RIGS.hero,ankle=.095,legY=R.thigh+R.shin+ankle,hipY=legY+.02;
 const f=R.fingerSeg,b=R.fingerBase,fz=[.036,.012,-.012,-.034];
 return{hipY,spine:R.spine,chest:R.chest,uc:.08,neckY:hipY+(R.neckY-R.hips),head:R.head,eyeY:.07,eyeZ:.1,shY:hipY+(R.shoulderY-R.hips),shX:R.shoulderX,clavX:.06,ua:R.upperArm,la:R.lowerArm,
  fing:{Index:[b.Indice*.88,f.Indice[0],f.Indice[1]],Middle:[b.Corazon*.9,f.Corazon[0],f.Corazon[1]],Ring:[b.Anular*.88,f.Anular[0],f.Anular[1]],Little:[b.Menique*.82,f.Menique[0],f.Menique[1]],Thumb:[b.Pulgar*.7,f.Pulgar[0],f.Pulgar[0]*.75]},
  fz,legX:R.legX,legY,thigh:R.thigh,shin:R.shin,foot:R.foot*.82}}
// Veyra: kawaiope proportions where they are precise enough, our anime defaults elsewhere (1.62 m)
function veyraProportions(){const R=RIGS.veyra,hipY=.94,legX=.085;
 return{hipY,spine:.11,chest:.12,uc:.09,neckY:1.38,head:.07,eyeY:.06,eyeZ:.085,shY:1.32,shX:.17,clavX:.04,ua:R.upperArm*1.15,la:R.lowerArm*1.1,
  fing:{Index:[.07,.026,.02],Middle:[.072,.029,.022],Ring:[.07,.027,.02],Little:[.066,.02,.016],Thumb:[.04,.028,.022]},fz:[.022,.007,-.008,-.022],
  legX,legY:.9,thigh:.41,shin:.42,foot:.13}}
