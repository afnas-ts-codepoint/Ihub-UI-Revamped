import { PettyCashFormBase } from './PettyCashFormBase';
import type { ReviewDecisionHandler } from './ReviewDecisionCards';

type PettyCashRequestFormProps = Readonly<{
  onDecision?: ReviewDecisionHandler;
  resubmit?: boolean;
  review?: boolean;
  verify?: boolean;
}>;

/**
 * Petty cash request form. Create mode (no props) is the Payment Settlement
 * "Request" tab; `review` (+ `resubmit`, `verify`, `onDecision`) is the Home
 * Form Preview for a petty-cash approval, where the left column is read-only
 * until Edit and the right column shows the Decision (or, for the creator of
 * a returned item, the Resubmit) card instead of Actions.
 * @prototype index.html:L7744-L7828 `PettyCashRequestCreate`
 */
export function PettyCashRequestForm({ onDecision, resubmit, review, verify }: PettyCashRequestFormProps) {
  return <PettyCashFormBase onDecision={onDecision} resubmit={resubmit} review={review} variant="request" verify={verify} />;
}
