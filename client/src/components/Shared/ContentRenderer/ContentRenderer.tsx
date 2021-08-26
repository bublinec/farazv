import { Link } from "gatsby";
import React from "react";
import ReactMarkdown from "react-markdown";
import { rendererStyles } from "./content-renderer.module.scss";

export interface ContentRendererProps {
  className?: string;
  source: string;
}

const LinkRenderer = (props: any) => {
  const { href, children } = props;

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <Link to={href}>{children}</Link>;
};

export const ContentRenderer = (props: ContentRendererProps) => {
  const { className = "", source } = props;
  return (
    <div className={`${rendererStyles} ${className}`}>
      <ReactMarkdown
        children={source}
        // If the url start with either http or https, the image is hosted somewhere else,
        // if hover it starts with / we need to prepend the strapi api url to the url
        transformImageUri={(uri) =>
          uri.startsWith("http") ? uri : `${process.env.IMAGE_BASE_URL}${uri}`
        }
        components={{
          a: LinkRenderer,
        }}
      />
    </div>
  );
};
