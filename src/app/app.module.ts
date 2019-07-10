import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS, MAT_SNACK_BAR_DEFAULT_OPTIONS,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule, MatSnackBarConfig, MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule
} from '@angular/material';
import {HomeComponent} from './home/home.component';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationComponent} from './registration/registration.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthenticationInterceptor, ErrorLogoutInterceptor, RegistrationService, SignInService, SubscribersService} from './shared';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';
import {ExtractListComponent} from './extract-list/extract-list.component';
import {FileSaverModule} from 'ngx-filesaver';
import {ConfirmDownloadDialogComponent} from './confirm-download-dialog/confirm-download-dialog.component';
import { PleaseWaitDialogComponent } from './please-wait-dialog/please-wait-dialog.component';
import {AuthGardService} from './shared/services/auth-gard.service';
import { NotifyRoundComponent } from './notify-round/notify-round.component';
import {MatFileUploadModule} from 'angular-material-fileupload';

const appRoutes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        // canActivate: [AuthGardService]
    },
    {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [AuthGardService]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'extract-list',
        component: ExtractListComponent,
        canActivate: [AuthGardService]
    },
    {
        path: 'notify-round',
        component: NotifyRoundComponent,
        canActivate: [AuthGardService]
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];

const EGC_SNACK_BAR_CONFIG: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: 'snack-bar-info'
};

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        RegistrationComponent,
        LoginComponent,
        ExtractListComponent,
        ConfirmDownloadDialogComponent,
        PleaseWaitDialogComponent,
        NotifyRoundComponent
    ],
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {enableTracing: true} // <-- debugging purposes only
        ),
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        FileSaverModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatToolbarModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFileUploadModule,
        RouterModule
    ],
    entryComponents: [
        ConfirmDownloadDialogComponent,
        PleaseWaitDialogComponent
    ],
    providers: [
        SubscribersService,
        SignInService,
        RegistrationService,
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
        {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: EGC_SNACK_BAR_CONFIG},
        {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorLogoutInterceptor, multi: true}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
