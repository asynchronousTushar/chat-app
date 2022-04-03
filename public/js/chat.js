const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('connected', (message) => {
    const html = Mustache.render($messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("H:mm a "),
        username: message.username
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (locationMessage) => {
    const url = "https://map.google.com/?q=" + locationMessage.coordinates.latitude + ',' + locationMessage.coordinates.longitude;
    const html = Mustache.render($locationTemplate, {
        username,
        url,
        createdAt: moment(locationMessage.createdAt).format("H:mm a"),
        username: locationMessage.username
    })

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, { room, users });
    document.querySelector("#sidebar").innerHTML = html;
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;
    socket.emit('sendMessage', message, () => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
    });
})

$sendLocationButton.addEventListener('click', (event) => {
    if (!navigator.geolocation) {
        return alert('Please update your browser.');
    }

    event.target.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        socket.emit('sendLocation', location, (status) => {
            event.target.removeAttribute('disabled');
        });
    });
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        location.href = '/';
        alert(error)
    }
})
