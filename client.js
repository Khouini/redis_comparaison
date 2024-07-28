const { env } = require('process');
const Redis = require('ioredis');

// Crée un client Redis en utilisant les variables d'environnement
console.log(`Redis ${env.REDIS_SRV}:${env.REDIS_PORT}`);
const client = new Redis({
    host: env.REDIS_SRV,
    port: env.REDIS_PORT
});

// Écoute les erreurs de connexion
client.on('error', (err) => {
    console.error(`Redis Client Error: ${err}`);
});

// Connecte le client et vérifie le statut
client.on('connect', () => {
    console.log('Connected to Redis server');
});

client.on('ready', () => {
    console.log('Redis client is ready');
});

client.on('end', () => {
    console.log('Connection to Redis closed');
});

module.exports = { client };