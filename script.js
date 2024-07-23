const redisCompressed = require('./compressed.js')
const redisNormal = require('./normal.js')
const data = require('./data.json')
const objSize = new TextEncoder().encode(JSON.stringify(data)).length
console.log(`Size of the object: ${objSize} bytes`)
const objSizeMB = objSize / (1024 * 1024) // Convert bytes to megabytes
console.log(`Size of the object: ${objSizeMB.toFixed(2)} MB`)

async function start(redisService, serviceName, data) {
    const time = new Date().getTime();
    console.time(`insert redis ${serviceName} ${data.length} hotels`);

    await redisService.setToRedis(`RS_${serviceName.toUpperCase()}_${time}`, data, 60 * 15);
    console.timeEnd(`insert redis ${serviceName} ${data.length} hotels`);

    console.time(`get redis ${serviceName}`);
    const results = await redisService.getFromRedis(`RS_${serviceName.toUpperCase()}_${time}`);
    console.log(`Found ${results.length} hotels`);
    console.timeEnd(`get redis ${serviceName}`);
}

// Example usage:
start(redisCompressed, 'compressed', data);
start(redisNormal, 'normal', data);
//start(redisJson, data);