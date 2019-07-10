import {autoserialize} from 'cerialize';
import {EgdPlayerInfo} from './egd-player-info.entity';
import {FormGroup} from '@angular/forms';
import * as moment from 'moment';

export class PlayerEntry {
    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public country: string;

    @autoserialize
    public email: string;

    public notification: boolean;

    public level: string;

    public age: string;

    @autoserialize
    public event: string;

    @autoserialize
    public club?: string;

    @autoserialize
    public phone?: string;

    @autoserialize
    public egdpin?: number;

    @autoserialize
    public gender?: string;

    @autoserialize
    public visa?: string;

    @autoserialize
    public validated?: string;

    @autoserialize
    public amount?: number;

    @autoserialize
    public paid?: string;

    @autoserialize
    public confirmed?: string;

    public dateCreation?: Date;

    public dateOfPayment?: Date;

    @autoserialize
    public remarks?: string;

    public onSite?: string;

    @autoserialize
    public firstName: string;

    @autoserialize
    public lastName: string;

    public mainTournament?: string;

    public rapidTournament?: string;

    public weekendTournament?: string;

    public sideEvent?: string;

    public egdInfo?: EgdPlayerInfo;

    public static OnSerialized(instance: PlayerEntry, json: any): void {
        json.date_creation = instance.dateCreation;
        if (instance.dateOfPayment === undefined) {
            instance.dateOfPayment = new Date();
        }
        json.date_of_payment = instance.dateOfPayment;
        switch (instance.age) {
            case 'Teen':
                json.age = '-18';
                break;
            case 'Child':
                json.age = '-12';
                break;
            case 'Adult':
            default:
                json.age = '+=18';
        }
        json.level = instance.level;
        json.main_tournament = instance.mainTournament;
        json.rapid_tournament = instance.rapidTournament;
        json.weekend_tournament = instance.weekendTournament;
        json.side_event = instance.sideEvent;
        json.on_site = instance.onSite;
        if (instance.notification) {
            json.notification = 'yes';
        } else {
            json.notification = 'no';
        }
    }

    public static OnDeserialized(instance: PlayerEntry, json: any): void {
        instance.id = Number(json.id);
        instance.amount = Number(json.amount);
        instance.dateCreation = moment(json.date_creation).toDate();
        if (typeof json.date_of_payment !== 'undefined' &&
            json.date_of_payment !== null &&
            json.date_of_payment !== '0000-00-00') {
            instance.dateOfPayment = moment(json.date_of_payment).toDate();
        }
        instance.mainTournament = json.main_tournament;
        instance.rapidTournament = json.rapid_tournament;
        instance.weekendTournament = json.weekend_tournament;
        instance.sideEvent = json.side_event;
        instance.onSite = json.on_site;
        if (typeof json.notification !== 'undefined') {
            instance.notification = json.notification === 'yes';
        }
        if (json.egdpin.toString().match(/\d{8}/)) {
            instance.egdpin = Number(json.egdpin);
        } else {
            instance.egdpin = undefined;
        }
        switch (json.age) {
            case '+=18':
                instance.age = 'Adult';
                break;
            case '-18':
                instance.age = 'Teen';
                break;
            case '-12':
                instance.age = 'Child';
                break;
            default:
                instance.age = json.age;
        }
        if (json.level === 'No level selected') {
            instance.level = '-';
        } else {
            instance.level = json.level;
        }
    }

    public fillFromFormGroup(formGroup: FormGroup,
                             mainTournament: string,
                             rapidTournament: string,
                             weekendTournament: string,
                             sideEvent: string): void {
        this.firstName = formGroup.get('firstName').value;
        this.lastName = formGroup.get('lastName').value;
        this.age = formGroup.get('age').value;
        this.email = formGroup.get('email').value;
        this.notification = formGroup.get('notification').value;
        this.level = formGroup.get('level').value;
        this.country = formGroup.get('country').value;
        this.egdpin = formGroup.get('egdPin').value;
        this.dateCreation = formGroup.get('registrationDate').value;
        this.paid = formGroup.get('paid').value ? 'yes' : 'no';
        this.dateOfPayment = formGroup.get('dateOfPayment').value;
        this.club = formGroup.get('club').value;
        this.phone = formGroup.get('phone').value;
        this.remarks = formGroup.get('remarks').value;

        // Name concatenation
        this.name = this.firstName + ' ' + this.lastName;

        // Event algorithm
        this.event = '';
        if (formGroup.get('firstWeekCheck').value === true) {
            this.event += '1stW,';
        }
        if (formGroup.get('weekendCheck').value === true) {
            this.event += 'WE';
        }
        if (formGroup.get('secondWeekCheck').value === true) {
            this.event += ',2ndW';
        }
        this.event = this.event.replace(',,', ',');
        if (this.event.startsWith(',')) {
            this.event = this.event.substring(1);
        }

        this.mainTournament = mainTournament;
        this.rapidTournament = rapidTournament;
        this.weekendTournament = weekendTournament;
        this.sideEvent = sideEvent;
        this.onSite = 'yes';

        console.log('With form group', this);
    }

    public toFormGroup(formGroup: FormGroup): void {
        formGroup.get('firstName').setValue(this.firstName);
        formGroup.get('lastName').setValue(this.lastName);
        formGroup.get('age').setValue(this.age);
        formGroup.get('email').setValue(this.email);
        formGroup.get('notification').setValue(this.notification);
        formGroup.get('level').setValue(this.level);
        formGroup.get('country').setValue(this.country); // TODO Land or isoCode ?
        formGroup.get('egdPin').setValue(this.egdpin);
        formGroup.get('registrationDate').setValue(this.dateCreation);
        formGroup.get('paid').setValue(this.paid === 'yes');
        formGroup.get('dateOfPayment').setValue(this.dateOfPayment);
        formGroup.get('club').setValue(this.club);
        formGroup.get('phone').setValue(this.phone);

        /* Toggle options depending on the event */
        formGroup.get('firstWeekCheck').setValue(this.event.match(/.*1stW.*/) !== null);
        formGroup.get('secondWeekCheck').setValue(this.event.match(/.*2ndW.*/) !== null);
        formGroup.get('weekendCheck').setValue(this.event.match(/.*WE.*/) !== null);
    }
}
