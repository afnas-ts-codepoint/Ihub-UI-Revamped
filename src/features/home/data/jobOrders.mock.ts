import type { QueueJobOrder } from '../types/queue.types';

/**
 * Job-order seed. Owned by the queue store because the workflow drawer's
 * job-order body (assign, dismiss) mutates it; the cards and Assigned views
 * that read it land in M10.3.
 * @prototype ihub/index.html:L10239-L10281 `JOBORDERS`
 */
export const JOB_ORDERS: readonly QueueJobOrder[] = [
  {
    id: 'JO-7782',
    title: 'Replace cinema projector lamp — Screen 6',
    location: 'SAMA Mall',
    dept: 'Operations',
    kind: 'internal',
    priority: 'high',
    status: 'New',
    due: 'Due tomorrow',
    partner: 'In-house AV team',
    isNew: true,
    detail:
      'Lamp failure on Screen 6. Spare in stock; assign AV technician for a pre-open swap.',
    steps: [
      'Review JO',
      'Assign technician',
      'Approve',
      'Track to completion',
    ],
  },
  {
    id: 'JO-7781',
    title: 'Deep clean — Food Court (post-event)',
    location: '360 Mall',
    dept: 'Facilities',
    kind: 'external',
    priority: 'medium',
    status: 'New',
    due: 'Due in 2 days',
    partner: 'Nasim Facility Services',
    isNew: true,
    detail:
      'Post-activation deep clean of the food court. External partner; confirm scope and schedule for overnight.',
    steps: ['Review scope', 'Assign partner', 'Approve', 'Track'],
  },
  {
    id: 'JO-7779',
    title: 'Repair escalator B2',
    location: 'Riyadh Park',
    dept: 'Facilities',
    kind: 'internal',
    priority: 'high',
    status: 'Assigned',
    due: 'Due today',
    partner: 'In-house MEP',
    isNew: false,
    detail:
      'Escalator B2 stopped on safety sensor. MEP team assigned; awaiting parts confirmation.',
    steps: ['Review JO', 'Confirm parts', 'Track progress'],
  },
  {
    id: 'JO-7775',
    title: 'Install digital signage — main concourse',
    location: 'The Avenues',
    dept: 'Marketing Tech',
    kind: 'external',
    priority: 'medium',
    status: 'In progress',
    due: 'Due in 5 days',
    partner: 'BrightSign Co.',
    isNew: false,
    detail:
      'New LED concourse signage install, phase 2 of 3. Partner on schedule.',
    steps: ['Review progress', 'Approve milestone', 'Track'],
  },
  {
    id: 'JO-7770',
    title: 'Quarterly electrical inspection',
    location: 'Al Kout',
    dept: 'Compliance',
    kind: 'internal',
    priority: 'low',
    status: 'Review',
    due: 'Due in 6 days',
    partner: 'In-house MEP',
    isNew: false,
    detail:
      'Statutory quarterly inspection complete; report submitted for review and closure.',
    steps: ['Review report', 'Approve closure'],
  },
  {
    id: 'JO-7768',
    title: 'Arcade machine maintenance — 12 units',
    location: '360 Mall',
    dept: 'Operations',
    kind: 'external',
    priority: 'medium',
    status: 'New',
    due: 'Due in 3 days',
    partner: 'PlayTech Service',
    isNew: true,
    detail:
      'Scheduled preventive maintenance on 12 arcade units. External partner; confirm window outside peak hours.',
    steps: ['Review JO', 'Assign partner', 'Approve', 'Track'],
  },
];
