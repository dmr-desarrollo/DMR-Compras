"use client";
import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/types";

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const statusStyles: Record<RequestStatus, string> = {
    Ingresado: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    "Cotización Solicitada": "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
    "Pago Realizado": "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    Completado: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    Rechazado: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    Pendiente: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  };

  return <Badge className={statusStyles[status]}>{status}</Badge>;
}
