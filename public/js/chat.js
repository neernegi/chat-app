

const socket=io() // access events from the server

// Elements

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')

const $SendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

// templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const LocationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const siderbarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room }=Qs.parse(location.search,{ ignoreQueryPrefix: true})

const autoScroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const VisibleHeight= $messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop + VisibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop=$messages.scrollHeight
    }
}


 // receive events
socket.on('message',(message)=>{
    console.log(message)
    const html =Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('LocationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(LocationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room,users})=>{
    const html=Mustache.render(siderbarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(message)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()


        console.log('The message was deliverd',message)
    })
})

$SendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }

    $SendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, ()=>{

            $SendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
            
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error) {
        alert(error)
        location.href='/'
    }
})