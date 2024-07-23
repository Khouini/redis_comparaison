const { client } = require('./client.js')

async function setToRedis(cacheKey, value, expiration = 120000) {
    console.log('Enter set redis json')
    try {
        const [ins] = await Promise.all([
            client.json.set(cacheKey, '$', value),
            client.expire(cacheKey, expiration)
        ]);
        console.log("🚀 ~ setToRedisJson ~ ins:", ins)
    } catch (error) {
        console.log('🚀 ~ setToRedis ~ error:', error)
    }
}

async function getFromRedis(key) {
    try {
        const data = await client.json.get(key)
        return data
    } catch (err) {
        console.error(`Error fetching data from Redis: ${err}`)
        return null
    }
}

module.exports = { getFromRedis, setToRedis }