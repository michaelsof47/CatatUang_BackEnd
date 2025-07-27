const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
})

client.on('connect', () => {
    console.log('Connected to Redis');
})

client.on('error', (err) => {
    console.log('Redis Client Error', err);
});

(async () => {
    try {
        await client.connect();
        console.log('Redis client successfully connected and ready!');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        // Anda mungkin ingin exit proses atau menangani error ini lebih lanjut
        process.exit(1); // Contoh: Keluar dari aplikasi jika gagal konek ke Redis
    }
})();

module.exports = client;
