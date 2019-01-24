import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'cc-international-legal-entity',
    templateUrl: 'international-legal-entity.component.html'
})
export class InternationalLegalEntityComponent implements OnInit {
    @Input()
    form: FormGroup;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.form.registerControl('legalName', this.fb.control('', Validators.required));
        this.form.registerControl('registeredAddress', this.fb.control('', Validators.required));

        this.form.registerControl('tradingName', this.fb.control(''));
        this.form.registerControl('actualAddress', this.fb.control(''));
        this.form.registerControl('registeredNumber', this.fb.control(''));
    }
}
