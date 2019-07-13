import {Injectable} from '@angular/core';
import {phpUri} from '../../../environments/environment';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {PlayerEntry} from '../domain/player-entry';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

const extractionUri = phpUri + 'update-extract.php';

@Injectable()
export class ExtractionService {

    constructor(private http: HttpClient) {}

    public updateExtractedPlayer(extractedPlayers: PlayerEntry[], extractionValue: string): Observable<any> {
        return this.http.put(extractionUri,
            {
                egcbels: extractedPlayers.map(player => player.id),
                extracted: extractionValue
            },
            { observe: 'response' })
            .pipe(
                take(1),
                map((response: HttpResponse<any>) => {
                    return response.body;
                })
            );
    }
}
