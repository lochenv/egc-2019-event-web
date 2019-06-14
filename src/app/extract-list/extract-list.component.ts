import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SubscribersService} from '../shared/services';
import {PlayerEntry} from '../shared/domain/player-entry';
import {ExtractListAction} from '../shared/enums';
import {FileSaverService} from 'ngx-filesaver';
import {from, of} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {MatSort, MatTableDataSource} from '@angular/material';

@Component({
    selector: 'app-extract-list',
    templateUrl: './extract-list.component.html',
    styleUrls: ['./extract-list.component.scss']
})
export class ExtractListComponent implements OnInit, AfterViewInit {

    public players: PlayerEntry[];

    public action: ExtractListAction;

    public displayedColumns: string[];

    public dataSource: MatTableDataSource<PlayerEntry>;

    @ViewChild(MatSort)
    public sort: MatSort;

    constructor(private subscriberService: SubscribersService,
                private fileSaverService: FileSaverService) {
    }

    public ngOnInit(): void {
        this.displayedColumns = ['lastName', 'firstName', 'level', 'country', 'club', 'egdpin', 'egcbel'];
        this.subscriberService.getSubscribers()
            .subscribe({
                next: (players: PlayerEntry[]) => {
                    this.players = players;
                    this.dataSource = new MatTableDataSource(this.players);
                    this.dataSource.sort = this.sort;
                }
            });
    }

    public setDisplayList(): void {
        this.action = ExtractListAction.CUSTOM;
    }

    public displayList(): boolean {
        return this.action === ExtractListAction.CUSTOM;
    }

    public extractAll(): void {
        this.generateFile(this.players);
    }

    private generateFile(players: PlayerEntry[]): void {
        const fileName = 'extract-all.txt';
        const fileType = this.fileSaverService.genType('txt');

        let fullString = '';
        from(players)
            .pipe(
                mergeMap((obsPlayer: PlayerEntry) => {
                    if (obsPlayer.egdpin && (
                        typeof obsPlayer.egdInfo === 'undefined')) {
                        return this.subscriberService.enrichPlayerWithEgd(obsPlayer);
                    }
                    return of(obsPlayer);
                }),
                map((enrichedPlayer: PlayerEntry) => {
                    /* surname|firstname|strength|country|club|rating|registration|playinginrounds */
                    let playerString: string;
                    if (enrichedPlayer.egdInfo) {
                        playerString = enrichedPlayer.egdInfo.lastName + '|' // last name
                            + enrichedPlayer.egdInfo.firstName + '|' // first name
                            + enrichedPlayer.egdInfo.grade + '|' // strength
                            + enrichedPlayer.egdInfo.countryCode + '|' // country
                            + enrichedPlayer.egdInfo.club + '|' // club
                            + enrichedPlayer.egdInfo.gor + '|' // rating
                            + 'F|' // ad final registration
                            + ''; // playing in round
                    } else {
                        // Double check to transform country to iso code and club if provided
                        if (enrichedPlayer.lastName) {
                            playerString = enrichedPlayer.lastName + '|' // last name
                                + enrichedPlayer.firstName + '|' // first name
                                + enrichedPlayer.level + '|' // strength
                                + '|' // country
                                + '|' // club
                                + '|' // rating
                                + 'F|' // ad final registration
                                + ''; // playing in round
                        } else {
                            playerString = enrichedPlayer.name + '|' // full name
                                + '|' // first name
                                + enrichedPlayer.level + '|' // strength
                                + '|' // country
                                + '|' // club
                                + '|' // rating
                                + 'F|' // ad final registration
                                + ''; // playing in round
                        }
                    }
                    return playerString;
                })
            ).subscribe({
            next: (playerStr: string) => {
                fullString = fullString.concat(playerStr.concat('\r\n'));
            },
            complete: () => {
                const txtBlob = new Blob([new TextEncoder().encode(fullString)], {type: fileType});
                this.fileSaverService.save(txtBlob, fileName);
            }
        });
    }

    /* Table functions*/
    public applyFilter(filterValue: string): void {
        console.log(filterValue);
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    ngAfterViewInit(): void {
        console.log('Sort ?', this.sort);
    }
}
