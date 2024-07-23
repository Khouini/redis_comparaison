const { env } = require('process');
const { createClient } = require('redis');

// Crée un client Redis en utilisant les variables d'environnement

console.log(`Redis ${env.REDIS_SRV}:${env.REDIS_PORT}`)
const client = createClient({
    url: `redis://${env.REDIS_SRV}:${env.REDIS_PORT}`
});

// Écoute les erreurs de connexion
client.on('error', (err) => {
    console.error(`Redis Client Error: ${err}`);
});

// Connecte le client et vérifie le statut
(async () => {
    try {
        await client.connect();
        console.log(`Redis connected: ${client.isOpen}`);
    } catch (err) {
        console.error(`Error connecting to Redis: ${err}`);
    }
})();

module.exports = { client };

client.on('connect', function () {
    console.log('Connected to Redis server')
})

// Listen for the 'error' event
client.on('error', function (err) {
    console.error('Error connecting to Redis:', err)
})

// You can also listen for the 'end' event to know when the connection is closed
client.on('end', function () {
    console.log('Connection to Redis closed')
})
// console.log(`Redis ${client?.status || 'failure'}`)


module.exports = { client }
