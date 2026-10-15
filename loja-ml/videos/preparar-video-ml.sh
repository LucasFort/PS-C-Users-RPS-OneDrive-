#!/usr/bin/env bash
# Prepara VÍDEO REAL (gravado no celular ou do fornecedor) para Clips do Mercado Livre.
# Não use com vídeo montado de fotos: o ML recusa ("imagens estáticas").
#
# Saída: MP4 H.264 + AAC, 1080x1920 (9:16) ocupando a tela toda, 30fps, 10 a 60 s, < 280 MB.
#
# Uso:
#   ./preparar-video-ml.sh saida.mp4 video1.mp4 [video2.mp4 ...] [opções]
#   ./preparar-video-ml.sh --conferir arquivo.mp4      (só confere se o arquivo está no padrão)
#
# Opções:
#   --texto "Impermeável 1,93x2,03"   legenda fixa no rodapé (fora da área dos botões do ML)
#   --sem-som                          remove o áudio (evita música com direitos autorais)
#   --inicio 3  --fim 40               corta: usa só de 3 s até 40 s do vídeo final
#   --fundo-desfocado                  vídeo deitado: mostra inteiro sobre fundo desfocado
#                                      (padrão: corta as laterais para preencher a tela)
set -euo pipefail

W=1080; H=1920; FPS=30; MIN=10; MAX=60; MAX_MB=280
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

conferir() {
  local f="$1" ok=1 w h d mb v
  read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f" | tr ',' ' ')
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  mb=$(( $(stat -c %s "$f") / 1024 / 1024 ))
  v=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$f")
  echo "Arquivo:   $f"
  echo "Tamanho:   ${w}x${h}  (codec $v)"
  printf 'Duração:   %.1f s\n' "$d"
  echo "Peso:      ${mb} MB"
  if (( w * 16 != h * 9 )); then echo "  ✗ Proporção não é 9:16 (vertical)"; ok=0; fi
  if (( w < 720 )); then echo "  ✗ Resolução baixa (mínimo recomendado 720x1280)"; ok=0; fi
  if awk "BEGIN{exit !($d < $MIN)}"; then echo "  ✗ Menos de ${MIN} s"; ok=0; fi
  if awk "BEGIN{exit !($d > $MAX)}"; then echo "  ✗ Mais de ${MAX} s"; ok=0; fi
  if (( mb >= MAX_MB )); then echo "  ✗ Acima de ${MAX_MB} MB"; ok=0; fi
  if (( ok )); then echo "✓ Dentro do padrão do Clips do Mercado Livre"; else return 1; fi
}

if [[ "${1:-}" == "--conferir" ]]; then conferir "$2"; exit $?; fi
if (( $# < 2 )); then sed -n '2,20p' "$0"; exit 1; fi

OUT="$1"; shift
VIDEOS=(); TEXTO=""; SOM=1; INICIO=0; FIM=""; FUNDO=0
while (( $# )); do
  case "$1" in
    --texto) TEXTO="$2"; shift 2 ;;
    --sem-som) SOM=0; shift ;;
    --inicio) INICIO="$2"; shift 2 ;;
    --fim) FIM="$2"; shift 2 ;;
    --fundo-desfocado) FUNDO=1; shift ;;
    *) VIDEOS+=("$1"); shift ;;
  esac
done

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

# 1) Cada vídeo vira um trecho 1080x1920 30fps com áudio estéreo (silêncio se não tiver)
i=0
for v in "${VIDEOS[@]}"; do
  if (( FUNDO )); then
    VF="split[a][b];[a]scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,boxblur=30:3,eq=brightness=-0.08[bg];[b]scale=$W:$H:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
  else
    VF="scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H"
  fi
  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$v" | grep -q .; then
    AIN=(-i "$v"); AMAP="0:a:0"
  else
    AIN=(-i "$v" -f lavfi -i anullsrc=r=48000:cl=stereo); AMAP="1:a"
  fi
  ffmpeg -v error -y "${AIN[@]}" -filter_complex "[0:v]$VF,fps=$FPS,setsar=1,format=yuv420p[v]" \
    -map "[v]" -map "$AMAP" -shortest -c:v libx264 -preset medium -crf 20 \
    -c:a aac -b:a 128k -ar 48000 -ac 2 "$TMP/p$i.mp4"
  echo "file '$TMP/p$i.mp4'" >> "$TMP/lista.txt"
  i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/lista.txt" -c copy "$TMP/junto.mp4"

# 2) Corte, legenda, limite de 60 s e compressão final
TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/junto.mp4")
[[ -z "$FIM" ]] && FIM="$TOTAL"
DUR=$(awk "BEGIN{d=$FIM-$INICIO; if(d>$MAX)d=$MAX; printf \"%.2f\", d}")
if awk "BEGIN{exit !($DUR < $MIN)}"; then
  echo "ERRO: o vídeo fica com ${DUR} s. O ML exige no mínimo ${MIN} s — grave um pouco mais ou junte outro trecho." >&2
  exit 1
fi
awk "BEGIN{exit !($FIM-$INICIO > $MAX)}" && echo "Aviso: vídeo cortado em ${MAX} s (limite do ML)."

VF="null"
if [[ -n "$TEXTO" ]]; then
  printf '%s' "$TEXTO" > "$TMP/texto.txt"
  # rodapé centralizado, longe da lateral direita onde ficam os botões de curtir/compartilhar
  VF="drawtext=fontfile=$FONT:textfile=$TMP/texto.txt:expansion=none:fontsize=60:fontcolor=white:box=1:boxcolor=0x1e3a8a@0.85:boxborderw=24:x=(w-text_w)/2:y=h-460"
fi
AUD=(-c:a aac -b:a 128k); (( SOM )) || AUD=(-an)
ffmpeg -v error -y -ss "$INICIO" -i "$TMP/junto.mp4" -t "$DUR" -vf "$VF,format=yuv420p" \
  -c:v libx264 -preset medium -crf 21 -maxrate 8M -bufsize 16M -profile:v high -r $FPS \
  "${AUD[@]}" -movflags +faststart "$OUT"

echo; conferir "$OUT"
