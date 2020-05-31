import { Injectable } from '@angular/core';
import { EventEmiterService } from './eventEmitter.service';
import { PokemonService } from './pokemon.service';
import { MarketService } from './market.service';
import * as $ from 'jquery';

@Injectable()
export class ActionService {

    constructor(private _eventEmitter: EventEmiterService, private pokemonService: PokemonService, private marketService: MarketService) { }

    public callAction(act, param) {
        switch (act) {
            case 'message':
                this._eventEmitter.emitChange({ message: ` ${param}`, type: 'action', category: 'logChatComponent' });
            break;
            case 'pokecenter':
                this.pokemonService.cureAllPokemon();
                this._eventEmitter.emitChange({ message: ` ${param}`, type: 'action', category: 'logChatComponent' });
            break;
            case 'pokemarket':
                this.marketService.setModeItems('buy');
                $('.marketContainer').attr('style', 'display: block');
            break;
        }
    }

}