import {Component, HostBinding, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SignInService} from '../shared/services';
import {SignInRequest} from '../shared/domain';
import * as CryptoJS from 'crypto-js';

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
                private signInService: SignInService) {
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
        console.log('Sign in requested');
        if (this.loginForm.valid) {
            const encPassword =
                CryptoJS.enc.Base64.stringify(
                    CryptoJS.SHA256(this.loginForm.controls.password.value));
            const signInRequest: SignInRequest = {
                username: this.loginForm.controls.username.value,
                password: encPassword
            };

            this.signInService.signIn(signInRequest);
        } else {
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
