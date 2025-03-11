require('dotenv').config();
const { v4: uuid4 } = require('uuid');
const {sign, verify} = require('jsonwebtoken');
const {UserRecord} = require("../records/user.record");
const {UnauthorizedError} = require("./errors");

// Generate user personal token and save in database.
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

// Create secure token to send in cookies.
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

// Verify, decoded token and return logged in user.
async function decodeToken(payload) {
    if (!payload) {
        throw new UnauthorizedError('Not logged in.');
    }

    const jwtSecret = process.env.JWT_SECRET || '';
    const jwt = verify(
        payload,
        jwtSecret,
    );

    if (!jwt.id) {
        throw new UnauthorizedError('Not logged in.');
    }

    return await UserRecord.findByToken(jwt.id);
}

module.exports = {
    generateToken,
    createToken,
    decodeToken,
}
