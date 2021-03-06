import { Injectable } from '@angular/core';
import { progress } from '@rbkmoney/partial-fetcher/dist/progress';
import { merge, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { DomainCacheService } from '../../../../thrift-services/damsel/domain-cache.service';

@Injectable()
export class FetchTerminalService {
    private getTerminal$ = new Subject<number>();
    private hasError$ = new Subject();

    terminal$ = this.getTerminal$.pipe(
        switchMap((terminalID) =>
            this.domainCacheService.getObjects('terminal').pipe(
                map((terminalObject) => terminalObject.find((obj) => obj.ref.id === terminalID)),
                catchError(() => {
                    this.hasError$.next();
                    return of('error');
                }),
                filter((result) => result !== 'error')
            )
        ),
        shareReplay(1)
    );

    inProgress$ = progress(this.getTerminal$, merge(this.terminal$, this.hasError$)).pipe(
        startWith(true)
    );

    constructor(private domainCacheService: DomainCacheService) {
        this.terminal$.subscribe();
    }

    getTerminal(terminalID: number) {
        this.getTerminal$.next(terminalID);
    }
}
