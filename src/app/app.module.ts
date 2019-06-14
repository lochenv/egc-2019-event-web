import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule
} from '@angular/material';
import {HomeComponent} from './home/home.component';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationComponent} from './registration/registration.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {SignInService, SubscribersService, AuthenticationInterceptor, RegistrationService, ErrorLogoutInterceptor} from './shared';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';
import {AuthGardService} from './shared/services/auth-gard.service';
import {ExtractListComponent} from './extract-list/extract-list.component';
import {FileSaverModule} from 'ngx-filesaver';

const appRoutes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGardService]
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
        component: ExtractListComponent
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        RegistrationComponent,
        LoginComponent,
        ExtractListComponent
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
        MatButtonModule,
        MatToolbarModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatSortModule,
        RouterModule
    ],
    providers: [
        SubscribersService,
        SignInService,
        RegistrationService,
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
        {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorLogoutInterceptor, multi: true}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
