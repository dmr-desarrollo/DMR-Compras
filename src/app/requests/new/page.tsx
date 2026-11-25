"use client";

import { MainLayout } from "@/components/main-layout";
import { NewRequestForm } from "@/components/requests/new-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Solicitud de Compra</CardTitle>
            <CardDescription>
              Completa el formulario para generar una nueva solicitud de compra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewRequestForm />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
