const categoryService = require('../../services/category-service')


const categoryController = {
  getCategories: (req, res, next) => {
    categoryService.getCategories(req, (err, data) => err ? next(err) : res.json({ status: "success", data }))
  },
  postCategories: (req, res, next) => {
    categoryService.postCategories(req, (err, data) => err ? next(err) : res.json({ status: "success", data }))
  },
  putCategories: (req, res, next) => {
    categoryService.putCategories(req, (err, data) => err ? next(err) : res.json({ status: "success", data }))
  },
  deleteCategories: (req, res, next) => {
    categoryService.deleteCategories(req, (err, data) => err ? next(err) : res.json({ status: "success", data }))
  }
}

module.exports = categoryController