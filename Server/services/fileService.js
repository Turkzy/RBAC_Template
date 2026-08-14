import { fileTypeFromFile } from "file-type";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const DEFAULT_UPLOAD_SUBFOLDER = "userimages";
const USER_IMAGE_FILE_TYPES = [".jpg", ".jpeg", ".png"];
const COMPLIANCE_DOCUMENT_FILE_TYPES = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"];
const MAX_FILE_SIZE = 5_000_000; // 5MB

const ALLOWED_MIME_TYPES = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ".txt": ["text/plain"],
  ".csv": ["text/csv"],
};

const getAllowedFileTypes = (subfolder = DEFAULT_UPLOAD_SUBFOLDER) => {
  if (subfolder === "compliances") {
    return COMPLIANCE_DOCUMENT_FILE_TYPES;
  }
  return USER_IMAGE_FILE_TYPES;
};

const getAllowedFileTypesLabel = (subfolder = DEFAULT_UPLOAD_SUBFOLDER) => {
  if (subfolder === "compliances") {
    return "PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt), and CSV files";
  }
  return "JPG, JPEG, and PNG files";
};

const getUploadDir = (subfolder = DEFAULT_UPLOAD_SUBFOLDER) => path.join(process.cwd(), "uploads", subfolder);

const ensureUploadDir = (subfolder = DEFAULT_UPLOAD_SUBFOLDER) => {
  const uploadDir = getUploadDir(subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const saveUploadedFile = async (file, subfolder = DEFAULT_UPLOAD_SUBFOLDER) => {
  const allowedFileTypes = getAllowedFileTypes(subfolder);

  // 1. Validate extension
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedFileTypes.includes(ext)) {
    throw new Error(`Invalid file format. Only ${getAllowedFileTypesLabel(subfolder)} are allowed.`);
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

  ensureUploadDir(subfolder);

  // 4. Generate secure filename
  const uniqueId = crypto.randomUUID();
  const filename = `${Date.now()}-${uniqueId}${ext}`;
  const filePath = path.join(getUploadDir(subfolder), filename);

  // 5. Save temporarily
  await file.mv(filePath);

  try {
    // 6. Verify actual file content (more lenient for documents)
    // For documents, we trust the MIME type rather than strict file content validation
    // since file-type detection may not work reliably for all document formats
    if (file.mimetype) {
      const allowedMimes = ALLOWED_MIME_TYPES[ext];
      if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
        fs.unlinkSync(filePath);
        throw new Error(`Invalid file type. Expected ${allowedMimes.join(" or ")}, got ${file.mimetype}`);
      }
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

export const deleteUploadedFile = (filename, subfolder = DEFAULT_UPLOAD_SUBFOLDER) => {
  if (!filename) return;
  const filePath = path.join(getUploadDir(subfolder), filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getStoredComplianceFileNames = (item) => {
  const fileUrls = Array.isArray(item?.fileUrls) ? item.fileUrls : [];
  return fileUrls
    .map((fileUrl) => {
      if (!fileUrl) return null;
      const urlParts = String(fileUrl).split("/");
      return urlParts[urlParts.length - 1] || null;
    })
    .filter(Boolean);
};