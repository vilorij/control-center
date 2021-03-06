import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { merge } from 'rxjs';

import { PartyID, ShopID } from '../../../thrift-services/damsel/gen-model/domain';
import {
    AddProviderService,
    EditTerminalDecisionService,
    FetchShopProvidersService,
    RemoveTerminalDecisionService,
} from './services';
import { TerminalAction, TerminalActionTypes } from './types';

@Component({
    selector: 'cc-shop-providers',
    templateUrl: 'shop-providers.component.html',
    providers: [
        FetchShopProvidersService,
        EditTerminalDecisionService,
        RemoveTerminalDecisionService,
        AddProviderService,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopProvidersComponent implements OnInit {
    @Input()
    partyID: PartyID;

    @Input()
    shopID: ShopID;

    @Input()
    categoryID: number;

    providersInfo$ = this.fetchProvidersService.providersInfo$;
    fetchProgress$ = this.fetchProvidersService.inProgress$;
    removeProgress$ = this.removeTerminalDecisionService.inProgress$;

    constructor(
        private fetchProvidersService: FetchShopProvidersService,
        private editTerminalDecisionService: EditTerminalDecisionService,
        private removeTerminalDecisionService: RemoveTerminalDecisionService,
        private addProviderService: AddProviderService
    ) {
        merge([
            this.editTerminalDecisionService.terminalChanged$,
            this.removeTerminalDecisionService.terminalRemoved$,
            this.addProviderService.terminalAdded$,
        ]).subscribe(() => this.getProviders());
    }

    ngOnInit() {
        this.getProviders();
    }

    getProviders() {
        this.fetchProvidersService.getProvidersInfo(this.partyID, this.shopID);
    }

    action(action: TerminalAction, providerID: number) {
        switch (action.type) {
            case TerminalActionTypes.editPriority:
            case TerminalActionTypes.editWeight:
                this.editTerminalDecisionService.edit({
                    ...action,
                    providerID,
                    partyID: this.partyID,
                    shopID: this.shopID,
                });
                break;
            case TerminalActionTypes.removeTerminal:
                this.removeTerminalDecisionService.remove({
                    ...action,
                    providerID,
                    partyID: this.partyID,
                    shopID: this.shopID,
                });
                break;
        }
    }

    addTerminal() {
        this.addProviderService.add({
            partyID: this.partyID,
            shopID: this.shopID,
            categoryID: this.categoryID,
        });
    }
}
