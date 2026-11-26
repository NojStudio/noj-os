# Overlays ProRes 4444 (con transparencia) para CapCut, mismo estilo que Garda_Ad1_Reserva
import subprocess, numpy as np, sys
from PIL import Image
A = '/tmp/claude-0/-home-claude/6195deb5-f974-585b-9956-2978659447d1/scratchpad/ads/'
W, H, FPS = 1080, 1920, 30


def capa(f):
    return np.array(Image.open(A + f).convert('RGBA')).astype(np.float32) / 255.0


GRAD, TITLE, CTA = capa('L_grad.png'), capa('L_title.png'), capa('L_cta.png')


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


def sobre(dst, src, alpha, dy=0):
    """composicion 'over' en premultiplicado: dst y src RGBA 0..1 (no premult)"""
    if alpha <= 0.002:
        return dst
    if dy:
        src = np.roll(src, int(round(dy)), axis=0)
    a = src[:, :, 3:4] * alpha
    da = dst[:, :, 3:4]
    oa = a + da * (1 - a)
    rgb = (src[:, :, :3] * a + dst[:, :, :3] * da * (1 - a)) / np.maximum(oa, 1e-6)
    return np.concatenate([rgb, oa], axis=2)


def escribir(path, frames_fn, n):
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '4444',
                            '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', '-vendor', 'apl0', path],
                           stdin=subprocess.PIPE)
    cache = {}
    for i in range(n):
        key, fr = frames_fn(i / FPS)
        if key is not None and key in cache:
            b = cache[key]
        else:
            b = (np.clip(fr, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes()
            if key is not None:
                cache[key] = b
        enc.stdin.write(b)
    enc.stdin.close(); enc.wait()
    print(path, n, 'cuadros')


def titulo(dur):
    """'¿Mesa para cuántos?': entra (0.6 s) y sale volando al final (0.45 s)"""
    def f(t):
        pe = ease(t / 0.6)
        ps = ease((t - (dur - 0.45)) / 0.45) if t >= dur - 0.45 else 0.0
        if 0.6 <= t < dur - 0.45:
            key = 'hold'
        else:
            key = None
        fr = np.zeros((H, W, 4), np.float32)
        return key, sobre(fr, TITLE, pe * (1 - ps), dy=18 * (1 - pe) - 60 * ps)
    return f


def cta():
    """degradado + 'RESERVA AQUÍ': entra y se queda"""
    def f(t):
        pe = ease(t / 0.6)
        pc = ease((t - 0.15) / 0.6)
        key = 'hold' if t >= 0.75 else None
        fr = np.zeros((H, W, 4), np.float32)
        fr = sobre(fr, GRAD, pe)
        fr = sobre(fr, CTA, pc, dy=14 * (1 - pc))
        return key, fr
    return f


if __name__ == '__main__':
    out = sys.argv[1]
    escribir(f'{out}/Garda_Ad_titulo_15s.mov', titulo(3.766 + 0.45), int(round((3.766 + 0.45) * FPS)))
    escribir(f'{out}/Garda_Ad_titulo_8s.mov', titulo(1.867 + 0.45), int(round((1.867 + 0.45) * FPS)))
    escribir(f'{out}/Garda_Ad_reserva.mov', cta(), 25 * FPS)
