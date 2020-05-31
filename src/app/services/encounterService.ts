import { Injectable } from '@angular/core';
import { Pokemon } from '../models/pokemon';
import { CalculatorService } from './calculator.service';
import * as _ from 'lodash';
import { EventEmiterService } from './eventEmitter.service';
import { PokemonService } from './pokemon.service';
import { MoveEffectService } from './moveEffect.service';
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { BackpackService } from './backpack.service';
import { GameComponent } from '../game/game.component';
import { TransitionService } from './transition.service';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';


@Injectable()
export class EncounterService {

  private encounter;
  private loot;
  private selectedPokemon: Pokemon = new Pokemon;
  private selectedPokemonMoves = [];
  private enemyPokemon: Pokemon = new Pokemon;
  private enemyPokemonMoves = [];
  private turnBlocked: boolean = false;
  private animationRunning = false;
  private running: number = 0;
  private enemyPokemonCaught: boolean = false;
  private actions = [];

  constructor(
      private http: HttpClient,
      private transitionService: TransitionService,
      private calculatorService: CalculatorService,
      private _eventEmitter: EventEmiterService,
      private pokemonService: PokemonService,
      private moveEffectService: MoveEffectService,
      private backpackService: BackpackService,
      private socketService: SocketService,
      private userService: UserService,
      private router: Router,
  ) { }

  public updatePokemon(selectedPokemon: Pokemon, enemyPokemon: Pokemon) {
      this.setSelectedPokemon(selectedPokemon);
      this.setEnemyPokemon(enemyPokemon);
  }
  public setEncounter(encounter) { this.encounter = encounter }
  public setSelectedPokemon(selectedPokemon: Pokemon) { this.selectedPokemon = selectedPokemon }
  public setSelectedPokemonMoves(moves) { this.selectedPokemonMoves = moves }
  public setSelectecPokemonExp(exp) { 
    this.selectedPokemon.exp += exp * this.getEnemyPokemon().level
    this._eventEmitter.emitChange({ message: `${this.getSelectedPokemon().name} won ${exp * this.getEnemyPokemon().level} experience.`, type: 'info', category: 'logChatComponent' });
  }
  public setEnemyPokemon(enemyPokemon: Pokemon) { this.enemyPokemon = enemyPokemon }
  public setEnemyPokemonId(id) { this.enemyPokemon.id = id }
  public setEnemyPokemonSprite(sprite) { this.enemyPokemon.spriteName = _.toLower(sprite) }
  public setEnemyPokemonName(name) { this.enemyPokemon.name = _.startCase(_.toLower(name)) }
  public setEnemyPokemonMoves(moves) { this.enemyPokemonMoves = moves }
  public setTurnBlocked(block) { this.turnBlocked = block }
  public setLoot(loot) { this.loot = loot }
  public setAnimationRunning(animationRunning) { this.animationRunning = animationRunning }
  
  public getEncounter() { return this.encounter }
  public getSelectedPokemon() { return this.selectedPokemon }
  public getSelectedPokemonMoves() { return this.selectedPokemonMoves }
  public getSelectedPokemonLevel() { return this.selectedPokemon.level }
  public getEnemyPokemon() { return this.enemyPokemon }
  public getEnemyPokemonHP() { return this.enemyPokemon.hp }
  public getEnemyPokemonMoves() { return this.enemyPokemonMoves }
  public getTurnBlocked() { return this.turnBlocked }
  public getLoot() { return this.loot }
  public getRunning() { return this.running }
  public getAnimationRunning() { return this.animationRunning }
  public getEnemyPokemonCaught() { return this.enemyPokemonCaught }

  public tryCatchPokemon(item) {
    this.setTurnBlocked(true);
    this.pokeballAnimation(item);
  }

  public setEnemyAtributtes(pokeInfo) {
    console.log(pokeInfo)
    this.actions = [];
    this.enemyPokemonCaught = false;
    let baseHp, baseAtk, baseDef, baseSpAtk, baseSpDef, baseSpeed;
    pokeInfo.stats.forEach((statusBase) => {
      if (statusBase.stat.name === 'hp') {
        baseHp = statusBase.base_stat;
      } else if (statusBase.stat.name === 'attack') {
        baseAtk = statusBase.base_stat;
      } else if (statusBase.stat.name === 'defense') {
        baseDef = statusBase.base_stat;
      } else if (statusBase.stat.name === 'special-attack') {
        baseSpAtk = statusBase.base_stat;
      } else if (statusBase.stat.name === 'special-defense') {
        baseSpDef = statusBase.base_stat;
      } else if (statusBase.stat.name === 'speed') {
        baseSpeed = statusBase.base_stat;
      }
    });
    this.enemyPokemon.hp = this.enemyPokemon.maxHP = this.calculatorService.calculateStatus(baseHp, this.enemyPokemon.hpIV, this.enemyPokemon.level);
    this.enemyPokemon.atk = this.calculatorService.calculateStatus(baseAtk, this.enemyPokemon.atkIV, this.enemyPokemon.level);
    this.enemyPokemon.def = this.calculatorService.calculateStatus(baseDef, this.enemyPokemon.defIV, this.enemyPokemon.level);
    this.enemyPokemon.spAtk = this.calculatorService.calculateStatus(baseSpAtk, this.enemyPokemon.spAtkIV, this.enemyPokemon.level);
    this.enemyPokemon.spDef = this.calculatorService.calculateStatus(baseSpDef, this.enemyPokemon.spDefIV, this.enemyPokemon.level);
    this.enemyPokemon.speed = this.calculatorService.calculateStatus(baseSpeed, this.enemyPokemon.speedIV, this.enemyPokemon.level);
  }

