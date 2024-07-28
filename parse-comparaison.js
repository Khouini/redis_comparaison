const { performance } = require('perf_hooks');
const fs = require('fs');
const JSONStream = require('JSONStream');
const fastJsonParse = require('fast-json-parse');
const fastJsonStringify = require('fast-json-stringify');

const filePath = 'data.json';

// Function to read the JSON file
const readJsonFile = (path) => {
    return fs.readFileSync(path, 'utf-8');
};

// Function to test JSON.parse
const testJSONParse = (data) => {
    const start = performance.now();
    const parsedData = JSON.parse(data);
    const end = performance.now();
    console.log(`JSON.parse took ${end - start}ms`);
    return parsedData;
};

// Function to test fast-json-parse
const testFastJsonParse = (data) => {
    const start = performance.now();
    const { value, err } = fastJsonParse(data);
    const end = performance.now();
    if (err) throw err;
    console.log(`fast-json-parse took ${end - start}ms`);
    return value;
};

// Function to test JSONStream

// Read the JSON file
const jsonData = readJsonFile(filePath);

// Run the benchmarks
console.log("Testing JSON.parse:");
testJSONParse(jsonData);

console.log("\nTesting fast-json-parse:");
testFastJsonParse(jsonData);

console.log("json stringify");
const data = require('./data.json');
const stringify = fastJsonStringify({
    data
});
console.time('stringify fast-json-stringify');
const stringifyDataFast =  stringify({
    data
})
console.timeEnd('stringify fast-json-stringify');
console.time('stringify JSON.stringify');
const str = JSON.stringify({
    data
});
console.timeEnd('stringify JSON.stringify');

console.log("check", stringifyDataFast === str);