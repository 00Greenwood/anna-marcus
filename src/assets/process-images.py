import argparse
import os
from typing import Tuple
from PIL import Image, ImageOps
import exifread
import json
from tqdm import tqdm
import hashlib

parser = argparse.ArgumentParser(description='Pre-process some image files.')
parser.add_argument('path_to_images', type=str)
parser.add_argument('path_to_links', type=str)
parser.add_argument('event_name', type=str)
parser.add_argument('password', type=str)
args = parser.parse_args()

def create_thumbnail(img_path: str, img_data: dict) -> None:
  thumbnail_path = os.path.join(args.path_to_images, f"..\\thumbnails\\{img_data['id']}.jpg")
  with Image.open(img_path) as img:
    img.thumbnail((1200, 1200))
    img = ImageOps.exif_transpose(img)
    size_difference = (img.size[0]-800, img.size[1]-1200)
    if img.size[0] > img.size[1]:
      size_difference = (img.size[0]-1200, img.size[1]-800)

    left = size_difference[0]/2
    top = size_difference[1]/2
    right = img.size[0] - size_difference[0]/2
    bottom = img.size[1] - size_difference[1]/2
    img = img.crop([left, top, right, bottom])
    if not os.path.exists(thumbnail_path):
      img.save(thumbnail_path, "JPEG")

    img_data['thumbnail_dimensions'] = img.size

def get_exif_data(exif_data: dict, tag: str) -> str:
  if tag in exif_data:
    return exif_data[tag].printable
  return ''

def extra_image_metadata(img_path: str) -> dict:
  img_data = {}
  with open(img_path, 'rb') as img:
    exif_data = exifread.process_file(img)

    dateTime = get_exif_data(exif_data, 'EXIF DateTimeOriginal')
    img_data['id'] = dateTime.replace(':', '').replace(' ', '_')
    img_data['datetime'] = dateTime
    img_data['professional'] = (get_exif_data(exif_data, 'Image Artist') == 'Big Day Productions')
    img_data['tags'] = []
    if 'Image XPKeywords' in exif_data:
      tags = [chr(i)  for i in exif_data['Image XPKeywords'].values]
      for tag in ''.join(tags).split(";"):
        img_data['tags'].append(tag.replace('\x00', ''))
  return img_data

def main() -> None:
  json_obj = dict()
  json_obj['password'] = hashlib.sha256(bytearray(args.password,'utf-8')).hexdigest()

  img_paths = [os.path.join(args.path_to_images, f) for f in os.listdir(args.path_to_images) if os.path.isfile(os.path.join(args.path_to_images, f))]
  json_obj['images'] = list()

  with open(args.path_to_links, 'rw') as img:
    pass

  for img_path in tqdm(img_paths):
    img_data = extra_image_metadata(img_path)
    img_data['embed_link'] = ''
    create_thumbnail(img_path, img_data)
    json_obj['images'].append(img_data)

    new_image_path = os.path.join(args.path_to_images, f"{img_data['id']}.jpg")
    if new_image_path != img_path:
      os.rename(img_path, new_image_path)

  json_path = os.path.join(args.path_to_images, f"..\\{args.event_name}.json")
  with open(json_path, 'w') as f:
    f.flush()
    f.write(json.dumps(json_obj, indent=2, sort_keys=True))

if __name__ == "__main__":
  main()
