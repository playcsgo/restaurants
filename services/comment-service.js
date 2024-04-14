const { Comment, User, Restaurant } = require('../models')

const commentController = {
  postComment: (req, cb) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id

    if (!text) throw new Error('Comment is empty!')

    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ]).then(([user, restaurant]) => {
      if (!user) throw new Error('user does not exist!')
      if (!restaurant) throw new Error('restaurant does not exist!')
      return Comment.create({
        text,
        restaurantId,
        userId
      })
    })
    .then(postedComment => cb(null, { postedComment }))
    .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    Comment.findByPk(req.params.id)
      .then(comment => {
        if(!comment) throw new Error('Comment does not exist!')
        comment.destroy()
        return comment
      })
      .then(deletedComment => cb(null, { deletedComment }))
      .catch(err => cb(err))
  }
}

module.exports = commentController
