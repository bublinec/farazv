import { graphql, useStaticQuery } from "gatsby";

export const useSacraments = (): any => {
  const data = useStaticQuery(graphql`
    query useSacraments {
      strapiGlobal {
        sacraments {
          backgroundImage {
            localFile {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED, quality: 90)
              }
            }
          }
          heading {
            superscript
            title
          }
          paragraphs {
            content
            link
            title
          }
        }
      }
    }
  `);

  return data.strapiGlobal.sacraments;
};
