import { graphql, useStaticQuery } from "gatsby";

export const usePriests = (): any => {
  const data = useStaticQuery(graphql`
    query usePriests {
      allStrapiPriests(
        filter: { guest: { eq: false } }
        sort: { fields: published_at, order: ASC }
      ) {
        nodes {
          role
          title
          email
          guest
          name
          phone
          surname
          photo {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  height: 320
                  width: 280
                  quality: 90
                )
              }
            }
          }
        }
      }
    }
  `);

  return data.allStrapiPriests.nodes;
};
