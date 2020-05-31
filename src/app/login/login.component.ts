import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { UserService } from '../services/user.service';
import { BackpackService } from '../services/backpack.service';
import { PokemonService } from '../services/pokemon.service';
import { MarketService } from '../services/market.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = 'teste.player1@gmail.com';
  public password: string = '123';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private backpackService: BackpackService,
    private pokemonService: PokemonService,
  ) { }

  ngOnInit() { }

  public login() {
    this.http.post(`${environment.endpoints.mongoUsers}/authenticate`, { email: this.email, password: this.password }).subscribe((userInfo) => {
      console.log(userInfo);
      if (!userInfo) {
        console.log('User Not Found');
      } else {
          this.userService.setUserId(userInfo['user']._id);
          this.userService.setUserName(userInfo['user'].username);
          this.userService.setEmail(userInfo['user'].email);
          this.userService.setUserCoins(userInfo['user'].coins);
          this.userService.setUserExp(userInfo['user'].exp);
          this.userService.setUserPremmium(userInfo['user'].premmium);
          this.userService.setUserRegionPositionId(userInfo['user'].regionPositionId);
          this.userService.setUserPlaceTypePositionId(userInfo['user'].placeTypePositionId);
          this.userService.setUserMapPositionId(userInfo['user'].mapPositionId);
          this.userService.setUserXCoordenate(userInfo['user'].xCoordenate);
          this.userService.setUserYCoordenate(userInfo['user'].yCoordenate);
          this.userService.setUserFaction(userInfo['user'].faction);
          this.pokemonService.setPokemonStartList(userInfo['user'].pokemons);
          this.http.get(`${environment.endpoints.mongoItems}`).subscribe((itemList) => {
            this.backpackService.setItemList(itemList);
            this.backpackService.setBackpack(userInfo['user'].items);
            console.log(itemList)
            setTimeout(() => {
              this.userService.getUserFaction() === null ? this.router.navigate(['/faction'], { skipLocationChange: true }) :
              this.router.navigate(['/game'], { skipLocationChange: true });
            }, 1000);
          })
      }
    }, (error) => { console.log(error); });
  }

}
