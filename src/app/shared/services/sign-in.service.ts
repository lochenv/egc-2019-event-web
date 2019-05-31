import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SignInRequest} from '../domain';
import {take} from 'rxjs/operators';
import {error} from '@angular/compiler/src/util';

@Injectable()
export class SignInService {

    private signInUrl = 'http://localhost:8080/api/authenticate';

    public constructor(private httpClient: HttpClient) {
    }

    public signIn(signInRequest: SignInRequest): void {
        console.log('Trying to sign in', signInRequest);

        this.httpClient.post(this.signInUrl, signInRequest)
            .pipe(
                take(1)
            ).subscribe({
            next: value => console.log('Do next', value),
            error: this.handleError,
            complete: () => console.log('completed')
        });
    }

    public handleError(httpError: HttpErrorResponse): void {
        if (httpError.status === 401) {
            console.log('User is not authorized', httpError);
        }
    }
}
