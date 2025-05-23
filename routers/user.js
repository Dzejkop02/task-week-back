const {Router} = require("express");
const {UserRecord} = require("../records/user.record");
const {hashPwd} = require("../helpers/hashPwd");
const {ValidationError} = require("../utils/errors");
const { v4: uuid4 } = require('uuid');
const {authenticateUser} = require("../middlewares/auth.middleware");
const {deleteJwtCookie} = require("../utils/tokens");

const userRouter = Router();

userRouter
    .post('/', async (req, res) => {
        const {name, email, password} = req.body;

        const foundUser = await UserRecord.find(email);

        if (foundUser) {
            throw new ValidationError('This email is already taken.');
        }

        if (!password) {
            throw new ValidationError('Provide password.');
        }

        const userData = {
            id: uuid4(),
            name,
            email,
            pwd_hash: hashPwd(password),
            last_weekly_clean: new Date()
        };

        const newUser = new UserRecord(userData);

        await newUser.save();

        res
            .status(201)
            .json({
                ok: true,
                data: {
                    email: newUser.email,
                    name: newUser.name,
                    weeklyDeleting: false,
                },
        });
    })
    .patch('/', authenticateUser, async (req, res) => {
        const {weeklyDeleting} = req.body;

        if (weeklyDeleting !== false && weeklyDeleting !== true) {
            throw new ValidationError('Invalid weeklyDeleting argument. Allowed options: true | false');
        }

        req.user.weekly_deleting = weeklyDeleting ?? req.user.weekly_deleting;

        const user = await req.user.update();

        res.status(200).json({
            ok: true,
            data: {
                email: user.email,
                name: user.name,
                weeklyDeleting: user.weekly_deleting,
            },
        });

    })
    .patch('/password', authenticateUser, async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            throw new ValidationError('Provide old password and new password.');
        }

        if (newPassword.length < 3) {
            throw new ValidationError('New password must be at least 3 characters long.');
        }

        const hashedOld = hashPwd(oldPassword);
        if (req.user.pwd_hash !== hashedOld) {
            throw new ValidationError('Old password is incorrect.');
        }

        const newHash = hashPwd(newPassword);
        const updatedUser = await req.user.updatePassword(newHash);

        deleteJwtCookie(res);

        res.status(200).json({
            ok: true,
            data: {
                email: updatedUser.email,
                name: updatedUser.name,
                message: 'Password changed successfully. Please log in again.',
            },
        });
    });

module.exports = {
    userRouter,
}
