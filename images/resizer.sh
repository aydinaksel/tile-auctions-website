find . -type f -iname "*.webp" | while read -r file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .webp)
  magick "$file" -resize 720x720^ -gravity center -extent 720x720 "$dir/${base}_720x720.webp"
done
