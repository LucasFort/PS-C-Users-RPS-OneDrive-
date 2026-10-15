#!/usr/bin/env bash
# Gera vídeo ANIMADO a partir de fotos, vertical 1080x1920 (9:16) para Clips do Mercado Livre.
# Cada foto entra deslizando, com zoom/pan suave, fundo em movimento (parallax),
# legenda animada e transições variadas entre as fotos. Duração final entre 10 e 60 s.
#
# Uso:
#   ./fazer-video-animado.sh saida.mp4 "foto1.jpg|Texto 1" "foto2.jpg|Texto 2" ... [opções]
# Opções:
#   --musica arquivo.mp3   trilha de fundo (use música livre de direitos)
#   --tempo 4              segundos por foto (padrão 4)
#
# Atenção: o ML já recusou vídeos só de fotos ("imagens estáticas"). Este script deixa o
# vídeo bem mais dinâmico, mas a aprovação depende do revisor. Vídeo gravado de verdade
# (preparar-video-ml.sh) continua sendo o caminho mais seguro.
set -euo pipefail

W=1080; H=1920; FPS=30; T=0.6; DUR=4; MUSICA=""
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
TRANS=(slideleft circleopen smoothup wiperight radial slideup circleclose smoothleft)

OUT="$1"; shift
ITENS=()
while (( $# )); do
  case "$1" in
    --musica) MUSICA="$2"; shift 2 ;;
    --tempo) DUR="$2"; shift 2 ;;
    *) ITENS+=("$1"); shift ;;
  esac
done
N=${#ITENS[@]}
(( N > 0 )) || { sed -n '2,15p' "$0"; exit 1; }

# garante 10 a 60 s no total: total = N*DUR - (N-1)*T
DUR=$(awk -v n=$N -v d=$DUR -v t=$T 'BEGIN{
  tot=n*d-(n-1)*t
  if (tot<10.5) d=(10.5+(n-1)*t)/n
  if (tot>59.5) d=(59.5+(n-1)*t)/n
  printf "%.2f", d}')
FR=$(awk -v d=$DUR -v f=$FPS 'BEGIN{printf "%d", d*f+0.5}')

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

for i in "${!ITENS[@]}"; do
  item="${ITENS[$i]}"; img="${item%%|*}"; txt=""
  [[ "$item" == *"|"* ]] && txt="${item#*|}"
  read -r iw ih < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$img" | tr ',' ' ')

  # tamanho da foto na tela: 960 de largura, no máximo 1150 de altura (mantém proporção)
  fw=960; fh=$(( fw * ih / iw ))
  if (( fh > 1150 )); then fh=1150; fw=$(( fh * iw / ih )); fi
  fw=$(( fw / 2 * 2 )); fh=$(( fh / 2 * 2 ))

  # movimento da foto (alterna entre 4 tipos)
  case $(( i % 4 )) in
    0) Z="1+0.08*on/$FR";            X="iw/2-(iw/zoom/2)";               Y="ih/2-(ih/zoom/2)" ;;  # aproxima
    1) Z="1.08-0.08*on/$FR";         X="iw/2-(iw/zoom/2)";               Y="ih/2-(ih/zoom/2)" ;;  # afasta
    2) Z="1.06";                     X="(iw-iw/zoom)*on/$FR";            Y="ih/2-(ih/zoom/2)" ;;  # pan →
    3) Z="1.06";                     X="iw/2-(iw/zoom/2)";               Y="(ih-ih/zoom)*(1-on/$FR)" ;; # pan ↑
  esac
  # entrada: desliza do lado direito/esquerdo com desaceleração, depois flutua levemente
  if (( i % 2 )); then SIDE=-1; else SIDE=1; fi
  OX="(W-w)/2+$SIDE*W*pow(max(0\,1-t/0.6)\,3)"
  OY="(H-h)/2-110+12*sin(2*PI*t/$DUR)"

  DT="null"
  if [[ -n "$txt" ]]; then
    printf '%s' "$txt" > "$TMP/t$i.txt"
    DT="drawtext=fontfile=$FONT:textfile=$TMP/t$i.txt:expansion=none:fontsize=62:fontcolor=white:box=1:boxcolor=0x1e3a8a@0.9:boxborderw=26:x=(w-text_w)/2:y=h-430+200*pow(max(0\,1-(t-0.5)/0.5)\,3):alpha='min(1,max(0,(t-0.5)/0.4))'"
  fi

  ffmpeg -v error -y -loop 1 -framerate $FPS -t "$DUR" -i "$img" -filter_complex "
    [0]split[a][b];
    [a]scale=1300:2310:force_original_aspect_ratio=increase,crop=1300:2310,boxblur=28:3,eq=brightness=-0.12:saturation=1.2,
       crop=$W:$H:x='(iw-ow)/2+$SIDE*100*sin(PI*t/$DUR)':y='(ih-oh)/2+80*cos(PI*t/$DUR)'[bg];
    [b]scale=$((fw*3)):$((fh*3)):flags=lanczos,
       zoompan=z='$Z':x='$X':y='$Y':d=1:s=${fw}x${fh}:fps=$FPS,
       pad=iw+16:ih+16:8:8:white[fg];
    [bg][fg]overlay=x='$OX':y='$OY':eval=frame,$DT,setsar=1,format=yuv420p" \
    -frames:v "$FR" -r $FPS -c:v libx264 -preset medium -crf 19 "$TMP/s$i.mp4"
  echo "foto $((i+1))/$N ok"
done

# junta as fotos com transições
if (( N == 1 )); then
  cp "$TMP/s0.mp4" "$TMP/video.mp4"
else
  IN=(); FC=""; prev="[0:v]"
  for i in "${!ITENS[@]}"; do IN+=(-i "$TMP/s$i.mp4"); done
  for (( i=1; i<N; i++ )); do
    off=$(awk -v k=$i -v d=$DUR -v t=$T 'BEGIN{printf "%.3f", k*(d-t)}')
    tr=${TRANS[$(( (i-1) % ${#TRANS[@]} ))]}
    FC+="$prev[$i:v]xfade=transition=$tr:duration=$T:offset=$off[x$i];"
    prev="[x$i]"
  done
  ffmpeg -v error -y "${IN[@]}" -filter_complex "${FC%;}" -map "$prev" \
    -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r $FPS "$TMP/video.mp4"
fi

# áudio: música com fade-out, ou faixa silenciosa
TOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/video.mp4")
if [[ -n "$MUSICA" ]]; then
  ffmpeg -v error -y -i "$TMP/video.mp4" -stream_loop -1 -i "$MUSICA" \
    -af "afade=t=in:d=0.5,afade=t=out:st=$(awk -v d=$TOT 'BEGIN{print d-1.5}'):d=1.5" \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -t "$TOT" -movflags +faststart "$OUT"
else
  ffmpeg -v error -y -i "$TMP/video.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 64k -t "$TOT" -movflags +faststart "$OUT"
fi

echo
"$(dirname "$0")/preparar-video-ml.sh" --conferir "$OUT"
