import json, sys, os, shutil, copy
sys.path.insert(0, '/home/claude/noj-os/tools/video')
import capcut_draft as cd

G = '/mnt/user-data/uploads/Garda Gastrobar - Noviembre/'
R1 = json.load(open(G + 'Timelines/2DEE613C-FC5E-4897-B05E-8ED245AF6E77/draft_content.json', encoding='utf-8'))
meta = json.load(open(G + 'draft_meta_info.json', encoding='utf-8'))
lib = {x['id']: x for x in [g for g in meta['draft_materials'] if g['type'] == 0][0]['value']}
ROOT = 'C:\\Users\\USUARIO\\AppData\\Local\\CapCut\\User Data\\Projects\\com.lveditor.draft'
MOVS = 'C:/Users/USUARIO/Desktop/Garda_Ediciones/_ads/'
MUSICA = 4  # pista de musica del R1 (no se corta)

idx = cd._index(R1['materials'])
pl_pista = R1['tracks'][2]
pl_seg = pl_pista['segments'][1]
pl_mat = idx[pl_seg['material_id']][1]

VERS = {
    'NOJ - Garda Ad Reserva (15s)': dict(keeps=[(0.0, 2.5), (3.133, 12.5), (13.133, 16.267)], fade=1.5,
                                         entra=3.734, sale=7.5, titulo='Garda_Ad_titulo_15s.mov'),
    'NOJ - Garda Ad Reserva (8s)': dict(keeps=[(0.433, 1.7), (1.867, 3.133), (7.5, 10.0), (10.633, 11.267), (13.767, 16.267)],
                                        fade=1.0, entra=2.533, sale=4.4, titulo='Garda_Ad_titulo_8s.mov'),
}
shutil.rmtree('cc_out', ignore_errors=True); os.makedirs('cc_out')
entradas = []
TLS = []; BIB = {}
for nombre, v in VERS.items():
    d = cd.recortar_timeline(R1, v['keeps'], pistas_fijas={MUSICA}, fade_out_s=v['fade'])
    d = cd.resolver_placeholders(d, ROOT + '\\Garda Gastrobar - Noviembre')
    total = d['duration'] / 1e6
    dt = v['sale'] - v['entra'] + 0.45
    cd.agregar_overlay(d, pl_pista, pl_seg, pl_mat, MOVS + v['titulo'], dt, v['entra'], dt, 'Mesa para cuantos')
    cd.agregar_overlay(d, pl_pista, pl_seg, pl_mat, MOVS + 'Garda_Ad_reserva.mov', 25.0, v['entra'], total - v['entra'], 'Reserva aqui')
    # biblioteca de medios: los mismos archivos del proyecto de Garda (para que reconozca los proxies)
    usados = {m.get('local_material_id') for m in d['materials']['videos'] + d['materials']['audios']}
    biblio = [lib[i] for i in usados if i in lib]
    TLS.append(('Ad ' + nombre.split('(')[1].rstrip(')'), d)); BIB.update({b['id']: b for b in biblio})
    ids = {x['id'] for vv in d['materials'].values() if isinstance(vv, list) for x in vv if isinstance(x, dict) and 'id' in x}
    rotas = [r for tr in d['tracks'] for s in tr['segments'] for r in [s['material_id']] + s['extra_material_refs'] if r not in ids]
    print(nombre, 'total', total, 'refs rotas', len(rotas), 'biblio', len(biblio))
    for ti, tr in enumerate(d['tracks']):
        print('  ', ti, tr['type'], tr.get('flag'), [(round(s['target_timerange']['start'] / 1e6, 3), round(sum(s['target_timerange'].values()) / 1e6, 3)) for s in tr['segments']])
NOMBRE = 'NOJ - Garda Ads (R1)'
info = cd.escribir_proyecto_multi('cc_out', NOMBRE, TLS, '/mnt/user-data/uploads/com.lveditor.draft/1008', list(BIB.values()))
mp = os.path.join('cc_out', NOMBRE, 'draft_meta_info.json'); m = json.load(open(mp, encoding='utf-8'))
m['draft_fold_path'] = ROOT.replace('\\', '/') + '/' + NOMBRE; m['draft_root_path'] = ROOT
json.dump(m, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
info['creado'] = m['tm_draft_create']
json.dump([cd.entrada_indice(info, NOMBRE, ROOT)], open('cc_indice.json', 'w', encoding='utf-8'), ensure_ascii=False)
