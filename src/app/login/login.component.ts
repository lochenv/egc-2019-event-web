import {Component, HostBinding, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SignInService} from '../shared/services';
import {SignInRequest, UserEntity} from '../shared/domain';
import * as CryptoJS from 'crypto-js';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {PleaseWaitDialogComponent} from '../please-wait-dialog/please-wait-dialog.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    @HostBinding()
    public class = 'app-login';

    public loginForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private signInService: SignInService,
                private snackBar: MatSnackBar,
                private dialog: MatDialog,
                private router: Router) {
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: [
                '',
                [Validators.required]
            ],
            password: [
                '',
                [Validators.required]
            ]
        });
    }

    public login(): void {
        if (this.loginForm.valid) {
            const pleaseWaitRef = this.dialog.open(PleaseWaitDialogComponent, {
                width: '250px'
            });
            const encPassword =
                CryptoJS.enc.Base64.stringify(
                    CryptoJS.SHA256(this.loginForm.controls.password.value));
            const signInRequest: SignInRequest = {
                username: this.loginForm.controls.username.value,
                password: encPassword
            };

            this.signInService.signIn(signInRequest)
                .subscribe({
                    next: (userEntry
                               : UserEntity) => {
                        this.snackBar.open('User ' + userEntry.username + ' successfully logged in', 'Ok');
                        this.router.navigate(['/home']);
                    },
                    error: (error: any) => {
                        console.log(error);
                    },
                    complete: () => pleaseWaitRef.close()
                });
        } else {
            this.snackBar.open('The form contains invalid values', 'Ok', {
                panelClass: 'snack-bar-error'
            });
            console.log('Cannot sign is cause form is invalid', this.loginForm);
        }


    }

    public getErrorMessage(field: string): string | undefined {
        if (this.loginForm.controls[field] !== undefined) {
            if (this.loginForm.controls[field].hasError('required')) {
                return 'This field is required';
            }
        }
        return undefined;
    }

}
