#!/usr/bin/env bash
# Run once from the project root to download all Unsplash images locally.
# Usage:  bash download-images.sh
# Requires: curl

set -e
DEST="public/images"
mkdir -p "$DEST"

download() {
  local url="$1"
  local file="$DEST/$2"
  if [ -f "$file" ]; then
    echo "  skip (exists): $2"
  else
    echo "  downloading: $2"
    curl -sL "$url" -o "$file"
  fi
}

download "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80" "photo-1450101499163-c8848c66ca85_1200.jpg"
download "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"  "photo-1451187580459-43490279c0fa_800.jpg"
download "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80" "photo-1454165804606-c3d57bc86b40_1200.jpg"
download "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80" "photo-1456513080510-7bf3a84b82f8_1200.jpg"
download "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80"  "photo-1461749280684-dccba630e2f6_800.jpg"
download "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80" "photo-1477959858617-67f85cf4f1df_1200.jpg"
download "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"  "photo-1481627834876-b7833e8f5570_800.jpg"
download "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80" "photo-1503676260728-1c00da094a0b_1200.jpg"
download "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80" "photo-1511632765486-a01980e01a18_1200.jpg"
download "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80"  "photo-1515187029135-18ee286d815b_800.jpg"
download "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80"  "photo-1521791136064-7986c2920216_800.jpg"
download "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80" "photo-1522071820081-009f0129c71c_1200.jpg"
download "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"  "photo-1522202176988-66273c2fd55f_800.jpg"
download "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"  "photo-1524178232363-1fb2b075b655_800.jpg"
download "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80" "photo-1529107386315-e1a2ed48a620_1200.jpg"
download "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80"  "photo-1529107386315-e1a2ed48a620_800.jpg"
download "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80"  "photo-1532629345422-7515f3d16bb6_800.jpg"
download "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"  "photo-1540575467063-178a50c2df87_800.jpg"
download "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80"    "photo-1542831371-29b0f74f9713_1200.jpg"
download "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80"     "photo-1542831371-29b0f74f9713_800.jpg"
download "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"     "photo-1551288049-bebda4e38f71_800.jpg"
download "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"    "photo-1555066931-4365d14bab8c_1200.jpg"
download "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"     "photo-1555066931-4365d14bab8c_800.jpg"
download "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80"    "photo-1556761175-4b46a572b786_1200.jpg"
download "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"     "photo-1559027615-cd4628902d4a_800.jpg"
download "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&q=80" "photo-1563986768494-4dee2763ff3f_1200.jpg"
download "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80"  "photo-1568992687947-868a62a9f521_800.jpg"
download "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80"  "photo-1589829545856-d10d557cf95f_800.jpg"
download "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80" "photo-1593113598332-cd288d649433_1200.jpg"
download "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80"  "photo-1611162617213-7d7a39e9b1d7_800.jpg"
download "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80"  "photo-1614064641938-3bbee52942c7_800.jpg"

echo ""
echo "✓ Done — $(ls $DEST | wc -l) images in $DEST/"
