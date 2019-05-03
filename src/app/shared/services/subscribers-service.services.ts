import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';

@Injectable()
export class SubscribersService {

    private subscribersUri = 'http://egc.srtt.pro/congress?export=true&token=rJV2P0HxWp8XaofbgN4dy2hc26ijB5WZz0nsKLpz7q2nA';

    public constructor(private httpClient: HttpClient) {
    }

    public getSubscribers(): any {
        this.httpClient.get(this.subscribersUri, {observe: 'response'})
            .subscribe((data: HttpResponse<any>) => {
                    console.log('Return message', data.status);
                },
                (error: HttpErrorResponse) => {
                    console.log('Error status', error.status);
                    console.log('Error message', error.message);
                }
            );
        return '';
    }
}
