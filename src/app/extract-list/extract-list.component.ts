import {AfterViewInit, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {SubscribersService} from '../shared/services';
import {PlayerEntry} from '../shared/domain/player-entry';
import {ExtractListAction} from '../shared/enums';
import {FileSaverService} from 'ngx-filesaver';
import {from, of} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {MatSort, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';


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

    /* Cannot use View child because the table is in a *ngIf */
    @ViewChildren(MatSort)
    public sorts: QueryList<MatSort>;

    public selection = new SelectionModel<PlayerEntry>(true, []);

    constructor(private subscriberService: SubscribersService,
                private fileSaverService: FileSaverService) {
    }

    public ngOnInit(): void {
        this.displayedColumns = ['select', 'lastName', 'firstName', 'level', 'country', 'club', 'egdpin', 'id'];
        this.subscriberService.getSubscribers()
            .subscribe({
                next: (players: PlayerEntry[]) => {
                    this.players = players;
                    this.dataSource = new MatTableDataSource(this.players);
                }
            });
    }

    public ngAfterViewInit(): void {
        this.sorts.changes.subscribe((components: QueryList<MatSort>) => {
            console.log('>>> changed', components, components.first, this.dataSource.sort);
            if (typeof this.dataSource.sort === 'undefined' || this.dataSource.sort === null) {
                this.dataSource.sort = components.first;
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

    public extractCustom(): void {
        this.generateFile(this.selection.selected);
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

    /** Whether the number of selected elements matches the total number of rows. */
    public isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    public masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    public checkboxLabel(row?: PlayerEntry): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }

    public getNumberSelected(): number {
        return this.selection.selected.length;
    }
}
