const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('ALHAMDULILLAH')
});

let users = []

io.on('connection', socket => {

    socket.on('userInfo', info => {
        console.log(info.userDp)
        users.push({ name: info.name, userRole: info.userRole, userID: socket.id })
        socket.emit('yourID', socket.id)
        io.sockets.emit('allUsers', users)
        console.log(users);
    })

    socket.on('disconnect', () => {
        users = users.filter(user => {
            return user.userID !== socket.id
        })
        console.log('disconnect users: ', users);
        io.sockets.emit('allUsers', users)
    })

    socket.on('callUser', (data) => {
        console.log('call user data: ', data)
        let requiredUser = users.find(user => {
            return user.userID === data.userToCall
        })
        console.log('call user: ', requiredUser)
        io.to(requiredUser.userID).emit('callComing', { signal: data.signalData, callerID: data.callerID, callerName: data.callerName })
    })

    socket.on('acceptCall', (data) => {
        console.log('accept call data: ', data)
        let requiredUser = users.find(user => {
            return user.userID === data.to
        })
        console.log('accept call: ', requiredUser)
        io.to(requiredUser.userID).emit('callAccepted', data.signal)
    })

    socket.on('close', (data) => {
        console.log('close: ', data)
        let requiredUser = users.find(user => {
            return user.userID === data.to
        })
        io.to(requiredUser.userID).emit('close')
    })

    socket.on('rejected', (data) => {
        let requiredUser = users.find(user => {
            return user.userID === data.to
        })
        io.to(requiredUser.userID).emit('rejected')
    })
})


server.listen(PORT, () => console.log(`Server is Running on port: ${PORT}`));

