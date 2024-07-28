const {client} = require('./client.js');
const fastJsonParse = require('fast-json-parse');

const CHUNK_SIZE = 20000000; // Define the size of each chunk

async function getFromRedis(cacheKey) {
    try {
        const getRedisTime = Date.now();
        // Fetch the number of chunks
        const chunkCount = await client.get(`${cacheKey}:count`);
        if (!chunkCount) return null;

        client.multi({pipeline: false});
        for (let i = 0; i < chunkCount; i++) {
            client.get(`${cacheKey}:${i}`);
        }


        const results = await client.exec();
        const getRedisTimeEnd = Date.now();

        const parseTime = Date.now();
        const data = results.map(([err, chunk]) => (err ? null : chunk)).join('');
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
        const data = JSON.stringify(value);
        const chunkCount = Math.ceil(data.length / CHUNK_SIZE);

        client.multi({pipeline: false});
        console.time("chunking");
        for (let i = 0; i < chunkCount; i++) {
            const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            client.set(`${cacheKey}:${i}`, chunk, 'EX', expiration);
        }
        console.timeEnd("chunking");
        const parseTimeEnd = Date.now();
        const setRedisTime = Date.now();
        client.set(`${cacheKey}:count`, chunkCount, 'EX', expiration);

        const results = await client.exec();
        const setRedisTimeEnd = Date.now();
        console.log('🚀 ~ setToRedis ~ results:', results);
        return {
            data: data,
            setRedisTime: setRedisTimeEnd - setRedisTime,
            parseTime: parseTimeEnd - parseTime
        }
    } catch (error) {
        console.log('🚀 ~ setToRedis ~ error:', error);
        return null;
    }
}

module.exports = {
    getFromRedis,
    setToRedis
};
