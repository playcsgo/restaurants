const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

redisClient.on('error', err => console.error('Redis ERROR', err));

const redisConnect = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  console.log('Redis Connected');
};

const getCache = (key) => {
  console.log('[out get]', key)
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) {
        console.error('Error on GET cache!', err)
        return reject(err)
      }
      if (data) {
        console.log('Cache HIT!', key)
        return resolve(JSON.parse(data))
      }
      console.log('Cache MISS!', key)
      resolve(null)
    })
  })
}
redisConnect(); // 確保 Redis 客戶端在加載時自動連接

module.exports = {
  redisClient,
  getCache
}
