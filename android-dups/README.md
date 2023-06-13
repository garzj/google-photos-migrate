# android-dups

Some scripts that I used to:

- find duplicates of photos, that were on Google and on my Android phone
  - both Google and apps on my phone sometimes lower resolution of images leading to duplicates, so
  - compare by filename and structural similarity
- apply the most correct date to both of them
  - depends on where the image was first, so
  - use the older valid date
- delete the lower res image
  - compared by size

## How I did it

After [fixing my google takeout](../README.md) I did the following:

```bash
cd android-dups

# Plug in my phone, setup adb

# Pull the internal storage from my phone
# (make sure to exclude some more useless dirs or filter by ext)
# (could also gzip before transfer but idk if that's faster)
adb exec-out "tar --exclude 'storage/emulated/0/Android/data' --exclude 'storage/emulated/0/Android/obb' -c storage/emulated/0" > storage_takeout.tar
# You can use the progress command to track file size and download speed
progress -mp $(lsof storage_takeout.tar | tail -n -1 | awk '{print $2}')
# Keep this file as a backup, just in case!

tar xvf ./storage_takeout.tar

# Run the comparison script and find duplicates (code by GPT, co-author was me)
pip3 install opencv-python scikit-image
python3 ./find-cloud-phone-dups.py

# Apply newer dates
bash ./fix-dates.sh

# Compare by size and generate lists for deletion
bash ./gen-file-list.sh

# Check the generated files, make sure no data gets lost

# Find files that should be reuploaded to the phone, cause they changed and won't be deleted
diff <(grep -E '^\./storage/emulated/0' ./fixed_date_files.txt) ./duplicate_deletion_phone.txt --old-line-format='%L' --unchanged-line-format='' --new-line-format='' > reupload_files.txt
# Upload them
xargs -a ./reupload_files.txt -L1 -I {} adb push {} {}

# Delete images from my phone
# ! Make sure there are no filenames that include newlines
cat duplicate_deletion_phone.txt | tr \\n \\0 | adb shell xargs -0 rm

# Delete images from fixed output dir
# ! Make sure there are no filenames that include newlines
xargs -a duplicate_deletion_google.txt -d '\n' rm
```
