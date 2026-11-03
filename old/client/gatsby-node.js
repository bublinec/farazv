/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const { createRemoteFileNode } = require("gatsby-source-filesystem");

// You can delete this file if you're not using it
exports.createResolvers = async ({
  actions,
  cache,
  createNodeId,
  createResolvers,
  store,
  reporter
}) => {
  const { createNode } = actions;

  await createResolvers({
    STRAPI_UploadFile: {
      localFile: {
        type: "File",
        async resolve(source) {
          let sourceUrl = `${source.url}`;
          return await createRemoteFileNode({
            url: sourceUrl,
            store,
            cache,
            createNode,
            createNodeId,
            reporter
          });
        }
      }
    }
  });
};
