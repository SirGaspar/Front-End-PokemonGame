import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { UserService } from './user.service';

@Injectable()
export class BackpackService {

    private itemList = [];
    private backpack = {
        miscellaneous: [],
        balls: [],
        consumables: [],
        equipments: [],
    };

    constructor(private http: HttpClient, private userService: UserService) { }

    public setItemList(itemList) { this.itemList = itemList }
    public setBackpack(userItems) { 
        userItems.forEach((userItem) => {
            this.backpack[`${this.determineItemType(userItem.itemId)}`].push(this.getItemById(
                userItem.itemId, userItem.quantity, userItem.pokemonAllowed, userItem.rarity));
        });
    }

    public getAllItems() { return this.http.get(`${environment.endpoints.items}`) }
    public getUserItems() { return this.http.get(`${environment.endpoints.userItems}/${this.userService.getUserId()}`) }
    public getItemById(id, quantity?, pokemonAllowed?, rarity?) { 
        const item = this.itemList.find(item => item.itemId === id)
        if (item) {
            item['quantity'] = quantity || item['quantity'] || null;
            item['pokemonAllowed'] = pokemonAllowed || null;
            item['rarity'] = rarity || null;
        }
        return item;
    }

    public getBackpack() { return this.backpack }
    public addToBackpack(id, quantity) {
        const item = this.backpack[`${this.determineItemType(id)}`].find(item => item.itemId === id)
        if (item) { item.quantity += quantity } else {
            this.backpack[`${this.determineItemType(id)}`].push(this.getItemById(id, quantity));
        }
        console.log(this.backpack);
    }

    private determineItemType(id) {
        switch (id.charAt(0)) {
            case 'm': return 'miscellaneous'
            case 'b': return 'balls'
            case 'c': return 'consumables'
            case 'e': return 'equipments'
        }
    }

    // Dev Functions

    public createItem() {
        this.http.post(`${environment.endpoints.mongoItems}/register`, {
          itemId: 'e1',
          itemType: 'equipment',
          itemName: 'Leather Helmet',
          itemSprite: 'leatherHelmet',
          itemDescription: 'A Leather Helmet that provides more spDef.',
          itemBasePrice: 2000,
          itemEffect: '5',
          equipmentType: 'helmet',
        }).subscribe((itemList) => {
          console.log('createdItem: ',itemList);
        }) 
    }
        
}