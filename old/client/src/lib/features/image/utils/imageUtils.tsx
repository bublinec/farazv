import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";

export const convertImage = (image: any) => {
  let bgImage = undefined;
  if (image) {
    const extractedImage = getImage(image.localFile);
    bgImage = convertToBgImage(extractedImage);
  }
  return bgImage;
};
