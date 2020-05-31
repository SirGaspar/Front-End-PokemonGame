import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon';
import { EventEmiterService } from './eventEmitter.service';
import * as _ from 'lodash';
import { CalculatorService } from './calculator.service';
import { SocketService } from './socket.service';
import { UserService } from './user.service';

@Injectable()
export class PokemonService {

    public selectedPokemonList: Pokemon[] = [new Pokemon, new Pokemon, new Pokemon, new Pokemon, new Pokemon, new Pokemon];
    public selectedPokemonForInfo: Pokemon = this.selectedPokemonList[0];
    public pokemonBasicList = require('../pokemon.json');
    private possibleNatures;
    private baseURL: string = "http://pokeapi.co/api/v2/";
    private moveList = require('./../moves.json');
    
    constructor(
        private http: HttpClient, 
        private _eventEmitter: EventEmiterService,
        private calculatorService: CalculatorService,
        private socketService: SocketService,
        private userService: UserService,
    ) { }

    public getPokemonList() {
        return this.selectedPokemonList
    }
    public addPokemonToList(pokemon) {
        if (this.selectedPokemonList.length <= 5) {
            this.selectedPokemonList.push(pokemon);
        } else {
            this._eventEmitter.emitChange({ message: 'Você já possui 6 Pokemon com você.', type: 'error', category: 'logChatComponent' });
        }
    }
    public addPokemontoIndex(pokemon, index) {
        this.getPokemonById(pokemon.pokemonId).subscribe((pokemonInfo) => {
            const newPokemon = new Pokemon(this.calculatorService, pokemon, pokemonInfo, index);
            this.selectedPokemonList[index] = newPokemon;
        })
    }
    public removePokemonById(pokemonId) {
        const pokemonIndex = _.findLastIndex(this.selectedPokemonList, function(pokemonFromList) { return pokemonFromList._id === pokemonId });
        this.selectedPokemonList[pokemonIndex] = new Pokemon;
    }
    public removePokemonFromList(pokemon: Pokemon) {
        const pokemonIndex = _.findLastIndex(this.selectedPokemonList, function(pokemonFromList) { return pokemonFromList.PokemonId === pokemon.PokemonId });
        this.selectedPokemonList.splice(pokemonIndex, 1);
    }
    public updatePokemonFromList(pokemon: Pokemon) {
        const pokemonIndex = _.findLastIndex(this.selectedPokemonList, function(pokemonFromList) { return pokemonFromList.PokemonId === pokemon.PokemonId });
        this.selectedPokemonList[pokemonIndex] = pokemon;
    }

    public getPokemons(): Observable<any> {
        return this.http.get(`${this.baseURL}pokemon`);
    }

    public getPokemonById(id: number): Observable<any> {
        return this.http.get(`${this.baseURL}pokemon/${id}`);
    }

    public getPokemonByName(name: string): Observable<any> {
        return this.http.get(`${this.baseURL}pokemon/${name}`);
    }

    public setPokemonForInfo(PokemonId: number) {
        this.selectedPokemonForInfo = this.selectedPokemonList.find((pokemon) => pokemon.PokemonId === PokemonId);
    }
    public getPokemonForInfo() {
        return this.selectedPokemonForInfo;
    }
    public getIvPercentage() {
        return (((this.selectedPokemonForInfo.hpIV + this.selectedPokemonForInfo.spAtkIV + this.selectedPokemonForInfo.spDefIV +
        this.selectedPokemonForInfo.speedIV + this.selectedPokemonForInfo.atkIV + this.selectedPokemonForInfo.defIV) / 60) * 100).toFixed();
    }

    public verifyLevelChange(pokemon: Pokemon) {
        const oldLevel = _.cloneDeep(pokemon.level);
        const currentLevel = this.calculatorService.calculateLevel(pokemon.exp);
        if (currentLevel > oldLevel) {
            pokemon.level = currentLevel;
            this._eventEmitter.emitChange({ message: `${pokemon.name} grew to level ${currentLevel}!`, type: 'info', category: 'logChatComponent' });
            this.verifyEvolution(pokemon);
            this.recalcStatus(pokemon, currentLevel);
            console.log('Novo: ', pokemon)
        }
    }

    private recalcStatus(pokemon: Pokemon, currentLevel: number) {
        pokemon.hp = pokemon.maxHP = this.calculatorService.calculateStatus(pokemon.baseHp, pokemon.hpIV, currentLevel);
        pokemon.atk = this.calculatorService.calculateStatus(pokemon.baseAtk, pokemon.atkIV, currentLevel);
        pokemon.def = this.calculatorService.calculateStatus(pokemon.baseDef, pokemon.defIV, currentLevel);
        pokemon.spAtk = this.calculatorService.calculateStatus(pokemon.baseSpAtk, pokemon.spAtkIV, currentLevel);
        pokemon.spDef = this.calculatorService.calculateStatus(pokemon.baseSpDef, pokemon.spDefIV, currentLevel);
        pokemon.speed = this.calculatorService.calculateStatus(pokemon.baseSpeed, pokemon.speedIV, currentLevel);
    }

    public verifyEvolution(pokemon: Pokemon) {
        const oldPokemon = _.cloneDeep(pokemon);
        console.log('Antigo: ', oldPokemon)
        const pokemonFound = this.getPokemonFromBaseList(pokemon.id);
        if (pokemon.level >= pokemonFound.evolution.level) {
            pokemon.id = pokemonFound.evolution.id;
            this.getPokemonById(pokemonFound.evolution.id).subscribe((pokemonInfo) => {
                pokemon = new Pokemon(this.calculatorService, pokemon, pokemonInfo);
                this._eventEmitter.emitChange({ message: `${oldPokemon.name} evolved to ${pokemon.name}!`, type: 'info', category: 'logChatComponent' });
            })
        }
    }

    public determineAllowedMoves(pokemonInfo, pokemonLevel) {
        const allowedMoveList = [];
        pokemonInfo.moves.forEach((possibleMove) => {
            if (possibleMove.version_group_details[0].level_learned_at !== 0) {
                this.moveList.moves.forEach((move) => {
                    if (this.normalizeMoveName(move.name) === possibleMove.move.name && 
                    pokemonLevel >= possibleMove.version_group_details[0].level_learned_at) {
                        allowedMoveList.push(move);
                    }
                });
            }
        });
        return allowedMoveList;
    }
    private normalizeMoveName(moveName) {
        return moveName.toLowerCase().replace(/ /g, "-");
    }

    public selectFirstPokemon(): Pokemon {
        for (let pokemon of this.selectedPokemonList) {
            if (pokemon.hp !== 0) {
                return pokemon;
                break;
            }
        }
    }

    public determineNature() {
        return this.possibleNatures[Math.floor(Math.random() * this.possibleNatures.length - 1) + 0]
    }

    public setPokemonStartList(pokemonList) {
        pokemonList.forEach((pokemon, index) => {
            this.getPokemonById(pokemon.pokemonId).subscribe((pokemonInfo) => {
                const newPokemon = new Pokemon(this.calculatorService, pokemon, pokemonInfo, index);
                this.selectedPokemonList[index] = newPokemon;
            })
        });
    }

    public getPokemonFromBaseList(id) {
        return this.pokemonBasicList.pokemon.find((pokemon) => pokemon.id === parseInt(id) || pokemon.id === (id.toString()));
    }

    public cureAllPokemon() {
        this.selectedPokemonList.forEach((pokemon) => { pokemon.hp = pokemon.maxHP; });
        this.socketService.socket.emit('cureAllPokemon', { userId: this.userService.getUserId(), pokemonList: this.getPokemonList()});
    }

}