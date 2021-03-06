import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, shareReplay, switchMap } from 'rxjs/operators';

import { EditTerminalDialogComponent } from '../../components/edit-terminal-dialog';
import { ChangeProviderParams, EditTerminalDialogResponse } from '../../types';

@Injectable()
export class EditTerminalDecisionService {
    private edit$ = new Subject<ChangeProviderParams>();

    terminalChanged$ = this.edit$.pipe(
        switchMap((data) =>
            this.dialog
                .open(EditTerminalDialogComponent, {
                    width: '300px',
                    disableClose: true,
                    data,
                })
                .afterClosed()
                .pipe(filter((r: EditTerminalDialogResponse) => r === 'edited'))
        ),
        shareReplay(1)
    );

    constructor(private dialog: MatDialog) {
        this.terminalChanged$.subscribe();
    }

    edit(params: ChangeProviderParams) {
        this.edit$.next(params);
    }
}
