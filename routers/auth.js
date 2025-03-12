const {Router} = require("express");
const {UserRecord} = require("../records/user.record");
const {hashPwd} = require("../helpers/hashPwd");
const {ValidationError} = require("../utils/errors");
const {generateToken, createToken, deleteJwtCookie} = require("../utils/tokens");
const {authenticateUser} = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter
    .post('/login', async (req, res) => {
        const {email, password} = req.body;
        const user = await UserRecord.findToLogin(email, hashPwd(password));

        if (!user) {
            throw new ValidationError('Invalid login data!');
        }

        const token = createToken(await generateToken(user));

        res
            .cookie('jwt', token.accessToken, {
                secure: false,
                domain: 'localhost',
                httpOnly: true,
            })
            .status(200)
            .json({
                ok: true,
                data: {
                    name: user.name,
                },
            });
    })
    .get('/logout', authenticateUser, async (req, res) => {
        try {
            req.user.current_token_id = null;
            await req.user.updateToken();

            deleteJwtCookie(res);
            res.status(200).json({ ok: true });
        } catch (error) {
            deleteJwtCookie(res);
            throw error;
        }
    });

module.exports = {
    authRouter,
}
