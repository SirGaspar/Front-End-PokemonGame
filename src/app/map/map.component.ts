import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import * as _ from 'lodash';
import { GameComponent } from '../game/game.component';
import * as $ from 'jquery';
import { EventEmiterService } from '../services/eventEmitter.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { ActionService } from '../services/action.service';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Input() public listener;

  public mapConfiguration;
  public mapName;
  public previousMap;
  public playerId;
  public player;
  // public atualPlace = [0, 'general', 0];
  public atualPlace = [this.userService.getUserRegionPositionId(), this.determineMapType(this.userService.getUserPlaceTypePositionId()), this.userService.getUserMapPositionId()];
  public mapPositionCoordinates = [this.userService.getUserXCoordenate(),this.userService.getUserYCoordenate()];
  public characterPositionFrame = 'Bottom';
  public characterFeetFrame = 'Right';
  public enconteredPokemon = '';
  public activeListener = true;
  public music: any;

  public devGrid = false;
  public square;
  public squareQtd;
  public squareList = [];

  private walkSpeedDelay = 150;
  private encounterRate = 10;
  private jsonMap = require('./../map.json');

  constructor(
    private router: Router,
    private game: GameComponent,
    private _eventEmitter: EventEmiterService,
    private socketService: SocketService,
    private userService: UserService,
    private actionService: ActionService,
    private mapService: MapService,
  ) {
    this.activeListener = true;
    this.mapService.setMapConfiguration(this.jsonMap.regions[this.atualPlace[0]].places[`${this.atualPlace[1]}`][this.atualPlace[2]]);
    this.mapConfiguration = this.mapService.getMapConfiguration();
    this.playMusic();
    this.mapName = this.mapConfiguration.mapName;

    // Usar para GridDev
    if (this.devGrid) {
      var img = new Image();
      let imgWidth;
      let imgHeight;
      img.onload = () => {
        imgWidth = img.width;
        imgHeight = img.height
        $('.gridContainer').width(`${imgWidth}px`);
        $('.gridContainer').height(`${imgHeight}px`);
        $('.mapComponent').width(`${imgWidth}px`);
        $('.mapComponent').height(`${imgHeight}px`);
        this.square = imgWidth / 32;
        const numberOfLines = (imgHeight / 32) * this.square;
        this.squareQtd = Array.apply(null, { length: this.square*this.square }).map( Number.call, Number );
      }
      img.src = `./../../assets/tilesets/${this.mapName}.png`;
    }

    this.socketService.socket.emit('joinMap', this.characterPositionFrame, this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], userService.getUserName(), this.atualPlace, userService.getUserId());
    this.socketService.socket.on('mapChanged', (data) => {
      this.playerId = this.socketService.getSocketUserId();
      let playerXCoordenate;
      let playerYCoordenate;
      data.users.forEach((user) => {
        if (user.user === this.playerId) {
          playerXCoordenate = user.xCoordenate;
          playerYCoordenate = user.yCoordenate;
        }
      });
      $(".player").map((index, lastInstanceUsers) => {
        if (data.users.findIndex((user) => user.user === lastInstanceUsers.id) === -1) {
          $(`#${lastInstanceUsers.id}`).remove();
        }
      })
      data.users.forEach((player) => {
        if ($(`#${player.user}`).length) {
          $(`#${player.user} img`).attr('src', `./../../assets/tilesets/player${player.frame}.png`)
          $(`#${player.user}`).not($(`#${this.playerId}`))
          .attr("style", `position: absolute; margin-top: ${(playerXCoordenate - player.xCoordenate) * 32}px; margin-left: ${(playerYCoordenate - player.yCoordenate) * 32}px;
          transition: margin-top 0.3s, margin-left 0.3s; cursor: pointer; display: flex; flex-direction: column; align-items: center;`);
        } else {
          const newPlayerContainer = document.createElement("div");
          newPlayerContainer.setAttribute("id", `${player.user}`);
          this.playerId === player.user ? 
          newPlayerContainer.setAttribute("style", "position: absolute; transition: margin-top 0.3s, margin-left 0.3s; cursor: pointer;  display: flex; flex-direction: column; align-items: center;")
          : newPlayerContainer.setAttribute("style", `position: absolute; margin-top: ${(playerXCoordenate - player.xCoordenate) * 32}px; margin-left: ${(playerYCoordenate - player.yCoordenate) * 32}px; transition: margin-top 0.3s, margin-left 0.3s; cursor: pointer;  display: flex; flex-direction: column; align-items: center;`)
          newPlayerContainer.setAttribute("class", "player");
          $(".mapComponent").append(newPlayerContainer);
          const newPlayerName = document.createElement("span");
          newPlayerName.innerHTML = `${player.username}`;
          newPlayerName.setAttribute('style', 'font-size: 10px; font-weight: 600; margin-top: -25px; margin-bottom: 5px; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;');
          $(`#${player.user}`).append(newPlayerName);
          const newPlayerImg = document.createElement("img");
          newPlayerImg.setAttribute('src', `./../../assets/tilesets/player${player.frame}.png`)
          newPlayerImg.setAttribute("style", 'height: 40px; width: 28px;');
          $(`#${player.user}`).append(newPlayerImg);
        }
      });
    })
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    this.game.activeListener = false;
    this.activeListener = true;
  }

  ngOnDestroy() {
    $(window).off('keydown');
  }

  ngAfterViewInit() {
    this.WalkToCoordinate(this.mapPositionCoordinates);
    window.addEventListener('keydown', (event) => {
      if ((event.keyCode === 87 || event.keyCode === 38 || event.keyCode === 65 || event.keyCode === 37 ||
        event.keyCode === 83 || event.keyCode === 40 || event.keyCode === 68 || event.keyCode === 39 || 
        event.keyCode === 33 || event.keyCode === 69 || event.keyCode === 88) && !$('.logChatInput').is(":focus")) {
          if (this.activeListener) {
            this.activeListener = false;
            this.walkController(event);
          }
        }
    }, false);
  }

  public selectSquare(element) {
    const id = element.target.id;
    const preLine = Math.trunc(id / (this.square));
    const line = (((this.square -1) / 2)) - preLine;
    const preColumn = Math.trunc(parseInt(id)-(this.square * preLine));
    const column = ((this.square -1) /2) - preColumn;
    const finalValueSquare = `${line}|${column}`;
    if($(element.target).hasClass('selected')) {
      this.squareList = this.squareList.filter((square) => square !== finalValueSquare);
      $(element.target).removeClass('selected');
    } else {
      if (!this.squareList.includes(finalValueSquare)) {
        this.squareList.push(finalValueSquare);
      }
      $(element.target).addClass('selected');
    }
    console.log(JSON.stringify(this.squareList)); // Não remover
  }

  public enterBtn(event) {
    if (event.keyCode === 87 || event.keyCode === 38 || event.keyCode === 65 || event.keyCode === 37 ||
      event.keyCode === 83 || event.keyCode === 40 || event.keyCode === 68 || event.keyCode === 39) {
        if (this.activeListener) {
          this.activeListener = false;
          this.walkController(event);
        }
      }
  }

  private walkController(event) {
    const map = document.getElementById("map");
    const storedMapPositionCoordinates = _.cloneDeep(this.mapPositionCoordinates);
    if (event.keyCode === 87 || event.keyCode === 38) {
      if (this.characterPositionFrame === 'Top' || this.characterPositionFrame === 'TopWalkRight' || this.characterPositionFrame === 'TopWalkLeft') {
        this.mapPositionCoordinates[0]++;
        this.characterPositionFrame = `TopWalk${this.characterFeetFrame}`;
        this.characterFeetFrame = this.characterFeetFrame === 'Right' ? 'Left' : 'Right';
        setTimeout(() => { this.characterPositionFrame = 'Top' }, 100);
        setTimeout(() => { this.socketService.socket.emit('playerWalking', 'Top', this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], this.atualPlace)}, 100);;
        this.WalkToCoordinate(storedMapPositionCoordinates);
      } else {
        this.characterPositionFrame = 'Top'
        this.activeListener = true;
      }
    }
    if (event.keyCode === 65 || event.keyCode === 37) {
      if (this.characterPositionFrame === 'Left' || this.characterPositionFrame === 'LeftWalkRight' || this.characterPositionFrame === 'LeftWalkLeft') {
        this.mapPositionCoordinates[1]++;
        this.characterPositionFrame = `LeftWalk${this.characterFeetFrame}`;
        this.characterFeetFrame = this.characterFeetFrame === 'Right' ? 'Left' : 'Right';
        setTimeout(() => { this.characterPositionFrame = 'Left' }, 100);
        setTimeout(() => { this.socketService.socket.emit('playerWalking', 'Left', this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], this.atualPlace)}, 100);;
        this.WalkToCoordinate(storedMapPositionCoordinates);
      } else {
        this.characterPositionFrame = 'Left'
        this.activeListener = true;
      }
    }
    if (event.keyCode === 83 || event.keyCode === 40) {
      if (this.characterPositionFrame === 'Bottom' || this.characterPositionFrame === 'BottomWalkRight' || this.characterPositionFrame === 'BottomWalkLeft') {
        this.mapPositionCoordinates[0]--;
        this.characterPositionFrame = `BottomWalk${this.characterFeetFrame}`;
        this.characterFeetFrame = this.characterFeetFrame === 'Right' ? 'Left' : 'Right';
        setTimeout(() => { this.characterPositionFrame = 'Bottom' }, 100);
        setTimeout(() => { this.socketService.socket.emit('playerWalking', 'Bottom', this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], this.atualPlace)}, 100);;
        this.WalkToCoordinate(storedMapPositionCoordinates);
      } else {
        this.characterPositionFrame = 'Bottom'
        this.activeListener = true;
      }
    }
    if (event.keyCode === 68 || event.keyCode === 39) {
      if (this.characterPositionFrame === 'Right' || this.characterPositionFrame === 'RightWalkRight' || this.characterPositionFrame === 'RightWalkLeft') {
        this.mapPositionCoordinates[1]--;
        this.characterPositionFrame = `RightWalk${this.characterFeetFrame}`;
        this.characterFeetFrame = this.characterFeetFrame === 'Right' ? 'Left' : 'Right';
        setTimeout(() => { this.characterPositionFrame = 'Right' }, 100);
        setTimeout(() => { this.socketService.socket.emit('playerWalking', 'Right', this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], this.atualPlace)}, 100);;
        this.WalkToCoordinate(storedMapPositionCoordinates);
      } else {
        this.characterPositionFrame = 'Right'
        this.activeListener = true;
      }
    }
    if (event.keyCode === 33 || event.keyCode === 69 || event.keyCode === 88) {
      this.verifyAction(storedMapPositionCoordinates);
    }
  }

  private verifyAction(atualCoordenates) {
    const verifyCoordenate = _.cloneDeep(atualCoordenates);
    if (this.characterPositionFrame === 'Top') { verifyCoordenate[0]++ } else
    if (this.characterPositionFrame === 'Bottom') { verifyCoordenate[0]-- } else
    if (this.characterPositionFrame === 'Left') { verifyCoordenate[1]++ } else
    { verifyCoordenate[1]-- }
    this.mapConfiguration.coordenates.action.forEach((action) => {
      if (action.cordenate === `${verifyCoordenate[0]}|${verifyCoordenate[1]}`) {
        this.actionService.callAction(action.act, action.param);
      }
    });
    this.activeListener = true;
  }

  private WalkToCoordinate(storedMapPositionCoordinates) {
    const mapCoordenate = `${this.mapPositionCoordinates[0]}|${this.mapPositionCoordinates[1]}`;
    console.log(mapCoordenate)
    // Verifica Colisão
    if (_.indexOf(this.mapConfiguration.coordenates.block, mapCoordenate) === -1) {
      this.socketService.socket.emit('playerWalking', this.characterPositionFrame, this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1]);
      document.getElementById("map").setAttribute("style", `margin-top: ${this.mapPositionCoordinates[0] * 64}px; margin-left: ${this.mapPositionCoordinates[1] * 64}px`);
      // Usar para gridDev
      if (this.devGrid) {
        document.getElementById("gridDev").setAttribute("style", `margin-top: ${this.mapPositionCoordinates[0] * 64}px; margin-left: ${this.mapPositionCoordinates[1] * 64}px`);
      }
      $(".player").not($(`#${this.playerId}`)).attr("style", `position: absolute; margin-top: ${this.mapPositionCoordinates[0] * 32}px; margin-left: ${this.mapPositionCoordinates[1] * 32}px;
      transition: margin-top 0.3s, margin-left 0.3s; cursor: pointer; display: flex; flex-direction: column; align-items: center;`);
      let actionFound = false;
      // Verifica Possibilidade de Encontro
      this.mapConfiguration.coordenates.encounter.forEach((encounter) => {
        if (encounter === mapCoordenate) {
          actionFound = true;
          this.activeListener = false;
          this.encounter();
        }
      });
      // Verifica Mudança de Mapa
      this.mapConfiguration.coordenates.portal.forEach((portal) => {
        if (portal.cordenate === mapCoordenate) {
          actionFound = true;
          this.activeListener = false;
          this.changePlace(portal.place, portal.initialCoordenate);
        }
      });
      if (!actionFound) {
        setTimeout(() => { this.activeListener = true; }, this.walkSpeedDelay);
      }
    }
    else {
      setTimeout(() => { this.activeListener = true; }, this.walkSpeedDelay);
      this.mapPositionCoordinates = _.cloneDeep(storedMapPositionCoordinates);
    }
  }

  private changePlace(newPlace, newCoordenates) {
    const previousMap = _.cloneDeep(this.mapConfiguration.mapName);
    this.game.closePokeball();
    this.socketService.socket.emit('leaveMap', this.mapName, this.userService.getUserXCoordenate() - 1, this.userService.getUserYCoordenate(), this.atualPlace, this.userService.getUserId());
    setTimeout(() => {
      $(".player").remove();
      if (newPlace[1] === 'return') {
        const cityToReturn = this.previousMap.split('-')[1];
        const returnAtualPlace = this.mapConfiguration.coordenates.returns.find((city) => city.city === cityToReturn )
        this.atualPlace = returnAtualPlace.newPlaceIds;
        this.mapPositionCoordinates = returnAtualPlace.initialCoordenate;
      } else {
        this.atualPlace = newPlace;
        this.mapPositionCoordinates = _.cloneDeep(newCoordenates);
      }
      this.mapService.setMapConfiguration(this.jsonMap.regions[this.atualPlace[0]].places[`${this.atualPlace[1]}`][this.atualPlace[2]]);
      this.mapConfiguration = this.mapService.getMapConfiguration();
      this.previousMap = this.mapConfiguration.mapName.includes('pokeCenter') ? `pokeCenter-${previousMap}` : this.mapConfiguration.mapName.includes('pokeMarket') ? `pokeMarket-${previousMap}` : undefined;
      this.mapService.setPreviousMap(this.previousMap);
      this.mapName = this.mapConfiguration.mapName;
      this.socketService.socket.emit('joinMap', this.characterPositionFrame, this.mapName, this.mapPositionCoordinates[0], this.mapPositionCoordinates[1], this.userService.getUserName(), this.atualPlace, this.userService.getUserId());
      document.getElementById("map").setAttribute("style", `margin-top: ${this.mapPositionCoordinates[0]*64}px; margin-left: ${this.mapPositionCoordinates[1]*64}px;`);
      setTimeout(() => {
        this._eventEmitter.emitChange({ message: `Entering ${this.mapConfiguration.name}.`, type: 'mapChange', category: 'logChatComponent' });
        this.game.openPokeball();
        this.activeListener = true;
        this.playMusic();
      }, 300);
    }, 1500);
  }

  private encounter() {
    var randomValue = Math.floor(Math.random() * 100) + 0.001
    if (randomValue < this.encounterRate) {
      this.game.closePokeball();
      setTimeout(() => {
        this.socketService.socket.emit('newEncounter', this.mapConfiguration);
      }, 1700);
      this.socketService.socket.on('newEncounter', (encounter) => {
        let navigationExtras: NavigationExtras = {
          queryParams: {
              "encounter": JSON.stringify({mapConfiguration: this.mapConfiguration, encounter})
          }, skipLocationChange: true
        };
        this.router.navigate(["/game/encounter"],  navigationExtras);
      });
    } else {
      setTimeout(() => { this.activeListener = true; }, this.walkSpeedDelay);
    }
  }

  private determineMapType(id) {
    switch (id) {
      case 0: return 'cities';
      case 1: return 'routes';
      case 2: return 'general';
    }
  }

  private playMusic() {
    // if (this.music) {
    //   this.music.pause();
    // }
    // setTimeout(() => {
    //   this.music = new Audio(`../../assets/music/${this.atualPlace[0]}-${this.atualPlace[1]}-${this.atualPlace[2]}.mp3`);
    //   this.music.loop = true;
    //   this.music.play();
    // }, 500);
  }

}