import { graphql, useStaticQuery } from "gatsby";
import { HeroCard } from "../model/hero-card.model";

export const useHeroCard = (): HeroCard => {
  const {
    strapiHome: { HeroCard },
  } = useStaticQuery(graphql`
    {
      strapiHome {
        HeroCard {
          title
          text
          image {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  quality: 60
                  placeholder: BLURRED
                )
              }
            }
          }
        }
      }
    }
  `);

  return HeroCard;
};
