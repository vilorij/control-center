import { Component, Input } from '@angular/core';

@Component({
    selector: 'cc-timeline-item-badge',
    templateUrl: 'timeline-item-badge.component.html',
    styleUrls: ['timeline-item-badge.component.scss'],
})
export class TimelineItemBadgeComponent {
    @Input()
    color: 'primary' | 'warn' | 'error' | 'success';
}
