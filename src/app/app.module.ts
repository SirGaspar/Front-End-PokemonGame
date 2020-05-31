import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { GameComponent } from './game/game.component';
import { PokemonService } from './services/pokemon.service';
import { HttpClientModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { EncounterComponent } from './encounter/encounter.component';
import { PlayerComponent } from './player/player.component';
import { LogChatComponent } from './log-chat/log-chat.component';
import { EventEmiterService } from './services/eventEmitter.service';
import { CalculatorService } from './services/calculator.service';
import { PokedexService } from './services/pokedex.service';
import { MoveEffectService } from './services/moveEffect.service';
import { UserService } from './services/user.service';
import { SocketService } from './services/socket.service';
import { ItemService } from './services/item.service';
import { ActionService } from './services/action.service';
import { BackpackService } from './services/backpack.service';
import { MapService } from './services/map.service';
import { EncounterService } from './services/encounterService';
import { TransitionService } from './services/transition.service';
import { ChooseFactionComponent } from './choose-faction/choose-faction.component';
import { MarketComponent } from './market/market.component';
import { MarketService } from './services/market.service';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'game', component: GameComponent, children:[
    { path : 'encounter', component: EncounterComponent },
  ]},
  { path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'faction', component: ChooseFactionComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GameComponent,
    MapComponent,
    EncounterComponent,
    PlayerComponent,
    LogChatComponent,
    ChooseFactionComponent,
    MarketComponent,
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    TransitionService,
    PokemonService,
    EventEmiterService,
    CalculatorService,
    PokedexService,
    MoveEffectService,
    UserService,
    SocketService,
    ItemService,
    ActionService,
    BackpackService,
    MapService,
    EncounterService,
    MarketService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
