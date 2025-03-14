const {Router} = require("express");
const {UserRecord} = require("../records/user.record");
const {hashPwd} = require("../helpers/hashPwd");
const {ValidationError} = require("../utils/errors");
const { v4: uuid4 } = require('uuid');

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
                },
        });
    });

module.exports = {
    userRouter,
}
