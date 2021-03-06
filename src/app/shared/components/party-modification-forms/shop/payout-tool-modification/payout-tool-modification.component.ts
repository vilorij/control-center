import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import get from 'lodash-es/get';

import { PayoutToolID } from '../../../../../thrift-services/damsel/gen-model/domain';

@Component({
    selector: 'cc-shop-payout-tool-modification',
    templateUrl: 'payout-tool-modification.component.html',
})
export class PayoutToolModificationComponent implements OnInit {
    @Input()
    form: FormGroup;

    @Input()
    initialValue: PayoutToolID;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        const payoutToolId = get(this, 'initialValue.modification', '');
        this.form.setControl('modification', this.fb.control(payoutToolId, Validators.required));
        this.form.updateValueAndValidity();
    }
}
