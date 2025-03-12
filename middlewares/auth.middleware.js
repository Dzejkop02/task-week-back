const { decodeToken, deleteJwtCookie } = require('../utils/tokens');

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
