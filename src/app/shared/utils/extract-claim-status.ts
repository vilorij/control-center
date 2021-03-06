import { getUnionKey } from '@cc/utils/get-union-key';

import { ClaimStatus } from '../../papi/model';
import { ClaimStatus as UnionClaimStatus } from '../../thrift-services/damsel/gen-model/claim_management';

export const claimStatusByUnionClaimStatus: { [name in keyof UnionClaimStatus]-?: ClaimStatus } = {
    accepted: ClaimStatus.accepted,
    denied: ClaimStatus.denied,
    revoked: ClaimStatus.revoked,
    pending: ClaimStatus.pending,
    review: ClaimStatus.review,
    pending_acceptance: ClaimStatus.pending_acceptance,
};

export const extractClaimStatus = (status: UnionClaimStatus): ClaimStatus =>
    claimStatusByUnionClaimStatus[getUnionKey(status) as keyof UnionClaimStatus];
