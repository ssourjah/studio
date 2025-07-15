
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task } from '@/lib/types';
import { useMemo } from 'react';
import { subDays, startOfWeek, endOfWeek, eachWeekOfInterval, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface StatusChartsProps {
  tasks: Task[];
}

export function StatusCharts({ tasks }: StatusChartsProps) {
  const chartConfig = {
      Completed: { label: 'Completed', color: 'hsl(142.1 76.2% 36.3%)' }, // green-600
      Incomplete: { label: 'Incomplete', color: 'hsl(30 90% 50%)' }, // orange-500
      Cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
  };

  const statusPieChartConfig = {
    completed: { label: 'Completed', color: 'hsl(142.1 76.2% 36.3%)' },
    incomplete: { label: 'Incomplete', color: 'hsl(30 90% 50%)' },
    cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
  };

  const {
    statusPieChartData,
    dailyProgressChartData,
    weeklyProgressChartData,
    monthlyProgressChartData
  } = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = [
      { name: 'Completed', value: statusCounts['Completed'] || 0, fill: 'var(--color-Completed)' },
      { name: 'Incomplete', value: statusCounts['Incomplete'] || 0, fill: 'var(--color-Incomplete)' },
      { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, fill: 'var(--color-Cancelled)' },
    ];
    
    // Daily
    const dailyData: { [key: string]: any } = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse();
    last7Days.forEach(day => {
        dailyData[day] = { date: day, Completed: 0, Incomplete: 0, Cancelled: 0 };
    });
    tasks.forEach(task => {
        const taskDay = format(new Date(task.date), 'yyyy-MM-dd');
        if (dailyData[taskDay]) {
            dailyData[taskDay][task.status]++;
        }
    });

    // Weekly
    const weeklyData: { [key: string]: any } = {};
    if (tasks.length > 0) {
        const firstTaskDate = tasks.reduce((min, t) => new Date(t.date) < min ? new Date(t.date) : min, new Date());
        const weeks = eachWeekOfInterval({ start: firstTaskDate, end: new Date() }, { weekStartsOn: 1 });
        weeks.forEach(week => {
            const weekLabel = `Week ${format(week, 'w')}`;
            weeklyData[weekLabel] = { week: weekLabel, Completed: 0, Incomplete: 0, Cancelled: 0 };
        });
        tasks.forEach(task => {
            const taskWeek = `Week ${format(new Date(task.date), 'w')}`;
            if(weeklyData[taskWeek]) {
                weeklyData[taskWeek][task.status]++;
            }
        });
    }

    // Monthly
    const monthlyData: { [key: string]: any } = {};
    if (tasks.length > 0) {
        const firstTaskDate = tasks.reduce((min, t) => new Date(t.date) < min ? new Date(t.date) : min, new Date());
        const months = eachMonthOfInterval({ start: firstTaskDate, end: new Date() });
        months.forEach(month => {
            const monthLabel = format(month, 'MMM');
            monthlyData[monthLabel] = { month: monthLabel, Completed: 0, Incomplete: 0, Cancelled: 0 };
        });
        tasks.forEach(task => {
            const taskMonth = format(new Date(task.date), 'MMM');
            if(monthlyData[taskMonth]) {
                monthlyData[taskMonth][task.status]++;
            }
        });
    }

    return {
      statusPieChartData: pieData,
      dailyProgressChartData: Object.values(dailyData),
      weeklyProgressChartData: Object.values(weeklyData),
      monthlyProgressChartData: Object.values(monthlyData)
    };
  }, [tasks]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>A breakdown of tasks by their current status.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={statusPieChartData} dataKey="value" nameKey="name" innerRadius={60} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
            </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <Tabs defaultValue="daily">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Task Progress</CardTitle>
                        <CardDescription>Daily, weekly, and monthly task statuses.</CardDescription>
                    </div>
                    <TabsList className="grid w-full max-w-[200px] grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="daily">
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={dailyProgressChartData} margin={{ left: -20, right: 12, top: 4, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend />
                                <Bar dataKey="Completed" fill="var(--color-Completed)" radius={4} />
                                <Bar dataKey="Incomplete" fill="var(--color-Incomplete)" radius={4} />
                                <Bar dataKey="Cancelled" fill="var(--color-Cancelled)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="weekly">
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={weeklyProgressChartData} margin={{ left: -20, right: 12, top: 4, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend />
                                <Bar dataKey="Completed" fill="var(--color-Completed)" radius={4} />
                                <Bar dataKey="Incomplete" fill="var(--color-Incomplete)" radius={4} />
                                <Bar dataKey="Cancelled" fill="var(--color-Cancelled)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="monthly">
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={monthlyProgressChartData} margin={{ left: -20, right: 12, top: 4, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend />
                                <Bar dataKey="Completed" fill="var(--color-Completed)" radius={4} />
                                <Bar dataKey="Incomplete" fill="var(--color-Incomplete)" radius={4} />
                                <Bar dataKey="Cancelled" fill="var(--color-Cancelled)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    </div>
  );
}
