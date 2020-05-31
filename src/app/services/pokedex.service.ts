import { Injectable } from '@angular/core';

@Injectable()
export class PokedexService {

    public pokedexValues = [
        { id: 1, viewed: false, caught: false },
        { id: 2, viewed: false, caught: false },
        { id: 3, viewed: false, caught: false },
        { id: 4, viewed: false, caught: false },
        { id: 5, viewed: false, caught: false },
        { id: 6, viewed: false, caught: false },
        { id: 7, viewed: false, caught: false },
        { id: 8, viewed: false, caught: false },
        { id: 9, viewed: false, caught: false },
        { id: 10, viewed: false, caught: false },
        { id: 11, viewed: false, caught: false },
        { id: 12, viewed: false, caught: false },
        { id: 13, viewed: false, caught: false },
        { id: 14, viewed: false, caught: false },
        { id: 15, viewed: false, caught: false },
        { id: 16, viewed: false, caught: false },
        { id: 17, viewed: false, caught: false },
        { id: 18, viewed: false, caught: false },
        { id: 19, viewed: false, caught: false },
        { id: 20, viewed: false, caught: false },
        { id: 21, viewed: false, caught: false },
        { id: 22, viewed: false, caught: false },
        { id: 23, viewed: false, caught: false },
        { id: 24, viewed: false, caught: false },
        { id: 25, viewed: false, caught: false },
        { id: 26, viewed: false, caught: false },
        { id: 27, viewed: false, caught: false },
        { id: 28, viewed: false, caught: false },
        { id: 29, viewed: false, caught: false },
        { id: 30, viewed: false, caught: false },
    ];

    public getPokedex() {
        return this.pokedexValues;
    }

    public viewPokemon(pokemonIndex) {
        this.pokedexValues[pokemonIndex - 1].viewed = true;
    }

    public catchPokemon(pokemonIndex) {
        this.pokedexValues[pokemonIndex - 1].caught = true;
    }

}
