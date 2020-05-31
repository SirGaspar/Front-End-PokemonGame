import { Injectable } from '@angular/core';
import io from 'socket.io-client';

@Injectable()
export class SocketService {
    public socket = io('http://localhost:3000');
    private socketUserId;

    public setSocketUserId(id) {
        this.socketUserId = id;
    }
    public getSocketUserId() {
        return this.socketUserId;
    }
}