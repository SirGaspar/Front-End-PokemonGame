import { Injectable } from '@angular/core';
import { Pokemon } from '../models/pokemon';

@Injectable()
export class CalculatorService {

    public calculateLevel(exp) {
        const level = Math.trunc(Math.cbrt(exp));
        return level === 0 ? 1 : level;
    }

    public calculateStatus(base, iv, level) {
        return Math.round(base + (1 + ((iv / 2)) * (level / 2)));
    }

    public calculateDamage(agressiveAtk, defensiveDef, baseSkillValue) {
        return Math.round((Math.max((agressiveAtk - defensiveDef), 0) + (baseSkillValue / 2)))
    }

    public calculateHpLost(hp, damage) {
        return Math.round(Math.max((hp - damage), 0));
    }

    public calculateCatch(enemyPokemon: Pokemon, item) {
        const chance = ((100 - (parseFloat(((enemyPokemon.hp/enemyPokemon.maxHP) * 100).toFixed(3)))) / 1.2) + parseInt(item.itemEffect);
        const percentValue = Math.floor(Math.random() * 100) + 0.001
        console.log(percentValue < chance);
        return percentValue < chance
    }

}