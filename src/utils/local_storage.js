const fs = require("fs");
const path = require("path");

// Root folder uploads, bisa diubah via env
const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

// Pastikan subfolder ada saat modul di-load
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(UPLOADS_DIR, "profiles"));
ensureDir(path.join(UPLOADS_DIR, "categories"));

/**
 * Simpan buffer gambar ke disk lokal.
 * @param {Buffer} buffer       - Buffer gambar hasil kompresi
 * @param {"profiles"|"categories"} folder - Subfolder tujuan
 * @param {string} filename     - Nama file (sudah termasuk ekstensi)
 * @returns {string}            - Relative path yang disimpan di DB, contoh: "profiles/abc123.jpg"
 */
function saveImageLocally(buffer, folder, filename) {
  const dir = path.join(UPLOADS_DIR, folder);
  ensureDir(dir);

  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, buffer);

  // Yang disimpan di DB = relative path saja
  return `${folder}/${filename}`;
}

/**
 * Hapus file dari disk lokal.
 * @param {string} relativePath - Relative path yang tersimpan di DB
 */
function deleteImageLocally(relativePath) {
  if (!relativePath) return;
  const fullPath = path.join(UPLOADS_DIR, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * Baca file dari disk lokal, kembalikan sebagai Buffer.
 * @param {string} relativePath - Relative path yang tersimpan di DB
 * @returns {Buffer}
 */
function readImageLocally(relativePath) {
  const fullPath = path.join(UPLOADS_DIR, relativePath);
  return fs.readFileSync(fullPath);
}

module.exports = {
  saveImageLocally,
  deleteImageLocally,
  readImageLocally,
  UPLOADS_DIR,
};
