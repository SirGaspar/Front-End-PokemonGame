import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon';
import { PokedexService } from '../services/pokedex.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { BackpackService } from '../services/backpack.service';
import { MapService } from '../services/map.service';
import { CalculatorService } from '../services/calculator.service';
import { EncounterService } from '../services/encounterService';
import { SocketService } from '../services/socket.service';
import { EventEmiterService } from '../services/eventEmitter.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {

  public itemUrlBase = 'https://img.pokemondb.net/sprites/items/';
  public pokemonUrlBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  public pokemonBigUrlBase = 'https://pokeres.bastionbot.org/images/pokemon/'
  public pokedexCaught = '4';
  public menuView = 'interface';
  public atualContent = 'backpack';
  public selectedItems = 'miscellaneous';
  public selectedItem;

  private releasedPokemonId: string;

  constructor(
    private router: Router,
    private pokemonService: PokemonService,
    private pokedexService: PokedexService,
    private mapService: MapService,
    private encounterService: EncounterService,
    public userService: UserService,
    public backpackService: BackpackService,
    public calculatorService: CalculatorService,
    private socketService: SocketService,
    private _eventEmitter: EventEmiterService,
  ) { }

  public throwBall(item) {
    if (this.router.url.includes('/game/encounter')) {
        if (this.encounterService.getEnemyPokemonHP() !== 0 && 
        this.encounterService.getSelectedPokemon().hp !== 0 && 
        this.encounterService.getAnimationRunning() === false) {
          this.encounterService.chooseAction('bag', item);
        } 
    }
  }

  public changeBackpackCategory(category, element) {
    if (!$(element.target).hasClass('selected')) {
      $('.backpackMenu .menuItem').removeClass('selected');
      $(element.target).addClass('selected');
    }
    this.selectedItems = category;
  }

  public openPokedex() {
    console.log(this.pokedexService.getPokedex());
  }

  public openMap() {
    this.setMarkerMap();
    $('.mapContainer').attr('style', 'display: block');
  }
  public closeMap() {
    $('.mapContainer').attr('style', 'display: none');
  }
  public openMenu() {
    $('.optionsContainer').attr('style', 'display: block');
  }
  public closeMenu() {
    $('.optionsContainer').attr('style', 'display: none');
  }
  public openRelease() {
    $('.releaseContainer').removeClass('hidden');
  }
  public closeRelease() {
    $('.releaseContainer').addClass('hidden');
  }
  public changeMenuView(element, view) {
    $('.optionsContainer .menuItem').removeClass('selected');
    $(element.target).addClass('selected');
    this.menuView = view;
  }

  public showPokemonStatus(pokemon: Pokemon) {
    if (this.router.url.includes('/game/encounter') && pokemon.hp !== 0) {
      this.encounterService.chooseAction('changePokemon', pokemon);
    } else {
      if (pokemon.PokemonId || pokemon.PokemonId === 0) {
        this.pokemonService.setPokemonForInfo(pokemon.PokemonId);
        $('.pokemonInfoContainer').attr('style', 'display: block');
      }
    }
  }

  public equipmentTitle(item) {
    return `${this.pokemonService.pokemonBasicList.pokemon.find(pokemon => pokemon.id == (item.pokemonAllowed).toString()).name}'s ${item.itemName}`
  }

  public allowedForEquip(pokemonFromList: Pokemon) {
    return (pokemonFromList.id === (this.selectedItem.pokemonAllowed).toString()) && (pokemonFromList[this.selectedItem.equipmentType] === null);
  }

  public equip(pokemonFromList: Pokemon) {
    const currentEquipment = _.cloneDeep(this.selectedItem);
    this.socketService.socket.emit('equipItem', 
      { userId: this.userService.getUserId(), item: currentEquipment, pokemonId: pokemonFromList._id }
    );
    this.socketService.socket.on('equipItem', (response) => {

    });
    if (pokemonFromList[currentEquipment.equipmentType] === null) {
      this.pokemonService.setPokemonForInfo(pokemonFromList.PokemonId);
      pokemonFromList[currentEquipment.equipmentType] = this.selectedItem;
      this.backpackService.getBackpack().equipments.forEach((equipInBag) => {
        if (currentEquipment._id === equipInBag._id) {
          if (equipInBag.quantity === 1) {
            this.backpackService.getBackpack().equipments.splice(currentEquipment, 1);
          } else {
            equipInBag.quantity--;
          }
        }
      });
      this.closeItemInfo();
      this.showPokemonStatus(pokemonFromList);
    }
    console.log(pokemonFromList);
  }

  public removeItem(slot) {
    let equipFound = false;
    this.backpackService.getBackpack().equipments.forEach((equipInBag) => {
      if (this.pokemonService.getPokemonForInfo()[slot]._id === equipInBag._id) {
        equipInBag.quantity++;
        equipFound = true;
      }
    });
    if (!equipFound) { this.backpackService.getBackpack().equipments.push(this.pokemonService.getPokemonForInfo()[slot]); }
    this.pokemonService.getPokemonForInfo()[slot] = null;
  }

  public closePokeInfo() {
    $('.pokemonInfoContainer').attr('style', 'display: none');
    this.closeRelease();
  }
  public openItemInfo(item) {
    this.selectedItem = item;
    $('.itemInfoContainer').attr('style', 'display: block');
    console.log(this.selectedItem)
  }
  public closeItemInfo() {
    $('.itemInfoContainer').attr('style', 'display: none');
  }

  public setMarkerMap() {
    const mapConfiguration = this.mapService.getMapConfiguration();
    const mapName = mapConfiguration.mapName;
    console.log(mapName);
  }

  public releasePokemon() {
    this.closePokeInfo();
    this.closeRelease();
    this.releasedPokemonId = this.pokemonService.getPokemonForInfo()._id
    this._eventEmitter.emitChange({ message: `Bye ${this.pokemonService.getPokemonForInfo().name}!`, type: 'info', category: 'logChatComponent' });
    this.socketService.socket.emit('releasePokemon', { userId: this.userService.getUserId(), pokemonId: this.pokemonService.getPokemonForInfo()._id } );
    this.socketService.socket.on('releasePokemon', (released) => {
      this.pokemonService.removePokemonById(this.releasedPokemonId);
    });
  }

}
