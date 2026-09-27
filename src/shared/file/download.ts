export function downloadText(
  text: string,
  filename: string,
  mimeType: string,
  revokeAfterMs = 4_000,
) {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => { URL.revokeObjectURL(url); }, revokeAfterMs);
}
