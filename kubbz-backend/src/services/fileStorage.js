const fs = require('fs').promises;
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/gallery');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

const saveFile = async (fileBuffer, fileName) => {
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, fileBuffer);
  // Return the URL that will be used to serve the file
  return `/uploads/gallery/${fileName}`;
};

const deleteFile = async (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

module.exports = {
  saveFile,
  deleteFile,
};
