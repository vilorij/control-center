import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService, ClaimManagementRole } from '@cc/app/shared/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'claim-mgt/party',
                loadChildren: () => import('./claim').then((m) => m.ClaimModule),
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [ClaimManagementRole.GetClaims],
                },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ClaimMgtRouting {}
