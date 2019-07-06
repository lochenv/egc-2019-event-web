import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {catchError, map, take} from 'rxjs/operators';
import {PlayerEntry} from '../domain/player-entry';
import {Observable, of} from 'rxjs';
import {Deserialize} from 'cerialize';
import {EgdPlayerInfo} from '../domain/egd-player-info.entity';
import {egdUri, phpUri} from '../../../environments/environment';

// const stub_file: PlayerEntry[] = require('./stub-data.json');

@Injectable()
export class SubscribersService {

    public constructor(private httpClient: HttpClient) {
    }

    public getSubscribers(): Observable<PlayerEntry[]> {
        // TestPurpose
        // return of(stub_file)
        //     .pipe(
        //         take(1),
        //         map((data: PlayerEntry[]) => {
        //             return data.map(jsonEntry => {
        //                 return Deserialize(jsonEntry, PlayerEntry);
        //             });
        //         })
        //     );
        return this.httpClient.get(phpUri + 'read.php', {observe: 'response'})
          .pipe(
            take(1),
            map((data: HttpResponse<PlayerEntry[]>) => {
              return data.body.map(jsonEntry => {
                return Deserialize(jsonEntry, PlayerEntry);
              });
            })
          );
    }

    public enrichPlayerWithEgd(player: PlayerEntry): Observable<PlayerEntry> {
        return this.httpClient.get(egdUri + 'GetPlayerDataByPIN.php', {observe: 'response', params: {pin: player.egdpin.toString()}})
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
        return this.httpClient.get(egdUri + 'GetPlayerDataByPIN.php', {observe: 'response', params: {pin: egdpin.toString()}})
            .pipe(
                take(1),
                map((data: HttpResponse<EgdPlayerInfo>) => {
                        return Deserialize(data.body, EgdPlayerInfo);
                    }
                )
            );
    }

    public getPlayerFromEgdByLastName(lastName: string): Observable<EgdPlayerInfo[]> {
        return this.httpClient.get(egdUri + 'GetPlayerDataByData.php', {observe: 'response', params: {lastname: '@' + lastName}})
            .pipe(
                map((data: HttpResponse<any>): EgdPlayerInfo[] => {
                        if (data.body.retcode === 'Ok') {
                            return data.body.players.map(egdPlayer => Deserialize(egdPlayer, EgdPlayerInfo));
                        }
                        return [];
                    }
                )
            );
    }

    public getPlayerFromEgdByLastNameAndFirstName(lastName: string, firstName: string): Observable<EgdPlayerInfo[]> {
        return this.httpClient.get(egdUri + 'GetPlayerDataByData.php',
            {
                observe: 'response',
                params: {
                    lastname: '@' + lastName,
                    name: firstName
                }
            })
            .pipe(
                map((data: HttpResponse<any>): EgdPlayerInfo[] => {
                        if (data.body.retcode === 'Ok') {
                            return data.body.players.map(egdPlayer => Deserialize(egdPlayer, EgdPlayerInfo));
                        }
                        return [];
                    }
                )
            );
    }
}
