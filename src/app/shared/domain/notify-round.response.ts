export class NotifyRoundResponse {
    public succeeded: SimpleGoPlayer[];
    public inError: SimpleGoPlayer[];
}

export class SimpleGoPlayer {
    public lastName: string;
    public firstName: string;
    public level: string;
    public email: string;
}
