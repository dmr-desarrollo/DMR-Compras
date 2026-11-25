
"use client";

import * as React from "react";
import { MainLayout } from "@/components/main-layout";
import { getPurchaseRequests } from "@/lib/actions";
import type { PurchaseRequest, RequestStatus, RequesterArea } from "@/types";
import { RequestsTable } from "@/components/requests/requests-table";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";


const statuses: RequestStatus[] = ['Ingresado', 'Cotización Solicitada', 'Pago Realizado', 'Completado', 'Rechazado'];
const areas: RequesterArea[] = [
    "comercial",
    "gerencia general",
    "direccion",
    "administracion",
    "soporte tecnico",
    "produccion",
    "calidad",
];


export default function DashboardPage() {
  const [requests, setRequests] = React.useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<RequestStatus | "all">("all");
  const [areaFilter, setAreaFilter] = React.useState<RequesterArea | "all">("all");
  const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
  
  React.useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      const fetchedRequests = await getPurchaseRequests();
      // Sort requests by date descending
      const sortedRequests = fetchedRequests.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
      setRequests(sortedRequests);
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
      const statusMatch = statusFilter === 'all' || request.status === statusFilter;
      const areaMatch = areaFilter === 'all' || request.requesterArea === areaFilter;
      
      let dateMatch = true;
      if (date?.from) {
        const toDate = date.to || date.from;
        const reqDate = new Date(request.submittedDate);
        dateMatch = reqDate >= date.from && reqDate <= addDays(toDate, 1);
      }

      return statusMatch && areaMatch && dateMatch;
  });

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Filtrar por Estado</label>
                             <Select onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')} defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Estados</SelectItem>
                                    {statuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Filtrar por Área</label>
                            <Select onValueChange={(value) => setAreaFilter(value as RequesterArea | 'all')} defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las áreas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las Áreas</SelectItem>
                                    {areas.map(area => (
                                        <SelectItem key={area} value={area} className="capitalize">{area}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-muted-foreground mb-2">Filtrar por Fecha</label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full font-normal",
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
                    </div>
                </CardContent>
            </Card>
            <RequestsTable requests={filteredRequests.slice(0, 30)} title="Últimas Solicitudes" />
          </>
        )}
      </div>
    </MainLayout>
  );
}
