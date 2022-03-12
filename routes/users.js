const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')

const User = require('../models/User');
const Permission = require('../models/Permission');
const AdminLog = require('../models/AdminLog');

// Register new user
router.post('/new/:user', (req,res) => {
    const { first_name, last_name, email, password_raw } = JSON.parse(req.params.user).user;
    const admin = JSON.parse(req.params.user).admin;

    if (!first_name || !last_name || !email || !password_raw) {
        return res.status(400).json({ msg: 'please enter all fields' });
    }

    // check for existing user
    User.findOne({ email: email }) // or just email cause they are the same
        .then(user => {
            if (user) return res.status(400).json({ msg: 'User already exists' });

            const newUser = new User({
                first_name: first_name, 
                last_name: last_name, 
                email: email, // or just email
                password_raw: password_raw, // or just password
                user: true
            });
            const newLog = new AdminLog({
                first_name: admin.first_name, 
                last_name: admin.last_name, 
                email: admin.email, // or just email
                request: "Create new user"
            })

            // create salt & hash
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password_raw, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            newLog.status = "200";
                            newLog.message = "Created user for " + user.email;
                            newLog.save();
                            return res.send(user)
                        })
                        .catch(err => {
                            newLog.status = err.code;
                            newLog.message = err.name + ":"+ err.messages +". for user " + email;
                            newLog.save();
                            res.status(404).json({success:false})
                        })
                })
            })
        })
});

// update user
router.post('/update/:user', (req,res) => {
    const { first_name, last_name, email, password_raw } = JSON.parse(req.params.user).user;
    const admin = JSON.parse(req.params.user).admin;

    if (!first_name || !last_name || !email || !password_raw) {
        return res.status(400).json({ msg: 'please enter all fields' });
    }

    const newUser = new User({
        first_name: first_name, 
        last_name: last_name, 
        email: email, // or just email
        password_raw: password_raw // or just password
    });
    const newLog = new AdminLog({
        first_name: admin.first_name, 
        last_name: admin.last_name, 
        email: admin.email, // or just email
        request: "Update user"
    })

    // create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password_raw, salt, (err, hash) => {
            if (err) throw err;
            User.findOneAndUpdate({email: email}, {
                first_name: first_name, 
                last_name: last_name, 
                email: email, 
                password_raw: password_raw,
                password: hash
            }, {new:true, upsert: true}, (err, doc) => {
                if (err) {
                    newLog.status = err.code;
                    newLog.message = err.name + ": "+ err.messages +". for user " + email;
                    newLog.save();
                    res.status(404).json({success:false})
                };
                newLog.status = "200";
                newLog.message = "Updated user: " + email;
                newLog.save();
                return res.send(doc)
            })
        })
    })
});

// Register new admin
router.post('/admin/new/:admin', (req,res) => {
    const { first_name, last_name, email, password_raw } = JSON.parse(req.params.admin);

    if (!first_name || !last_name || !email || !password_raw) {
        return res.status(400).json({ msg: 'please enter all fields' });
    }

    // check for existing user
    User.findOne({ email: email }) // or just email cause they are the same
        .then(user => {
            if (user) return res.status(400).json({ msg: 'User already exists' });

            const newUser = new User({
                first_name: first_name, 
                last_name: last_name, 
                email: email, // or just email
                password_raw: password_raw, // or just password
                admin: true
            });

            // create salt & hash
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password_raw, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            return res.send(user)
                        })
                })
            })
        })
});

// get all users
router.post('/users', auth, (req,res) => {
    User.find({user: true})
        .select('-password')
        .sort({first_name: 1})
        .then(users => res.json(users))
});

// get all admins
router.post('/admins', auth, (req,res) => {
    User.find({admin: true})
        .select('-password')
        .sort({first_name: 1})
        .then(users => res.json(users))
});

// get permissions for user
router.post('/permission/:email', auth, (req,res) => {
    Permission.findOne({user: req.params.email})
        .then(user => {
            res.json(user.rooms)
        })
        .catch(err => res.status(404).json({success:false}));
})

// delete user & permissions
router.delete('/:user', auth, (req,res) => {
    const user = JSON.parse(req.params.user).user;
    const admin = JSON.parse(req.params.user).admin;
    const newLog = new AdminLog({
        first_name: admin.first_name, 
        last_name: admin.last_name, 
        email: admin.email, // or just email
        request: "Delete user"
    })
    User.findOne({email:user.email})
        .then(user => user.remove().then(()=> {
            Permission.findOne({user: user.email})
                .then(perm => perm.remove().then(() => {
                    newLog.status = "200";
                    newLog.message = "Deleted user: " + user.email;
                    newLog.save();
                    res.json({success:true})
                }))
        }))
        .catch(err => {
            newLog.status = err.code;
            newLog.message = err.name + ": "+ err.messages +". for user " + user.email;
            newLog.save();
            res.status(404).json({success:false})
        });
})

// delete admin
router.delete('/admin/:admin', auth, (req,res) => {
    const admin = (req.params.admin);
    User.findOne({email: admin})
        .then(user => user.remove().then(()=> res.json({success:true})))
        .catch(err => res.status(404).json({success:false}));
})

module.exports = router;