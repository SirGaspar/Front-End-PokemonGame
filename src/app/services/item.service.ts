import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';

@Injectable()
export class ItemService {

    private itemList = [];

    constructor(private http: HttpClient) { }

    public getAllItems() {
        return this.http.get(`${environment.endpoints.items}`);
    }

    public getItemById(id) {
        return this.http.get(`${environment.endpoints.items}/${id}`);
    }

    public setItemList(itemList) { this.itemList = itemList };

}