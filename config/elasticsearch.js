const { Client } = require('@elastic/elasticsearch')

const elasticsearch = new Client({
    node: process.env.ELASTICSEARCH_ENDPOINT,
    auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
    }
})

module.exports = elasticsearch;