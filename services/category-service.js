const { Category } = require('../models')

const categoryController = {
  postCategories: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
   return Category.create({ name })
      .then(createdCategory => cb(null, { createdCategory }))
      .catch(err => cb(err))
  },
  putCategories: (req, cb) => {
    const { name } = req.body
    if(!name) throw new Error('Category name is required')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category does not exist!')
        return Category.update({ name }, { where: { id: req.params.id } })
      })
      .then(updatedCategory => cb(null, { updatedCategory }))
      .catch(err => cb(err))
  },
  deleteCategories: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category does not exist!')
        return category.destroy()
      })
      .then(deletedCategory => cb(null, { deletedCategory }))
      .catch(err => cb(err))
  }
}

module.exports = categoryController