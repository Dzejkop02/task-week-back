require('dotenv').config();
const crypto = require('crypto');

const salt = process.env.SALT || 'test';

const hashPwd = p => {
    const hmac = crypto.createHmac(
        'sha512',
        salt,
    );
    hmac.update(p);
    return hmac.digest('hex');
};

module.exports = {
    hashPwd,
}
