// 各種取得user身分的方式統一寫在這邊, 方便git追蹤

const getUser = req => {
  return req.user || null
}
const ensureAuthenticated = req => {
  return req.isAuthenticated()
}


module.exports = {
  getUser,
  ensureAuthenticated
}