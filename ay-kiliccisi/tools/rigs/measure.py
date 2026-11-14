#!/usr/bin/env python3
"""Kullanıcının GLB modellerinden YALNIZCA iskelet oranlarını ölçer (kemik uzunlukları, genişlikler).
Görünüş (mesh, doku) alınmaz; oyun karakterleri bu oranlarla kendi T-pozu iskeletimizde sıfırdan modellenir.
Girdi: tools/rigs/rig_*.json (GLB bağlama pozundaki eklem konumları). Çıktı: data/rigs.js"""
import json, math, pathlib
here = pathlib.Path(__file__).resolve().parent
def load(n):
    d = json.load(open(here / f'rig_{n}.json'))
    return {b['n'].rsplit('_', 1)[0]: b['r'] for b in d['bones']}
D = lambda a, b: math.dist(a, b)
out = {}
# --- berserk_armor: Z yukarı, -Y ileri, sol +X
b = load('berserk_armor')
up = lambda p: p[2]
out['hero'] = dict(src='berserk_armor.glb (Angy97, CC BY 4.0) — yalnızca iskelet oranları',
  hips=up(b['Cadera']), spine=up(b['Abdomen'])-up(b['Cadera']), chest=up(b['Torso'])-up(b['Abdomen']), neckY=up(b['Cuello']), head=up(b['Cabeza'])-up(b['Cuello']),
  shoulderX=b['BrazoL'][0], shoulderY=up(b['BrazoL']), upperArm=D(b['BrazoL'], b['AntebrazoL']), lowerArm=D(b['AntebrazoL'], b['ManoL']),
  fingerBase={k: D(b['ManoL'], b[k+'L']) for k in ['Indice','Corazon','Anular','Menique','Pulgar']},
  fingerSeg={k: [D(b[k+'L'], b[k+'L001'])] + ([D(b[k+'L001'], b[k+'L002'])] if k+'L002' in b else []) for k in ['Indice','Corazon','Anular','Menique','Pulgar']},
  legX=b['PiernaL'][0], legY=up(b['PiernaL']), thigh=D(b['PiernaL'], b['RodillaL']), shin=D(b['RodillaL'], b['PieL']), ankle=up(b['PieL']), foot=D(b['PieL'], b['Pie2L']))
# --- kawaiope: Y yukarı, ölçek çok küçük -> boya göre normalize
k = load('kawaiope'); y = lambda p: p[1]
top = y(k['Head']); ground = y(k['LeftToeBase']); H = (top - ground) * 1.12
s = 1.62 / H
out['veyra'] = dict(src='kawaiope.glb (chained_tan, CC BY 4.0) — yalnızca iskelet oranları; görünüş kendi tasarımımız',
  scale=s, hips=(y(k['Hips'])-ground)*s, spine=(y(k['Spine'])-y(k['Hips']))*s, chest=(y(k['Chest'])-y(k['Spine']))*s, neckY=(y(k['Neck'])-ground)*s, head=(y(k['Head'])-y(k['Neck']))*s,
  shoulderX=k['LeftArm'][0]*s, shoulderY=(y(k['LeftArm'])-ground)*s, upperArm=D(k['LeftArm'], k['LeftForeArm'])*s, lowerArm=D(k['LeftForeArm'], k['LeftHand'])*s,
  fingerBase={n: D(k['LeftHand'], k['LeftHand'+n+'1'])*s for n in ['Index','Middle','Ring','Pinky','Thumb']},
  legX=k['LeftUpLeg'][0]*s, legY=(y(k['LeftUpLeg'])-ground)*s, thigh=D(k['LeftUpLeg'], k['LeftLeg'])*s, shin=D(k['LeftLeg'], k['LeftFoot'])*s, ankle=(y(k['LeftFoot'])-ground)*s, foot=D(k['LeftFoot'], k['LeftToeBase'])*s,
  hairChain=len([n for n in k if n.startswith('hair')]), skirtChains=len([n for n in k if n.startswith('skirt')]), capeChain=len([n for n in k if n.startswith('cape')]))
# --- aldrich: Şeytan Kral için oranlar (gövde/kol/kuyruk zinciri sayısı)
a = load('aldrich_devourer_of_gods')
out['king'] = dict(src='aldrich_devourer_of_gods.glb (9S, CC BY 4.0) — yalnızca iskelet oranları',
  upperArm=D(a['R_Arm1'], a['R_Arm2']), lowerArm=D(a['R_Arm2'], a['R_Arm_Hand']), torso=D(a['Spine01'], a['Neck1']), neck=D(a['Neck1'], a['Head']),
  tailBones=len([n for n in a if n.startswith('tail')]))
for v in out.values():
    for kk, vv in list(v.items()):
        if isinstance(vv, float): v[kk] = round(vv, 4)
        if isinstance(vv, dict): v[kk] = {a: (round(b, 4) if isinstance(b, float) else [round(x, 4) for x in b]) for a, b in vv.items()}
txt = '// Kullanıcının modellerinden ölçülen iskelet oranları (tools/rigs/measure.py). Görünüş alınmadı.\nconst RIGS=' + json.dumps(out, ensure_ascii=False) + ';\n'
(here.parent.parent / 'data' / 'rigs.js').write_text(txt, encoding='utf-8')
print(json.dumps(out, ensure_ascii=False, indent=1))
