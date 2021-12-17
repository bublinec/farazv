import { graphql, useStaticQuery } from "gatsby";

export const usePostsBgImage = (): any => {
  const data = useStaticQuery(graphql`
    query {
      fileName: file(relativePath: { eq: "posts-bg.png" }) {
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
