#!/bin/bash

echo -n "" >duplicates_comparison.txt
echo -n "" >duplicate_deletion_phone.txt
echo -n "" >duplicate_deletion_google.txt

while read -u 9 line; do
  if [ "$line" == "" ]; then
    continue
  fi

  sfile=$(echo "$line" | sed -E 's/ [^ ]*$//')
  sim=$(echo "$line" | sed 's/^.* //')

  base=$(basename "$sfile")
  gfile="../output/$base"

  # compare file sizes
  if (($(echo "$(stat -c%s "$sfile") <= $(stat -c%s "$gfile")" | bc))); then
    echo "$sfile" >>duplicate_deletion_phone.txt
    delete_from=Phone
  else
    echo "$gfile" >>duplicate_deletion_google.txt
    delete_from=Google
  fi

  echo "---" >>duplicates_comparison.txt
  echo "Phone: $sfile" >>duplicates_comparison.txt
  echo "Google: $gfile" >>duplicates_comparison.txt
  echo "Sim: $sim" >>duplicates_comparison.txt
  echo "Would delete: $delete_from" >>duplicates_comparison.txt
done 9<./duplicates_data.txt
