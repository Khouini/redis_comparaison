const redis = require('ioredis')

// Create a new Redis client
const client = redis.createClient({
    host: "localhost",
    port: "6379"
})
// console.log('🚀 ~ file: redisConfig.js:12 ~ client:', client)
// Listen for the 'connect' event


client.on('connect', function () {
    console.log('Connected to Redis server')
})

// Listen for the 'error' event
client.on('error', function (err) {
    console.error('Error connecting to Redis:', err)
})

// You can also listen for the 'end' event to know when the connection is closed
client.on('end', function () {
    console.log('Connection to Redis closed')
})
// console.log(`Redis ${client?.status || 'failure'}`)


module.exports = { client }
