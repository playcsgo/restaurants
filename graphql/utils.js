// 取得搜尋的atributes減少資料庫操作

// 用套件來解析GraphQL Query的項目
const { parseResolveInfo } = require('graphql-parse-resolve-info')

// 定義合法Table 以及 column. 也就是各Table的columns
const LEGAL_FIELDS = {
  User: ['id', 'name', 'email', 'isAdmin', 'image', 'createdAt', 'updatedAt'],
  Category: ['id', 'name', 'createdAt', 'updatedAt'],
  Comment: ['id', 'text', 'userId', 'restaurantId', 'createdAt', 'updatedAt'],
  Favorite: ['id', 'userId', 'restaurantId', 'createdAt', 'updatedAt'],
  Followship: ['id', 'followerId', 'followingId', 'createdAt', 'updatedAt'],
  Like: ['id', 'userId', 'restaurantId', 'createdAt', 'updatedAt'],
  Restaurant: ['id', 'name', 'tel', 'openingHour', 'description', 'address', 'image', 'viewCounts', 'createdAt', 'updatedAt'],
}

// 透過 parseResolverInfo 取得Query要查詢的Table以及columns
// 以這邊的MySQL來說 Table就是model, columns則為attributes
function getAttributes(info, Model, schemaSubName = null, includedModel = null) {
  const parseInfo = parseResolveInfo(info)
  const fields = parseInfo.fieldsByTypeName[Model.name] || {}
  if (includedModel) {
    // fields[FavoritedRestaurants].fieldsByTypeName.Restaurant
    const legal_field = LEGAL_FIELDS[includedModel] || []
    const keys = fields[schemaSubName] ? Object.keys(fields[schemaSubName]?.fieldsByTypeName[includedModel]) : []
    const attributes = keys.filter(key => legal_field.includes(key)) 

    return attributes
  }
  const legal_field = LEGAL_FIELDS[Model.name] || []
  const keys = Object.keys(fields)
  const attributes = keys.filter(key => legal_field.includes(key))

  return attributes
}


module.exports = { getAttributes }
