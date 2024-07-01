const { GraphQLError } = require('graphql')
const { User, Category, Comment, Favorite, Followship, Like, Restaurant, getQueryCount } = require('../models')
const { getAttributes } = require('./utils')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')

// 需要查詢的項目. post用mutation, 其他都用Query
const resolvers = {
  Query: {
    users: async(_root, { _id }, { reqUser }, info) => {
      try {
        const userAttributes = getAttributes(info, User)
        const commentAttributes = getAttributes(info, User, 'Comments', 'Comment')
        const FavoritedRestaurantsAttributes = getAttributes(info, User, 'FavoritedRestaurants', 'Restaurant')
        const LikedRestaurantsAttributes = getAttributes(info, User, 'LikedRestaurants', 'Restaurant')
        const FollowersAttributes = getAttributes(info, User, 'Followers', 'User')
        const FollowingsAttributes = getAttributes(info, User, 'Followings', 'User')

        const users = await User.findAll({
          attributes: userAttributes,
          include: [
            { model: Comment, attributes: commentAttributes, raw: true },
            { model: Restaurant, as: 'FavoritedRestaurants', attributes: FavoritedRestaurantsAttributes, raw: true },
            { model: Restaurant, as: 'LikedRestaurants', attributes: LikedRestaurantsAttributes, raw: true },
            { model: User, as: 'Followers', attributes: FollowersAttributes, raw: true },
            { model: User, as: 'Followings', attributes: FollowingsAttributes, raw: true },
          ],
          // nest: true
        })
        
        if (!users) throw new GraphQLError('Users Not Found')
        const usersJSON = users.map(user => ({
          ...user.toJSON(),
          commentsCount: user.Comments?.length,
          favoritedCount: user.FavoritedRestaurants?.length,
          likedCount: user.LikedRestaurants?.length,
          followingsCount: user.Followings?.length,
          followersCount: user.Followers?.length,
          isFollowed: reqUser?.Followings?.some(f => f.id === user.id)
        }))
        
        return usersJSON
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    user: async(_root, { id }, { reqUser }, info) => {
      try {
        const userAttributes = getAttributes(info, User)
        const commentAttributes = getAttributes(info, User, 'Comments', 'Comment')
        const FavoritedRestaurantsAttributes = getAttributes(info, User, 'FavoritedRestaurants', 'Restaurant')
        const LikedRestaurantsAttributes = getAttributes(info, User, 'LikedRestaurants', 'Restaurant')
        const FollowersAttributes = getAttributes(info, User, 'Followers', 'User')
        const FollowingsAttributes = getAttributes(info, User, 'Followings', 'User')

        const user = await User.findByPk(id, {
          attributes: userAttributes,
          include: [
            { model: Comment, attributes: commentAttributes, raw: true },
            { model: Restaurant, as: 'FavoritedRestaurants', attributes: FavoritedRestaurantsAttributes, raw: true },
            { model: Restaurant, as: 'LikedRestaurants', attributes: LikedRestaurantsAttributes, raw: true },
            { model: User, as: 'Followers', attributes: FollowersAttributes, raw: true },
            { model: User, as: 'Followings', attributes: FollowingsAttributes, raw: true },
          ]
        })
        if (!user) throw new GraphQLError('User Not Found')
        
        userJson = user.toJSON()
        userJson.commentsCount = user?.Comments?.length ?? 0
        userJson.favoritedCount = user?.FavoritedRestaurants?.length ?? 0
        userJson.likedCount = user?.LikedRestaurants?.length ?? 0
        userJson.followersCount = user?.Followers?.length ?? 0
        userJson.followingsCount = user?.Followings?.length ?? 0
        userJson.isFollowed = reqUser?.Followings?.some(f => f.id === user.id) ?? null
        
        return userJson
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    restaurants: async(_root, { limit = 9, page = 1, query_categoryId = '' }, { reqUser }, info) => {
      try {
        // pagination
        const categoryId = Number(query_categoryId) || ''
        const offset = Math.max(getOffset(limit, page), 0)

        // set attributes
        const restaurantAttributes = getAttributes(info, Restaurant)
        const CategoryAttributes = getAttributes(info, Restaurant, 'Category', 'Category')
        const commentAttributes = getAttributes(info, Restaurant, 'Comments', 'Comment')
        const FavoritedUserssAttributes = getAttributes(info, Restaurant, 'FavoritedUsers', 'User')
        const LikedUserAttributes = getAttributes(info, Restaurant, 'LikedUser', 'User')
        
        // findAll
        const restaurants = await Restaurant.findAll({
          where: { ...categoryId ? { categoryId } : {} },
          
          // order不適合用在GraphQL, 因為Query的att不一定有. 或是自己加
          // order: [['createdAt', orderMethod]],
          include: [
            { model: Category, attributes: CategoryAttributes },
            { model: Comment, attributes: commentAttributes },
            { model: User, as: 'FavoritedUsers', attributes: FavoritedUserssAttributes, raw: true },
            { model: User, as: 'LikedUser', attributes: LikedUserAttributes, raw: true },
          ],
          attributes: restaurantAttributes,
          limit: 2,
          offset,
          nest: true
        })
        
        // return   
        const data = restaurants.map(r =>({ ...r.toJSON() }))
        return data
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    reqUser: async(_root, { id }, { reqUser }, info) => {
      try {
        // 但是reqUser 可以索取的資料要協調好
        // 因為是直接寫在passport裡面的. 每次query都會讀取到
        // 不然就是要把token寫成input, 在這邊做解析. 邏輯就不是req.user了
        return reqUser
      } catch(err) {
        throw new GraphQLError(err.message)
      }
    },
    queryCount: () => {
      return getQueryCount()
    }
    // template: async(_root, { id }, { reqUser }, info) => {
    //   try {
    //   } catch(err) {
    //     console.error('Error in user query:', err);
    //     throw new GraphQLError(err.message)
    //   }
    // },

    // end Query
  },

  Mutation: {
    signin: async (_root, { email, password }, _context) => {
      try {
        const user = await User.findOne({ where: { email } })
        const validate = await bcryptjs.compare(password, user.password)
        if (!validate) {
          throw new GraphQLError('帳號或密碼輸入錯誤!')
        }
        const userData = user.toJSON()
        delete userData.password
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) 

        return {
          token,
          user: userData
        }
      } catch (err) {
        throw new GraphQLError(err.message)
      }
    },
    favorite: async(_root, { restaurantId }, { reqUser }, info) => {
      try {
        const userId = reqUser.id
        const restaurant = await Restaurant.findByPk(restaurantId, {
          attributes: ['id']
        })
        if (!restaurant) {
          throw new GraphQLError('restaurant NOT FOUNT')
        }

        const favorite = await Favorite.findOne({
          where: { userId, restaurantId }
        })
        if (favorite) {
          throw new GraphQLError('favorite has been created')
        }f

        const data = await Favorite.create({ userId, restaurantId })

        return data
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    like: async(_root, { restaurantId }, { reqUser }, info) => {
      try {
        const userId = reqUser.id
        const restaurant = await Restaurant.findByPk(restaurantId, {
          attributes: ['id']
        })
        if (!restaurant) throw new GraphQLError('restaurant NOT FOUNT')

        const like = await Like.findOne({
          where: { userId, restaurantId }
        })
        if (like) {
          throw new GraphQLError('like has been created')
        }

        const data = await Like.create({ userId, restaurantId }, )
        console.log(data)
        return data
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    comment: async(_root, { restaurantId, text }, { reqUser }, info) => {
      try {
        const restaurant = Restaurant.findByPk(restaurantId, {
          attributes: ['id']
        })
        if (!restaurant) throw new GraphQLError('restaurant NOT FOUNT!')
        if (!text) throw new GraphQLError('text is empty!')
        userId = reqUser.id
        data = await Comment.create({ userId, restaurantId, text })

        return data

      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },
    followship: async(_root, { followingId }, { reqUser }, info) => {
      try {
        const followingUser = User.findByPk(followingId, {
          attributes: ['id']
        })
        if (!followingUser) throw new GraphQLError('user NOT found!')
        const followerId = reqUser.id
        const data = Followship.create({ followingId, followerId })
        
        return data
      } catch(err) {
        console.error('Error in user query:', err);
        throw new GraphQLError(err.message)
      }
    },

    // end Mutation
  }
}

module.exports = resolvers
