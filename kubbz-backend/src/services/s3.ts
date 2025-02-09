import { S3 } from 'aws-sdk';
import { config } from '../config';

const s3 = new S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
) => {
  const params = {
    Bucket: config.aws.bucketName,
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

export const deleteFromS3 = async (fileName: string) => {
  const params = {
    Bucket: config.aws.bucketName,
    Key: `gallery/${fileName}`,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};
