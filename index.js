var express = require('express');
var mongoose = require('mongoose')
const http = require("http");
const socketio = require("socket.io");
const { dbString } = require('./config.js')
const userModel = require('./models/User');
const privateMessage = require('./models/PrivateMessage');
const GroupMessage = require('./models/GroupMessage');
const cookieParser = require('cookie-parser')

var app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(__dirname + "public"))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(express.json());

io.on('connection', (socket) => {
    
    const joinMsg = {
        msg: 'Welcome to the chatroom',
        name: 'SERVER'
    }
    socket.emit('joinMsg', joinMsg)

    socket.on('joinRoom', (room) => {
        socket.join(room)
    })

    socket.on('sendMsg', (data) => {
        const msg = {
            msg: data.message,
            name: data.username
        }
        socket.broadcat.to(data.room).emit('msg', msg)
    })

    socket.on("typing", () => {
        socket.broadcast.emit("typing", {user: socket.username})
    })

    
    socket.on("disconnect", () => {
        const byeMsg = {
            msg: `USER has left`,
            name: 'SERVER'
        }
        console.log("goodbye")
        socket.broadcast.emit("byeMsg", byeMsg)
    })

})

mongoose.connect(dbString.dbURL , { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('mongodb connected',err);
    }else{
        console.log('Successfully mongodb connected');
    }
})

app.post('/register', async (req, res) => {
    console.log(req.body)
    const user = new userModel(req.body)

    try {
        await user.save((err) => {
          if(err){
            res.send(err)
          }else{
            res.sendFile(__dirname + '/login.html')
          }
        });
      } catch (err) {
        res.status(500).send(err);
      }
    res.sendFile(__dirname + '/login.html')

});

app.get('/register', async (req, res) => {
    res.sendFile(__dirname + '/register.html')
});

app.get(['/', '/login'], async (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

app.get('/logout', async (req, res) => {
    res.clearCookie('username')
    res.sendFile(__dirname + '/login.html')
})

app.post('/login', async (req, res) => {
    const user = await userModel.findOne({username: req.body.username, password: req.body.password})
    console.log(user)
    try {
        if(user != null){
            res.cookie('username', user.username)
            res.sendFile(__dirname + "/room.html")
        }else{
          res.send(JSON.stringify({status:false, message: "No user found"}))
        }
      } catch (err) {
        res.status(500).send(err);
      }
})


app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/room.html')
})


app.get('/groupMessages', (req, res) => {
    GroupMessage.find({},(err, messages)=> {
        console.log(messages)
      res.send(messages);
    })
  })

app.post('/groupMessages', (req, res) => {
    console.log(req.body)
        const msg = {
            from_user: req.body.username,
            room: req.body.room,
            message: req.body.message
        }
    var message = new GroupMessage(msg);
    message.save((err) =>{ 
      if(err)
      {
        console.log(err)
      }
    })
})


var start = server.listen(8088, () => {
    console.log('server is running on port', start.address().port);
});
