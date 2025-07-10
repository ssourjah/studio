import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle2, Loader, XCircle } from 'lucide-react';

interface SummaryCardsProps {
    summaryData: {
        total: number;
        completed: number;
        incomplete: number;
        cancelled: number;
    }
}

export function SummaryCards({ summaryData }: SummaryCardsProps) {
  const cardDetails = [
    {
      title: 'Total Tasks',
      value: summaryData.total,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: summaryData.completed,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Incomplete',
      value: summaryData.incomplete,
      icon: Loader,
      color: 'text-orange-500',
    },
    {
      title: 'Cancelled',
      value: summaryData.cancelled,
      icon: XCircle,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardDetails.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              Overview of all tasks
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
