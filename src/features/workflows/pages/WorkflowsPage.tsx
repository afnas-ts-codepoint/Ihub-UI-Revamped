import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AutoRouting } from '../components/AutoRouting';
import { OperationalFlow } from '../components/OperationalFlow';
import { RoutingRules } from '../components/RoutingRules';
import { SlaEscalation } from '../components/SlaEscalation';
import { WorkflowScopeBar } from '../components/WorkflowScopeBar';
import { WorkflowTabs } from '../components/WorkflowTabs';
import { WORKFLOW_DEPARTMENTS } from '../data/workflows.mock';
import type { WorkflowTabId } from '../types/workflow.types';

/** @prototype index.html:L21190-L21528 */
export function WorkflowsPage() {
  useTranslation('workflows');
  const [departmentId, setDepartmentId] = useState('tx');
  const [divisionId, setDivisionId] = useState('gx');
  const [taskId, setTaskId] = useState('complaint');
  const [tab, setTab] = useState<WorkflowTabId>('rules');
  const department = WORKFLOW_DEPARTMENTS.find((item) => item.id === departmentId) ?? WORKFLOW_DEPARTMENTS[0];
  if (!department) return null;
  const task = department.tasks.find((item) => item.id === taskId) ?? department.tasks[0];
  if (!task) return null;

  const pickDepartment = (id: string) => {
    const nextDepartment = WORKFLOW_DEPARTMENTS.find((item) => item.id === id);
    if (!nextDepartment) return;
    setDepartmentId(id);
    setDivisionId(nextDepartment.divisions[0]?.id ?? '');
    setTaskId(nextDepartment.tasks[0]?.id ?? '');
  };

  return (
    <section>
      <WorkflowScopeBar
        department={department}
        departmentId={departmentId}
        departments={WORKFLOW_DEPARTMENTS}
        divisionId={divisionId}
        onDepartmentChange={pickDepartment}
        onDivisionChange={setDivisionId}
      />
      <WorkflowTabs active={tab} onChange={setTab} />
      {tab === 'rules' ? <RoutingRules rules={department.rules} tasks={department.tasks} /> : null}
      {tab === 'flow' ? <OperationalFlow onTaskChange={setTaskId} task={task} tasks={department.tasks} /> : null}
      {tab === 'auto' ? <AutoRouting /> : null}
      {tab === 'sla' ? <SlaEscalation onTaskChange={setTaskId} task={task} tasks={department.tasks} /> : null}
    </section>
  );
}
