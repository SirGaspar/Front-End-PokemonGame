import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LogChatComponent } from '../log-chat/log-chat.component';
import { PokemonService } from '../services/pokemon.service';
import * as _ from 'lodash';
import { PlayerComponent } from '../player/player.component';
import { EventEmiterService } from '../services/eventEmitter.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @ViewChild(LogChatComponent)
  public logChatComponent: LogChatComponent;
  @ViewChild(PlayerComponent)
  public playerComponent: PlayerComponent;

  public activeListener = false;

  constructor(
    private _eventEmitter: EventEmiterService,
    private userService: UserService,
    private router: Router,
    private socketService: SocketService,
  ) {
    _eventEmitter.changeEmitted$.subscribe(
      (message) => {
        this.messageController(message);
      });
      this.socketService.socket.on('connectionStarted', (socketUserId) => {
        this.socketService.setSocketUserId(socketUserId);
      });
  }

  ngOnInit() {
    if(!this.userService.getUserId()) {
      this.router.navigate(['/']);
    }
  }

  public closed(componentReference) {
    this.activeListener = true;
  }

  public closePokeball() {
    document.getElementById("topPokeball").classList.add("close");
    document.getElementById("bottomPokeball").classList.add("close");
  }

  public openPokeball() {
    document.getElementById("topPokeball").classList.remove("close");
    document.getElementById("bottomPokeball").classList.remove("close");
  }

  public messageController(message) {
    switch (message.category) {
      case 'logChatComponent':
        this.logChatComponent.logMessages.push({ message: message.message, type: message.type });
        setTimeout(() => {
          var messageBody = document.querySelector('.logChatContent');
          messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        }, 120);
      break;
    }
  }

}
