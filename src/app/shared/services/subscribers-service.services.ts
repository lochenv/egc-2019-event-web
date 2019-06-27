import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {catchError, map, take} from 'rxjs/operators';
import {PlayerEntry} from '../domain/player-entry';
import {Observable, of} from 'rxjs';
import {Deserialize} from 'cerialize';
import {EgdPlayerInfo} from '../domain/egd-player-info.entity';

const stub_file: PlayerEntry[] = require('./stub-data.json');

@Injectable()
export class SubscribersService {

  private subscribersUri = 'http://egc2019.eu/congress/registered-participants?' +
    'export=true&token=rJV2P0HxWp8XaofbgN4dy2hc26ijB5WZz0nsKLpz7q2nA';
  private egdUri = 'http://www.europeangodatabase.eu/EGD/GetPlayerDataByPIN.php';

  public constructor(private httpClient: HttpClient) {
    console.log('>>> Config', stub_file);
  }

  public getSubscribers(): Observable<PlayerEntry[]> {
    // TestPurpose
    return of(stub_file)
      .pipe(
        take(1),
        map((data: PlayerEntry[]) => {
          return data.map(jsonEntry => {
            return Deserialize(jsonEntry, PlayerEntry);
          });
        })
      );
    // return this.httpClient.get(this.subscribersUri, {observe: 'response'})
    //   .pipe(
    //     take(1),
    //     map((data: HttpResponse<PlayerEntry[]>) => {
    //       return data.body.map(jsonEntry => {
    //         const instance: PlayerEntry = Deserialize(jsonEntry, PlayerEntry);
    //         return instance;
    //       });
    //     })
    //   );
  }

  public enrichPlayerWithEgd(player: PlayerEntry): Observable<PlayerEntry> {
    return this.httpClient.get(this.egdUri, {observe: 'response', params: {pin: player.egdpin.toString()}})
      .pipe(
        map((data: HttpResponse<EgdPlayerInfo>) => {
            player.egdInfo = Deserialize(data.body, EgdPlayerInfo);
            return player;
          }
        ),
        catchError((error: any) => {
          console.log('An error occurred', error, ' for player ', player);
          return of(player);
        })
      );
  }

  public getPlayerFromEgd(egdpin: number): Observable<EgdPlayerInfo> {
    return this.httpClient.get(this.egdUri, {observe: 'response', params: {pin: egdpin.toString()}})
      .pipe(
        take(1),
        map((data: HttpResponse<EgdPlayerInfo>) => {
            return Deserialize(data.body, EgdPlayerInfo);
          }
        )
      );
  }
}
