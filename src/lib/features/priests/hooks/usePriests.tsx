import { graphql, useStaticQuery } from "gatsby";

export const usePriests = (): any => {
  const data = useStaticQuery(graphql`
    query usePriests {
      strapiPriests {
        email
        guest
        name
        phone
        surname
        photo {
          localFile {
            childImageSharp {
              gatsbyImageData
            }
          }
        }
      }
    }
  `);

  return data.strapiPriests;
};
