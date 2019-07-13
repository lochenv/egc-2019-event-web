import {AfterViewInit, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ExtractionService, SubscribersService} from '../shared/services';
import {PlayerEntry} from '../shared/domain/player-entry';
import {FileSaverService} from 'ngx-filesaver';
import {from, of} from 'rxjs';
import {map, mergeMap, tap} from 'rxjs/operators';
import {MatCheckboxChange, MatDialog, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {ConfirmDownloadDialogComponent} from '../confirm-download-dialog/confirm-download-dialog.component';

// import TextEncoder from 'utf8-encoding/utf8-encoding';
// import {TextEncoder} from 'utf8-encoding';

@Component({
    selector: 'app-extract-list',
    templateUrl: './extract-list.component.html',
    styleUrls: ['./extract-list.component.scss']
})
export class ExtractListComponent implements OnInit, AfterViewInit {

    public players: PlayerEntry[];

    public displayedColumns: string[];

    public dataSource: MatTableDataSource<PlayerEntry>;

    public showSpinner: boolean;

    private tournamentData = ['Main', 'Weekend', 'Rapid'];

    public allColumns: ColumnsState[] = [
        new ColumnsState('firstName', 'First name'),
        new ColumnsState('lastName', 'Last Name'),
        new ColumnsState('level', 'Level'),
        new ColumnsState('event', 'Event'),
        new ColumnsState('age', 'Age'),
        new ColumnsState('country', 'Country'),
        new ColumnsState('club', 'Club'),
        new ColumnsState('egdpin', 'EGD Pin'),
        new ColumnsState('id', 'EGC Bel')];

    /* Cannot use View child because the table is in a *ngIf */
    @ViewChildren(MatSort)
    public sorts: QueryList<MatSort>;

    public selection = new SelectionModel<PlayerEntry>(true, []);

    constructor(private subscriberService: SubscribersService,
                private fileSaverService: FileSaverService,
                private extractionService: ExtractionService,
                private snackBar: MatSnackBar,
                private dialog: MatDialog) {
    }

    public ngOnInit(): void {
        this.showSpinner = true;
        this.displayedColumns = ['select', ...this.allColumns.filter(colState => colState.displayed).map(filtered => filtered.name)];
        this.subscriberService.getSubscribers()
            .subscribe({
                next: (players: PlayerEntry[]) => {
                    this.players = players;
                    this.dataSource = new MatTableDataSource(this.players);
                    this.dataSource.sortingDataAccessor = ((data: PlayerEntry, property: string) => {
                        switch (property) {
                            case 'level':
                                if (data.level.match(/\dp/)) {
                                    return Number(data.level.replace('p', '')) * 10;
                                } else if (data.level.match(/\dd/)) {
                                    return Number(data.level.replace('d', ''));
                                } else if (data.level.match(/\d{1,2}k/)) {
                                    return Number(data.level.replace('k', '')) * -1;
                                } else {
                                    return -100;
                                }
                            default:
                                return data[property];
                        }
                    });
                },
                complete: () => this.showSpinner = false
            });
    }

    public ngAfterViewInit(): void {
        this.sorts.changes.subscribe((components: QueryList<MatSort>) => {
            if (typeof this.dataSource.sort === 'undefined' || this.dataSource.sort === null) {
                this.dataSource.sort = components.first;
            }
        });
    }

    public extractSelection(): void {
        if (typeof this.selection.selected !== 'undefined' && this.selection.selected.length > 0) {
            const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
                width: '250px',
                data: this.tournamentData
            });

            dialogRef.afterClosed().subscribe({
                next: (result?: string) => {
                    if (result) {
                        console.log('>>> Exporting for', result);
                        this.generateFile(this.selection.selected, result);
                    }
                }
            });
        } else {
            this.snackBar.open('Please select at least one player', 'Ok', {
                panelClass: 'snack-bar-error'
            });
        }
    }

    private getPlayingInRounds(player: PlayerEntry, tournamentName: string): string {
        let result: string;
        switch (tournamentName) {
            case 'Main':
                result = player.mainTournament;
                break;
            case 'Weekend':
                result = player.weekendTournament.repeat(5);
                break;
            case 'Rapid' :
                result = player.rapidTournament;
                break;
            default:
                result = '';
        }
        return result;
    }

    private getExtractionMask(tournamentName: string): string {
        let result;
        switch (tournamentName) {
            case 'Main':
                result = '1000';
                break;
            case 'Rapid' :
                result = '0100';
                break;
            case 'Weekend':
                result = '0010';
                break;
            default:
                result = '0001';
        }
        return '1' + result;
    }

    private generateFile(players: PlayerEntry[], forTournament: string): void {
        const fileName = 'extract-macmahon.txt';
        const fileType = this.fileSaverService.genType('txt');

        let fullString = '';
        this.showSpinner = true;
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
                    const surName = enrichedPlayer.lastName;
                    const firstName = enrichedPlayer.firstName;
                    let strength;
                    let country;
                    let club;
                    let rating;
                    const playingInRound = this.getPlayingInRounds(enrichedPlayer, forTournament);
                    if (enrichedPlayer.egdInfo) {
                        country = enrichedPlayer.egdInfo.countryCode;
                        club = enrichedPlayer.egdInfo.club;
                        rating = enrichedPlayer.egdInfo.gor;
                        strength = enrichedPlayer.egdInfo.grade;
                    } else {
                        country = enrichedPlayer.country;
                        club = enrichedPlayer.club;
                        rating = '';
                        strength = enrichedPlayer.level;
                    }
                    /* surname|firstname|strength|country|club|rating|registration|playinginrounds */
                    return surName + '|' + firstName + '|' + strength + '|' +
                        country + '|' + club + '|' + rating + '|F{' + playingInRound;
                })
            ).subscribe({
            next: (playerStr: string) => {
                fullString = fullString.concat(playerStr.concat('\r\n'));
            },
            error: (error: any) => {
                this.snackBar.open('Unexpected error. Please contact Vincent', 'Ok', {
                    panelClass: 'snack-bar-error'
                });
                this.showSpinner = false;
            },
            complete: () => {
                const extractedMask = this.getExtractionMask(forTournament);
                this.extractionService.updateExtractedPlayer(players, extractedMask)
                    .subscribe(
                        (value: any) => {
                            if (typeof value.success !== 'undefined' && value.success) {
                                console.log(value.result);
                            }
                            const txtBlob = new Blob([new TextEncoder().encode(fullString)], {type: fileType});
                            this.fileSaverService.save(txtBlob, fileName);
                            this.showSpinner = false;
                            this.selection.clear();
                        }
                    );
            }
        });
    }

    /* Table functions*/
    public toggleShowState($event: MatCheckboxChange, col: ColumnsState): void {
        this.displayedColumns = ['select', ...this.allColumns
            .filter(colState => {
                if (colState.name === col.name) {
                    colState.displayed = $event.checked;
                }
                return colState.displayed;
            }).map(filtered => filtered.name)];
    }

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
    public selectAll() {
        this.selection.clear();
        this.dataSource.data.forEach(row => this.selection.select(row));
    }

    public selectMain() {
        this.selection.clear();
        this.dataSource.data.forEach(row => {
            if (row.event.match(/.*(1stw|2ndw).*/i)) {
                this.selection.select(row);
            }
        });
    }

    public selectWeekend() {
        this.selection.clear();
        this.dataSource.data.forEach(row => {
            if (row.event.match(/.*we.*/i)) {
                this.selection.select(row);
            }
        });
    }

    public toggleFiltered(): void {
        this.dataSource.filteredData.forEach(row => this.selection.select(row));
    }

    public selectAllVisible(): void {
        this.dataSource.filteredData.forEach((filteredRow) => this.selection.select(filteredRow));
    }

    public unselectAllVisible(): void {
        this.dataSource.filteredData.forEach((filteredRow) => this.selection.deselect(filteredRow));
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

    public getColumnName(col: string): string {
        return this.allColumns.find(colState => colState.name == col).displayName;
    }
}

class ColumnsState {
    public name: string;
    public displayName: string;
    public displayed: boolean;

    constructor(name: string, displayName: string) {
        this.name = name;
        this.displayName = displayName;
        this.displayed = true;
    }
}
