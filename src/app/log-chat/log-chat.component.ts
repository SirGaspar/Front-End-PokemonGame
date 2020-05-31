import { Component, OnInit } from '@angular/core';
import { EventEmiterService } from '../services/eventEmitter.service';
import { UserService } from '../services/user.service';
import { SocketService } from '../services/socket.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-log-chat',
  templateUrl: './log-chat.component.html',
  styleUrls: ['./log-chat.component.scss']
})
export class LogChatComponent implements OnInit {

  public message: string;
  public logMessages = [
    { message: `Welcome ${this.userService.getUserName()}, to Pokemon World Wars.`, type: 'bigInfo' },
  ]

  constructor(
    private _eventEmitter: EventEmiterService,
    private userService: UserService,
    private socketService: SocketService,  
  ) {
    this.socketService.socket.on('receivedMessage', (message) => {
      this._eventEmitter.emitChange({ message: message, type: '', category: 'logChatComponent' });
      setTimeout(() => {
        var messageBody = document.querySelector('.logChatContent');
        messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
      }, 120);
    })
  }

  ngOnInit() { }

  public submitMessage() {
    this.socketService.socket.emit('sendMessage', `${this.userService.getUserName()}: ${this.message}`);
    setTimeout(() => {
      var messageBody = document.querySelector('.logChatContent');
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
    }, 120);
    this.message = '';
  }

}
