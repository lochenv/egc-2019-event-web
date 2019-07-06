import {Component, HostBinding, OnInit} from '@angular/core';
import {RegistrationService, SubscribersService} from '../shared';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlayerEntry} from '../shared/domain/player-entry';
import {MatCheckboxChange, MatDialog, MatSnackBar} from '@angular/material';
import {Observable} from 'rxjs';
import {EgdPlayerInfo} from '../shared/domain/egd-player-info.entity';
import {filter, startWith, switchMap} from 'rxjs/operators';
import {PleaseWaitDialogComponent} from '../please-wait-dialog/please-wait-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';

const componentName = 'app-registration';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

    @HostBinding()
    public class: string = componentName;

    public formGroup: FormGroup;

    public ageOptions: string[];

    public isoCodeOptions: string[];

    public currentStep: number;

    public players: PlayerEntry[];

    public selectedPlayer: PlayerEntry;

    public filteredEgdPayer: Observable<EgdPlayerInfo[]>;

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
            label: '07-21 / 07-23 (5 rounds)',
            played: false,
            disabled: true
        },
        {
            title: 'Children : ',
            label: '07-29 (5 rounds)',
            played: false,
            disabled: true
        },
        {
            title: 'Ying Yang : ',
            label: '08-02 (5 rounds)',
            played: false,
            disabled: true
        },
        {
            title: 'Chess & Go : ',
            label: '08-01 (x rounds)',
            played: false,
            disabled: true
        },
        {
            title: '13*13 : ',
            label: '07-24 (4 rounds)',
            played: false,
            disabled: true
        }
    ];

    constructor(private subscribersService: SubscribersService,
                private registerService: RegistrationService,
                private formBuilder: FormBuilder,
                private dialog: MatDialog,
                private snackBar: MatSnackBar) {
    }

    public ngOnInit(): void {
        this.subscribersService.getSubscribers()
            .subscribe((players: PlayerEntry[]) => {
                this.players = players;
            });

        this.currentStep = 0;

        this.ageOptions = ['Adult', 'Teen', 'Child'];
        this.isoCodeOptions = [];

        this.formGroup = this.formBuilder.group({
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
                undefined,
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
            searchPin: [
                '',
                [Validators.pattern(/^(\d{1,4}|1\d{7})$/)]
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

        this.filteredEgdPayer = this.formGroup.get('lastName').valueChanges
            .pipe(
                startWith(''),
                filter(val => val !== null && val.length > 2),
                switchMap((value: string) => {
                    return this.subscribersService.getPlayerFromEgdByLastName(value);
                })
            );
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
        let foundPlayer: PlayerEntry;
        const searchPin = this.formGroup.get('searchPin').value;
        if (searchPin.match(/\d{1,4}/)) {
            const playerId = Number(searchPin);
            const result: PlayerEntry[] = this.players.filter(player => {
                return player.id === playerId;
            });
            if (result.length === 1) {
                foundPlayer = result[0];
            }
        } else {
            const egdPin = Number(searchPin);
            const result: PlayerEntry[] = this.players.filter(player => {
                return player.egdpin === egdPin;
            });
            if (result.length === 1) {
                foundPlayer = result[0];
            }
        }
        if (this.formGroup.get('searchPin').valid && foundPlayer) {
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
            this.formGroup.markAsPristine();
            this.toggleTournamentOptions();

            this.selectedPlayer = foundPlayer;
            this.currentStep = 2;
        } else {
            this.formGroup.get('searchPin').setErrors({'notfound': true});
        }
    }

    public register(): void {
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
            this.registerService.register(player)
                .subscribe({
                    next: (savedPayer: PlayerEntry) => {
                        this.snackBar.open('Player ' + savedPayer.name + ' has been saved',
                            'Ok');
                    },
                    error: (error: HttpErrorResponse) => {
                        if (error.status === 412) {
                            this.snackBar.open(error.error.message,
                                'Ok');
                        } else {
                            this.snackBar.open('Unknown error. Please try again',
                                'Ok');
                        }
                        waitDialogRef.close();
                    },
                    complete: () => {
                        waitDialogRef.close();
                        this.currentStep = 0;
                        this.formGroup.reset();
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

    public toggleTournamentOptions(): void {
        const firstWeekCheck = this.formGroup.get('firstWeekCheck').value;
        const secondWeekCheck = this.formGroup.get('secondWeekCheck').value;
        const weekendCheck = this.formGroup.get('weekendCheck').value;
        if (typeof firstWeekCheck !== 'undefined') {
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
        if (typeof secondWeekCheck !== 'undefined') {
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
        if (typeof weekendCheck !== 'undefined') {
            this.otherEventOptions.filter((filterOption) => {
                return filterOption.title === 'Weekend : ';
            }).forEach((eventOption) => {
                eventOption.disabled = !weekendCheck;
                eventOption.played = weekendCheck;
            });
        }
    }

    public resetState() {
        this.formGroup.reset();
        this.formGroup.markAsPristine();
        this.currentStep = 0;
        this.snackBar.open('Form reset', 'Ok');
    }

    private transformOptionsToString(eventOptions: EventOption[]): string {
        let result = '';
        console.log('creating result for', eventOptions);
        eventOptions.forEach((option) => result += option.played ? '1' : '0');
        return result;
    }

    public toggle($event: MatCheckboxChange, option: EventOption): void {
        console.log('>>> changing options', option);
        option.played = $event.checked;
    }

    public getErrorMessage(field: string): string | undefined {
        if (this.formGroup.get(field) !== undefined) {
            if (this.formGroup.get(field).hasError('required')) {
                return 'This field is required';
            }
            if (this.formGroup.get(field).hasError('notfound')) {
                return 'Player not found';
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
