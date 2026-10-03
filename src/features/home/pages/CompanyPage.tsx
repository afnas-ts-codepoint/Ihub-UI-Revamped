import { AnalyticsCard } from '../components/company/AnalyticsCard';
import { CalendarCard } from '../components/company/CalendarCard';
import { CompanyNews } from '../components/company/CompanyNews';

/**
 * `/home/company` — analytics, calendar and company news.
 * @prototype index.html:L14059-L14062 `BusinessView`
 */
export function CompanyPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-5 max-desktop:grid-cols-[minmax(0,1fr)]">
        <AnalyticsCard />
        <CalendarCard />
      </div>
      <CompanyNews />
    </div>
  );
}
