"""Encode the licensed Pexels clips (research/video-raw, see docs/STATUS.md) for the web. Usage: build_video.py <project root>"""
import os, subprocess, sys
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
root = sys.argv[1]
raw = os.path.join(root, 'research/video-raw')
out = os.path.join(root, 'public/video'); os.makedirs(out, exist_ok=True)
img = os.path.join(root, 'public/images'); os.makedirs(img, exist_ok=True)
# Soft "blush" grade: lifted shadows, a little less saturation, warm-pink mids.
SOFT = 'eq=brightness=0.02:contrast=0.96:saturation=0.85,colorbalance=rm=0.03:bm=0.01:rh=0.02'
def run(*a):
    r = subprocess.run([FF, '-y', '-loglevel', 'error', *a], capture_output=True, text=True)
    if r.returncode: print(r.stderr[-800:]); raise SystemExit(1)
enc = ['-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-movflags', '+faststart', '-profile:v', 'high']
def boomerang(chain, seconds, start=0):
    return f"[0:v]trim={start}:{start + seconds},setpts=PTS-STARTPTS,fps=30,{chain},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]"
def clip(src, name, w, h, seconds, start, crf, rate, crop='', grade=SOFT, speed=1.0):
    chain = (crop + ',' if crop else '') + f'scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},{grade}'
    if speed != 1.0: chain = f'setpts={1/speed}*PTS,' + chain
    run('-i', src, '-filter_complex', boomerang(chain, seconds, start), '-map', '[v]', *enc, '-crf', str(crf), '-maxrate', rate, '-bufsize', rate.replace('M', '') + 'M', os.path.join(out, name + '.mp4'))
    run('-ss', str(start), '-i', src, '-frames:v', '1', '-vf', chain, '-q:v', '82', os.path.join(img, name + '-poster.webp'))
src = lambda i: os.path.join(raw, f'{i}.mp4')
clip(src(7234935), 'hero', 1920, 1080, 8, 0.5, 24, '5M')
clip(src(7234935), 'hero-mobile', 720, 1280, 8, 0.5, 26, '2.5M', crop='crop=ih*9/16:ih:iw*0.5-ih*9/32:0')
clip(src(6611904), 'drops', 1600, 900, 7, 1, 26, '3M', grade='eq=saturation=0.8:brightness=0.02')
clip(src(7233561), 'satin', 1600, 900, 8, 0, 26, '3M', grade='eq=saturation=0.75:brightness=0.03,colorbalance=rm=0.04:bm=0.03')
clip(src(9697874), 'ritual', 1080, 1350, 8, 1, 26, '3M', crop='crop=ih*0.8:ih:iw*0.5-ih*0.4:0')
for f in sorted(os.listdir(out)):
    print(f, round(os.path.getsize(os.path.join(out, f)) / 1048576, 2), 'MB')
