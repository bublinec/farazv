import { ImageDataLike } from "gatsby-plugin-image";

export interface Image {
  localFile: ImageDataLike;
  url: string;
}
