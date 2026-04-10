"use client";

const MAX_SIZE = 256;
const QUALITY = 0.8;

/**
 * Compress an image File to a WebP base64 data URL.
 * Max 256×256px, quality 80%. Uses only native browser APIs.
 */
export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  // Calculate new dimensions preserving aspect ratio
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = Math.round((height / width) * MAX_SIZE);
      width = MAX_SIZE;
    } else {
      width = Math.round((width / height) * MAX_SIZE);
      height = MAX_SIZE;
    }
  }

  // Draw on OffscreenCanvas
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Convert to WebP blob
  const blob = await canvas.convertToBlob({ type: "image/webp", quality: QUALITY });

  // Convert blob to data URL via FileReader
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });
}
