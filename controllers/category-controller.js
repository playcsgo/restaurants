const { Category } = require('../models')
const categoryService = require('../services/category-service')

const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  postCategories: (req, res, next) => {
    categoryService.postCategories(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },
  putCategories: (req, res, next) => {
    categoryService.putCategories(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },
  deleteCategories: (req, res, next) => {
    categoryService.deleteCategories(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  }
}

module.exports = categoryController