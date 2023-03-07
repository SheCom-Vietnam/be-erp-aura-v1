const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const { MeiliSearch } = require("meilisearch");
const supabase = require("../config/supabase");
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_KEY,
});
const LIMIT_PER_QUERY = 1000;
class MeiliseacrhController {
  constructor(client) {
    this.client = client;
    this.userIndex = client.index("users");
  }

  addUserDocument = catchAsync(async (req, res, next) => {
    const getAllUser = ({ from, to }) => {
      return supabase
        .from("users")
        .select(
          "*,status(*),details_status(*),interact_type(*),interact_result(*),service_staff(*)"
        )
        .order("created_at", { ascending: false })
        .range(from, to);
    };
    const { data: countUserRecord, error } = await supabase
      .rpc("count_record_table", {
        _tbl: "users",
      })
      .single();
    // console.log(countUserRecord); { result: 4074 }
    const query = [];
    if (countUserRecord.result) {
      for (let i = 0; i < countUserRecord.result / LIMIT_PER_QUERY; i++) {
        if ((i + 1) * LIMIT_PER_QUERY >= countUserRecord.result) {
          query.push(
            getAllUser({
              from: i * LIMIT_PER_QUERY,
              to: countUserRecord.result,
            }).then((data) => {
              return data;
            })
          );
        } else {
          query.push(
            getAllUser({
              from: i * LIMIT_PER_QUERY,
              to: (i + 1) * LIMIT_PER_QUERY - 1,
            }).then((data) => {
              return data;
            })
          );
        }
      }
    }
    const allUser = await Promise.all(query);
    const mappingMeilisearch = allUser.map((item) => item.data);
    let response = await this.userIndex.addDocuments(
      allUser.map((item) => item.data).flat(),
      {
        primaryKey: "id",
      }
    );
    console.log(response);
    return res.status(200).json("Sucesss");
  });
  searchUserDocument = catchAsync(async (req, res, next) => {
    const search = await this.userIndex.search();
    console.log(search);
  });
}
module.exports = new MeiliseacrhController(client);
