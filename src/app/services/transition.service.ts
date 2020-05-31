import { Injectable } from '@angular/core';

@Injectable()
export class TransitionService {

    public closePokeball() {
        document.getElementById("topPokeball").classList.add("close");
        document.getElementById("bottomPokeball").classList.add("close");
    }
    
    public openPokeball() {
        document.getElementById("topPokeball").classList.remove("close");
        document.getElementById("bottomPokeball").classList.remove("close");
    }

}