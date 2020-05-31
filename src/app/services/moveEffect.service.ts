import { Injectable } from '@angular/core';
import { Pokemon } from '../models/pokemon';
import { EventEmiterService } from './eventEmitter.service';


@Injectable()
export class MoveEffectService {

    constructor(private _eventEmitter: EventEmiterService) { }

    public executeMovementEffect(effect: string, params: any[], pokemon: Pokemon) {
        switch (effect) {
            case 'increaseStatus':
                this.increaseStatus(params[0], params[1], pokemon);
            break;
            case 'decreaseStatus':
                this.decreaseStatus(params[0], params[1], pokemon);
            break;
            case 'applySpecialStatus':
                this.applySpecialStatus(params[0], pokemon);
            break;
            case 'recoverHP':
                this.recoverHP(params[0], pokemon);
            break;
        }
    }

    private increaseStatus(status, amount, pokemon: Pokemon) {
        pokemon[status] = pokemon[status] * (1 + amount);
    }

    private decreaseStatus(status, amount, pokemon: Pokemon) {
        pokemon[status] = pokemon[status] - (pokemon[status] * amount);
    }

    private applySpecialStatus(status, pokemon: Pokemon) {
        pokemon.specialStatus.push(status);
    }

    private recoverHP(amount, pokemon: Pokemon) {
        const restored = pokemon.hp * (1 + amount);
        pokemon.hp = Math.min(pokemon.hp + restored, pokemon.maxHP);
        this._eventEmitter.emitChange({ message: `${pokemon.name} restored ${restored}.`, type: 'info', category: 'logChatComponent' });
    }
    
}
