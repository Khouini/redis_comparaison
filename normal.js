const { client } = require('./client.js')

async function getFromRedis(cacheKey) {
    try {
        const data =  await client.get(cacheKey);
        return JSON.parse(data)
    } catch (error) {
        console.log('🚀 ~ getFromRedis ~ error:', error);
        return null;
    }
}


async function setToRedis(cacheKey, value, expiration = 120000) {
    try {
        const data = JSON.stringify(value)
        const ins = await client.set(cacheKey, data, {
            EX: expiration
        })
        return ins
    } catch (error) {
        console.log('🚀 ~ setToRedis ~ error:', error)
    }
}

module.exports = {
    getFromRedis,
    setToRedis
}
