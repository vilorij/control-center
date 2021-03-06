import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { first, pluck, shareReplay } from 'rxjs/operators';

import { FetchClaimService } from './fetch-claim.service';

@Component({
    templateUrl: 'party-claim.component.html',
    providers: [FetchClaimService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyClaimComponent implements OnInit {
    claimID$ = this.route.params.pipe(pluck('claimID'), shareReplay(1));
    partyID$ = this.route.params.pipe(pluck('partyID'), shareReplay(1));
    isLoading$ = this.fetchClaimService.isLoading$;
    createdAt$ = this.fetchClaimService.claim$.pipe(pluck('created_at'));
    changeset$ = this.fetchClaimService.claim$.pipe(pluck('changeset'));
    status$ = this.fetchClaimService.claim$.pipe(pluck('status'));

    constructor(private route: ActivatedRoute, private fetchClaimService: FetchClaimService) {}

    ngOnInit(): void {
        this.getClaim();
    }

    changesetUpdated() {
        this.getClaim();
    }

    private getClaim() {
        combineLatest([this.partyID$, this.claimID$])
            .pipe(first())
            .subscribe(([partyID, claimID]) => {
                this.fetchClaimService.getClaim(partyID, claimID);
            });
    }
}
