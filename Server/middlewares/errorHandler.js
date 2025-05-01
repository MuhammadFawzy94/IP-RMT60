function errorHandler(err, req, res, next) {
    console.log('Error:', err); // Log the full error

    let status = 500;
    let message = 'Internal Server Error';

    switch (err.name) {
        case 'SequelizeValidationError':
            status = 400;
            message = err.errors[0].message;
            break;
        case 'NotFound':
            status = 404;
            message = err.message;
            break;
        case 'Unauthorized':
            status = 401;
            message = err.message;
            break;
        case 'Forbidden':
            status = 403;
            message = err.message;
            break;
    }

    res.status(status).json({ message });
}

module.exports = errorHandler;