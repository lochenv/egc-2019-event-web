import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {RegistrationService, SubscribersService} from '../shared';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {PlayerEntry} from '../shared/domain/player-entry';
import {MatCheckboxChange, MatDialog, MatSnackBar} from '@angular/material';
import {Observable, of, throwError} from 'rxjs';
import {EgdPlayerInfo} from '../shared/domain/egd-player-info.entity';
import {filter, map, startWith, switchMap} from 'rxjs/operators';
import {PleaseWaitDialogComponent} from '../please-wait-dialog/please-wait-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';
import {main} from '@angular/compiler-cli/src/main';
import {maxNumberOfPlayer} from '../../environments/environment';
import {ErrorTooManyPlayerComponent, TooManyPlayerError} from '../error-too-many-player/error-too-many-player.component';

const componentName = 'app-registration';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

    @HostBinding()
    public class: string = componentName;

    @ViewChild('ngForm')
    public ngForm: NgForm;

    public formGroup: FormGroup;

    public ageOptions: string[];

    public isoCodeOptions: string[];

    public currentStep: number;

    public selectedPlayer: PlayerEntry;

    public filteredEgdPayer: Observable<EgdPlayerInfo[]>;

    // This is ugly as sin but it's to remove the error message on Notification awhen we enter the first time
    public registerClicked = false;

    public mainFirstWeekOptions: EventOption[] = [
        {
            label: '07-21 Sun 11:00',
            played: false,
            title: 'Round 01 : ',
            disabled: true
        },
        {
            title: 'Round 02 : ',
            label: '07-22 Mon 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 03 : ',
            label: '08-23 Tue 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 04 : ',
            label: '08-25 Thu 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 05 : ',
            label: '08-26 Fri 10:30',
            played: false,
            disabled: true
        },
    ];

    public rapidFirstWeekOptions: EventOption[] = [
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
    ];

    public mainSecondWeekOptions: EventOption[] = [
        {
            title: 'Round 06 : ',
            label: '07-29 Mon 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 07 : ',
            label: '07-30 Tue 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 08 : ',
            label: '08-01 Thu 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 09 : ',
            label: '08-02 Fri 10:00',
            played: false,
            disabled: true
        },
        {
            title: 'Round 10 : ',
            label: '08-03 Sat 10:00',
            played: false,
            disabled: true
        },
    ];

    public rapidSecondWeekOptions: EventOption[] = [
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        },
        {
            label: '17:00',
            played: false,
            disabled: true
        }
    ];

    public otherEventOptions: EventOption[] = [
        {
            title: 'Weekend : ',
            label: '07-27 / 07-28 (5 rounds)',
            played: false,
            disabled: true
        },
        {
            title: '9*9 : ',
            label: '07-21 / 07-23',
            played: false,
            disabled: true
        },
        {
            title: '13*13 : ',
            label: '07-24',
            played: false,
            disabled: true
        },
        {
            title: 'Children : ',
            label: '07-29',
            played: false,
            disabled: true
        },
        {
            title: 'Chess & Go : ',
            label: '08-01',
            played: false,
            disabled: true
        },
        {
            title: 'Ying Yang : ',
            label: '08-02',
            played: false,
            disabled: true
        },
    ];

    // Players registered
    public registeredPlayers: PlayerEntry[];
    public filteredRegisteredPlayers: Observable<PlayerEntry[]>;

    public searchPin: FormControl;

    public searchLastName: FormControl;

    constructor(private subscribersService: SubscribersService,
                private registerService: RegistrationService,
                private formBuilder: FormBuilder,
                private dialog: MatDialog,
                private snackBar: MatSnackBar) {
    }

    public ngOnInit(): void {
        this.currentStep = 0;

        this.ageOptions = ['Adult', 'Teen', 'Child'];
        this.isoCodeOptions = [];
        this.searchPin = this.formBuilder.control(
            '',
            [Validators.required, Validators.pattern(/^\d{1,4}$/)]
        );

        this.searchLastName = this.formBuilder.control(
          '',
        );

        this.formGroup = this.createEmptyForm();
        this.filteredEgdPayer = this.formGroup.get('lastName').valueChanges
            .pipe(
                startWith(''),
                filter(val => val !== null && val.length > 2),
                switchMap((value: string) => {
                    return this.subscribersService.getPlayerFromEgdByLastName(value);
                })
            );
        this.filteredRegisteredPlayers = this.searchLastName.valueChanges
          .pipe(
            startWith(''),
            map((value: string) => {
              return this.registeredPlayers
                .filter(regPlayer => regPlayer.lastName.toUpperCase().startsWith(value.toUpperCase()))
            })
          );
        this.refreshPlayer();
    }

    private refreshPlayer(): void {
        this.subscribersService.getSubscribers()
            .subscribe((players: PlayerEntry[]) => {
                this.registeredPlayers = players;
                // this.filteredRegisteredPlayers = of(this.registeredPlayers);
            });
    }

    private createEmptyForm(): FormGroup {
        return this.formBuilder.group({
            // Screen dependent
            firstWeekCheck: false,
            secondWeekCheck: false,
            weekendCheck: false,
            // Player field
            firstName: [
                '',
                [Validators.required]
            ],
            lastName: [
                '',
                [Validators.required]
            ],
            age: [
                '',
                [Validators.required]
            ],
            email: [
                '',
                [Validators.required, Validators.email]
            ],
            notification: [
                null,
                [Validators.required]
            ],
            level: [
                '',
                [Validators.required, Validators.pattern(/^(\d{1,2}[k]|\d[dp])$/)]
            ],
            country: [
                '',
                [Validators.required]
            ],
            egdPin: [
                '',
                [Validators.pattern(/^(\d{1,4}|1\d{7})$/)]
            ],
            amount: [
                0,
                [Validators.required]
            ],
            registrationDate: null,
            dateOfPayment: null,
            remarks: '',
            paid: [
                false,
                [Validators.requiredTrue]
            ],
            club: null,
            phone: null
        });
    }

    public selectPlayerByName(selectionPlayer: PlayerEntry): void {
      this.searchPin.setValue(selectionPlayer.id);
    }

    public selectPlayerFormEgd(egdPlayer: EgdPlayerInfo): void {
        if (egdPlayer !== undefined) {
            Object.keys(this.formGroup.controls)
                .filter((key: string) => key !== 'lastName' &&
                    key !== 'registrationDate' &&
                    key !== 'dateOfPayment')
                .forEach((filteredKey: string) => this.formGroup.get(filteredKey).setValue(null));
            this.formGroup.get('firstName').setValue(egdPlayer.firstName);
            this.formGroup.get('level').setValue(egdPlayer.grade);
            this.formGroup.get('egdPin').setValue(egdPlayer.pinPlayer);
            this.formGroup.get('country').setValue(egdPlayer.countryCode);
            this.formGroup.get('club').setValue(egdPlayer.club);
        }
    }

    public createNewPlayer(): void {
        this.currentStep = 2;
        this.formGroup.get('registrationDate').setValue(new Date());
        this.formGroup.get('dateOfPayment').setValue(new Date());
    }

    public findAndNext(): void {
       if (this.searchPin.valid) {
            const searchPin = this.searchPin.value;
            const playerId = Number(searchPin);
            const waitDialogRef = this.dialog.open(PleaseWaitDialogComponent,
                {
                    width: '250px'
                });
            this.subscribersService.findSubscriber(playerId)
                .subscribe({
                    next: (foundPlayer: PlayerEntry) => {
                        if (foundPlayer.egdpin && foundPlayer.egdpin !== 0) {
                            this.subscribersService.getPlayerFromEgd(foundPlayer.egdpin)
                                .subscribe({
                                        next: (value: EgdPlayerInfo) => foundPlayer.egdInfo = value,
                                        complete: () => {
                                            if (typeof foundPlayer.egdInfo !== 'undefined') {
                                                foundPlayer.club = foundPlayer.egdInfo.club;
                                                foundPlayer.level = foundPlayer.egdInfo.grade;
                                            }
                                            foundPlayer.toFormGroup(this.formGroup);
                                        }
                                    }
                                );
                        } else {
                            this.subscribersService.getPlayerFromEgdByLastNameAndFirstName(
                                foundPlayer.lastName, foundPlayer.firstName
                            ).subscribe({
                                    next:
                                        (players: EgdPlayerInfo[]) => {
                                            if (players.length === 1) {
                                                foundPlayer.egdInfo = players[0];
                                                foundPlayer.egdpin = players[0].pinPlayer;
                                                this.formGroup.get('egdPin').setValue(foundPlayer.egdpin);
                                            }
                                        },
                                    complete: () => {
                                        if (typeof foundPlayer.egdInfo !== 'undefined') {
                                            foundPlayer.club = foundPlayer.egdInfo.club;
                                            foundPlayer.level = foundPlayer.egdInfo.grade;
                                            this.formGroup.get('club').setValue(foundPlayer.club);
                                            this.formGroup.get('level').setValue(foundPlayer.level);
                                        }
                                    }
                                }
                            );
                        }
                        foundPlayer.toFormGroup(this.formGroup);
                        this.toggleTournamentOptions(false);
                        this.formGroup.markAsPristine();
                        if (this.formGroup.get('firstWeekCheck').value) {
                            this.refreshCheckboxes(this.mainFirstWeekOptions, foundPlayer.mainTournament, 0);
                            this.refreshCheckboxes(this.rapidFirstWeekOptions, foundPlayer.rapidTournament, 0);
                        }
                        if (this.formGroup.get('secondWeekCheck').value) {
                            this.refreshCheckboxes(this.mainSecondWeekOptions, foundPlayer.mainTournament, 5);
                            this.refreshCheckboxes(this.rapidSecondWeekOptions, foundPlayer.rapidTournament, 5);
                        }
                        if (this.formGroup.get('weekendCheck').value) {
                            this.refreshCheckboxes(
                                this.otherEventOptions
                                    .filter((eventOption) => eventOption.title === 'Weekend : '),
                                foundPlayer.weekendTournament,
                                0);
                            this.refreshCheckboxes(
                                this.otherEventOptions
                                    .filter((eventOption) => eventOption.title !== 'Weekend : '),
                                foundPlayer.sideEvent,
                                0);
                        }

                        this.selectedPlayer = foundPlayer;
                    },
                    error: (error1) => {
                        console.log('Error occurend in find and next', error1);
                        waitDialogRef.close();
                        this.searchPin.setErrors({'notfound': true});
                    },
                    complete: () => {
                        waitDialogRef.close();
                        this.currentStep = 2;
                    }
                });
        }
    }

    private refreshCheckboxes(eventOptions: EventOption[], tournament: string, tournamentIndex: number) {
        let index = tournamentIndex;
        if (tournament !== '') {
            eventOptions.forEach((option: EventOption) => {
                option.played = tournament.charAt(index++) === '1';
            });
        }
    }

    public register(): void {
        this.registerClicked = true;
        if (this.formGroup.valid) {
            const waitDialogRef = this.dialog.open(PleaseWaitDialogComponent,
                {
                    width: '250px'
                });
            const player: PlayerEntry = new PlayerEntry();
            player.fillFromFormGroup(
                this.formGroup,
                this.transformOptionsToString([...this.mainFirstWeekOptions, ...this.mainSecondWeekOptions]),
                this.transformOptionsToString([...this.rapidFirstWeekOptions, ...this.rapidSecondWeekOptions]),
                this.transformOptionsToString(this.otherEventOptions.filter(option => option.title === 'Weekend : ')),
                this.transformOptionsToString(this.otherEventOptions.filter(option => option.title !== 'Weekend : ')),
            );

            if (typeof this.selectedPlayer !== 'undefined') {
                player.id = this.selectedPlayer.id;
            }

            let registerObservable: Observable<PlayerEntry>;
            if (typeof player.id === 'undefined') {
                // New player, we have to check number of places left
                registerObservable = this.subscribersService.getSubscribers()
                    .pipe(
                        switchMap((allRegisteredPlayers: PlayerEntry[]) => {
                            const mainTournament: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            let weekendTournament = 0;
                            allRegisteredPlayers
                                .forEach((onSitePlayer) => {
                                    if (typeof onSitePlayer.mainTournament !== 'undefined' &&
                                        onSitePlayer.mainTournament.match(/[01]{10}/)) {
                                        Array.from(onSitePlayer.mainTournament).forEach(
                                            (char, index) => {
                                                if (char === '1') {
                                                    mainTournament[index]++;
                                                }
                                            }
                                        );
                                    } else {
                                        if (onSitePlayer.event.match(/.*1stW.*/i)) {
                                            mainTournament[0]++;
                                            mainTournament[1]++;
                                            mainTournament[2]++;
                                            mainTournament[3]++;
                                            mainTournament[4]++;
                                        }
                                        if (onSitePlayer.event.match(/.*2ndW.*/i)) {
                                            mainTournament[5]++;
                                            mainTournament[6]++;
                                            mainTournament[7]++;
                                            mainTournament[8]++;
                                            mainTournament[9]++;
                                        }
                                    }

                                    if (onSitePlayer.event.match(/.*WE.*/i) &&
                                        onSitePlayer.weekendTournament !== '0'
                                    ) {
                                        weekendTournament++;
                                    }
                                });

                            const tooManyErrorTournament: boolean[] = [false, false, false];
                            const indexMainTooMany = mainTournament.findIndex(val => val + 1 > maxNumberOfPlayer);
                            tooManyErrorTournament[0] = player.event.match(/.*1stW.*/) && indexMainTooMany >= 0 && indexMainTooMany < 5;
                            tooManyErrorTournament[1] = player.event.match(/.*WE.*/) && weekendTournament > maxNumberOfPlayer;
                            tooManyErrorTournament[2] = player.event.match(/.*2ndW.*/) && indexMainTooMany >= 5;

                            if (tooManyErrorTournament[0] || tooManyErrorTournament[1] || tooManyErrorTournament[2]) {
                                return throwError({
                                    message: 'Too many players registered',
                                    mainFirstWeek: tooManyErrorTournament[0],
                                    weekend: tooManyErrorTournament[1],
                                    mainSecondWeek: tooManyErrorTournament[2]
                                });
                            }

                            return of(player);
                        })
                    );
            } else {
                registerObservable = of(player);
            }

            registerObservable.pipe(
                switchMap((toRegister) => this.registerService.register(toRegister))
            ).subscribe({
                next: (savedPayer: PlayerEntry) => {
                    this.snackBar.open('Player ' + savedPayer.name + ' has been saved',
                        'Ok');
                },
                error: (error: any) => { // HttpErrorResponse | TooManyPlayerError
                    if (typeof error.message !== 'undefined' &&
                        typeof error.mainFirstWeek !== 'undefined' &&
                        typeof error.weekend !== 'undefined' &&
                        typeof error.mainSecondWeek !== 'undefined') {
                        const tooManyPlayerError = error as TooManyPlayerError;
                        this.dialog.open(ErrorTooManyPlayerComponent, {
                            width: '400px',
                            data: tooManyPlayerError,
                            panelClass: 'error-bg'
                        });
                    } else {
                        const httpErrorReponse = error as HttpErrorResponse;
                        if (httpErrorReponse.status === 412) {
                            this.snackBar.open(httpErrorReponse.error.message,
                                'Ok');
                        } else {
                            this.snackBar.open('Unknown error. Please try again',
                                'Ok');
                        }
                    }

                    waitDialogRef.close();
                },
                complete: () => {
                    waitDialogRef.close();
                    this.currentStep = 0;
                    this.resetState(false);
                    this.refreshPlayer();
                }
            });
        } else {
            if (this.formGroup.get('paid').hasError('required')) {
                this.snackBar.open('Please check payment', 'Ok', {
                    panelClass: 'snack-bar-error'
                });
            } else {
                this.snackBar.open('The form contains invalid values', 'Ok', {
                    panelClass: 'snack-bar-error'
                });
            }
        }
    }

    public toggleTournamentOptions(fromScreen: boolean, $event?: MatCheckboxChange): void {
        if (fromScreen) {
            this.formGroup.get('paid').setValue(false);
        }
        const firstWeekCheck = this.formGroup.get('firstWeekCheck').value;
        const secondWeekCheck = this.formGroup.get('secondWeekCheck').value;
        const weekendCheck = this.formGroup.get('weekendCheck').value;
        if (typeof firstWeekCheck !== 'undefined' &&
            $event === undefined ||
            $event.source.id === 'idFirstWeekCheck') {
            [
                ...this.mainFirstWeekOptions,
                ...this.rapidFirstWeekOptions
            ].forEach((eventOption) => {
                eventOption.disabled = !firstWeekCheck;
                eventOption.played = firstWeekCheck;
            });
            this.otherEventOptions.filter((filterOption) => {
                return filterOption.title === '9*9 : ' ||
                    filterOption.title === '13*13 : ';
            }).forEach((eventOption) => {
                eventOption.disabled = !firstWeekCheck;
            });
        }
        if (typeof secondWeekCheck !== 'undefined' &&
            $event === undefined ||
            $event.source.id === 'idSecondWeekCheck') {
            [
                ...this.mainSecondWeekOptions,
                ...this.rapidSecondWeekOptions
            ].forEach((eventOption) => {
                eventOption.disabled = !secondWeekCheck;
                eventOption.played = secondWeekCheck;
            });
            this.otherEventOptions.filter((filterOption) => {
                return filterOption.title === 'Children : ' ||
                    filterOption.title === 'Ying Yang : ' ||
                    filterOption.title === 'Chess & Go : ';
            }).forEach((eventOption) => {
                eventOption.disabled = !secondWeekCheck;
            });
        }
        if (typeof weekendCheck !== 'undefined' &&
            $event === undefined ||
            $event.source.id === 'idWeekendCheck') {
            this.otherEventOptions.filter((filterOption) => {
                return filterOption.title === 'Weekend : ';
            }).forEach((eventOption) => {
                eventOption.disabled = !weekendCheck;
                eventOption.played = weekendCheck;
            });
        }
    }

    public resetState(withMessage?: boolean) {
        this.currentStep = 0;
        this.registerClicked = false;
        this.selectedPlayer = undefined;
        if (typeof withMessage === 'undefined' || withMessage === true) {
            this.snackBar.open('Form reset', 'Ok');
        }

        this.searchPin.reset();
        this.searchLastName.reset();
        this.formGroup.reset();
        this.toggleTournamentOptions(false);
        this.ngForm.resetForm();
        this.refreshPlayer();
    }

    private transformOptionsToString(eventOptions: EventOption[]): string {
        let result = '';
        eventOptions.forEach((option) => result += option.played ? '1' : '0');
        return result;
    }

    public toggle($event: MatCheckboxChange, option: EventOption): void {
        option.played = $event.checked;
    }

    public getErrorMessage(field: string): string | undefined {
        if (this.formGroup.get(field) !== undefined) {
            if (this.formGroup.get(field).hasError('required')) {
                return 'This field is required';
            }
            if (this.formGroup.get(field).hasError('email')) {
                return 'Please enter a valid email address';
            }
            if (this.formGroup.get(field).hasError('pattern')) {
                if (field === 'level') {
                    return 'Should be xxk or xd or xp';
                }
                if (field === 'egdpin') {
                    return 'Egdpin must match 8 digits';
                }
                if (field === 'searchPin') {
                    return 'Invalid number. Use egcbel or egdpin';
                }
            }
        }
        return undefined;
    }
}

class EventOption {
    public label: string;
    public played: boolean;
    public disabled: boolean;
    public title?: string;
}
