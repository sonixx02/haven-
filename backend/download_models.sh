#!/bin/bash

mkdir -p wanted_images

images=(
    "https://mahacid.gov.in/public/uploads/wanted/rjUqiG2OBZ1578130887-1.jpg"
    "https://mahacid.gov.in/public/uploads/wanted/NU1CeC1nDA1578131099-1.jpg"
    "https://mahacid.gov.in/public/uploads/wanted/ROmac3inLd1578132442-1.jpg"
    "https://mahacid.gov.in/public/uploads/wanted/0ANOvojVep1578131585-1.jpg"
    "https://mahacid.gov.in/public/uploads/wanted/KW2cVjnEuw1577793022-17.jpg"
    "https://mahacid.gov.in/public/uploads/wanted/yJ4zLeQwnC1577791709-17.jpg"
)

for i in "${!images[@]}"; do
    url="${images[$i]}"
    filename="wanted_$((i+1)).jpg"
    echo "Downloading $filename..."
    curl -L "$url" -o "wanted_images/$filename"
done

echo "All images downloaded successfully."