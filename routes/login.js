const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const User = require('../models/User');

// Login user
router.post('/', (req,res) => {
    const { email, password } = req.body; 

    // simple validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'please enter all fields' });
    }

    // check for existing user
    User.findOne({ email: email}) // or just email cause they are the same
        .then(user => {
            if (!user) return res.status(400).json({ msg: 'User does not exist' });

            // validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

                    jwt.sign(
                        { id: user.id },
                        config.get('jwtKey'),
                        { expiresIn: 3600 }, 
                        (err, token) => {
                            if(err) throw err;
                            return res.json({
                                token: token,
                                user: {
                                    id: user.id,
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    admin: user.admin,
                                    superuser: user.superuser,
                                    user: user.user
                                }
                            });
                        }
                    )
                })
        })
});

router.get('/user', auth, (req,res) => {
    User.findById(req.user.id)
        .select('-password -password_raw')
        .then(user => res.json(user));
})

module.exports = router;