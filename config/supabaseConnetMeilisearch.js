const { createClient } = require("@supabase/supabase-js");
const { MeiliSearch } = require("meilisearch");
const connectMeilisearch = (
  supabaseUrl,
  supabaseServiceKey,
  meilisearchHost,
  meilisearchKey,
  indexName,
  tableName
) => {
  // Create Supabase Realtime subscription
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const meilisearchClient = new MeiliSearch({
    host: meilisearchHost,
    apiKey: meilisearchKey,
  });
  const meilisearchIndex = meilisearchClient.index(indexName);
  const subscription = supabase
    .channel("listen:user:change:insert:meilisearch")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: tableName },
      handleRealtimeEvent
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: tableName },
      handleRealtimeEvent
    )
    .subscribe();
  console.log("Connect Meilsearch Successfully");
  // Event handlers
  async function handleRealtimeEvent(payload) {
    try {
      const eventType = payload.eventType;
      const record = payload.new || payload.old;

      switch (eventType) {
        case "INSERT":
          await meilisearchIndex.addDocuments([record]);
          break;
        case "UPDATE":
          await meilisearchIndex.updateDocuments([record]);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling Realtime event:", error);
    }
  }
};
module.exports = connectMeilisearch;
