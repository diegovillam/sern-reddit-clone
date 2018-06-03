import io from 'socket.io-client';
import store from './../store';

class Sockets {
    static endpoint = 'http://192.168.1.106:4000/';
    static socket = undefined;

    static connect(username) {
        Sockets.socket = io.connect(Sockets.endpoint);

        // Register this user's Sockets.socket
        Sockets.socket.emit('login', {username: username});
        // Event handlers
        Sockets.socket.on('connect', data => {
            // When user receives a message
            Sockets.socket.on('receive_message', data => {
                store.dispatch({ type: 'ADD_UNREAD_MESSAGE', value: 1 });
            });
        });
        return Sockets.socket;
    }

    static emit(endpoint, data) {
        Sockets.socket.emit(endpoint, data);
    }
}

export default Sockets;