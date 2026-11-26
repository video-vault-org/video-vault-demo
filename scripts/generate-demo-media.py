"""Optional asset regeneration: Python + Pillow + ffmpeg. Not needed for npm builds.
All scenes are procedural illustrations; no private or third-party recordings are used.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess

root = Path(__file__).resolve().parent.parent / 'public' / 'demo'
root.mkdir(parents=True, exist_ok=True)
for scene in ['lake', 'mountains', 'garden']:
    image = Image.new('RGB', (960, 540), '#d9e9e8')
    draw = ImageDraw.Draw(image)
    for y in range(540):
        ratio = y / 540
        draw.line((0, y, 960, y), fill=(int(216-65*ratio), int(235-30*ratio), int(235-25*ratio)))
    draw.ellipse((680, 65, 785, 170), fill='#f9e6ae')
    if scene == 'lake':
        draw.polygon([(0, 310), (160, 150), (380, 325)], fill='#8eaba3')
        draw.polygon([(160, 320), (420, 115), (670, 320)], fill='#668e87')
        draw.polygon([(430, 340), (740, 180), (960, 320)], fill='#88a99a')
        draw.rectangle((0, 315, 960, 540), fill='#649b9f')
        for y in range(350, 530, 22):
            draw.line((120 + (y % 90), y, 820 - (y % 75), y), fill='#c6dcd0', width=2)
        draw.polygon([(0, 470), (260, 420), (420, 540), (0, 540)], fill='#4a7260')
    elif scene == 'mountains':
        draw.polygon([(0, 430), (260, 70), (540, 450)], fill='#6b8987')
        draw.polygon([(178, 182), (260, 70), (348, 190), (270, 155), (235, 185)], fill='#f1f4e8')
        draw.polygon([(290, 450), (610, 120), (960, 440)], fill='#91a9a1')
        draw.polygon([(520, 212), (610, 120), (718, 220), (610, 185)], fill='#f1f4e8')
        draw.polygon([(0, 420), (260, 350), (530, 430), (770, 365), (960, 425), (960, 540), (0, 540)], fill='#72916b')
        draw.polygon([(420, 540), (500, 420), (550, 400), (520, 440), (500, 540)], fill='#dfc9a1')
    else:
        draw.rectangle((0, 310, 960, 540), fill='#8ca673')
        for x in [80, 270, 810]:
            draw.rectangle((x+35, 220, x+50, 390), fill='#7e6c56')
            draw.ellipse((x-20, 120, x+110, 290), fill='#507b60')
        draw.rounded_rectangle((360, 350, 690, 385), radius=8, fill='#b18c65')
        draw.polygon([(390, 385), (410, 385), (390, 470), (370, 470)], fill='#8a6d50')
        draw.polygon([(640, 385), (660, 385), (680, 470), (660, 470)], fill='#8a6d50')
        for x,y in [(160,460),(220,430),(760,465),(800,490)]:
            draw.ellipse((x,y,x+22,y+22), fill='#e8bb91')
    draw.rounded_rectangle((30, 28, 160, 68), radius=10, fill='#244d3d')
    draw.text((50, 38), 'DEMO', fill='white', font_size=24)
    thumbnail = root / f'{scene}.jpg'
    image.save(thumbnail, quality=90, optimize=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(thumbnail), '-vf',
        "zoompan=z='min(zoom+0.0007,1.08)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=120:s=640x360:fps=15",
        '-t', '8', '-c:v', 'libx264', '-profile:v', 'baseline', '-level', '3.0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(root / f'{scene}.mp4')], check=True)
