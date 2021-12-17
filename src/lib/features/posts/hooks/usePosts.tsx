import { graphql, useStaticQuery } from "gatsby";

export const usePosts = (): any => {
  const data = useStaticQuery(graphql`
    query getPosts {
      allStrapiPost(limit: 4) {
        nodes {
          content
          description
          published_at
          title
          slug

          image {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: BLURRED
                  height: 500
                  width: 800
                  quality: 90
                )
              }
            }
          }
        }
      }
    }
  `);

  return data.allStrapiPost.nodes;
};
