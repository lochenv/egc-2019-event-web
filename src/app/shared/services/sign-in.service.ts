import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SignInRequest, UserEntity} from '../domain';
import {map, take} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {javaUri} from '../../../environments/environment';

const EGC_USER_KEY = 'egcCurrentUser';

@Injectable()
export class SignInService {

    private signInUrl = javaUri + 'authenticate';
    private validateUrl = javaUri + 'authenticate/valid';

    private currentUserSubject: BehaviorSubject<UserEntity>;
    public currentUser: Observable<UserEntity>;

    public constructor(private httpClient: HttpClient, private router: Router) {
        this.currentUserSubject = new BehaviorSubject<UserEntity>(JSON.parse(localStorage.getItem(EGC_USER_KEY)));
        this.currentUser = this.currentUserSubject.asObservable();

        console.log('Sign in service', this);
    }

    public get currentUserValue(): UserEntity {
        return this.currentUserSubject.value;
    }

    public signIn(signInRequest: SignInRequest): Observable<UserEntity> {
        console.log('Trying to sign in', signInRequest, ' on ', this.signInUrl);

        return this.httpClient.post(this.signInUrl, signInRequest)
            .pipe(
                take(1),
                map((user: UserEntity) => {
                    this.storeUser(user);
                    return user;
                })
            );
    }

    public logout() {
        localStorage.removeItem(EGC_USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    public logoutIfTokenExpired() {
        const storedUser: UserEntity = this.currentUserValue;
        console.log(storedUser, this);
        if (typeof storedUser !== 'undefined' && storedUser !== null) {
            this.httpClient.post(this.validateUrl,
                {
                    bearer : storedUser.token
                }).subscribe(
                (response: any) => {
                    if (typeof response.valid === 'undefined' || !response.valid) {
                        this.logout();
                    }
                }
            );
        } else {
            // Clean memory
            this.logout();
        }
    }

    private storeUser(user: UserEntity): void {
        if (user && user.token) {
            console.log(this);
            localStorage.setItem(EGC_USER_KEY, JSON.stringify(user));
            this.currentUserSubject.next(user);
        }
    }

    public handleError(httpError: HttpErrorResponse): void {
        if (httpError.status === 401) {
            console.log('User is not authorized', httpError);
        }
    }
}
