const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    })

    if (existingUser) {
        return {
            error: 'Username already taken.'
        }
    }

    const user = { id, username, room }
    users.push(user)

    return user;
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getuser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    })

    if (!user) {
        return {
            error: "no user found"
        }
    }

    return user;
}

const getuserroom = (room) => {
    const userroom = users.filter((user) => {
        return user.room === room;
    })

    if (!userroom) {
        return {
            error: 'No room founded'
        }
    }

    return userroom;
}

module.exports = {
    addUser,
    removeUser,
    getuser,
    getuserroom
}