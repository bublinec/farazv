import { graphql, useStaticQuery } from "gatsby";
import { Hero } from "../model/hero.model";

export const useHero = (): Hero => {
  const data = useStaticQuery(graphql`
    query HeroQuery {
      strapiHomePage {
        hero {
          image {
            localFile {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED, quality: 100)
              }
            }
          }
          title
          subtitle
        }
      }
    }
  `);

  return data.strapiHomePage.hero;
};
