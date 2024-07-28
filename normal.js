const { client } = require('./client.js')
const fastJsonParse = require('fast-json-parse');

async function getFromRedis(cacheKey) {
    try {
        const getRedisTime = Date.now();
        const data =  await client.get(cacheKey);
        const getRedisTimeEnd = Date.now();
        const parseTime = Date.now();
        const pasedData = fastJsonParse(data).value;
        const parseTimeEnd = Date.now();
        return {
            data: pasedData,
            getRedisTime: getRedisTimeEnd - getRedisTime,
            parseTime: parseTimeEnd - parseTime
        }
    } catch (error) {
        console.log('🚀 ~ getFromRedis ~ error:', error);
        return null;
    }
}


async function setToRedis(cacheKey, value, expiration = 120000) {
    try {
        const parseTime = Date.now();
        const data = JSON.stringify(value)
        const parseTimeEnd = Date.now();
        const setRedisTime = Date.now();
        const ins = await client.set(cacheKey, data, 'EX', expiration)
        const setRedisTimeEnd = Date.now();
        return {
            data: data,
            setRedisTime: setRedisTimeEnd - setRedisTime,
            parseTime: parseTimeEnd - parseTime
        }
    } catch (error) {
        console.log('🚀 ~ setToRedis ~ error:', error)
    }
}

module.exports = {
    getFromRedis,
    setToRedis
}
