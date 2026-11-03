import { graphql, useStaticQuery } from "gatsby";

export const useBlogBgImage = (): any => {
  const data = useStaticQuery(graphql`
    query {
      fileName: file(relativePath: { eq: "blog-bg.png" }) {
        childImageSharp {
          gatsbyImageData(
            placeholder: TRACED_SVG
            layout: FULL_WIDTH
            quality: 90
          )
        }
      }
    }
  `);

  return data;
};
