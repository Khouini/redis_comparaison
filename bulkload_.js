const { client } = require('./client.js');

async function getFromRedis(cacheKey) {
    if (!client) {
        console.error('Redis client is not initialized.');
        return null;
    }

    try {
        const keys = await client.keys(`${cacheKey}:*`);
        if (keys.length === 0) {
            return [];
        }

        const commands = keys.map(key => ['get', key]);
        const results = await client.multi(commands).exec();

        if (!results) {
            console.error('Multi execution failed.');
            return null;
        }

        const data = results.map(([err, chunk]) => (err ? null : JSON.parse(chunk)));
        return data.flat();
    } catch (error) {
        console.error('Error during bulk get:', error);
        return null;
    }
}

function chunkDataByCharacters(data, charLimit) {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    data.forEach(item => {
        const itemString = JSON.stringify(item);
        if (currentSize + itemString.length > charLimit) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentSize = 0;
        }
        currentChunk.push(item);
        currentSize += itemString.length;
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

async function setToRedis(cacheKey, data, charLimit = 10000000, expiration = 120000) {
    if (!client) {
        console.error('Redis client is not initialized.');
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data provided.');
        return;
    }

    const chunks = chunkDataByCharacters(data, charLimit);

    const commands = chunks.map((chunk, index) => {
        const chunkKey = `${cacheKey}:${index}`;
        return ['set', chunkKey, JSON.stringify(chunk), 'EX', expiration];
    });

    try {
        const results = await client.multi(commands).exec();
        if (!results) {
            console.error('Multi execution failed.');
            return;
        }
        console.log('Bulk set completed:', results);
    } catch (error) {
        console.error('Error during bulk set:', error);
    }
}

module.exports = { getFromRedis, setToRedis };