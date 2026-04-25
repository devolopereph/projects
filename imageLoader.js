export default function imageLoader({ src, width, quality }) {
  // For uploads folder, serve directly without optimization
  if (src.startsWith('/uploads/')) {
    return src;
  }
  
  // For other images, use default optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
