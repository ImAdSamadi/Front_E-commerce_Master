import {Component, OnInit} from '@angular/core';
import {GetShoppingCartAction} from "./ngrx/ShoppingCartState/cart.actions";
import {Store} from "@ngrx/store";
import {SecurityService} from "./security/security.service";
import {filter, take} from "rxjs";
import {KeycloakProfile} from "keycloak-js";

// At the top of the file, outside the component class
function isValidProfile(profile: KeycloakProfile | null): profile is KeycloakProfile & { id: string } {
  return profile !== null && typeof profile.id === 'string' && profile.id.length > 0;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ecom-front';

  constructor(private store: Store<any> , private secService : SecurityService) {
  }

  ngOnInit(): void {
    this.secService.profile$
      .pipe(
        filter(isValidProfile),
        take(1)
      )
      .subscribe(profile => {
        this.store.dispatch(new GetShoppingCartAction(profile.id));
      });
  }


}


