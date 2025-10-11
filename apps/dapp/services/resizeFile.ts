import Resizer from 'react-image-file-resizer';

export const resizeFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      200,
      200,
      'PNG',
      100,
      0,
      (uri: string) => {
        return resolve(uri);
      },
      'base64'
    );
  });
