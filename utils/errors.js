class ValidationError extends Error {}
class UnauthorizedError extends Error {}
// class NotFoundError extends Error {}

function handleError(err, req, res, next) {
    if (err instanceof UnauthorizedError) {
        res
            .status(401)
            .json({
                ok: false,
                message: err instanceof UnauthorizedError ? err.message : 'You are not authorised to access this content.',
            });
        return;
    }

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
            ok: false,
            message: err instanceof ValidationError ? err.message : 'Sorry, server error occurred.',
        });
}

module.exports = {
    handleError,
    ValidationError,
    UnauthorizedError,
    // NotFoundError,
}
