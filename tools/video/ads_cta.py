# R1 -> versiones para ads con CTA "¿Mesa para cuántos? / Reserva aquí"
import subprocess, sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = '/mnt/user-data/uploads/Desktop/Edits/R1_1080p_sincortinilla.mp4'
FONT = '/tmp/claude-0/-home-claude/6195deb5-f974-585b-9956-2978659447d1/scratchpad/r1ads/fonts/DidactGothic.ttf'
W, H, FPS = 1080, 1920, 30
CREMA = (244, 238, 228)
VINO = (94, 18, 29)

VERSIONES = {
    # (inicio, fin) en segundos del R1; cortes en la reticula del beat (~0.633 s)
    'R1_ads_15s': dict(segs=[(0.0, 2.5), (3.133, 12.5), (13.133, 13.767), (13.767, 16.267)],
                        entra=3.734, sale=7.5, cierre=12.5),
    'R1_ads_8s': dict(segs=[(0.433, 1.700), (1.867, 3.133), (7.5, 8.133), (8.133, 8.733), (8.733, 9.367),
                             (9.367, 10.0), (10.633, 11.267), (13.767, 16.300)],
                       entra=2.533, sale=4.4, cierre=5.7),
}


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


def capa_linea1():
    f = ImageFont.truetype(FONT, 80)
    txt = '¿Mesa para cuántos?'
    bb = f.getbbox(txt)
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    pad = 60
    im = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new('L', im.size, 0)
    ImageDraw.Draw(sh).text((pad - bb[0], pad - bb[1]), txt, font=f, fill=210)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    im = Image.merge('RGBA', (Image.new('L', im.size, 0),) * 3 + (sh,))
    ImageDraw.Draw(im).text((pad - bb[0], pad - bb[1]), txt, font=f, fill=CREMA + (255,))
    return np.array(im).astype(np.float32)


def capa_pill():
    f = ImageFont.truetype(FONT, 40)
    txt = 'RESERVA AQUÍ'
    track = 7
    ws = [f.getlength(c) for c in txt]
    tw = sum(ws) + track * (len(txt) - 1)
    bb = f.getbbox('RESERVAQUÍ')
    th = bb[3] - bb[1]
    pw, ph = int(tw + 2 * 54), 88
    pad = 30
    im = Image.new('RGBA', (pw + 2 * pad, ph + 2 * pad), (0, 0, 0, 0))
    sh = Image.new('L', im.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 6, pad + pw, pad + ph + 6), radius=ph // 2, fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    im = Image.merge('RGBA', (Image.new('L', im.size, 0),) * 3 + (sh,))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((pad, pad, pad + pw, pad + ph), radius=ph // 2, fill=VINO + (235,))
    x = pad + 54
    y = pad + (ph - th) / 2 - bb[1]
    for c, cw in zip(txt, ws):
        d.text((x, y), c, font=f, fill=CREMA + (255,))
        x += cw + track
    return np.array(im).astype(np.float32)


def capa_flecha():
    s = 4
    im = Image.new('RGBA', (60 * s, 40 * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.line([(14 * s, 10 * s), (30 * s, 26 * s), (46 * s, 10 * s)], fill=CREMA + (255,), width=3 * s, joint='curve')
    im = im.resize((60, 40), Image.LANCZOS)
    sh = Image.fromarray(np.array(im)[:, :, 3]).filter(ImageFilter.GaussianBlur(5)).point(lambda v: v * 0.6)
    base = Image.merge('RGBA', (Image.new('L', im.size, 0),) * 3 + (sh,))
    base.alpha_composite(im)
    return np.array(base).astype(np.float32)


L1, PILL, FLECHA = capa_linea1(), capa_pill(), capa_flecha()
Y_L1, Y_PILL, Y_FLECHA = 1050, 1165, 1240
yy, xx = np.mgrid[0:H, 0:W]
BANDA = (np.exp(-((yy - 1085) / 150.0) ** 2) * np.exp(-((xx - W / 2) / 520.0) ** 4)).astype(np.float32)[:, :, None]  # centros; zona segura de Reels: libre y > 1248 (35% inferior) y < 269


def pegar(frame, capa, cx, cy, alpha):
    if alpha <= 0.003:
        return
    h, w = capa.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    reg = frame[y0:y0 + h, x0:x0 + w]
    a = capa[:, :, 3:4] / 255.0 * alpha
    reg[:] = reg * (1 - a) + capa[:, :, :3] * a


A = '/tmp/claude-0/-home-claude/6195deb5-f974-585b-9956-2978659447d1/scratchpad/ads/'
def _capa(f):
    a = np.array(Image.open(A + f).convert('RGBA')).astype(np.float32)
    return a[:, :, :3], a[:, :, 3:4] / 255.0
GRAD, TITLE, CTA = _capa('L_grad.png'), _capa('L_title.png'), _capa('L_cta.png')


def mezclar(frame, capa, alpha, dy=0):
    if alpha <= 0.003:
        return
    rgb, a = capa
    if dy:
        rgb = np.roll(rgb, int(round(dy)), axis=0); a = np.roll(a, int(round(dy)), axis=0)
    aa = a * alpha
    frame[:] = frame * (1 - aa) + rgb * aa


def overlay(frame, t, v):
    # mismo estilo que Garda_Ad1_Reserva (capas de la manana): degradado + titulo + CTA
    te, ts = v['entra'], v['sale']
    if t < te:
        return
    pe = ease((t - te) / 0.6)
    mezclar(frame, GRAD, pe)
    ps = ease((t - ts) / 0.45) if t >= ts else 0.0
    mezclar(frame, TITLE, pe * (1 - ps), dy=18 * (1 - pe) - 60 * ps)
    pc = ease((t - te - 0.15) / 0.6)
    mezclar(frame, CTA, pc, dy=14 * (1 - pc))


def render(nombre, v, out_dir):
    segs = v['segs']
    dur = sum(b - a for a, b in segs)
    # 1) armar el corte (video) + musica continua desde 0 con fade out
    fc = ''.join(f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];' for i, (a, b) in enumerate(segs))
    fc += ''.join(f'[v{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[v];'
    fc += f'[0:a]atrim=0:{dur:.3f},afade=t=out:st={dur - 0.9:.3f}:d=0.9[a]'
    corte = f'{out_dir}/{nombre}_corte.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                    '-r', str(FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '256k', corte], check=True)
    # 2) textos cuadro por cuadro
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', corte, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                           stdout=subprocess.PIPE)
    final = f'{out_dir}/{nombre}.mp4'
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-i', corte, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264',
                            '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                            '-movflags', '+faststart', '-c:a', 'copy', final], stdin=subprocess.PIPE)
    n = 0
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        overlay(fr, n / FPS, v)
        enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        n += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    print(nombre, 'cuadros', n, 'duracion', round(dur, 2))
    return final


if __name__ == '__main__':
    out = sys.argv[1]
    for k in (sys.argv[2:] or VERSIONES):
        render(k, VERSIONES[k], out)
