import {AfterViewInit, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {SubscribersService} from '../shared/services';
import {PlayerEntry} from '../shared/domain/player-entry';
import {FileSaverService} from 'ngx-filesaver';
import {from, of} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {MatCheckboxChange, MatSort, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

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
              private fileSaverService: FileSaverService) {
  }

  public ngOnInit(): void {
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
          })
        }
      });
  }

  public ngAfterViewInit(): void {
    this.sorts.changes.subscribe((components: QueryList<MatSort>) => {
      if (typeof this.dataSource.sort === 'undefined' || this.dataSource.sort === null) {
        this.dataSource.sort = components.first;
      }
    });
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
  public toggleShowState($event: MatCheckboxChange, col: ColumnsState): void {
    this.displayedColumns = ['select', ...this.allColumns
      .filter(colState => {
        if (colState.name === col.name) {
          colState.displayed = $event.checked
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
    })
  }

  public selectWeekend() {
    this.selection.clear();
    this.dataSource.data.forEach(row => {
      if (row.event.match(/.*we.*/i)) {
        this.selection.select(row);
      }
    })
  }

  public toggleFiltered(): void {
    this.dataSource.filteredData.forEach(row => this.selection.select(row))
  }

  public selectAllVisible(): void {
    this.dataSource.filteredData.forEach((filteredRow) => this.selection.select(filteredRow))
  }

  public unselectAllVisible(): void {
    this.dataSource.filteredData.forEach((filteredRow) => this.selection.deselect(filteredRow))
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
