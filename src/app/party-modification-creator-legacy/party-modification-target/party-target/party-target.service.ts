import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';

import { PartyService } from '../../../papi/party.service';
import {
    Contract,
    Party,
    PartyContractor,
    Shop,
} from '../../../thrift-services/damsel/gen-model/domain';
import { PartyTarget } from '../party-target';
import { SelectableItem } from './selectable-item';

@Injectable()
export class PartyTargetService {
    constructor(private partyService: PartyService) {}

    getSelectableItems(partyID: string, targetName: PartyTarget): Observable<SelectableItem[]> {
        return this.partyService.getParty(partyID).pipe(
            map((party) => {
                const result = [];
                const target = this.getTarget(party, targetName);
                target.forEach((item, id) => result.push({ data: item, id, checked: false }));
                return result;
            })
        );
    }

    private getTarget(
        party: Party,
        targetName: PartyTarget
    ): Map<string, Contract | Shop | PartyContractor> {
        switch (targetName) {
            case PartyTarget.contract:
                return party.contracts;
            case PartyTarget.shop:
                return party.shops;
            case PartyTarget.contractor:
                return party.contractors;
        }
    }
}
