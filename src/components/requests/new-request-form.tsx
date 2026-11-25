"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { RequesterArea } from "@/types";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const requestSchema = z.object({
  requesterName: z.string().min(1, { message: "El nombre es requerido." }),
  requesterArea: z.enum([
    "comercial",
    "gerencia general",
    "direccion",
    "administracion",
    "soporte tecnico",
    "produccion",
    "calidad",
  ]),
  item: z.string().min(1, { message: "El artículo es requerido." }),
  description: z.string().min(1, { message: "La descripción es requerida." }),
  priority: z.enum(["Baja", "Media", "Alta"]),
  currency: z.enum(["USD", "UYU"]),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "El monto debe ser un número positivo." })
  ),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const areas: RequesterArea[] = [
    "comercial",
    "gerencia general",
    "direccion",
    "administracion",
    "soporte tecnico",
    "produccion",
    "calidad",
];

export function NewRequestForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RequestFormValues>({
      resolver: zodResolver(requestSchema),
      defaultValues: {
        requesterName: "",
        requesterArea: "comercial",
        item: "",
        description: "",
        priority: "Media",
        currency: "USD",
        amount: 0,
      },
    });
  
    const onSubmit = async (data: RequestFormValues) => {
      setIsSubmitting(true);
      try {
        const newRequest = {
          ...data,
          status: 'Ingresado',
          submittedDate: serverTimestamp(),
        };
        await addDoc(collection(db, "purchaseRequests"), newRequest);
        
        toast({
          title: "Solicitud Enviada",
          description: "Tu solicitud de compra ha sido enviada con éxito.",
        });
        router.push("/dashboard");

      } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          variant: "destructive",
          title: "Error al Enviar",
          description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle className="text-2xl">Nueva Solicitud de Compra</CardTitle>
            <CardDescription>Completa el formulario para registrar una nueva solicitud.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="requesterName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre del Solicitante</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="requesterArea"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Área Solicitante</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un área" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {areas.map(area => (
                                    <SelectItem key={area} value={area} className="capitalize">{area}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Artículo o Servicio</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: Licencia de Software, Monitor, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descripción Detallada</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Incluye detalles importantes como especificaciones, justificación de la compra, etc."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prioridad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecciona una prioridad" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Baja">Baja</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Alta">Alta</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecciona una moneda" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="UYU">UYU</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Monto Estimado</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Solicitud
                    </Button>
                </div>
            </form>
            </Form>
      </CardContent>
    </Card>
  );
}