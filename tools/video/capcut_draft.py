# -*- coding: utf-8 -*-
"""
No'j OS - generador de proyectos de CapCut (escritorio, Windows).

Construye un proyecto NUEVO a partir de:
  - una linea de tiempo de referencia (draft_content.json de un proyecto real) de donde se copian
    las estructuras de clip, capa de ajuste (LUT + color) y musica, para respetar la version de CapCut;
  - un proyecto vacio como esqueleto de carpeta;
  - la lista de tomas elegidas por el motor.
Nunca modifica proyectos existentes. El indice de CapCut (root_meta_info.json) se actualiza aparte,
con respaldo, y solo con CapCut cerrado.
"""
import copy, json, os, time, uuid

US = 1_000_000


def nid():
    u = str(uuid.uuid4()).upper()
    # CapCut usa grupos 4 y 5 en minusculas en algunos ids; ambos formatos funcionan
    p = u.split('-')
    return '-'.join(p[:3] + [p[3].lower(), p[4]])


def _index(mats):
    idx = {}
    for k, v in mats.items():
        if isinstance(v, list):
            for x in v:
                if isinstance(x, dict) and 'id' in x:
                    idx[x['id']] = (k, x)
    return idx


def construir_timeline(ref, tomas, titulo_id=None, musica_inicio_s=0.0, total_s=None, transicion=None):
    """ref: dict de draft_content.json con 1 pista de video, 1 de ajuste y 1 de audio.
    tomas: lista de dict(path, src_in, src_dur, speed, dur, ancho, alto, dur_archivo, lib_id)."""
    d = copy.deepcopy(ref)
    tid = titulo_id or nid()
    d['id'] = tid
    M = d['materials']
    idx = _index(M)
    vtrack = [t for t in d['tracks'] if t['type'] == 'video'][0]
    seg0 = vtrack['segments'][0]
    vmat0 = idx[seg0['material_id']][1]
    extras0 = [idx[r] for r in seg0['extra_material_refs']]
    # quitar el clip de referencia y sus materiales
    quitar = {seg0['material_id']} | set(seg0['extra_material_refs'])
    for k, v in M.items():
        if isinstance(v, list):
            M[k] = [x for x in v if not (isinstance(x, dict) and x.get('id') in quitar)]
    segs = []
    t = 0
    for tm in tomas:
        vm = copy.deepcopy(vmat0)
        vm['id'] = nid()
        vm['path'] = tm['path']
        vm['material_name'] = os.path.basename(tm['path'])
        vm['duration'] = int(tm['dur_archivo'] * US)
        vm['width'], vm['height'] = tm['ancho'], tm['alto']
        vm['unique_id'] = ''
        vm['local_material_id'] = tm.get('lib_id', '')
        for k in ('reverse_path', 'intensifies_path', 'reverse_intensifies_path', 'intensifies_audio_path', 'cartoon_path'):
            if k in vm:
                vm[k] = ''
        if isinstance(vm.get('video_algorithm'), dict) and 'time_range' in vm['video_algorithm']:
            vm['video_algorithm']['time_range'] = {'start': 0, 'duration': vm['duration']}
        M['videos'].append(vm)
        refs = []
        for (k, x) in extras0:
            y = copy.deepcopy(x)
            y['id'] = nid()
            if k == 'speeds':
                y['speed'] = float(tm['speed'])
                y['mode'] = 0
                y['curve_speed'] = None
            M[k].append(y)
            refs.append(y['id'])
        s = copy.deepcopy(seg0)
        s['id'] = nid()
        s['material_id'] = vm['id']
        s['extra_material_refs'] = refs
        s['speed'] = float(tm['speed'])
        s['reverse'] = False
        s['volume'] = 0.0
        s['source_timerange'] = {'start': int(tm['src_in'] * US), 'duration': int(tm['src_dur'] * US)}
        dur = int(round(tm['dur'] * US))
        s['target_timerange'] = {'start': t, 'duration': dur}
        s['keyframe_refs'] = []
        s['clip']['transform'] = {'x': 0.0, 'y': 0.0}
        esc = float(tm.get('escala', 1.0))
        s['clip']['scale'] = {'x': esc, 'y': esc}
        if 'uniform_scale' in s:
            s['uniform_scale'] = {'on': True, 'value': esc}
        if tm.get('transicion_salida') and transicion:
            tr = copy.deepcopy(transicion)
            tr['id'] = nid()
            M.setdefault('transitions', []).append(tr)
            s['extra_material_refs'] = s['extra_material_refs'] + [tr['id']]
        segs.append(s)
        t += dur
    vtrack['segments'] = segs
    total = int(total_s * US) if total_s else t
    for tr in d['tracks']:
        if tr['type'] == 'adjust':
            tr['segments'] = tr['segments'][:1]
            tr['segments'][0]['target_timerange'] = {'start': 0, 'duration': total}
        if tr['type'] == 'audio':
            tr['segments'] = tr['segments'][:1]
            a = tr['segments'][0]
            a['source_timerange'] = {'start': int(musica_inicio_s * US), 'duration': total}
            a['target_timerange'] = {'start': 0, 'duration': total}
    d['duration'] = total
    d['name'] = ''
    return d


