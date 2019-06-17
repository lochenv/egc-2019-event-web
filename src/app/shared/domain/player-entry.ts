import {autoserialize} from 'cerialize';
import {EgdPlayerInfo} from './egd-player-info.entity';

export class PlayerEntry {
    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public country: string;

    @autoserialize
    public email: string;

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

    public egdInfo?: EgdPlayerInfo;

    public static OnDeserialized(instance: PlayerEntry, json: any): void {
        instance.id = Number(json.id);
        instance.dateCreation = json.date_creation;
        instance.dateOfPayment = json.date_of_payment;
        instance.onSite = json.on_site;
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
          instance.level = '-'
        } else {
          instance.level = json.level;
        }
    }
}
