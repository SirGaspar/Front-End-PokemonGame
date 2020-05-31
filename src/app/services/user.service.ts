import { Injectable } from '@angular/core';
import { EventEmiterService } from './eventEmitter.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { SocketService } from './socket.service';

@Injectable()
export class UserService {

    constructor(
        private _eventEmitter: EventEmiterService,
        private http: HttpClient,
    ) { }

    private _id: number;
    private socketId: any;
    private username: string;
    private email: string;
    private coins: number;
    private exp: number;
    private premmium: boolean;
    private regionPositionId: number;
    private placeTypePositionId: number;
    private mapPositionId: number;
    private xCoordenate: number;
    private yCoordenate: number;
    private faction: string;

    private userLevel: number = 1;

    public getUserId() { return this._id }
    public setUserId(id) { this._id = id }

    public getSocketId() { return this.socketId }
    public setSocketId(id) { this.socketId = id }

    public getUserName() { return this.username }
    public setUserName(name) { this.username = name }

    public getEmail() { return this.email }
    public setEmail(email) { this.email = email }

    public getUserCoins() { return this.coins }
    public setUserCoins(coins) { this.coins = coins }
    public addCoins(coins) { this.coins += coins }
    public removeCoins(coins) { this.coins -= coins }

    public getUserExp() { return this.exp }
    public setUserExp(exp) { 
        this.exp = exp;
        this.setUserLevel(this.exp);
    }
    public addExp(exp) {
        this.exp += exp;
        this.setUserLevel(this.exp);
    }

    public getUserPremmium() { return this.premmium }
    public setUserPremmium(premmium) { this.premmium = premmium }

    public getUserRegionPositionId() { return this.regionPositionId }
    public setUserRegionPositionId(id) { this.regionPositionId = id }

    public getUserPlaceTypePositionId() { return this.placeTypePositionId }
    public setUserPlaceTypePositionId(id) { this.placeTypePositionId = id }

    public getUserMapPositionId() { return this.mapPositionId }
    public setUserMapPositionId(id) { this.mapPositionId = id }

    public getUserXCoordenate() { return this.xCoordenate }
    public setUserXCoordenate(coordenate) { this.xCoordenate = coordenate }

    public getUserYCoordenate() { return this.yCoordenate }
    public setUserYCoordenate(coordenate) { this.yCoordenate = coordenate }

    public getUserFaction() { return this.faction }
    public setUserFaction(faction) { this.faction = faction }

    public getUserLevel() { return this.userLevel }
    private setUserLevel(exp) {
        const nextLevel = Math.floor(0.75 + Math.sqrt(1 + 8*(exp)/(500)) / 2);
        if (this.userLevel !== nextLevel) {
            this.userLevel === nextLevel;
            this._eventEmitter.emitChange({ message: `Congratulations, you advanced from level ${nextLevel - 1} to ${nextLevel}.`, type: 'rare', category: 'logChatComponent' });
        }
    }

    // Dev Functions

    public createUser() {
        this.http.post(`${environment.endpoints.mongoUsers}/register`, { 
            email: 'teste.player2@gmail.com',
            password: '123',
            username: 'Player 2'
        }).subscribe((userInfo) => {
            console.log(userInfo);
        });
    }

    public updateUser(username, gender, faction) {
        return this.http.put(`${environment.endpoints.mongoUsers}/register`, { userId: this.getUserId(), username, gender, faction });
    }


}