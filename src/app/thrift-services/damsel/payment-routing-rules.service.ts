import { Injectable } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import { DomainCacheService } from './domain-cache.service';
import {
    PaymentRoutingCandidate,
    PaymentRoutingDelegate,
    PaymentRoutingRulesObject,
    Predicate,
} from './gen-model/domain';
import { Version } from './gen-model/domain_config';
import { generateID } from './operations/utils';

@Injectable()
export class PaymentRoutingRulesService {
    constructor(private domainService: DomainCacheService) {}

    rulesets$: Observable<PaymentRoutingRulesObject[]> = this.domainService
        .getObjects('payment_routing_rules')
        .pipe(
            map((r) => r.sort((a, b) => a.ref.id - b.ref.id)),
            shareReplay(1)
        );

    nextRefID$ = this.rulesets$.pipe(map((rulesets) => generateID(rulesets)));

    getRuleset(refID: number): Observable<PaymentRoutingRulesObject> {
        return this.rulesets$.pipe(map((rulesets) => rulesets.find((r) => r?.ref?.id === refID)));
    }

    addPartyRuleset({
        name,
        mainRulesetRefID,
        partyID,
        description,
        delegateDescription,
    }: {
        name: string;
        mainRulesetRefID: number;
        partyID: string;
        description?: string;
        delegateDescription?: string;
    }): Observable<Version> {
        return combineLatest([this.getRuleset(mainRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([mainRuleset, id]) => {
                const ruleset: PaymentRoutingRulesObject = {
                    ref: { id },
                    data: {
                        name,
                        description,
                        decisions: {
                            delegates: [],
                        },
                    },
                };
                const newMainRuleset = this.cloneRulesetAndPushDelegate(mainRuleset, {
                    ruleset: { id },
                    description: delegateDescription,
                    allowed: {
                        condition: {
                            party: {
                                id: partyID,
                            },
                        },
                    },
                });
                return this.domainService.commit({
                    ops: [
                        {
                            insert: {
                                object: { payment_routing_rules: ruleset },
                            },
                        },
                        {
                            update: {
                                old_object: { payment_routing_rules: mainRuleset },
                                new_object: { payment_routing_rules: newMainRuleset },
                            },
                        },
                    ],
                });
            })
        );
    }

    addShopRuleset({
        name,
        shopID,
        partyID,
        partyRulesetRefID,
        description,
    }: {
        name: string;
        shopID: string;
        partyID: string;
        partyRulesetRefID: number;
        description?: string;
    }): Observable<Version> {
        return combineLatest([this.getRuleset(partyRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([partyRuleset, id]) => {
                const shopRuleset: PaymentRoutingRulesObject = {
                    ref: { id },
                    data: {
                        name,
                        description,
                        decisions: {
                            candidates: [],
                        },
                    },
                };
                const newPartyRuleset = this.cloneRulesetAndPushDelegate(partyRuleset, {
                    ruleset: { id },
                    allowed: {
                        condition: {
                            party: {
                                id: partyID,
                                definition: {
                                    shop_is: shopID,
                                },
                            },
                        },
                    },
                });
                return this.domainService.commit({
                    ops: [
                        {
                            insert: {
                                object: { payment_routing_rules: shopRuleset },
                            },
                        },
                        {
                            update: {
                                old_object: { payment_routing_rules: partyRuleset },
                                new_object: { payment_routing_rules: newPartyRuleset },
                            },
                        },
                    ],
                });
            })
        );
    }

    addShopRule({
        refID,
        terminalID,
        description,
        weight,
        priority,
        predicate,
    }: {
        refID: number;
        terminalID: number;
        description: string;
        weight: number;
        priority: number;
        predicate: Predicate;
    }): Observable<Version> {
        return this.getRuleset(refID).pipe(
            take(1),
            switchMap((shopRuleset) => {
                const newShopRule = this.cloneRulesetAndPushCandidate(shopRuleset, {
                    description,
                    allowed: predicate,
                    terminal: {
                        id: terminalID,
                    },
                    weight,
                    priority,
                });
                return this.domainService.commit({
                    ops: [
                        {
                            update: {
                                old_object: { payment_routing_rules: shopRuleset },
                                new_object: { payment_routing_rules: newShopRule },
                            },
                        },
                    ],
                });
            })
        );
    }

    attachPartyDelegateRuleset({
        mainRulesetRefID,
        partyID,
        mainDelegateDescription,
        ruleset: { name, description },
    }: {
        mainRulesetRefID: number;
        partyID: string;
        mainDelegateDescription?: string;
        ruleset: { name: string; description?: string };
    }): Observable<Version> {
        return combineLatest([this.getRuleset(mainRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([mainRuleset, id]) => {
                const newMainPaymentRoutingRuleset = this.cloneRulesetAndPushDelegate(mainRuleset, {
                    description: mainDelegateDescription,
                    allowed: {
                        condition: {
                            party: { id: partyID },
                        },
                    },
                    ruleset: { id },
                });
                const ruleset: PaymentRoutingRulesObject = {
                    ref: { id },
                    data: {
                        name,
                        description,
                        decisions: { delegates: [] },
                    },
                };
                return this.domainService.commit({
                    ops: [
                        {
                            insert: { object: { payment_routing_rules: ruleset } },
                        },
                        {
                            update: {
                                old_object: { payment_routing_rules: mainRuleset },
                                new_object: { payment_routing_rules: newMainPaymentRoutingRuleset },
                            },
                        },
                    ],
                });
            })
        );
    }

    removeShopRule({
        refID,
        candidateIdx,
    }: {
        refID: number;
        candidateIdx: number;
    }): Observable<Version> {
        return this.getRuleset(refID).pipe(
            take(1),
            switchMap((shopRuleset) => {
                const newShopRule = cloneDeep(shopRuleset);
                newShopRule.data.decisions.candidates.splice(candidateIdx, 1);
                return this.domainService.commit({
                    ops: [
                        {
                            update: {
                                old_object: { payment_routing_rules: shopRuleset },
                                new_object: { payment_routing_rules: newShopRule },
                            },
                        },
                    ],
                });
            })
        );
    }

    deleteRulesetAndDelegate({
        mainRulesetRefID,
        rulesetRefID,
    }: {
        mainRulesetRefID: number;
        rulesetRefID: number;
    }): Observable<Version> {
        return combineLatest([
            this.getRuleset(mainRulesetRefID),
            this.getRuleset(rulesetRefID),
        ]).pipe(
            take(1),
            switchMap(([mainRuleset, ruleset]) => {
                const newMainPaymentRoutingRuleset = cloneDeep(mainRuleset);
                newMainPaymentRoutingRuleset.data.decisions.delegates.splice(
                    this.getDelegateIdx(mainRuleset, rulesetRefID),
                    1
                );
                return this.domainService.commit({
                    ops: [
                        {
                            update: {
                                old_object: { payment_routing_rules: mainRuleset },
                                new_object: { payment_routing_rules: newMainPaymentRoutingRuleset },
                            },
                        },
                        {
                            remove: {
                                object: { payment_routing_rules: ruleset },
                            },
                        },
                    ],
                });
            })
        );
    }

    changePartyDelegateRuleset({
        previousMainRulesetRefID,
        mainRulesetRefID,
        rulesetID,
        mainDelegateDescription,
    }: {
        previousMainRulesetRefID: number;
        mainRulesetRefID: number;
        rulesetID: number;
        mainDelegateDescription?: string;
    }): Observable<Version> {
        return combineLatest([
            this.getRuleset(mainRulesetRefID),
            this.getRuleset(previousMainRulesetRefID),
        ]).pipe(
            take(1),
            switchMap(([mainRuleset, previousMainRuleset]) => {
                const newPreviousMainRuleset = cloneDeep(previousMainRuleset);
                const [delegate] = newPreviousMainRuleset.data.decisions.delegates.splice(
                    this.getDelegateIdx(previousMainRuleset, rulesetID),
                    1
                );
                const newMainPaymentRoutingRuleset = cloneDeep(mainRuleset);
                if (!newMainPaymentRoutingRuleset.data.decisions.delegates) {
                    newMainPaymentRoutingRuleset.data.decisions.delegates = [];
                }
                newMainPaymentRoutingRuleset.data.decisions.delegates.push({
                    ...delegate,
                    description: mainDelegateDescription,
                });
                return this.domainService.commit({
                    ops: [
                        {
                            update: {
                                old_object: { payment_routing_rules: previousMainRuleset },
                                new_object: { payment_routing_rules: newPreviousMainRuleset },
                            },
                        },
                        {
                            update: {
                                old_object: { payment_routing_rules: mainRuleset },
                                new_object: { payment_routing_rules: newMainPaymentRoutingRuleset },
                            },
                        },
                    ],
                });
            })
        );
    }

    private getDelegateIdx(ruleset: PaymentRoutingRulesObject, delegateRulesetRefId: number) {
        return ruleset.data.decisions.delegates.findIndex(
            (d) => d?.ruleset?.id === delegateRulesetRefId
        );
    }

    private cloneRulesetAndPushDelegate(
        ruleset: PaymentRoutingRulesObject,
        delegate: PaymentRoutingDelegate
    ) {
        const newRuleset = cloneDeep(ruleset);
        if (!Array.isArray(newRuleset.data.decisions.delegates)) {
            newRuleset.data.decisions.delegates = [];
        }
        newRuleset.data.decisions.delegates.push(delegate);
        return newRuleset;
    }

    private cloneRulesetAndPushCandidate(
        ruleset: PaymentRoutingRulesObject,
        candidate: PaymentRoutingCandidate
    ) {
        const newRuleset = cloneDeep(ruleset);
        if (!Array.isArray(newRuleset.data.decisions.candidates)) {
            newRuleset.data.decisions.candidates = [];
        }
        newRuleset.data.decisions.candidates.push(candidate);
        return newRuleset;
    }
}