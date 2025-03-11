require('dotenv').config();
const { v4: uuid4 } = require('uuid');
const {sign} = require('jsonwebtoken');
const {UserRecord} = require("../records/user.record");

async function generateToken(user) {
    let token;
    let userWithThisToken = null;

    do {
        token = uuid4();
        userWithThisToken = await UserRecord.findByToken(token);
    } while (!!userWithThisToken);

    user.current_token_id = token;
    await user.updateToken();

    return token;
}

function createToken(id) {
    const payload = {id};
    const expiresIn = 60 * 60 * 24;
    const jwtSecret = process.env.JWT_SECRET || '';

    const accessToken = sign(
        payload,
        jwtSecret,
        {expiresIn},
    );

    return {
        accessToken,
        expiresIn,
    };
}

module.exports = {
    generateToken,
    createToken,
}
