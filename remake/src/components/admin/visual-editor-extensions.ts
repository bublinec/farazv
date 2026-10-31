import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import type { MediaAsset } from "@/content/types";

/** Imported dimensions, captions and gallery order survive visual editing. */
export const ParishImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      caption: { default: null }
    };
  }
});

export const Gallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute("data-images") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-images": JSON.stringify(attributes.images)
        })
      }
    };
  },
  parseHTML() {
    return [{ tag: "div[data-parish-gallery]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-parish-gallery": "true",
        style:
          "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:8px;background:#eef3f4"
      }),
      ...(node.attrs.images as MediaAsset[]).map((image) => [
        "img",
        {
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          style: "width:100%;height:140px;object-fit:cover"
        }
      ])
    ];
  }
});
