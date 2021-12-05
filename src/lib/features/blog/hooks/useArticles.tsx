import { graphql, useStaticQuery } from "gatsby";

export const useArticles = (): any => {
  const data = useStaticQuery(graphql`
    query getArticles {
      STRAPI {
        articles(limit: 7, sort: "published_at") {
          author {
            name
          }
          contentSections {
            ...STRAPI_ArticleFragment
          }
          description
          published_at
          slug
          title
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
            url
          }
        }
      }
    }
  `);

  return data.STRAPI.articles;
};
