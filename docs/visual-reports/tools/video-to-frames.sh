#!/usr/bin/env bash
# video-to-frames.sh — extract N evenly-spaced frames from a video as a PNG sequence.
#
# Usage: ./video-to-frames.sh <input-video> [count=20]
#
# Examples:
#   ./video-to-frames.sh recording.mp4        # 20 frames → <video-dir>/frames/
#   ./video-to-frames.sh recording.mp4 40     # 40 frames — finer detail
#
# Requires ffmpeg + ffprobe in PATH.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <input-video> [count=20]" >&2
  exit 1
fi

input="$1"
count="${2:-20}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found in PATH" >&2
  echo "install: winget install ffmpeg  |  choco install ffmpeg" >&2
  exit 1
fi

if [ ! -f "$input" ]; then
  echo "error: input not found: $input" >&2
  exit 1
fi

outdir="$(dirname "$input")/frames"
mkdir -p "$outdir"

total=$(ffprobe -v error -select_streams v:0 -count_packets \
  -show_entries stream=nb_read_packets -of csv=p=0 "$input")

if [ -z "$total" ] || [ "$total" -eq 0 ]; then
  echo "error: ffprobe could not read frame count" >&2
  exit 1
fi

stride=$(( total / count ))
[ "$stride" -lt 1 ] && stride=1

echo "Video:   $input"
echo "Total:   $total frames in source"
echo "Request: $count frames (stride=$stride)"
echo "Output:  $outdir"
echo

ffmpeg -hide_banner -loglevel warning \
  -i "$input" \
  -vf "select='not(mod(n\,${stride}))'" \
  -vsync vfr \
  "$outdir/%03d.png"

actual=$(find "$outdir" -maxdepth 1 -name "*.png" | wc -l)
echo "Extracted $actual frames to $outdir/"
