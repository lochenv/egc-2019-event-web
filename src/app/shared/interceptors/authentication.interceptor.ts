import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SignInService} from '../services';
import {Observable} from 'rxjs';
import {UserEntity} from '../domain';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

    constructor(private signInService: SignInService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser: UserEntity = this.signInService.currentUserValue;
        if (currentUser && currentUser.token && req.url.indexOf('/EGD/') === -1) {
            req = req.clone({
                setHeaders: this.signInService.retrieveSecurityHeader()
            });
        }

        return next.handle(req);
    }

}
