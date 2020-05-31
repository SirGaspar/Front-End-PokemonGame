import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameComponent } from '../game/game.component';
import { PokemonService } from '../services/pokemon.service';
import * as _ from 'lodash';
import { EventEmiterService } from '../services/eventEmitter.service';
import { PokedexService } from '../services/pokedex.service';
import { UserService } from '../services/user.service';
import { EncounterService } from '../services/encounterService';
import { MapService } from '../services/map.service';
import { BackpackService } from '../services/backpack.service';

@Component({
  selector: 'app-encounter',
  templateUrl: './encounter.component.html',
  styleUrls: ['./encounter.component.scss'],
})
export class EncounterComponent implements OnInit {

  public encounteredPokemonInfo;
  // public enemyPokemonUrlBase = 'http://www.pokestadium.com/sprites/xy/';
  // public selectedPokemonUrlBase = 'http://www.pokestadium.com/sprites/xy/back/';
  // public enemyPokemonUrlBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  // public selectedPokemonUrlBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/';
  public enemyPokemonUrlBase = 'https://img.pokemondb.net/sprites/black-white/anim/normal/';
  public selectedPokemonUrlBase = 'https://img.pokemondb.net/sprites/black-white/anim/back-normal/';

  public battleContainerMode = 'menu';
  
  constructor(
    private route: ActivatedRoute,
    private gameComponent: GameComponent,
    private pokemonService: PokemonService,
    private _eventEmitter: EventEmiterService,
    private pokedexService: PokedexService,
    private mapService: MapService,
    public backpackService: BackpackService,
    public encounterService: EncounterService,
    public userService: UserService,
  ) {

    this.route.queryParams.subscribe(params => {
      const encounter = JSON.parse(params["encounter"]);
      this.mapService.setMapConfiguration(encounter.mapConfiguration);
      this.encounterService.setEncounter(encounter.encounter);
    });

    this.encounterService.setSelectedPokemon(this.pokemonService.selectFirstPokemon());

    this.pokemonService.getPokemonById(this.encounterService.getSelectedPokemon().id).subscribe((response) => {
      this.encounterService.setSelectedPokemonMoves(this.pokemonService.determineAllowedMoves(response, this.encounterService.getSelectedPokemon().level));
    });

    this.encounterService.setEnemyIvs();
    this.encounterService.setLoot(this.encounterService.getEncounter().loot);
    console.log(this.encounterService.getEncounter().loot);

    const enconteredPokemon = this.encounterService.getEncounter().pokemon.id;
    this.encounterService.setEnemyPokemonId(enconteredPokemon);

    this.pokemonService.getPokemonById(enconteredPokemon).subscribe((response) => {
      this.encounterService.setEnemyPokemonMoves(this.pokemonService.determineAllowedMoves(response, this.encounterService.getEnemyPokemon().level))
      this.encounterService.setEnemyPokemonSprite(response.name);
      this.encounterService.setEnemyPokemonName(response.name);
      this.encounterService.setEnemyAtributtes(response);
      const superRareOrAbove = this.verifyRarity();
      this._eventEmitter.emitChange({ message: `A wild ${this.encounterService.getEnemyPokemon().name} lvl ${this.encounterService.getEnemyPokemon().level} appeared.`, type: superRareOrAbove ? 'rare' : 'info', category: 'logChatComponent' });
      setTimeout(() => {
        this.encounterService.updatePokemon(this.encounterService.getSelectedPokemon(), this.encounterService.getEnemyPokemon());
        this.encounterService.setTurnBlocked(false); // Desbloqueia Batalha
        this.gameComponent.openPokeball();
      }, 1000);
    }) 
  }

  ngOnInit() { }

  public changeBattleContainerMode(mode) {
    this.battleContainerMode = mode;
  }

  public showMenu(type) {
    return this.battleContainerMode === type && 
    this.encounterService.getSelectedPokemon().hp > 0 && 
    this.encounterService.getEnemyPokemon().hp > 0 &&
    !this.encounterService.getAnimationRunning() &&
    !this.encounterService.getEnemyPokemonCaught();
  }
  public showBackBtn() {
    return this.battleContainerMode !== 'menu' && 
    this.encounterService.getSelectedPokemon().hp > 0 && 
    this.encounterService.getEnemyPokemon().hp > 0 &&
    !this.encounterService.getAnimationRunning() &&
    !this.encounterService.getEnemyPokemonCaught();
  }

  private verifyRarity() {
    const mapConfiguration = this.mapService.getMapConfiguration();
    let result = false;
    mapConfiguration.pokemon.legendary.forEach((legendaryID) => {
      legendaryID === this.encounterService.getEnemyPokemon().id ? result = true : result = result;
    });
    mapConfiguration.pokemon.superRare.forEach((superRareID) => {
      superRareID === this.encounterService.getEnemyPokemon().id ? result = true : result = result;
    });
    return result;
  }

}
