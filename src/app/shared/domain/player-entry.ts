import {autoserialize} from 'cerialize';
export class PlayerEntry {
    @autoserialize
    public id: number;
    @autoserialize
    public name: string;
    @autoserialize
    public country: string;
    @autoserialize
    public email: string;
    @autoserialize
    public level: string;
    @autoserialize
    public age: string;
    @autoserialize
    public event: string;
    @autoserialize
    public club: string;
    @autoserialize
    public phone: string;
    @autoserialize
    public egdpin: number;
    @autoserialize
    public gender: string;
    @autoserialize
    public visa: string;
    @autoserialize
    public validated: string;
    @autoserialize
    public paid: string;
    @autoserialize
    public confirmed: string;

    public dateCreation: Date;
    public dateOfPayment: Date;
    @autoserialize
    public remarks: string;

    public onSite: string;
    @autoserialize
    public firstName: string;
    @autoserialize
    public lastName: string;

    public static OnDeserialized(instance : PlayerEntry, json : any) : void {
        instance.id = Number(json.id);
        instance.dateCreation = json.date_creation;
        instance.dateOfPayment = json.date_of_payment;
        instance.onSite = json.on_site;
        instance.egdpin = Number(json.egdpin);
    }
}

/*
INFO FROM EGD
retcode	"Ok"
Pin_Player	"12098053"
AGAID	"0"
Last_Name	"Podavini"
Name	"Aldo"
Country_Code	"IT"
Club	"Mila"
Grade	"5k"
Grade_n	"25"
EGF_Placement	"0"
Gor	"1464"
DGor	"0"
Proposed_Grade	""
Tot_Tournaments	"37"
Last_Appearance	"T101212A"
Elab_Date	"2009-04-03"
Hidden_History	"0"
Real_Last_Name	"Podavini"
Real_Name	"Aldo"
 */
