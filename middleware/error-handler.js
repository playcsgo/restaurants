module.exports = {
  generalErrorHandler (err, req, res, next) {
    // 如果是Error的instance. 
    // 否則放入flash的 error_message
    if (err instanceof Error) {  
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', `${err}`)  
    }
    res.redirect('back')

    next(err)
  },
  apiErrorHandler (err, req, res, next) {
    if (err instanceof Error) {  
      res.status(500).json({
        status: 'error',
        message: `${err.name}: ${err.message}`
      })
    } else {
      res.status(500).json({
        status: 'error',
        message: `${err}`
      })
    }
  }
}
