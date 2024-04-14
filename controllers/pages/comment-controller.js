const { Comment, User, Restaurant } = require('../../models')
const commentServices = require('../../services/comment-service')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => err ? next(err) : res.redirect(`/restaurants/${data.postedComment.restaurantId}`))
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => err ? next(err) : res.redirect(`/restaurants/${data.deletedComment.restaurantId}`))
  }
}

module.exports = commentController
