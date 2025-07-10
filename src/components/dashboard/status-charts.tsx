'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import {
  progressChartData,
  statusPieChartData,
  statusPieChartConfig,
  tasksBarChartData,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StatusCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
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

        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Daily completed and incomplete tasks over the last week.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        Completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
                        Incomplete: { label: 'Incomplete', color: 'hsl(var(--chart-4))' },
                    }}
                    className="h-[250px] w-full"
                >
                    <AreaChart
                        data={progressChartData}
                        margin={{ left: -20, right: 12, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area
                            dataKey="Completed"
                            type="natural"
                            fill="var(--color-Completed)"
                            fillOpacity={0.4}
                            stroke="var(--color-Completed)"
                            stackId="a"
                        />
                        <Area
                            dataKey="Incomplete"
                            type="natural"
                            fill="var(--color-Incomplete)"
                            fillOpacity={0.4}
                            stroke="var(--color-Incomplete)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
            <CardDescription>Breakdown of tasks by type and status.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer
                config={{
                    Completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
                    Incomplete: { label: 'Incomplete', color: 'hsl(var(--chart-4))' },
                    Cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive))' },
                }}
                className="h-[300px] w-full"
            >
                <BarChart data={tasksBarChartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Bar dataKey="Completed" fill="var(--color-Completed)" radius={4} />
                    <Bar dataKey="Incomplete" fill="var(--color-Incomplete)" radius={4} />
                    <Bar dataKey="Cancelled" fill="var(--color-Cancelled)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>

    </div>
  );
}
