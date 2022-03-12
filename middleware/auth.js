const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    // check for token
    if(!token) return res.status(401).json({ msg: 'no token, authorization denied' });

    try {
        // verify token
        const decoded = jwt.verify(token, config.get('jwtKey'));
        // add user from payload 
        req.user = decoded;
        next(); // call next piece of middleware
    } catch(e) {
        res.status(400).json({ msg: 'token is not valid', redirect: true });
    }
}

module.exports = auth;