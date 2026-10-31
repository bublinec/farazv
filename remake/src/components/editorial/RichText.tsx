import { Fragment, type ReactNode } from "react";
import type { RichTextDocument, RichTextNode } from "@/content/documents";
import { validateRichText } from "@/lib/rich-text";
import { ImageGallery } from "./ImageGallery";
import type { MediaAsset } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";

function renderNode(node: RichTextNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  switch (node.type) {
    case "text": {
      let value: ReactNode = node.text;
      for (const [index, mark] of (node.marks ?? []).entries()) {
        if (mark.type === "bold") value = <strong key={index}>{value}</strong>;
        else if (mark.type === "italic") value = <em key={index}>{value}</em>;
        else if (mark.type === "underline") value = <u key={index}>{value}</u>;
        else if (mark.type === "code") value = <code key={index}>{value}</code>;
        else if (mark.type === "strike") value = <s key={index}>{value}</s>;
        else if (mark.type === "link")
          value = (
            <a
              key={index}
              href={String(mark.attrs?.href)}
              rel="noopener noreferrer"
            >
              {value}
            </a>
          );
      }
      return <Fragment key={key}>{value}</Fragment>;
    }
    case "paragraph":
      return <p key={key}>{children?.length ? children : <br />}</p>;
    case "heading": {
      if (node.attrs?.level === 3) return <h3 key={key}>{children}</h3>;
      if (node.attrs?.level === 4) return <h4 key={key}>{children}</h4>;
      if (node.attrs?.level === 5) return <h5 key={key}>{children}</h5>;
      if (node.attrs?.level === 6) return <h6 key={key}>{children}</h6>;
      return <h2 key={key}>{children}</h2>;
    }
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "imageGallery":
      return (
        <ImageGallery key={key} images={node.attrs?.images as MediaAsset[]} />
      );
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={Number(node.attrs?.start ?? 1)}>
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    case "image":
      return (
        <figure key={key}>
          <MediaImage
            image={{
              src: String(node.attrs?.src),
              alt: String(node.attrs?.alt ?? ""),
              width: Number(node.attrs?.width ?? 1200),
              height: Number(node.attrs?.height ?? 800)
            }}
            sizes="(max-width: 760px) 100vw, 760px"
          />
          {node.attrs?.caption || node.attrs?.title ? (
            <figcaption>
              {String(node.attrs.caption || node.attrs.title)}
            </figcaption>
          ) : null}
        </figure>
      );
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}
/** Rendering imports no editor JavaScript and never accepts source HTML. */
export function RichText({
  document,
  className
}: {
  document: RichTextDocument;
  className?: string;
}) {
  const safe = validateRichText(document);

  return (
    <div className={`prose ${className ?? ""}`}>
      {safe.content.map(renderNode)}
    </div>
  );
}
