import {Component, HostBinding, OnInit} from '@angular/core';
import {RegistrationService, SubscribersService} from '../shared';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlayerEntry} from '../shared/domain/player-entry';
import {Player} from '@angular/core/src/render3/interfaces/player';

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

    constructor(private subscribersService: SubscribersService,
                private registerService: RegistrationService,
                private formBuilder: FormBuilder) {
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
                [Validators.required]
            ],
            searchPin: [
                '',
                [Validators.pattern(/^(egcbel\d*|\d{8})$/)]
            ]
        });
    }

    public findAndNext(): void {
        console.log('>>> Searching for ', this.formGroup.get('searchPin').value);
        let foundPlayer: PlayerEntry;
        const searchPin = this.formGroup.get('searchPin').value;
        if (searchPin.toLowerCase().startsWith('egcbel')) {
            const playerId = Number(searchPin.toLowerCase().replace('egcbel', ''));
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
                    .subscribe(
                        (value: any) => console.log('From EGD', value)
                    );
            }
            this.formGroup.markAsPristine();
            this.formGroup.get('firstName').setValue(foundPlayer.firstName);
            this.formGroup.get('lastName').setValue(foundPlayer.lastName);
            this.formGroup.get('age').setValue(foundPlayer.age);
            this.formGroup.get('email').setValue(foundPlayer.email);
            this.formGroup.get('level').setValue(foundPlayer.level);
            this.formGroup.get('country').setValue(foundPlayer.country); // TODO Land or isoCode ?
            this.formGroup.get('egdPin').setValue(foundPlayer.egdpin);

            this.currentStep = 2;
        } else {
          console.log('Player not found', searchPin);
          this.formGroup.get('searchPin').setErrors({ "Player not found": true});
        }
    }

    public register(): void {
        console.log('Registering');
        this.registerService.register();
    }
}
