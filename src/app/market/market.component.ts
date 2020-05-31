import { Component } from '@angular/core';
import { MarketService } from '../services/market.service';
import { BackpackService } from '../services/backpack.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent {

  constructor(public marketService: MarketService, public backpackService: BackpackService) {  }
  
  public closeMarket() {
    this.marketService.resetMarket();
    $('.marketContainer').attr('style', 'display: none');
  }

}
