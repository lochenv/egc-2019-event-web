import {Component, HostBinding, OnInit} from '@angular/core';
import {RegistrationService, SubscribersService} from '../shared';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlayerEntry} from '../shared/domain/player-entry';

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
    }
  ];

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
      this.selectedPlayer = foundPlayer;

      this.currentStep = 2;
    } else {
      console.log('Player not found', searchPin);
      this.formGroup.get('searchPin').setErrors({'Player not found': true});
    }
  }

  public register(): void {
    console.log('Registering');
    this.registerService.register();
  }

  public toggleTournamentOptions(): void {
    console.log('>>> Toggle options', this);
    const firstWeekCheck = this.formGroup.get('firstWeekCheck').value;
    const secondWeekCheck = this.formGroup.get('secondWeekCheck').value;
    const weekendCheck = this.formGroup.get('weekendCheck').value;
    if (typeof firstWeekCheck !== "undefined") {
      this.mainFirstWeekOptions.forEach((eventOption) => {
        console.log('>>> changing disable', firstWeekCheck);
        eventOption.disabled = !firstWeekCheck;
      });
      this.rapidFirstWeekOptions.forEach((eventOption) => {
        eventOption.disabled = !firstWeekCheck;
      });
      this.otherEventOptions.filter((filterOption) => {
        return filterOption.title === '9*9 : ';
      }).forEach((eventOption) => {
        eventOption.disabled = !firstWeekCheck;
      });
    }
    if (typeof secondWeekCheck !== "undefined") {
      this.mainSecondWeekOptions.forEach((eventOption) => {
        eventOption.disabled = !secondWeekCheck;
      });
      this.rapidSecondWeekOptions.forEach((eventOption) => {
        eventOption.disabled = !secondWeekCheck;
      });
      this.otherEventOptions.filter((filterOption) => {
        return filterOption.title === 'Children : ' || filterOption.title === 'Ying Yang : ';
      }).forEach((eventOption) => {
        eventOption.disabled = !secondWeekCheck;
      });
    }
    if (typeof weekendCheck !== "undefined") {
      this.otherEventOptions.filter((filterOption) => {
        return filterOption.title === 'Weekend : ';
      }).forEach((eventOption) => {
        eventOption.disabled = !weekendCheck;
      });
    }
  }
}

class EventOption {
  public label: string;
  public played: boolean;
  public disabled: boolean;
  public title?: string;
}
