function errorHandler(err, req, res, next) {
    console.error(err.stack);

    if (res.headersSent) {
        return next(err);
    }
    
    console.log("ERROR MIDDLEWARE CALLED")
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
}

module.exports = errorHandler;
