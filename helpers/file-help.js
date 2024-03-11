// multer處理的碎片化檔案室放在Temp資料下直到上傳完成, temp會定期清理
// 做一個file-help.js  將完成上傳的資料放到對外的資料夾給伺服器使用

const fs = require('fs') // fs = file system, express原生模組

const localFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null)
    }
    const fileName = `upload/${file.originalname}`
    return fs.promises.readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler
}