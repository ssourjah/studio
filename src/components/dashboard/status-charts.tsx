'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  dailyProgressChartData,
  weeklyProgressChartData,
  monthlyProgressChartData,
  statusPieChartData,
  statusPieChartConfig,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StatusCharts() {
  const chartConfig = {
      Completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
      Incomplete: { label: 'Incomplete', color: 'hsl(var(--chart-4))' },
      Cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>A breakdown of tasks by their current status.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={statusPieChartConfig} className="mx-auto aspect-square h-[250px]">
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
