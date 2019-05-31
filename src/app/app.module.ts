import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule,
    MatToolbarModule
} from '@angular/material';
import {HomeComponent} from './home/home.component';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationComponent} from './registration/registration.component';
import {HttpClientModule} from '@angular/common/http';
import {SignInService, SubscribersService} from './shared';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';

const appRoutes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'registration', component: RegistrationComponent},
    {path: 'login', component: LoginComponent}

    // {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        RegistrationComponent,
        LoginComponent
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
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatToolbarModule,
        MatCardModule,
        MatInputModule,
        RouterModule
    ],
    providers: [
        SubscribersService,
        SignInService,
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
