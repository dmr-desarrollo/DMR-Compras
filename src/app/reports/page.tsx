
"use client";

import * as React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PurchaseRequest, RequestStatus } from "@/types";
import { 
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  Line, LineChart, Pie, PieChart, Cell,
} from 'recharts';
import { getPurchaseRequests } from "@/lib/actions";
import { Loader2, Calendar as CalendarIcon, TrendingUp, CheckCircle, Clock, DollarSign } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ReportsPage() {
    const [requests, setRequests] = React.useState<PurchaseRequest[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });

    React.useEffect(() => {
        const fetchRequests = async () => {
          setIsLoading(true);
          const fetchedRequests = await getPurchaseRequests();
          setRequests(fetchedRequests);
          setIsLoading(false);
        };
        fetchRequests();
    }, []);

    const filterRequestsByDateRange = (requestsToFilter: PurchaseRequest[], dateRange?: DateRange): PurchaseRequest[] => {
        if (!dateRange || !dateRange.from) return requestsToFilter;
        const toDate = dateRange.to || dateRange.from;

        return requestsToFilter.filter(req => {
            const reqDate = new Date(req.submittedDate);
            return reqDate >= dateRange.from! && reqDate <= addDays(toDate, 1); // addDays to include the 'to' date
        });
    };

    const filteredRequests = filterRequestsByDateRange(requests, date);

    // --- Chart and Stat Calculations ---
    const requestsByStatus = filteredRequests.reduce((acc, req) => {
        const status = req.status || "Pendiente";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<RequestStatus, number>);
    
    const statusData = Object.entries(requestsByStatus).map(([name, value], index) => ({ 
      name, 
      value,
      fill: COLORS[index % COLORS.length]
    }));

    const requestsByArea = filteredRequests.reduce((acc, req) => {
        const area = req.requesterArea || "No definida";
        acc[area] = (acc[area] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const areaData = Object.entries(requestsByArea).map(([name, value]) => ({ name, 'solicitudes': value }));

    const totalAmountUSD = filteredRequests.reduce((acc, req) => req.currency === 'USD' && req.finalAmount && req.status === 'Completado' ? acc + req.finalAmount : acc, 0);
    const totalAmountUYU = filteredRequests.reduce((acc, req) => req.currency === 'UYU' && req.finalAmount && req.status === 'Completado' ? acc + req.finalAmount : acc, 0);

    const completedRequests = filteredRequests.filter(r => r.status === 'Completado' && r.approvedDate && r.submittedDate);
    const approvalTimes = completedRequests.map(r => differenceInDays(new Date(r.approvedDate!), new Date(r.submittedDate)));
    const avgApprovalTime = approvalTimes.length > 0 ? Math.round(approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length) : 0;
    
    const monthlyTrendData = filteredRequests.reduce((acc, req) => {
        const month = format(new Date(req.submittedDate), 'yyyy-MM');
        if (!acc[month]) {
            acc[month] = { month, count: 0, amountUSD: 0, amountUYU: 0 };
        }
        acc[month].count++;
        if(req.status === 'Completado' && req.finalAmount) {
            if (req.currency === 'USD') acc[month].amountUSD += req.finalAmount;
            if (req.currency === 'UYU') acc[month].amountUYU += req.finalAmount;
        }
        return acc;
    }, {} as Record<string, { month: string; count: number; amountUSD: number; amountUYU: number }>);
    const trendData = Object.values(monthlyTrendData).sort((a,b) => a.month.localeCompare(b.month));

    const formatCurrency = (amount: number, currency: 'USD' | 'UYU') => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount);
    };

    if (isLoading) {
      return (
        <MainLayout>
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </MainLayout>
      );
    }

    return (
        <MainLayout>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "P", { locale: es })} -{" "}
                            {format(date.to, "P", { locale: es })}
                          </>
                        ) : (
                          format(date.from, "P", { locale: es })
                        )
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      locale={es}
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Solicitudes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monto Completado (USD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAmountUSD, 'USD')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monto Completado (UYU)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAmountUYU, 'UYU')}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tpo. Prom. Aprobación</CardTitle>
                         <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgApprovalTime} días</div>
                    </CardContent>
                </Card>
            </div>
    
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Solicitudes por Estado</CardTitle>
                        <CardDescription>Distribución de las solicitudes según su estado actual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                     {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Solicitudes por Área</CardTitle>
                        <CardDescription>Volumen de solicitudes generado por cada área de la empresa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={areaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} height={70} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="solicitudes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Tendencia Mensual</CardTitle>
                    <CardDescription>Evolución de solicitudes y montos aprobados en el período seleccionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="count" name="Cantidad" stroke="hsl(var(--primary))" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="amountUSD" name="Monto USD" stroke="hsl(var(--accent))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

          </div>
        </MainLayout>
      );
}
