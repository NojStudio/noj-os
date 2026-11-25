# Genera previews del banco de media y la migración 0006 a partir del análisis de No'j Motor.
import json, os, sys
from PIL import Image
UP = '/mnt/user-data/uploads/Desktop'
OUT = '/home/claude/noj-os/public/_bank/garda'
os.makedirs(OUT, exist_ok=True)
listing = json.load(open(sys.argv[1]))  # listado de CLIP (tamaños)
sizes = {e['name']: e.get('size') for e in listing['entries']}
SHOOTS = {
  'Garda': ('Garda', 'Levantamiento día · 10 nov 2026', 'C:\\Users\\USUARIO\\Desktop\\Garda'),
  'CLIP': ('CLIP', None, 'C:\\Users\\USUARIO\\Desktop\\CLIP'),
}
def q(v):
  if v is None: return 'NULL'
  if isinstance(v, (int, float)): return str(v)
  return "'" + str(v).replace("'", "''") + "'"
def thumb(src, dst):
  im = Image.open(src).convert('RGB'); cell = im.crop((0, 22, 480, 268))
  g = cell.convert('L'); w, h = g.size; px = g.load()
  cols = [x for x in range(w) if sum(px[x, y] > 14 for y in range(0, h, 3)) > h / 3 * 0.6]
  rows = [y for y in range(h) if sum(px[x, y] > 14 for x in range(0, w, 3)) > w / 3 * 0.3]
  if cols and rows: cell = cell.crop((cols[0], rows[0], cols[-1] + 1, rows[-1] + 1))
  cell.save(dst, quality=82)
rows = []
for folder in ['Garda', 'CLIP']:
  data = json.load(open(f'{UP}/{folder}/_stock/analisis.json'))
  for e in data:
    src = e['source']; num = src.split('.')[0]
    st = e.get('shot_time')
    if folder == 'Garda': shoot = 'Levantamiento día · 10 nov 2026'
    elif st: shoot = 'Levantamiento tarde · 13 nov 2026'
    else: shoot = 'Levantamiento noche · 19 nov 2026'
    clips = e.get('clips', [])
    sheets = []
    for c in clips:
      hp = f"{UP}/{folder}/_stock/hojas/{c['id']}.jpg"
      if os.path.exists(hp):
        Image.open(hp).convert('RGB').save(f"{OUT}/{c['id']}.jpg", quality=72)
        sheets.append(c['id'])
    if sheets: thumb(f"{UP}/{folder}/_stock/hojas/{sheets[0]}.jpg", f"{OUT}/{sheets[0]}_t.jpg")
    rot = e.get('rotation'); w, h = e.get('width'), e.get('height')
    orient = None if w is None else ('vertical' if rot in (90, -90, 270) else 'horizontal')
    if e.get('error'): status = 'sin_escanear'
    elif clips: status = 'buena'
    else: status = 'descartada'
    reason = '; '.join(d.get('reason', '') for d in e.get('discarded', []) if d.get('reason')) or None
    best = max((c['score'] for c in clips), default=None)
    cl = [{k: c[k] for k in ('id', 'start', 'end', 'score') if k in c} for c in clips]
    rows.append(dict(id=f"bk_gar_{num}", file_name=src, folder=SHOOTS[folder][2], shoot=shoot, status=status, note=reason,
      taken_at=st, duration=e.get('duration'), width=w, height=h, fps=e.get('fps'), camera=e.get('model'), profile=e.get('color_profile'),
      rotation=rot, orientation=orient, clips=json.dumps(cl) if cl else None, best_score=best,
      preview=(f"garda/{sheets[0]}_t.jpg" if sheets else None), sheets=json.dumps([f"garda/{s}.jpg" for s in sheets]) if sheets else None,
      size=sizes.get(src) if folder == 'CLIP' else None))
cols = ['id', 'file_name', 'folder', 'shoot', 'status', 'note', 'taken_at', 'duration', 'width', 'height', 'fps', 'camera', 'profile', 'rotation', 'orientation', 'clips', 'best_score', 'preview', 'sheets', 'size']
sql = ["-- Banco de media: material de Garda indexado por No'j Motor (video de Luis en la Surface).",
"""CREATE TABLE IF NOT EXISTS bank_items (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  client_id    TEXT REFERENCES clients(id),
  owner        TEXT REFERENCES members(id),
  device       TEXT NOT NULL DEFAULT '',
  kind         TEXT NOT NULL DEFAULT 'video',
  shoot        TEXT NOT NULL DEFAULT '',
  file_name    TEXT NOT NULL,
  folder       TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'buena',   -- buena | descartada | sin_escanear
  note         TEXT,
  taken_at     TEXT,
  duration     REAL, width INTEGER, height INTEGER, fps TEXT, camera TEXT, profile TEXT, rotation INTEGER, orientation TEXT,
  size         INTEGER,
  clips        TEXT,          -- JSON [{id,start,end,score}]
  best_score   REAL,
  preview      TEXT,          -- llave en public/_bank
  sheets       TEXT,          -- JSON de hojas de contacto
  tags         TEXT,          -- JSON de etiquetas (IA o equipo)
  description  TEXT,
  people       INTEGER,
  moment       TEXT,
  fav          INTEGER NOT NULL DEFAULT 0,
  tagged_at    TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);""",
"CREATE INDEX IF NOT EXISTS idx_bank_ws ON bank_items(workspace_id, client_id, shoot);",
"ALTER TABLE clients ADD COLUMN brand_kit TEXT;",
"ALTER TABLE posts ADD COLUMN design TEXT;",
"INSERT OR IGNORE INTO workspace_agents (workspace_id, agent_id, enabled) VALUES ('ws_noj','slides',1);",
"INSERT OR IGNORE INTO workspace_agents (workspace_id, agent_id, enabled) VALUES ('ws_noj','etiquetas',1);"]
for r in rows:
  sql.append(f"INSERT OR IGNORE INTO bank_items (workspace_id, client_id, owner, device, kind, {', '.join(cols)}) VALUES ('ws_noj','c_garda','m_luis','Surface','video', " + ', '.join(q(r[c]) for c in cols) + ');')
open('/home/claude/noj-os/migrations/0006_banco_y_slides.sql', 'w').write('\n'.join(sql) + '\n')
import collections
print(len(rows), collections.Counter((r['shoot'], r['status']) for r in rows))
