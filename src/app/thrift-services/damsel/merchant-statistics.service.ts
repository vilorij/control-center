import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../thrift-service';
import { StatRequest, StatResponse } from './gen-model/merch_stat';
import * as MerchantStatistics from './gen-nodejs/MerchantStatistics';
import { StatRequest as ThriftStatRequest } from './gen-nodejs/merch_stat_types';

@Injectable()
export class MerchantStatisticsService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/stat', MerchantStatistics);
    }

    getPayments = (req: StatRequest): Observable<StatResponse> =>
        this.toObservableAction('GetPayments')(new ThriftStatRequest(req));
}