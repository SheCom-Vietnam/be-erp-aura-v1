const { Client } = require('@elastic/elasticsearch')

const elasticsearch = new Client({
    node: 'https://elasticsearch-dev.auradental.vn',
    auth: {
        apiKey: 'SWZ6dHRZa0JfNkdmNVpYSjl5ZUU6M0V4SDlhR2hSZ1NDaGhIbjRidk5MUQ==',
    }
})

module.exports = elasticsearch;