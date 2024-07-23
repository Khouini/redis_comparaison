const { client } = require('./client.js')
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

const PREFIX = 'gzip:'

async function getFromRedis(cacheKey) {
    try {
        let rawData = await client.get(cacheKey);

        if (!rawData) {
            rawData = await client.get(cacheKey.replace(/RS/, "rs"));
        }
        //const rawData = await promisify(client.get).bind(client)(cacheKey);

        if (!rawData){
            console.log(`no data found in redis for key: ${cacheKey}`)
            return []
        }
        if (rawData.startsWith(PREFIX)) {
            // Data is compressed
            const compressedData = Buffer.from(rawData.slice(PREFIX.length), 'base64');
            const data = await gunzip(compressedData);
            return JSON.parse(data.toString());
        } else {
            // Data is plain JSON
            return JSON.parse(rawData);
        }

        console.log('🚀 ~ getFromRedis ~ rawData:', rawData);
        return []
    } catch (error) {
        console.log('🚀 ~ getFromRedis ~ error:', error);
        return null;
    }
}


async function setToRedis(cacheKey, value, expiration = 120000) {
    try {
        const data = JSON.stringify(value)
        const compressedData = await gzip(data)
        const prefixedData = PREFIX + compressedData.toString('base64')
        const ins = await client.set(cacheKey, prefixedData, 'EX', expiration)
        return ins
    } catch (error) {
        console.log('🚀 ~ setToRedis ~ error:', error)
    }
}

module.exports = {
    getFromRedis,
    setToRedis
}
