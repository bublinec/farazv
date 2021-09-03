import { graphql, useStaticQuery } from "gatsby";
import { Hero } from "../model/hero.model";

export const useHero = (): Hero => {
  const {
    strapiHome: { hero },
  } = useStaticQuery(graphql`
    {
      strapiHome {
        hero {
          title
          superscript
          subtitle
          image {
            localFile {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED)
              }
            }
          }
        }
      }
    }
  `);

  return hero;
};
