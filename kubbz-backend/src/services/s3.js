const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `gallery/${fileName}`,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    return await s3.upload(params).promise();
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `gallery/${fileName}`,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
