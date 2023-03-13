const { MeiliSearch } = require("meilisearch");
const meilisearchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_KEY,
});
module.exports = meilisearchClient;
