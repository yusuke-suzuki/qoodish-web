import * as loadImage from 'blueimp-load-image';

export default async function fileToDataUrl(file: File) {
  const metadata = await loadImage.parseMetaData();

  const options = {
    canvas: true
  };

  if (metadata.exif) {
    Object.assign(options, {
      orientation: metadata.exif.get('Orientation')
    });
  }

  const data = await loadImage(file, options);
  const dataUrl = data.image.toDataURL('image/jpeg', 1.0);

  return dataUrl;
}
