
"use client";

import type { PurchaseRequest, RequestStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface RequestStatsProps {
  requests: PurchaseRequest[];
}

export function RequestStats({ requests }: RequestStatsProps) {
  const getStatusCount = (status: RequestStatus) => {
    return requests.filter((req) => req.status === status).length;
  };

  const pendingStatuses: RequestStatus[] = ['Ingresado', 'Cotización Solicitada'];
  const pendingCount = requests.filter(req => pendingStatuses.includes(req.status)).length;
  const completedCount = getStatusCount('Completado');
  const rejectedCount = getStatusCount('Rechazado');

  const stats = [
    {
      title: "Total de Solicitudes",
      value: requests.length,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Pendientes",
      value: pendingCount,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Completadas",
      value: completedCount,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Rechazadas",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
