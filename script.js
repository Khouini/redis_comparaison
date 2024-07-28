const dotenv = require('dotenv');
dotenv.config();
const redisCompressed = require('./compressed.js');
const redisNormal = require('./normal.js');
const redisJson = require('./json.js');
const bulkload = require('./bulkload.js');
const { performance } = require('perf_hooks');

function duplicateArray(arr, nbDuplicates) {
    if (nbDuplicates < 0) {
        throw new Error("Number of duplicates must be non-negative");
    }

    return arr.flatMap(item => Array(nbDuplicates).fill(item));
}

const data = duplicateArray(require('./data.json'), 1);

const objSize = new TextEncoder().encode(JSON.stringify(data)).length;
console.log(`Size of the object: ${objSize} bytes`);
const objSizeMB = objSize / (1024 * 1024); // Convert bytes to megabytes
console.log(`Size of the object: ${objSizeMB.toFixed(2)} MB`);

async function start(redisService, serviceName, data, timings) {
    const time = new Date().getTime();

    const insertStart = performance.now();
    const insertResult = await redisService.setToRedis(`RS_${serviceName.toUpperCase()}_${time}`, data);
    const insertEnd = performance.now();
    const insertTime = insertEnd - insertStart;

    const getStart = performance.now();
    const getResult = await redisService.getFromRedis(`RS_${serviceName.toUpperCase()}_${time}`);
    const getEnd = performance.now();
    const getTime = getEnd - getStart;

    timings.push({
        serviceName,
        insertTime,
        getTime,
        insertRedisTime: insertResult.setRedisTime,
        insertParseTime: insertResult.parseTime,
        getRedisTime: getResult.getRedisTime,
        getParseTime: getResult.parseTime,
        dataLength: getResult.data.length
    });
}

// Collect timings
const timings = [];

// Example usage
(async function() {
    console.log('Starting comparison...');
    console.log("Normal service started");
    await start(redisNormal, 'normal', data, timings);
    // Uncomment these lines to include tests for the other services
    // console.log("JSON service started");
    // await start(redisJson, 'json', data, timings);
    // console.log("Compressed service started");
    // await start(redisCompressed, 'compressed', data, timings);
    console.log("Bulkload service started");
    await start(bulkload, 'bulkload', data, timings);

    console.log('Comparison Table:');
    console.table(timings.map(t => ({
        Service: t.serviceName,
        'Insert Time (s)': (t.insertTime / 1000).toFixed(2),
        'Insert Redis Time (s)': (t.insertRedisTime / 1000).toFixed(2),
        'Insert Parse Time (s)': (t.insertParseTime / 1000).toFixed(2),
        'Get Time (s)': (t.getTime / 1000).toFixed(2),
        'Get Redis Time (s)': (t.getRedisTime / 1000).toFixed(2),
        'Get Parse Time (s)': (t.getParseTime / 1000).toFixed(2),
        'Data Length': t.dataLength
    })));
})();
