import type { EnquiryAttachment } from '../types/enquiries.types';

/** @prototype ihub/index.html:L7061-L7063 `needCaption` / `canSubmit`. */
export function captionedFiles(files: readonly EnquiryAttachment[]): boolean {
  return files.every((file) => file.caption.trim().length > 0);
}
