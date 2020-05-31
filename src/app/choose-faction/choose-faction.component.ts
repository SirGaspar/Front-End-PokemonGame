import { Component } from '@angular/core';
import * as $ from 'jquery';
import { UserService } from '../services/user.service';

@Component({
  selector: 'choose-faction',
  templateUrl: './choose-faction.component.html',
  styleUrls: ['./choose-faction.component.scss']
})
export class ChooseFactionComponent {

    public faction: string = 'travelers';
    public factionPokemon = {
        travelers: [43, 46, 69],
        hunters: [37, 58, 77],
        strategists: [60, 72, 98],
    };
    public selectedPokemonList = [];
    public selectedPokemon;
    public playerGender = 'male';
    public music = 'note';
    public characterName = '';
    public errorMessage = '';

    constructor(private userService: UserService) { }

    public chooseFaction(element, faction) {
        if (!$(element.target).hasClass('changeFaction')) {
            this.faction = faction;
            this.selectedPokemonList = this.factionPokemon[faction];
            $('.faction').addClass('unselected');
            $(`.faction.${faction}`).removeClass('unselected');
            $(`.faction.${faction}`).addClass('selected');
            $('.pokemonChooseContainer').removeClass('travelers');
            $('.pokemonChooseContainer').removeClass('hunters');
            $('.pokemonChooseContainer').removeClass('strategists');
            $('.pokemonChooseContainer').addClass(faction);
            setTimeout(() => {
                $('.pokemonChooseContainer').removeClass('hidden');
            }, 600);
        }
    }

    public cancelFaction() {
        $(`.playerCreationContainer.${this.faction}`).removeClass(this.faction);
        $(`.registerButton.${this.faction}`).removeClass(this.faction);
        this.faction = undefined;
        this.unchoosePokemon();
        $('.faction').removeClass('unselected');
        $('.faction').removeClass('selected');
        $('.pokemonChooseContainer').addClass('hidden');
    }

    public choosePokemon(pokemon) {
        this.selectedPokemon = pokemon; 
        $('.pokemonChooseContent').addClass('selected');
        $('.pokemonCard').addClass('unselected');
        $(`.pokemonCard#${pokemon}`).removeClass('unselected');
        $(`.pokemonCard#${pokemon}`).addClass('selected');
        $('.pokemonChooseContainer').addClass('reduzed');
        setTimeout(() => {
            $('.pokemonChooseContent').addClass('center');
        }, 600);
        $('.playerCreationContainer').addClass(this.faction);
        $('.registerButton').addClass(this.faction);
        $('.playerCreationContainer').removeClass('hidden');
    }

    public unchoosePokemon() {
        $('.pokemonChooseContent').removeClass('selected');
        $('.pokemonCard').removeClass('unselected');
        $('.pokemonCard').removeClass('selected');
        $('.pokemonChooseContainer').removeClass('reduzed');
        $('.pokemonChooseContent').removeClass('center');
        $('.playerCreationContainer').addClass('hidden');
    }

    public changeGender() {
        this.playerGender = this.playerGender === 'male' ? 'female' : 'male';
    }
    public changeMusic() {
        this.music = this.music === 'note' ? 'off' : 'note';
    }

    public finishRegistration() {
        this.errorMessage = '';
        $('.playerCreationContent input').removeClass('wrong');
        if (this.characterName.length < 4) {
            $('.playerCreationContent input').addClass('wrong');
            this.errorMessage = 'Your name must have at least 4 characters'
        } else {
            this.userService.updateUser(this.characterName, this.playerGender, this.faction).subscribe((response) => {
                console.log(response);
            });
        }
    }

}