import { SummaryCards } from '@/components/dashboard/summary-cards';
import { StatusCharts } from '@/components/dashboard/status-charts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <SummaryCards />
      <StatusCharts />
    </div>
  );
}
