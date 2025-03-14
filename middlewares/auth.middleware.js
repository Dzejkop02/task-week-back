const { decodeToken, deleteJwtCookie, createToken} = require('../utils/tokens');

async function authenticateUser(req, res, next) {
    try {
        const token = req.cookies?.['jwt'];
        const user = await decodeToken(token);

        if (!user) {
            deleteJwtCookie(res);
            return res.status(401).json({
                ok: false,
                message: 'User not logged in. Cookies cleared.',
            });
        }

        // Przedłużanie ważności tokenu
        const newToken = createToken(user.current_token_id);
        res.cookie('jwt', newToken.accessToken, {
            secure: false,
            domain: 'localhost',
            httpOnly: true,
            maxAge: newToken.expiresIn * 1000,
        });

        req.user = user;
        next();
    } catch (error) {
        deleteJwtCookie(res);
        next(error);
    }
}

module.exports = {
    authenticateUser,
};
