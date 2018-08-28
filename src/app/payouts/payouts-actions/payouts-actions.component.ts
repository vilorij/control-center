import { Component, Input, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { MatDialog } from '@angular/material';

import { PayPayoutsComponent } from '../pay-payouts/pay-payouts.component';
import { ConfirmPayoutsComponent } from '../confirm-payouts/confirm-payouts.component';
import { CreatePayoutComponent } from '../create-payout/create-payout.component';
import { Payout, PayoutStatus } from '../../papi/model';

@Component({
    selector: 'cc-payouts-actions',
    templateUrl: 'payouts-actions.component.html'
})
export class PayoutsActionsComponent implements OnInit {
    @Input()
    selectedPayouts: Payout[];

    roles: string[];

    constructor(private keycloakService: KeycloakService,
                private dialogRef: MatDialog) {
    }

    ngOnInit() {
        this.roles = this.keycloakService.getUserRoles();
    }

    pay() {
        this.dialogRef.open(PayPayoutsComponent, {data: this.getIds(this.selectedPayouts)});
    }

    confirmPayouts() {
        this.dialogRef.open(ConfirmPayoutsComponent, {data: this.getIds(this.selectedPayouts)});
    }

    createPayout() {
        this.dialogRef.open(CreatePayoutComponent, {
            width: '720px',
            disableClose: true
        });
    }

    hasRole(role: string): boolean {
        return this.roles.includes(role);
    }

    isCanPay(): boolean {
        const unpaid = this.selectedPayouts.filter((payout) => payout.status === PayoutStatus.unpaid);
        return this.selectedPayouts.length === unpaid.length && unpaid.length > 0;
    }

    isCanConfirm(): boolean {
        const paid = this.selectedPayouts.filter((payout) => payout.status === PayoutStatus.paid);
        return this.selectedPayouts.length === paid.length && paid.length > 0;
    }

    private getIds(payouts: Payout[]): string[] {
        return payouts.reduce((acc, current) => acc.concat(current.id), []);
    }
}