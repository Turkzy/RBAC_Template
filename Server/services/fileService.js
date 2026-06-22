import { fileTypeFromFile } from "file-type";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_DIR = path.resolve("public/userimages");
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5_000_000; // 5MB

const ALLOWED_MIME_TYPES = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const saveUploadedFile = async (file) => {
  // 1. Validate extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(ext)) {
    throw new Error("Invalid file format. Only JPG, JPEG, and PNG files are allowed.");
  }

  // 2. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1_000_000}MB`);
  }

  // 3. Validate MIME type from metadata
  if (file.mimetype) {
    const allowedMimes = ALLOWED_MIME_TYPES[ext];
    if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
      throw new Error(`Invalid MIME type. Expected ${allowedMimes?.join(" or ")}, got ${file.mimetype}`);
    }
  }

  ensureUploadDir();

  // 4. Generate secure filename
  const uniqueId = crypto.randomUUID();
  const filename = `${Date.now()}-${uniqueId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // 5. Save temporarily
  await file.mv(filePath);

  try {
    // 6. Verify actual file content
    const fileType = await fileTypeFromFile(filePath);

    if (!fileType) {
      fs.unlinkSync(filePath);
      throw new Error("Unable to determine file type. File may be corrupted or invalid.");
    }

    const detectedExt = `.${fileType.ext}`.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(detectedExt)) {
      fs.unlinkSync(filePath);
      throw new Error(`File content does not match extension. Detected: ${fileType.mime}`);
    }

    const expectedMimes = ALLOWED_MIME_TYPES[ext];
    if (!expectedMimes.includes(fileType.mime)) {
      fs.unlinkSync(filePath);
      throw new Error(`File content MIME type mismatch. Detected: ${fileType.mime}, Expected: ${expectedMimes.join(" or ")}`);
    }

    return filename;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (
      error.message.includes("Unable to determine") ||
      error.message.includes("does not match") ||
      error.message.includes("MIME type mismatch")
    ) {
      throw error;
    }
    throw new Error(`File validation failed: ${error.message}`);
  }
};

export const deleteUploadedFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};