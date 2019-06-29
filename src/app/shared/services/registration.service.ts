import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

const uri = 'http://localhost/egc2019php/subscribers/insert.php';

@Injectable()
export class RegistrationService {

    constructor(private httpClient: HttpClient) {
    }

    public register(): void {
        this.httpClient.post(uri, {observe: 'response'}).subscribe(
            (value: any) => console.log('Yes it works', value),
            (error: any) => console.log('Oh no too bad', error)
        );
    }
}
