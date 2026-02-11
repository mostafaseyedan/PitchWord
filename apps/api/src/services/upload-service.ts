import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createId } from "../utils/id.js";

const uploadRoot = path.resolve(process.cwd(), "uploads");

export interface UploadedFileInfo {
  fileRef: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export class UploadService {
  async saveFile(part: {
    filename: string;
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  }): Promise<UploadedFileInfo> {
    await mkdir(uploadRoot, { recursive: true });

    const fileId = createId();
    const safeName = part.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileRef = `${fileId}-${safeName}`;
    const destination = path.join(uploadRoot, fileRef);

    const buffer = await part.toBuffer();
    await writeFile(destination, buffer);

    return {
      fileRef,
      originalFilename: part.filename,
      mimeType: part.mimetype,
      sizeBytes: buffer.byteLength
    };
  }
}
