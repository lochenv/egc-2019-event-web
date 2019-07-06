import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {PlayerEntry} from '../domain/player-entry';
import {Serialize, Deserialize} from 'cerialize';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {phpUri} from '../../../environments/environment';

const uri = phpUri + 'insert.php';

@Injectable()
export class RegistrationService {

    constructor(private httpClient: HttpClient) {
    }

    public register(playerEntry: PlayerEntry): Observable<PlayerEntry> {
        return this.httpClient.post(uri, Serialize(playerEntry), {observe: 'response'}).
        pipe(
            take(1),
            map((response: HttpResponse<any>) => Deserialize(response.body))
        );
    }
}
