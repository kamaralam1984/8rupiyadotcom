#!/bin/bash

# Video Compression Script for 8rupiya shoper.mp4
# This script compresses the video to approximately 5MB while maintaining good quality

INPUT="public/uploads/8rupiya shoper.mp4"
OUTPUT="public/uploads/8rupiya-shoper-compressed.mp4"
TARGET_SIZE_MB=5

echo "Starting video compression..."
echo "Input: $INPUT"
echo "Output: $OUTPUT"
echo "Target size: ${TARGET_SIZE_MB}MB"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed."
    echo "Please install it using: sudo apt install ffmpeg"
    exit 1
fi

# Get video duration to calculate bitrate
DURATION=$(ffprobe -i "$INPUT" -show_entries format=duration -v quiet -of csv="p=0")
DURATION=${DURATION%.*}  # Remove decimal part

if [ -z "$DURATION" ] || [ "$DURATION" -eq 0 ]; then
    echo "Error: Could not determine video duration"
    exit 1
fi

# Calculate target bitrate (in kbps)
# Formula: (Target size in MB * 8 * 1024) / Duration in seconds
TARGET_SIZE_KB=$((TARGET_SIZE_MB * 8 * 1024))
VIDEO_BITRATE=$((TARGET_SIZE_KB / DURATION - 128))  # Subtract 128k for audio

# Ensure minimum bitrate for quality
if [ "$VIDEO_BITRATE" -lt 500 ]; then
    VIDEO_BITRATE=500
fi

echo "Video duration: ${DURATION} seconds"
echo "Calculated video bitrate: ${VIDEO_BITRATE}k"

# Compress video with optimized settings for 5MB target
# Using faster preset and slightly higher CRF for better size control
ffmpeg -i "$INPUT" \
  -vcodec libx264 \
  -crf 26 \
  -preset medium \
  -vf "scale=1280:-2" \
  -b:v ${VIDEO_BITRATE}k \
  -maxrate $((VIDEO_BITRATE + 100))k \
  -bufsize $((VIDEO_BITRATE * 2))k \
  -acodec aac \
  -b:a 96k \
  -movflags +faststart \
  -y \
  "$OUTPUT"

# Check if compression was successful
if [ $? -eq 0 ]; then
    OUTPUT_SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo ""
    echo "✅ Compression successful!"
    echo "Output file: $OUTPUT"
    echo "Output size: $OUTPUT_SIZE"
    echo ""
    echo "The compressed video is ready to use on the homepage."
else
    echo ""
    echo "❌ Compression failed. Please check the error messages above."
    exit 1
fi

