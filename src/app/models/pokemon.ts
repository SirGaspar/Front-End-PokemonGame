import { CalculatorService } from '../services/calculator.service';

export class Pokemon {

    public PokemonId: number;
    public id: number;
    public _id: string;
    public name: string;
    public level: number;
    public exp: number;
    public spriteName: string;

    public maxHP: number;
    public hp: number;
    public atk: number;
    public def: number;
    public spAtk: number;
    public spDef: number;
    public speed: number;

    public hpIV: number;
    public atkIV: number;
    public defIV: number;
    public spAtkIV: number;
    public spDefIV: number;
    public speedIV: number;

    public baseHp: number;
    public baseAtk: number;
    public baseDef: number;
    public baseSpAtk: number;
    public baseSpDef: number;
    public baseSpeed: number;

    public jewellery: string;
    public helmet: string;
    public ball: string;
    public armor: string;
    public foot: string;
    public leftHand: string;
    public rightHand: string;

    public shiny: boolean;
    public specialStatus: string[];
    public rarity: string;

    constructor(private calculatorService?: CalculatorService, pokemon?, pokemonInfo?, index?) {
        if (pokemon && pokemonInfo) {
            this._id = pokemon._id;
            this.PokemonId = index;
            this.id = pokemon.pokemonId;
            this.spriteName = pokemonInfo.name;
            this.shiny = pokemon.shiny;
            this.name = pokemonInfo.name.charAt(0).toUpperCase() + pokemonInfo.name.slice(1);
            this.exp = pokemon.exp;
            this.level = calculatorService.calculateLevel(pokemon.exp);
            this.rarity = pokemon.rarity;
            this.hp = pokemon.hp;
            this.hpIV = pokemon.hpIv;
            this.atkIV = pokemon.atkIv;
            this.defIV = pokemon.defIv;
            this.spAtkIV = pokemon.spAtkIv;
            this.spDefIV = pokemon.spDefIv;
            this.speedIV = pokemon.speedIv;
    
            pokemonInfo.stats.forEach((statusBase) => {
                if (statusBase.stat.name === 'hp') {
                    this.baseHp = statusBase.base_stat;
                    this.maxHP = calculatorService.calculateStatus(statusBase.base_stat, pokemon.hpIv, this.level);
                } else if (statusBase.stat.name === 'attack') {
                    this.baseAtk = statusBase.base_stat;
                    this.atk = calculatorService.calculateStatus(statusBase.base_stat, pokemon.atkIv, this.level);
                } else if (statusBase.stat.name === 'defense') {
                    this.baseDef = statusBase.base_stat;
                    this.def = calculatorService.calculateStatus(statusBase.base_stat, pokemon.defIv, this.level);
                } else if (statusBase.stat.name === 'special-attack') {
                    this.baseSpAtk = statusBase.base_stat;
                    this.spAtk = calculatorService.calculateStatus(statusBase.base_stat, pokemon.spAtkIv, this.level);
                } else if (statusBase.stat.name === 'special-defense') {
                    this.baseSpDef = statusBase.base_stat;
                    this.spDef = calculatorService.calculateStatus(statusBase.base_stat, pokemon.spDefIv, this.level);
                } else if (statusBase.stat.name === 'speed') {
                    this.baseSpeed = statusBase.base_stat;
                    this.speed = calculatorService.calculateStatus(statusBase.base_stat, pokemon.speedIv, this.level);
                }
            });

            this.jewellery = pokemon.jewellery;
            this.helmet = pokemon.helmet;
            this.ball = pokemon.ball;
            this.armor = pokemon.armor;
            this.foot = pokemon.foot;
            this.leftHand = pokemon.leftHand;
            this.rightHand = pokemon.rightHand;
        }
    }

}