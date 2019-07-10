import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadService {

    constructor(private http: HttpClient) {
    }

    public uploadFile(file: any): Observable<any> {
        return of('file');
    }
}
