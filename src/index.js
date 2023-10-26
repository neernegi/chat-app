import path from 'path'
import http from 'http'
import express from 'express'
import {Server} from 'socket.io'
import  {generateMessage,generateLocation } from './utils/message.js'
import { addUser,removeUser,getUser,getUsersInRoom } from './utils/user.js'



const app=express()
const server=http.createServer(app)
const io=new Server(server)

const port=process.env.PORT || 3000

const __dirname = path.resolve();
const publicDirectoryPath=path.join(__dirname, 'public')

app.use(express.static(publicDirectoryPath));



io.on('connection',(socket)=>{
    console.log("New websocket connection")

    

    socket.on('join',(options,callback)=>{
        const { error,user }=addUser({ id:socket.id, ...options })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin' ,`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendlocation',(coords,callback)=>{
        const user=getUser(socket.id)

        io.to(user.room).emit('LocationMessage',generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    
})

server.listen(port, ()=>{
    console.log(`Server is up on port ${port}!`)
})

