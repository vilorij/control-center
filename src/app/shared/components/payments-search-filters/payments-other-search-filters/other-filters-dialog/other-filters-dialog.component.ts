import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SearchFiltersParams } from '../../search-filters-params';
import { paymentMethods, paymentStatuses, paymentSystems, tokenProviders } from './constants';
import { OtherFiltersDialogService } from './other-filters-dialog.service';

@Component({
    templateUrl: 'other-filters-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherFiltersDialogComponent implements OnInit {
    paymentStatuses = paymentStatuses;
    paymentMethods = paymentMethods;
    tokenProviders = tokenProviders;
    paymentSystems = paymentSystems;

    currentDomainVersion$ = this.paymentsOtherSearchFiltersService.currentDomainVersion$;
    form = this.paymentsOtherSearchFiltersService.form;

    constructor(
        private dialogRef: MatDialogRef<OtherFiltersDialogComponent>,
        private paymentsOtherSearchFiltersService: OtherFiltersDialogService,
        @Inject(MAT_DIALOG_DATA) public initParams: SearchFiltersParams
    ) {}

    ngOnInit() {
        this.form.patchValue(this.initParams);
    }

    cancel() {
        this.dialogRef.close();
    }

    save() {
        this.dialogRef.close(this.form.value);
    }
}
