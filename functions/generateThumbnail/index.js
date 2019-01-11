const { Storage } = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

const gcs = new Storage();

const generateThumbnail = object => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const contentType = object.contentType;

  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  const fileName = path.basename(filePath);
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return null;
  }

  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
    cacheControl: 'public,max-age=86400'
  };

  return bucket
    .file(filePath)
    .download({
      destination: tempFilePath
    })
    .then(() => {
      console.log('Image downloaded locally to', tempFilePath);
      return spawn('convert', [
        tempFilePath,
        '-thumbnail',
        '200x200>',
        tempFilePath
      ]);
    })
    .then(() => {
      console.log('Thumbnail created at', tempFilePath);
      const thumbFileName = `thumb_${fileName}`;
      const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
      return bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata
      });
    })
    .then(() => fs.unlinkSync(tempFilePath));
};

module.exports = generateThumbnail;
