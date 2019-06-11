import {Component, HostBinding, OnInit} from '@angular/core';
import {SubscribersService, RegistrationService} from '../shared';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const componentName = 'app-registration';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  @HostBinding()
  public class: string = componentName;

  public formGroup: FormGroup;

  public ageOptions: string[];

  public isoCodeOptions: string[];

  constructor(private subscribersService: SubscribersService,
              private registerService: RegistrationService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.ageOptions = ['Equal or more than 18', 'Less than 18', 'Less than 12'];
    this.isoCodeOptions = [];
    this.subscribersService.getSubscribers();

    this.formGroup = this.formBuilder.group({
      fullName: [
        '',
        [Validators.required]
      ],
      age: [
        '',
        [Validators.required]
      ],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      level: [
        '',
        [Validators.required, Validators.pattern(/^(\d{1,2}[k]|\d[d])$/)]
      ],
      country: [
        '',
        [Validators.required]
      ],
      egcPin: [
        '',
        [Validators.required]
      ]
    });
  }

  public register(): void {
    console.log('Registering');
    this.registerService.register();
  }
}
