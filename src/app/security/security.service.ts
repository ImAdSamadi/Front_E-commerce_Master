import { Injectable } from '@angular/core';
import {KeycloakService} from "keycloak-angular";
import {Store} from "@ngrx/store";
import {KeycloakProfile} from "keycloak-js";
import {BehaviorSubject, map, Observable, take} from "rxjs";
import {
  GetProductsPageAction,
  GetProductsPageByCategoryAction,
  GetProductsPageByKeyWordAction
} from "../ngrx/productsState/product.actions";
import {GetProductItemAction} from "../ngrx/Product-item-State/productItem.actions";
import {Router} from "@angular/router";
import {ShoppingCartState} from "../ngrx/ShoppingCartState/cart.reducer";
import {GetShoppingCartAction} from "../ngrx/ShoppingCartState/cart.actions";

@Injectable({
  providedIn: 'root'
})
// export class SecurityService {
//   public profile! : KeycloakProfile;
//   constructor(public kcService: KeycloakService , private store : Store<any>, private router : Router ) {  this.init(); }
//
// // it is recommended to use event here
//   //kcService.keycloakEvents$.subscribe ..........
//   init(){
//     this.kcService.isLoggedIn().then(isLoggedIn => {
//       if (isLoggedIn) {
//         this.kcService.loadUserProfile().then(profile=>{
//           this.profile=profile;
//           // console.log(this.kcService.getKeycloakInstance().token);
//         });
//       }});
//
//   }
//   public hasRoleIn(roles:string[]):boolean{
//     let userRoles = this.kcService.getUserRoles();
//     for(let role of roles){
//       if (userRoles.includes(role)) return true;
//     } return false;
//   }
//
//   async login() {
//
//     const currentUrl = window.location.href;
//     console.log('Current page before login:', currentUrl);
//     await this.kcService.login({
//       redirectUri :window.location.origin
//     })
//
//   }
//
//   logout() {
//     this.kcService.logout(window.location.origin);
//   }
//
//
// }

export class SecurityService {
  private profileSubject = new BehaviorSubject<KeycloakProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  public profile!: KeycloakProfile;

  constructor(
    public kcService: KeycloakService,
    private store: Store<any>,
    private router: Router
  ) {
    this.init();
  }

  init() {
    this.kcService.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.kcService.loadUserProfile().then(profile => {
          this.profile = profile;
          this.profileSubject.next(profile); // ✅ emit profile for subscribers
        });
      }
    });
  }

  async login() {
    const currentUrl = window.location.href;
    console.log('Current page before login:', currentUrl);
    await this.kcService.login({
      redirectUri: window.location.origin
    });
  }

  logout() {
    this.kcService.logout(window.location.origin);
  }

  public hasRoleIn(roles: string[]): boolean {
    const userRoles = this.kcService.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }
}