  public setEnemyIvs() {
      this.enemyPokemon.level = this.encounter.pokemon.level;
      this.enemyPokemon.hpIV = this.encounter.pokemon.hpIV;
      this.enemyPokemon.atkIV = this.encounter.pokemon.atkIV;
      this.enemyPokemon.defIV = this.encounter.pokemon.defIV;
      this.enemyPokemon.spAtkIV = this.encounter.pokemon.spAtkIV;
      this.enemyPokemon.spDefIV = this.encounter.pokemon.spDefIV;
      this.enemyPokemon.speedIV = this.encounter.pokemon.speedIV;
  }

  public chooseAction(actionType, action?) {
    if (this.actions.length === 0 || actionType === 'lostRun') {
      const pushEnemy = !(actionType === 'changePokemon' && this.selectedPokemon.hp === 0);
      const enemyAction = (Math.floor(Math.random() * 100) + 0.001) < 95 ? 'battle' : 'run';
      if (actionType === 'changePokemon' || actionType === 'bag' || actionType === 'lostRun' || (this.getSelectedPokemon().speed >= this.getEnemyPokemon().speed)) {
        this.actions.push({ actionType, action, user: 'user' });
        if (pushEnemy) this.actions.push({ actionType: enemyAction, action: false, user: 'enemy' });
      } else {
        this.actions.push({ actionType: enemyAction, action: false, user: 'enemy' });
        if (pushEnemy) this.actions.push({ actionType, action, user: 'user' });
      }
      console.log('Actions Choosen: ', this.actions)
      this.useAction(this.actions[0].actionType, this.actions[0].user, this.actions[0].action);
    }
  }

  public async useAction(actionType, user, action?): Promise<any> {
    this.actions.shift();
    console.log('After: ', this.actions);
    if (actionType === 'lostRun') {
      this._eventEmitter.emitChange({ message: `You lost to ${this.getEnemyPokemon().name}.`, type: 'info', category: 'logChatComponent' });
      this.leaveEnconter(false);
    } else if (actionType === 'run') {
      this.tryScape(false, false, user === 'user' ? false : true);
    } else if (actionType === 'battle') {
      const move = user === 'user' ? action : this.getEnemyPokemonMoves()[Math.floor(Math.random()*this.getEnemyPokemonMoves().length)];
      this.useMove(move, user);
      this.finishAction();
    } else if (actionType === 'bag') {
        if (action.itemType === 'pokeball') {
          this.pokeballAnimation(action);
        }
    } else if (actionType === 'changePokemon') {
      this.changePokemonAnimation(action);
    }
  }

  private finishAction() {
    setTimeout(() => {
      this.actions.length === 0 || this.enemyPokemon.hp === 0 || this.selectedPokemon.hp === 0 ? this.setTurnBlocked(false) : this.useAction(this.actions[0].actionType, this.actions[0].user, this.actions[0].action);
    }, 2000);
  }
    
  public useMove(move, user) {
    const striker = user === 'enemy' ? this.getEnemyPokemon() : this.getSelectedPokemon();
    const target = user === 'enemy' ? this.getSelectedPokemon() : this.getEnemyPokemon();
    const damage = this.calculatorService.calculateDamage(
      move.category === 'physical' ? striker.atk : striker.spAtk,
      move.category === 'physical' ? target.def : target.spDef,
      move.power
    );
    this._eventEmitter.emitChange({ message: `${striker.name} done ${damage} damage to ${target.name} with ${move.name}.`, type: 'info', category: 'logChatComponent' });
    target.hp = this.calculatorService.calculateHpLost(target.hp, damage);
    if (move.effect !== null) {
      this.moveEffectService.executeMovementEffect(move.effect, move.effectParams, move.effectTarget === 'user' ? striker : target);
    }
    this.pokemonService.updatePokemonFromList(this.getSelectedPokemon());
    this.updatePokemon(this.getSelectedPokemon(), this.getEnemyPokemon());
    this.verifyFaint(target.hp, user);
  }
    
  public changePokemon(pokemon) {
    this.setSelectedPokemon(pokemon);
    this.pokemonService.getPokemonById(this.getSelectedPokemon().id).subscribe((response) => {
      this.setSelectedPokemonMoves(this.pokemonService.determineAllowedMoves(response, this.getSelectedPokemon().level));
    });
  }
    
