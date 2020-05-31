import { Injectable } from '@angular/core';
import { MapService } from './map.service';

@Injectable()
export class MarketService {

    private markets = {
        rosTown: { 
            buy: [{ itemId: "b1" }],
            sell: [{ itemId: "m1" }],
        },
        frigusTown: { 
            buy: [{ itemId: "b1" }],
            sell: [{ itemId: "m1" }],
        },
        calidiTown: { 
            buy: [{ itemId: "b1" }],
            sell: [{ itemId: "m1" }],
        }
    };
    private selectedModeItems = [];

    constructor(private mapService: MapService) {

    }

    public getMarket() { return this.markets[this.mapService.getPreviousMap().split('-')[1]] };
    public getSelectedModeItems() {return this.selectedModeItems };

    public setModeItems(mode) { this.selectedModeItems = this.getMarket()[mode] };
    public resetMarket() { this.selectedModeItems = [] }

}
