import { FormPreviewDialog } from './form-preview/FormPreviewDialog';
import { SendBackDialog } from './actions/SendBackDialog';
import { TrackPromptDialog } from './actions/TrackPromptDialog';
import { WorkflowDrawer } from './workflow-drawer/WorkflowDrawer';

/**
 * Mounts the Home queue overlays once for every `/home/*` route: the workflow
 * drawer, the Form Preview dialog, the send-back dialog and the track prompt.
 * Routed children open them through the home queue store.
 * @prototype ihub/index.html:L12733-L12761 `DashboardOCC` overlays
 */
export function HomeQueueHost() {
  return (
    <>
      <WorkflowDrawer />
      <FormPreviewDialog />
      <SendBackDialog />
      <TrackPromptDialog />
    </>
  );
}
