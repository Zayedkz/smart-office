const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../middleware/auth');
const run = require('../cloud');

const User = require('../models/User');
const Room = require('../models/Room');
const Log = require('../models/Log');
const AdminLog = require('../models/AdminLog');
const Permission = require('../models/Permission');

// get specific rooms
router.post('/:rooms', auth, (req,res) => {
    const rooms = JSON.parse(req.params.rooms);
    Room.find({"name": { $in: rooms }})
        .sort({name: 1})
        .then(rooms => res.json(rooms))
});

// get all rooms
router.post('/rooms/all', auth, (req,res) => {
    Room.find()
        .sort({name: 1})
        .then(rooms => res.json(rooms))
});

// get all logs for room
router.post('/logs/:logs', auth, (req,res) => {
    const logs = (req.params.logs);
    Log.find({"room": { $in: logs }})
        .sort({date: -1})
        .limit(5)
        .then(logs => res.json(logs))
        .catch(err => res.json({err:err}));
});

// get all logs for room no limit
router.post('/log/:logs', auth, (req,res) => {
    const logs = (req.params.logs);
    Log.find({"room": { $in: logs }})
        .sort({date: -1})
        .then(logs => res.json(logs))
        .catch(err => res.json({err:err}));
});

// get all logs
router.post('/all/logs', auth, (req,res) => {
    Log.find()
        .sort({date: -1})
        .then(logs => res.json(logs))
        .catch(err => res.json({err:err}));
});

// get all logs
router.post('/all/adminlogs', auth, (req,res) => {
    AdminLog.find()
        .sort({date: -1})
        .then(logs => res.json(logs))
        .catch(err => res.json({err:err}));
});

// add new room
router.post('/new/:room', auth, (req,res) => {
    const room = JSON.parse(req.params.room).room;
    const admin = JSON.parse(req.params.room).admin;
    const newRoom = new Room({
        name: room.name,
        thing_id: room.thing_id,
        property_id: room.property_id,
        building: room.building,
        floor: room.floor,
        unlocked: room.unlocked
    });
    const newLog = new AdminLog({
        first_name: admin.first_name, 
        last_name: admin.last_name, 
        email: admin.email, // or just email
        request: "Create new room"
    })

    // check for existing room
    Room.findOne({ name: room.name }) 
        .then(room => {
            if (room) return res.status(400).json({ msg: 'Room already exists' });

            newRoom.save().then(room => {
                newLog.status = "200";
                newLog.message = "Created room: " + room.name;
                newLog.save();
                res.json(room)
            })
            .catch(err => {
                newLog.status = err.code;
                newLog.message = err.name + ":"+ err.messages +". for room " + room.name;
                newLog.save();
                res.status(404).json({success:false})
            })
        })

});

// update room
router.post('/update/:room', auth, (req,res) => {
    const room = JSON.parse(req.params.room).room;
    const admin = JSON.parse(req.params.room).admin;

    const newLog = new AdminLog({
        first_name: admin.first_name, 
        last_name: admin.last_name, 
        email: admin.email, // or just email
        request: "Update room"
    })

    Room.findOneAndUpdate({name: room.name}, {
        name: room.name,
        thing_id: room.thing_id,
        property_id: room.property_id,
        building: room.building,
        floor: room.floor,
        unlocked: room.unlocked
    }, 
        {new:true, upsert: true}, (err, doc) => {
            console.log(err)
        if (err) {
            newLog.status = err.code;
            newLog.message = err.name + ": "+ err.messages +". for room " + room.name;
            newLog.save();
            res.status(404).json({success:false})
        };
        newLog.status = "200";
        newLog.message = "Updated room: " + room.name;
        newLog.save();
        return res.send(doc)
    })
});

// switch lock
router.post('/switch/:room', auth, async (req,res) => {
    const room = JSON.parse(req.params.room).room;
    // console.log(room);
    const user = JSON.parse(req.params.room).user;
    // console.log(user);
    
    const newLog = new Log({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        room: room.name
    })

    run(room.thing_id, room.property_id, !room.unlocked)
    .then(result => {
        newLog.status = result.status;
        newLog.property = result.property;
        newLog.message = result.message;
        newLog.save().then(log => {
            Room.findOneAndUpdate({name: room.name}, {
                unlocked: !room.unlocked
            }, {new:true}, (err, doc) => {
                if (err) res.status(404).json({success:false});
                // console.log(doc);
                const payload = {
                    doc,
                    log
                }
                return res.send(payload);
            })
        });
    })
    .catch(result => {
        newLog.status = result.status;
        newLog.property = result.property;
        newLog.message = result.message;
        newLog.save();
        return res.status(result.status).json({msg: result.message});
    })
});

// create/update permissions
router.post('/permissions/:data', auth, (req,res) => {
    const data = JSON.parse(req.params.data);
    const newLog = new AdminLog({
        first_name: data.admin.first_name, 
        last_name: data.admin.last_name, 
        email: data.admin.email, // or just email
        request: "Update permissions"
    })
    Permission.findOneAndUpdate({user: data.user.email}, {
        user: data.user.email,
        rooms: data.rooms
    }, {upsert: true}, (err, doc) => {
        if (err) {
            newLog.status = err.code;
            newLog.message = err.name + ":"+ err.messages +". for user " + data.user.email;
            newLog.save();
            res.status(404).json({success:false})
        };
        newLog.status = "200";
        newLog.message = "Updated permissions: " + data.user.email;
        newLog.save();
        return res.send(doc);
    })
});

// delete room
router.delete('/:room', auth, (req,res) => {
    const room = JSON.parse(req.params.room).room;
    const admin = JSON.parse(req.params.room).admin;
    const newLog = new AdminLog({
        first_name: admin.first_name, 
        last_name: admin.last_name, 
        email: admin.email, // or just email
        request: "Delete room"
    })
    Room.findOne({name: room.name})
        .then(room => room.remove().then(()=> {
            Permission.updateMany({rooms: room.name}, { $unset : { "rooms": room.name }},
            (err, doc) => {
                if (err) res.status(404).json({success:false});
                newLog.status = "200";
                newLog.message = "Deleted room: " + room.name;
                newLog.save();
                return res.send('Success');
            })
        }))
        .catch(err => {
            newLog.status = err.code;
            newLog.message = err.name + ": "+ err.messages +". for room " + room.name;
            newLog.save();
            res.status(404).json({success:false})
        });
        
})
module.exports = router;