const siteTitle = "Farazv";
const siteDescription = "Our custom in-house starter";
const siteAuthor = "@jakobrolik";
const siteUrl = "https://google.com";
const siteImage = `${siteUrl}/icons/icon_512x512.png`;
const siteKeywords = ["gatsby", "typescript", "starter", "javascript", "react"];

module.exports = {
  siteMetadata: {
    title: siteTitle,
    description: siteDescription,
    author: siteAuthor,
    url: siteUrl,
    siteUrl,
    keywords: siteKeywords,
    image: siteImage,
    siteUrl
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    `gatsby-plugin-image`,
    // "gatsby-plugin-offline",
    "gatsby-plugin-robots-txt",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    "gatsby-plugin-postcss",
    "@chakra-ui/gatsby-plugin",
    {
      resolve: `gatsby-alias-imports`,
      options: {
        extensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
        aliases: {
          "@/components": `src/components/`,
          "@/lib": "src/lib/",
          "@/assets": "src/assets/"
        }
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets`
      }
    },
    {
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: `Poppins`,
              subsets: [`latin-ext`],
              variants: [`300`, `400`, `700`, "500", "900", "600"]
            }
          ]
        }
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: siteTitle,
        short_name: siteTitle,
        start_url: "/",
        background_color: "#663399",
        theme_color: "#663399",
        display: "standalone",
        icon: "src/assets/favicon.png"
      }
    },
    // CUSTOM
    {
      resolve: `gatsby-source-strapi`,
      options: {
        apiURL: `https://farazv.herokuapp.com`,
        queryLimit: 1000,
        collectionTypes: [
          "announcements",
          "events",
          "priests",
          "weekly-announcements",
          "page",
          "admin-pages"
        ],
        singleTypes: ["contact", "global"]
      }
    },

    {
      resolve: "gatsby-source-graphql",
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: "STRAPI",
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: "STRAPI",
        // Url to query from
        url: "https://farazv.herokuapp.com/graphql"
      }
    },

    {
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: `Ubuntu`,
              subsets: [`latin-ext`],
              variants: [`300`, `400`, `700`, "500", "900", "600"]
            }
          ]
        }
      }
    }
  ]
};
