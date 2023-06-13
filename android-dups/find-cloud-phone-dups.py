#!/usr/bin/env python3

import os
import cv2
from skimage.metrics import structural_similarity as ssim

storage_dir = "./storage"
data_dir = "../output"

extensions = [
    ".jpg", ".jpeg", ".png", ".raw", ".ico", ".tiff", ".webp", ".heic",
    ".heif", ".gif", ".mp4", ".mov", ".qt", ".mov.qt", ".mkv", ".wmv", ".webm"
]

similarity_threshold = 0.8

duplicates_file = "./duplicates_data.txt"
open(duplicates_file, "w").close()

def compare_frames(frame1, frame2):
  # Resize frames to a consistent size for comparison
  frame1 = cv2.resize(frame1, (500, 500))
  frame2 = cv2.resize(frame2, (500, 500))

  # Convert frames to grayscale
  gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
  gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)

  # Compute structural similarity index (SSIM) between the frames
  similarity = ssim(gray1, gray2)

  return similarity

def process_file(file):
  # Extract the basename and extension
  basename = os.path.basename(file)
  name, ext = os.path.splitext(basename)

  # Check if a corresponding file exists in the data directory
  data_file = os.path.join(data_dir, basename)
  if os.path.exists(data_file):
    # Load and compare videos
    storage_video = cv2.VideoCapture(file)
    data_video = cv2.VideoCapture(data_file)

    similarity_sum = 0
    frame_count = 0

    while True:
      # Read frames from the videos
      ret1, storage_frame = storage_video.read()
      ret2, data_frame = data_video.read()

      if not ret1 or not ret2:
        break

      similarity = compare_frames(storage_frame, data_frame)
      similarity_sum += similarity
      frame_count += 1

    average_similarity = similarity_sum / frame_count if frame_count > 0 else 0

    if average_similarity >= similarity_threshold:
      # Append the filename and similarity to duplicates.txt
      with open(duplicates_file, "a") as f:
        f.write(f"{file} {average_similarity}\n")

    storage_video.release()
    data_video.release()

# Loop over files in the storage directory
for root, dirs, files in os.walk(storage_dir):
  for file in files:
    # Check file extension
    if any(file.lower().endswith(ext) for ext in extensions):
      file_path = os.path.join(root, file)
      process_file(file_path)
