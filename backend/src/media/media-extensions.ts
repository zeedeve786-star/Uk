export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

export function extensionMatchesType(url: string, mediaType: 'IMAGE' | 'VIDEO'): boolean {
  let pathname: string;
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    return false;
  }
  const allowed = mediaType === 'IMAGE' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
  return allowed.some((ext) => pathname.endsWith(ext));
}