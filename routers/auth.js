const {Router} = require("express");
const {UserRecord} = require("../records/user.record");
const {hashPwd} = require("../helpers/hashPwd");
const {ValidationError} = require("../utils/errors");
const {generateToken, createToken, decodeToken} = require("../utils/tokens");

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
    .get('/logout', async (req, res) => {
        const jwtCookie = req.cookies?.['jwt'];
        const user = await decodeToken(jwtCookie);

        user.current_token_id = null;
        await user.updateToken();

        res
            .clearCookie('jwt', {
                secure: false,
                domain: 'localhost',
                httpOnly: true,
            })
            .status(200)
            .json({
                ok: true,
            });
    });

module.exports = {
    authRouter,
}
