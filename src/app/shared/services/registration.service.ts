import {HttpClient} from '@angular/common/http';
import {baseUri} from '../constant';
import {Injectable} from '@angular/core';

const uri = baseUri + 'e-mail';

@Injectable()
export class RegistrationService {

    constructor(private httpClient: HttpClient) {
    }

    public register(): void {
        this.httpClient.get(uri).subscribe(
            (value: any) => console.log('Yes it works', value),
            (error: any) => console.log('Oh no too bad', error)
        );
    }
}
