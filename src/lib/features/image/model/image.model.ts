
export interface Fallback {
  src: string;
  srcSet: string;
  sizes: string;
}

export interface Source {
  srcSet: string;
  type: string;
  sizes: string;
}

export interface Images {
  fallback: Fallback;
  sources: Source[];
}

export interface GatsbyImageData {
  layout: string;
  backgroundColor: string;
  images: Images;
  width: number;
  height: number;
}

export interface ChildImageSharp {
  gatsbyImageData: GatsbyImageData;
}

export interface LocalFile {
  publicURL: string;
  childImageSharp: ChildImageSharp;
}

export interface Image {
  alternativeText: string;
  localFile: LocalFile;
}