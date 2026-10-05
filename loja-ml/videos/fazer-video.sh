#!/usr/bin/env bash
# Gera vídeo vertical 1080x1920 (tela cheia, sem bordas pretas) para Clips do Mercado Livre.
# Uso: ./fazer-video.sh saida.mp4 "foto1.png|Texto 1" "foto2.png|Texto 2" ...
set -euo pipefail
OUT="$1"; shift
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
DUR=5; FPS=30
TMP=$(mktemp -d)
i=0
for item in "$@"; do
  img="${item%%|*}"; txt="${item#*|}"
  printf '%s' "$txt" > "$TMP/t$i.txt"
  # fundo: a própria foto ampliada e desfocada cobrindo a tela; frente: foto inteira com zoom suave
  ffmpeg -v error -y -loop 1 -t $DUR -i "$img" -filter_complex "
    [0]split[a][b];
    [a]scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,boxblur=30:3,eq=brightness=-0.08[bg];
    [b]scale=1060:-2:flags=lanczos,unsharp=5:5:0.8,zoompan=z='1+0.0012*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*FPS)):s=1060x1060:fps=$FPS[fg];
    [bg][fg]overlay=(W-w)/2:(H-h)/2-60,
    drawtext=fontfile=$FONT:textfile=$TMP/t$i.txt:fontsize=66:fontcolor=white:box=1:boxcolor=0x1e3a8a@0.85:boxborderw=28:x=(w-text_w)/2:y=h-420,
    fade=t=in:st=0:d=0.4,fade=t=out:st=$((DUR-1)).6:d=0.4,format=yuv420p" \
    -r $FPS -c:v libx264 -preset medium -crf 20 "$TMP/s$i.mp4"
  echo "file '$TMP/s$i.mp4'" >> "$TMP/list.txt"
  i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy -movflags +faststart "$OUT"
rm -rf "$TMP"
echo "OK: $OUT"
