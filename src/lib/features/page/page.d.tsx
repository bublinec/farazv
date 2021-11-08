declare module Page {
  export interface Button {
    external: boolean;
    link: string;
    text: string;
    type: string;
  }

  export interface Slideshow {
    buttons: Button[];
    description: string;
    superscript: string;
    title: string;
    image: any;
  }

  export interface StrapiPage {
    content?: string;
    title: string;
    description: string;
    slug?: string;
    useGlobalSlideshow?: boolean;
    image?: any;
    slideshow?: Slideshow[];
  }
}