  public tryScape(byFaint?, faintUser?, enemyScape?) {
    if (enemyScape) {
      this._eventEmitter.emitChange({ message: `${this.getEnemyPokemon().name} ran away.`, type: 'info', category: 'logChatComponent' });
      this.leaveEnconter(false);
    } else {
      if (byFaint) {
        if (faintUser) {
          this._eventEmitter.emitChange({ message: `You lost to ${this.getEnemyPokemon().name}.`, type: 'info', category: 'logChatComponent' });
          this.leaveEnconter(false);
        } else {
          this.userService.addCoins(this.getLoot().coins);
          this.getLoot().totalLoot.forEach((loot) => {
            this.backpackService.addToBackpack(loot.id, loot.qtd);
          });
          this._eventEmitter.emitChange({ message: `You killed ${this.getEnemyPokemon().name}.`, type: 'info', category: 'logChatComponent' });
        }
      } else {
        this._eventEmitter.emitChange({ message: `You ran away from ${this.getEnemyPokemon().name}.`, type: 'info', category: 'logChatComponent' });
        this.leaveEnconter(false);
      }
    } 
  }
    
  public leaveEnconter(result) {
    if (result === 'lost') {
      this._eventEmitter.emitChange({ message: `You lost to ${this.getEnemyPokemon().name}.`, type: 'info', category: 'logChatComponent' });
    }
    this.setTurnBlocked(false);
    this.transitionService.closePokeball();
    const enemyPokemon = _.cloneDeep(this.enemyPokemon);
    enemyPokemon['exp'] = parseInt(this.pokemonService.getPokemonFromBaseList(enemyPokemon.id).exp);
    if (result === 'killed' || result === 'caught') {
      this.userService.addExp(enemyPokemon.exp);
      this.setSelectecPokemonExp(enemyPokemon.exp);
      this.updatePokemon(this.getSelectedPokemon(), this.getEnemyPokemon());
      this.pokemonService.verifyLevelChange(this.getSelectedPokemon());
    }
    this.socketService.socket.emit('finishEncounter', 
      { result, userId: this.userService.getUserId(), pokemon: enemyPokemon, usedPokemon: this.getSelectedPokemon(), ball: 'pokeball' }
    );
    this.socketService.socket.on('finishEncounter', (pokemonCaught) => {
      if (pokemonCaught) {
        let index = 0;
        this.pokemonService.getPokemonList().forEach((pokemonSpace) => {
          if (('PokemonId' in pokemonSpace)) {
            index++;
          }
        });
        if (index < 6) {
          this.pokemonService.addPokemontoIndex(pokemonCaught.pokemon, index);
        }
      }
      setTimeout(() => {
        this.enemyPokemonCaught = false;
        this.router.navigate(["/game"]);
        setTimeout(() => {
        this.transitionService.openPokeball();
        }, 1000);
      }, 1000);
    });
  }
    
  private verifyFaint(hp, striker) {
    if (hp === 0) {
      this.setTurnBlocked(true);
      if (striker === 'enemy') {
        // Player Faint
        if (this.pokemonService.getPokemonList().length === 0) {
          this.tryScape(true, true);
        }
      } else {
        // Enemy Faint
        this.tryScape(true);
      }
    }
  }

  private changePokemonAnimation(pokemon) {
    this.setAnimationRunning(true);
    $('#selectedPokemon').css('filter', 'brightness(0) invert(1)');
    $('#selectedPokemon').css('width', '0vh')
    setTimeout(() => {
      this.changePokemon(pokemon);
      $('#selectedPokemon').css('width', '8vh')
      setTimeout(() => {
        $('#selectedPokemon').css('filter', 'none');
        this.setAnimationRunning(false);
        this.finishAction();
      }, 400);
    }, 1000);
  }

  private pokeballAnimation(item) {
    this.setAnimationRunning(true);
    $('.ball').addClass('throw');
    setTimeout(() => {
      $('#enconteredPokemon').css('filter', 'brightness(0) invert(1)');
      $('#enconteredPokemon').css('height', '0vh');
      setTimeout(() => {
        $('.ball').addClass('shake');
        setTimeout(() => {
          if (this.calculatorService.calculateCatch(this.enemyPokemon, item)) {
            $('.ball').addClass('pokeglow');
            setTimeout(() => {
              this._eventEmitter.emitChange({ message: `Congratulations! You caught ${this.getEnemyPokemon().name}!`, type: 'info', category: 'logChatComponent' });
              this.enemyPokemonCaught = true
              this.setAnimationRunning(false);
            }, 1000);
          } else {
            setTimeout(() => {
              $('#enconteredPokemon').css('filter', 'none');
              $('#enconteredPokemon').css('height', '8vh')
              $('.ball').addClass('broken');
              setTimeout(() => {
                $('.ball').removeClass('throw');
                $('.ball').removeClass('shake');
                setTimeout(() => {
                  $('.ball').removeClass('broken');
                  setTimeout(() => {
                    this.setAnimationRunning(false);
                  }, 1000);
                }, 550);
              }, 550);
            }, 1100);
            this.finishAction();
          }
        }, 2000);
      }, 500);
    }, 700);
  }

}