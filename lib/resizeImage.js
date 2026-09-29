// Shrinks a photo in the browser before upload so phone pictures (3 to 8 MB)
// become roughly 50 KB thumbnails. Keeps the dashboard fast on event Wi-Fi.
export async function resizeImage(file, maxSize = 480, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that image."))),
      "image/jpeg",
      quality
    )
  );
}
