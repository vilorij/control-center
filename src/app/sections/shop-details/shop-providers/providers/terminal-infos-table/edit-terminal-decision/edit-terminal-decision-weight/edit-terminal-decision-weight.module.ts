import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { EditTerminalDecisionWeightComponent } from './edit-terminal-decision-weight.component';

@NgModule({
    declarations: [EditTerminalDecisionWeightComponent],
    imports: [
        MatDialogModule,
        FlexModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        CommonModule,
    ],
    entryComponents: [EditTerminalDecisionWeightComponent],
})
export class EditTerminalDecisionWeightModule {}