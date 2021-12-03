import { Image } from "../image/model/image.model";

export type ContentSection =
  | TextProps
  | ImagesTextGridProps
  | MultiParagraphImageBannerProps
  | BackgroundImageContentProps
  | any;

// ELEMENTS
export interface Paragraph {
  content: string;
  reactIconName?: string;
  title: string;
  link?: string;
}

export enum MultiParagraphImageBannerConfiguration {
  sacraments,
  groups,
  custom
}

export enum ButtonTypes {
  primary,
  secondary
}

export interface ImageParagraphProps {
  content: string;
  image: any;
  isImageOnTheLeft?: boolean;
}

export interface Button {
  text: string;
  link: string;
  external: boolean;
  type: ButtonTypes;
}

export interface Slide {
  image: Image;
  buttons: Button[];
  heading: TextProps;
}

export interface ImageLink {
  image: Image;
  url: string;
}

//////////////////////////////////////
// SECTIONS
//////////////////////////////////////

export interface TextProps {
  content?: string;
  info?: string;
  superscript?: string;
  title?: string;
}

export interface ImagesTextGridProps {
  heading: TextProps;
  paragraphs: ImageParagraphProps[];
}

export interface MultiParagraphImageBannerProps {
  paragraphs: Paragraph[];
  heading: TextProps;
  backgroundImage: Image;
  configuration: MultiParagraphImageBannerConfiguration;
}

export interface BackgroundImageContentProps {
  backgroundImage: Image;
  imageParagraph: ImageParagraphProps;
}

export interface SlideshowProps {
  slides: Slide[];
  useGlobalConfiguration: boolean;
}

export interface GalleryProps {
  images: Image[];
  heading: TextProps;
}

export interface AnnouncementsSectionProps {
  useMostRecent: boolean;
  backgroundImage: Image;
  heading: TextProps;
  announcements: any[];
}

export interface EventsSectionProps {
  useMostRecent?: boolean;
  gridGap?: number;
  heading?: TextProps;
  events: any[];
}

export interface ImageLinksProps {
  heading: TextProps;
  images: ImageLink[];
}

export interface PartnersSectionProps {
  heading: TextProps;
  partners: ImageLink[];
}
