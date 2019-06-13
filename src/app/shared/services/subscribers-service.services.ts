import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {map, take} from 'rxjs/operators';
import {PlayerEntry} from '../domain/player-entry';
import {Observable} from 'rxjs';
import {Deserialize} from 'cerialize';

@Injectable()
export class SubscribersService {

    private subscribersUri = 'http://egc2019.eu/congress/registered-participants?' +
        'export=true&token=rJV2P0HxWp8XaofbgN4dy2hc26ijB5WZz0nsKLpz7q2nA';

    private egdUri = 'http://www.europeangodatabase.eu/EGD/GetPlayerDataByPIN.php';

    public constructor(private httpClient: HttpClient) {
    }

    public getSubscribers(): Observable<PlayerEntry[]> {
        return this.httpClient.get(this.subscribersUri, {observe: 'response'})
            .pipe(
                take(1),
                map((data: HttpResponse<PlayerEntry[]>) => {
                    return data.body.map(jsonEntry => Deserialize(jsonEntry, PlayerEntry));
                })
            );
    }

    public getPlayerFromEgd(egdpin: number): Observable<any> {
        return this.httpClient.get(this.egdUri, {observe: 'response', params: {pin: egdpin.toString()}})
            .pipe(
                take(1),
                map((data: HttpResponse<any>) => {
                        return data.body;
                    }
                )
            );
    }
}
