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
    console.log('進到error handler')

    next(err)
  }
}
