const dotenv = require('dotenv');
dotenv.config();
const redisCompressed = require('./compressed.js');
const redisNormal = require('./normal.js');
const redisJson = require('./json.js');
const data = require('./data.json');
const { performance } = require('perf_hooks');

const objSize = new TextEncoder().encode(JSON.stringify(data)).length;
console.log(`Size of the object: ${objSize} bytes`);
const objSizeMB = objSize / (1024 * 1024); // Convert bytes to megabytes
console.log(`Size of the object: ${objSizeMB.toFixed(2)} MB`);

async function start(redisService, serviceName, data, timings) {
    const time = new Date().getTime();

    const insertStart = performance.now();
    await redisService.setToRedis(`RS_${serviceName.toUpperCase()}_${time}`, data, 60 * 15);
    const insertEnd = performance.now();
    const insertTime = insertEnd - insertStart;

    const getStart = performance.now();
    const results = await redisService.getFromRedis(`RS_${serviceName.toUpperCase()}_${time}`);
    console.log(`Found ${results.length} hotels`);
    const getEnd = performance.now();
    const getTime = getEnd - getStart;

    timings.push({ serviceName, insertTime, getTime });
}

// Collect timings
const timings = [];

// Example usage
(async function() {
    await start(redisNormal, 'normal', data, timings);
    await start(redisJson, 'json', data, timings);
    await start(redisCompressed, 'compressed', data, timings);

    console.log('Comparison Table:');
    console.table(timings.map(t => ({
        Service: t.serviceName,
        'Insert Time (s)': Number((t.insertTime / 1000)).toFixed(2),
        'Get Time (s)': Number((t.getTime / 1000)).toFixed(2)
    })));
})();
