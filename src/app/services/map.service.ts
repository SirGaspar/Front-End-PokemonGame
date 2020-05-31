import { Injectable } from '@angular/core';


@Injectable()
export class MapService {

    private mapConfiguration;
    private previousMap;

    public setMapConfiguration(mapConfiguration) { this.mapConfiguration = mapConfiguration }
    public setPreviousMap(previousMap) { this.previousMap = previousMap }

    public getMapConfiguration() { return this.mapConfiguration }
    public getPreviousMap() { return this.previousMap }
    
}