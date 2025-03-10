class ValidationError extends Error {}
// class NotFoundError extends Error {}

function handleError(err, req, res, next) {
    // if (err instanceof NotFoundError) {
    //     res
    //         .status(404)
    //         .json({
    //             message: 'Element with provided ID not found.',
    //         });
    //     return;
    // }

    console.error(err);

    res
        .status(err instanceof ValidationError ? 400 : 500)
        .json({
            message: err instanceof ValidationError ? err.message : 'Sorry, server error occurred.',
        });
}

module.exports = {
    handleError,
    ValidationError,
    // NotFoundError,
}
