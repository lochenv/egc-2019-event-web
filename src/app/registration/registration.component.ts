import {Component, HostBinding, OnInit} from '@angular/core';
import {SubscribersService} from '../shared/services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const componentName: string = 'app-registration';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  @HostBinding()
  public class: string = componentName;

  public formGroup: FormGroup;

  constructor(private subscribersService: SubscribersService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.subscribersService.getSubscribers();

    this.formGroup = this.formBuilder.group({
      firstName: [
        '',
        [Validators.required]
      ],
      lastName: [
        '',
        [Validators.required]
      ],
      level: [
        '',
        [Validators.required]
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
}
