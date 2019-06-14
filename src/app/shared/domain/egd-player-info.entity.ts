export class EgdPlayerInfo {
    public pinPlayer: number;
    public lastName: string;
    public firstName: string;
    public countryCode: string;
    public club: string;
    public grade: string;
    public gradeN: string;
    public egfPlacement: string;
    public gor: string;
    public dGor: string;
    public proposedGrade: string;
    public realLastName: string;
    public restFirstName: string;

    public static OnDeserialized(instance: EgdPlayerInfo, json: any): void {
        instance.pinPlayer = Number(json.Pin_Player);
        instance.lastName = json.Last_Name;
        instance.firstName = json.Name;
        instance.countryCode = json.Country_Code;
        instance.club = json.Club;
        instance.grade = json.Grade;
        instance.gradeN = json.Grade_n;
        instance.egfPlacement = json.EGF_Placement;
        instance.gor = json.Gor;
        instance.dGor = json.DGor;
        instance.proposedGrade = json.Proposed_Grade;
        instance.realLastName = json.Real_Last_Name;
        instance.restFirstName = json.Real_Name;
    }
}
