
"use client";

import { useRouter } from "next/navigation";
import type { PurchaseRequest } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "./request-status-badge";
import { Eye } from "lucide-react";

interface RequestsTableProps {
  requests: PurchaseRequest[];
  title?: string;
}

export function RequestsTable({ requests, title = "Solicitudes" }: RequestsTableProps) {
  const router = useRouter();

  const handleViewDetails = (id: string) => {
    router.push(`/requests/${id}`);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">ID</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Artículo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="hidden sm:table-cell font-mono text-xs">{req.id.substring(0, 8)}</TableCell>
                  <TableCell>{req.requesterName}</TableCell>
                  <TableCell>{req.item}</TableCell>
                   <TableCell>{formatCurrency(req.amount, req.currency)}</TableCell>
                  <TableCell>
                    <RequestStatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(req.id)}
                      title="Ver Detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron solicitudes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    