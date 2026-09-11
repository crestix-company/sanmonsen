#!/bin/sh
set -eu
# Usage: FFMPEG=/path/to/ffmpeg sh scripts/prepare-silent-video.sh
# These outputs contain the complete supplied footage, and no audio stream.
cd "$(dirname "$0")/.."
encoder="${FFMPEG:-ffmpeg}"
"$encoder" -hide_banner -loglevel error -y -i dist/assets/charcoal.mp4 \
  -an -vf scale=1280:-2,fps=24 -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p -movflags +faststart dist/assets/charcoal-silent-720.mp4
"$encoder" -hide_banner -loglevel error -y -i dist/assets/charcoal.mp4 \
  -an -vf scale=960:-2,fps=24 -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p -movflags +faststart dist/assets/charcoal-silent-540.mp4
