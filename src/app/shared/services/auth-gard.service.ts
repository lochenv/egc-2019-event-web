import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SignInService} from './sign-in.service';

@Injectable({providedIn: 'root'})
export class AuthGardService implements CanActivate {

    constructor(
        private router: Router,
        private signInService: SignInService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const currentUser = this.signInService.currentUserValue;
        if (currentUser) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }

}
