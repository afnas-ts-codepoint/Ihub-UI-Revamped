import { EnquiryAdd } from '../components/EnquiryAdd';
import { EnquiryHistory } from '../components/EnquiryHistory';

export type EnquiryView = 'add' | 'history';

export function EnquiriesPage({ view }: Readonly<{ view: EnquiryView }>) {
  return view === 'history' ? <EnquiryHistory /> : <EnquiryAdd />;
}