def escribir_proyecto(destino_raiz, nombre, timeline, esqueleto_dir, biblioteca=None):
    """Crea la carpeta del proyecto. biblioteca: entradas de draft_materials (tipo 0) para el panel de medios."""
    carpeta = os.path.join(destino_raiz, nombre)
    if os.path.exists(carpeta):
        raise SystemExit('Ya existe un proyecto con ese nombre: ' + carpeta)
    tid = timeline['id']
    did = nid()
    ahora_us = int(time.time() * US)
    root_win = destino_raiz.replace('\\', '/')
    fold = root_win + '/' + nombre

    def cp(rel, dst=None, transform=None):
        src = os.path.join(esqueleto_dir, rel)
        out = os.path.join(carpeta, dst or rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        data = open(src, 'rb').read()
        if transform:
            data = transform(data)
        open(out, 'wb').write(data)

    os.makedirs(carpeta)
    for rel in ('attachment_pc_common.json', 'draft_agency_config.json', 'draft_biz_config.json', 'draft.extra',
                'performance_opt_info.json', 'common_attachment/attachment_id_mapping.json',
                'common_attachment/attachment_pc_timeline.json'):
        cp(rel)
    for sub in ('adjust_mask', 'matting', 'qr_upload', 'smart_crop', 'subdraft', 'Resources/audioAlg',
                'Resources/combination', 'Resources/videoAlg'):
        os.makedirs(os.path.join(carpeta, sub), exist_ok=True)
    contenido = json.dumps(timeline, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(carpeta, 'draft_content.json'), 'w', encoding='utf-8').write(contenido)
    # linea de tiempo
    tl_dir_rel = os.path.join('Timelines', tid)
    sk_tl = [x for x in os.listdir(os.path.join(esqueleto_dir, 'Timelines')) if os.path.isdir(os.path.join(esqueleto_dir, 'Timelines', x))][0]
    for rel in ('attachment_editing.json', 'attachment_pc_common.json', 'draft.extra',
                'common_attachment/attachment_action_scene.json', 'common_attachment/attachment_gen_ai_info.json',
                'common_attachment/attachment_id_mapping.json', 'common_attachment/attachment_pc_timeline.json',
                'common_attachment/attachment_plugin_draft.json', 'common_attachment/attachment_script_video.json',
                'attachment/patch/patch.json'):
        cp(os.path.join('Timelines', sk_tl, rel), os.path.join(tl_dir_rel, rel))
    open(os.path.join(carpeta, tl_dir_rel, 'draft_content.json'), 'w', encoding='utf-8').write(contenido)
    nombre_tl = 'Corte 1'
    pj = {"config": {"color_space": -1, "hdr_vivid": False, "mixed_track_mode_on": False, "render_index_track_mode_on": False,
                     "use_float_render": False}, "create_time": ahora_us, "id": nid(), "main_timeline_id": tid,
          "timelines": [{"create_time": ahora_us, "id": tid, "is_marked_delete": False, "name": nombre_tl, "update_time": ahora_us}],
          "update_time": ahora_us, "version": 0}
    json.dump(pj, open(os.path.join(carpeta, 'Timelines', 'project.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({"dockItems": [{"dockIndex": 0, "ratio": 1, "timelineIds": [tid], "timelineNames": [nombre_tl]}],
               "layoutOrientation": 1}, open(os.path.join(carpeta, 'timeline_layout.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    open(os.path.join(carpeta, 'draft_settings'), 'w', encoding='utf-8').write(
        '[General]\ndraft_create_time=%d\ndraft_last_edit_time=%d\nreal_edit_seconds=0\nreal_edit_keys=0\n' % (ahora_us // US, ahora_us // US))
    meta = json.load(open(os.path.join(esqueleto_dir, 'draft_meta_info.json'), encoding='utf-8'))
    meta.update(draft_id=did, draft_name=nombre, draft_fold_path=fold, draft_root_path=destino_raiz,
                tm_draft_create=ahora_us, tm_draft_modified=ahora_us, tm_duration=timeline['duration'],
                draft_cover='', draft_timeline_materials_size_=0)
    if biblioteca is not None:
        for grp in meta['draft_materials']:
            if grp['type'] == 0:
                grp['value'] = biblioteca
    json.dump(meta, open(os.path.join(carpeta, 'draft_meta_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    vs = {"draft_materials": [], "draft_virtual_store": [
        {"type": 0, "value": [{"creation_time": 0, "display_name": "", "filter_type": 0, "id": "", "import_time": 0, "import_time_us": 0,
                               "material_color_tag": "", "sort_sub_type": 0, "sort_type": 0, "subdraft_filter_type": 0}]},
        {"type": 1, "value": [{"child_id": b['id'], "parent_id": ""} for b in (biblioteca or [])]}, {"type": 2, "value": []}]}
    json.dump(vs, open(os.path.join(carpeta, 'draft_virtual_store.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    return dict(carpeta=carpeta, draft_id=did, fold=fold, json_file=fold + '\\draft_content.json', timeline_id=tid,
                duracion=timeline['duration'], creado=ahora_us)


def entrada_indice(info, nombre, root):
    """Registro para root_meta_info.json (mismo formato que los proyectos existentes)."""
    root_w = root.replace('\\', '/')
    return {"cloud_draft_cover": False, "cloud_draft_sync": False, "draft_cloud_last_action_download": False,
            "draft_cloud_purchase_info": "", "draft_cloud_template_id": "", "draft_cloud_tutorial_info": "",
            "draft_cloud_videocut_purchase_info": "", "draft_cover": root_w + '/' + nombre + '\\draft_cover.jpg',
            "draft_fold_path": root_w + '/' + nombre, "draft_id": info['draft_id'], "draft_is_ai_shorts": False,
            "draft_is_cloud_temp_draft": False, "draft_is_infinite_canvas_draft": False, "draft_is_invisible": False,
            "draft_is_pippit_draft": False, "draft_is_web_article_video": False,
            "draft_json_file": root_w + '/' + nombre + '\\draft_content.json', "draft_name": nombre,
            "draft_new_version": "", "draft_root_path": root_w, "draft_timeline_materials_size": 0, "draft_type": "",
            "draft_web_article_video_enter_from": "", "pippit_avatar_url": "", "pippit_extra_info": "", "pippit_id": "",
            "pippit_user_name": "", "streaming_edit_draft_ready": True, "tm_draft_cloud_completed": "",
            "tm_draft_cloud_entry_id": -1, "tm_draft_cloud_modified": 0, "tm_draft_cloud_parent_entry_id": -1,
            "tm_draft_cloud_space_id": -1, "tm_draft_cloud_user_id": -1, "tm_draft_create": info['creado'],
            "tm_draft_modified": info['creado'], "tm_draft_removed": 0, "tm_duration": info['duracion']}


def _dup_refs(M, idx, refs):
    nuevos = []
    for r in refs:
        if r not in idx:
            continue
        k, x = idx[r]
        y = copy.deepcopy(x)
        y['id'] = nid()
        M[k].append(y)
        idx[y['id']] = (k, y)
        nuevos.append(y['id'])
    return nuevos


def recortar_timeline(ref, keeps_s, pistas_fijas=(), fade_out_s=None):
    """Version corta de una linea de tiempo real (ripple): conserva solo los rangos keeps_s=[(a,b), ...]
    (segundos de la linea original) y los junta. Las pistas en pistas_fijas (p. ej. la musica) no se cortan:
    arrancan en 0 y se ajustan a la nueva duracion, con desvanecido final opcional."""
    d = copy.deepcopy(ref)
    d['id'] = nid()
    M = d['materials']
    idx = _index(M)
    keeps, off = [], 0
    for a, b in keeps_s:
        A, B = int(round(a * US)), int(round(b * US))
        keeps.append((A, B, off))
        off += B - A
    total = off
    trans_ids = {x['id'] for x in M.get('transitions', [])}
    for ti, tr in enumerate(d['tracks']):
        if ti in pistas_fijas:
            for s in tr['segments'][:1]:
                sp = float(s.get('speed', 1.0))
                s['target_timerange'] = {'start': 0, 'duration': total}
                if s.get('source_timerange'):
                    s['source_timerange']['duration'] = int(round(total * sp))
                if fade_out_s is not None:
                    for r in s['extra_material_refs']:
                        if r in idx and idx[r][0] == 'audio_fades':
                            idx[r][1]['fade_out_duration'] = int(fade_out_s * US)
            tr['segments'] = tr['segments'][:1]
            continue
        nuevos, huerfanas = [], []
        for s in tr['segments']:
            S0 = s['target_timerange']['start']
            E0 = S0 + s['target_timerange']['duration']
            sp = float(s.get('speed', 1.0) or 1.0)
            tr_refs = [r for r in s['extra_material_refs'] if r in trans_ids]
            piezas = []
            for A, B, o in keeps:
                lo, hi = max(S0, A), min(E0, B)
                if hi - lo > 20000:
                    piezas.append((lo, hi, o + lo - A))
            if not piezas and tr_refs:
                huerfanas.append((S0, tr_refs))
            for n, (lo, hi, nstart) in enumerate(piezas):
                p = copy.deepcopy(s)
                base_refs = [r for r in s['extra_material_refs'] if r not in trans_ids]
                if n > 0:
                    p['id'] = nid()
                    base_refs = _dup_refs(M, idx, base_refs)
                p['extra_material_refs'] = base_refs + (tr_refs if hi == E0 else [])
                p['target_timerange'] = {'start': nstart, 'duration': hi - lo}
                if s.get('source_timerange'):
                    st = s['source_timerange']['start']
                    p['source_timerange'] = {'start': int(round(st + (lo - S0) * sp)),
                                             'duration': int(round((hi - lo) * sp))}
                p['_old_hi'] = hi
                nuevos.append(p)
        # una transicion cuyo clip se quito pasa al ultimo clip que termina en ese corte
        for S0, refs in huerfanas:
            cand = [p for p in nuevos if p['_old_hi'] <= S0 and any(p['_old_hi'] == B for _, B, _ in keeps)]
            if cand:
                c = max(cand, key=lambda p: p['_old_hi'])
                if not any(r in trans_ids for r in c['extra_material_refs']):
                    c['extra_material_refs'] += refs
        for p in nuevos:
            p.pop('_old_hi', None)
        tr['segments'] = sorted(nuevos, key=lambda p: p['target_timerange']['start'])
    d['duration'] = total
    return d


def agregar_overlay(d, plantilla_pista, plantilla_seg, plantilla_mat, path, dur_archivo_s, inicio_s, dur_s, nombre_pista=''):
    """Agrega una pista de video superpuesta (encima de todo) con un clip con transparencia (p. ej. ProRes 4444)."""
    M = d['materials']
    idx = _index(M)
    vm = copy.deepcopy(plantilla_mat)
    vm.update(id=nid(), path=path, material_name=os.path.basename(path), duration=int(dur_archivo_s * US),
              width=1080, height=1920, unique_id='', local_material_id='', has_audio=False)
    for k in ('reverse_path', 'intensifies_path', 'reverse_intensifies_path', 'intensifies_audio_path', 'cartoon_path', 'media_path'):
        if k in vm:
            vm[k] = ''
    if isinstance(vm.get('video_algorithm'), dict):
        vm['video_algorithm'].update(algorithms=[], path='', time_range=None)
    if isinstance(vm.get('stable'), dict):  # sin estabilizacion: deformaria el texto
        vm['stable'] = {'stable_level': 0, 'matrix_path': '', 'time_range': {'start': 0, 'duration': 0}}
    M['videos'].append(vm)
    s = copy.deepcopy(plantilla_seg)
    s['id'] = nid()
    s['material_id'] = vm['id']
    refs = _dup_refs(M, idx, [r for r in plantilla_seg['extra_material_refs'] if idx.get(r, ('',))[0] != 'transitions'])
    for r in refs:
        k, x = idx[r]
        if k == 'speeds':
            x.update(speed=1.0, mode=0, curve_speed=None)
    s['extra_material_refs'] = refs
    s.update(speed=1.0, volume=0.0, reverse=False, keyframe_refs=[], common_keyframes=[])
    s['source_timerange'] = {'start': 0, 'duration': int(round(dur_s * US))}
    s['target_timerange'] = {'start': int(round(inicio_s * US)), 'duration': int(round(dur_s * US))}
    s['clip'].update(scale={'x': 1.0, 'y': 1.0}, rotation=0.0, transform={'x': 0.0, 'y': 0.0}, alpha=1.0)
    if 'uniform_scale' in s:
        s['uniform_scale'] = {'on': True, 'value': 1.0}
    ri = max([x.get('render_index', 0) for t in d['tracks'] for x in t['segments']] + [0]) + 1
    s['render_index'] = ri
    pista = copy.deepcopy(plantilla_pista)
    pista['id'] = nid()
    pista['segments'] = [s]
    if 'name' in pista:
        pista['name'] = nombre_pista
    pos = next((i for i, t in enumerate(d['tracks']) if t['type'] == 'audio'), len(d['tracks']))
    d['tracks'].insert(pos, pista)
    for i, t in enumerate(d['tracks']):
        for x in t['segments']:
            if 'track_render_index' in x:
                x['track_render_index'] = i
    return d


def escribir_proyecto_multi(destino_raiz, nombre, timelines, esqueleto_dir, biblioteca=None):
    """Proyecto con varias lineas de tiempo (versiones del mismo video). timelines: [(nombre_tl, timeline_dict), ...];
    la primera es la principal."""
    (n0, t0), resto = timelines[0], timelines[1:]
    info = escribir_proyecto(destino_raiz, nombre, t0, esqueleto_dir, biblioteca)
    carpeta = info['carpeta']
    sk_tl = [x for x in os.listdir(os.path.join(esqueleto_dir, 'Timelines')) if os.path.isdir(os.path.join(esqueleto_dir, 'Timelines', x))][0]
    pj_path = os.path.join(carpeta, 'Timelines', 'project.json')
    pj = json.load(open(pj_path, encoding='utf-8'))
    pj['timelines'][0]['name'] = n0
    ahora_us = int(time.time() * US)
    for n, t in resto:
        tl_dir = os.path.join(carpeta, 'Timelines', t['id'])
        for rel in ('attachment_editing.json', 'attachment_pc_common.json', 'draft.extra',
                    'common_attachment/attachment_action_scene.json', 'common_attachment/attachment_gen_ai_info.json',
                    'common_attachment/attachment_id_mapping.json', 'common_attachment/attachment_pc_timeline.json',
                    'common_attachment/attachment_plugin_draft.json', 'common_attachment/attachment_script_video.json',
                    'attachment/patch/patch.json'):
            src = os.path.join(esqueleto_dir, 'Timelines', sk_tl, rel)
            out = os.path.join(tl_dir, rel)
            os.makedirs(os.path.dirname(out), exist_ok=True)
            open(out, 'wb').write(open(src, 'rb').read())
        open(os.path.join(tl_dir, 'draft_content.json'), 'w', encoding='utf-8').write(
            json.dumps(t, ensure_ascii=False, separators=(',', ':')))
        pj['timelines'].append({"create_time": ahora_us, "id": t['id'], "is_marked_delete": False, "name": n, "update_time": ahora_us})
    json.dump(pj, open(pj_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({"dockItems": [{"dockIndex": 0, "ratio": 1, "timelineIds": [x['id'] for x in pj['timelines']],
                              "timelineNames": [x['name'] for x in pj['timelines']]}], "layoutOrientation": 1},
              open(os.path.join(carpeta, 'timeline_layout.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    return info


def resolver_placeholders(d, carpeta_origen):
    """Los recursos internos de CapCut (clips en reversa, color match, audio limpio) usan una ruta relativa al proyecto
    de origen; al copiar la linea de tiempo a otro proyecto se apuntan con ruta absoluta al original."""
    import re
    txt = json.dumps(d, ensure_ascii=False)
    base = carpeta_origen.replace('\\', '/')
    txt = re.sub(r'##_draftpath_placeholder_[0-9A-Fa-f-]+_##', lambda m: base, txt)
    return json.loads(txt)
