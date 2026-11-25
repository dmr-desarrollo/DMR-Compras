
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { PurchaseRequest, RequestStatus } from "@/types";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { onAuthStateChanged, type User } from "firebase/auth";

// --- Main Component ---
export default function RequestDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = typeof params.id === "string" ? params.id : "";

    const [request, setRequest] = React.useState<PurchaseRequest | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);

    // --- State for Dialogs ---
    const [statusToUpdate, setStatusToUpdate] = React.useState<RequestStatus | "">("");
    const [finalAmount, setFinalAmount] = React.useState<number | undefined>(undefined);
    const [newComment, setNewComment] = React.useState("");
    const [isUpdating, setIsUpdating] = React.useState(false);

    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          router.push("/");
        }
      });
      return () => unsubscribe();
    }, [router]);

    const fetchRequest = React.useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const docRef = doc(db, "purchaseRequests", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const submittedDate = data.submittedDate?.toDate ? data.submittedDate.toDate() : new Date();
                const approvedDate = data.approvedDate?.toDate ? data.approvedDate.toDate() : undefined;
                
                // Ensure comments have proper date objects
                const comments = (data.comments || []).map((comment: any) => ({
                    ...comment,
                    date: comment.date?.toDate ? comment.date.toDate() : new Date(comment.date)
                }));
                
                setRequest({ id: docSnap.id, ...data, submittedDate, approvedDate, comments } as PurchaseRequest);
            } else {
                setError("No se encontró la solicitud.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al cargar la solicitud.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);
    
    const handleUpdateStatus = async () => {
        if (!statusToUpdate || !currentUser) return;
        setIsUpdating(true);
        try {
            const docRef = doc(db, "purchaseRequests", id);
            
            const statusComment = {
                text: `Estado cambiado a: ${statusToUpdate}`,
                author: currentUser.email || "Usuario del Sistema",
                date: new Date(),
            };
            
            const updatePayload: any = { 
                status: statusToUpdate,
                comments: arrayUnion(statusComment)
            };
            
            if (finalAmount !== undefined) {
                updatePayload.finalAmount = finalAmount;
            }
            if (['Completado', 'Rechazado'].includes(statusToUpdate) && !request?.approvedDate) {
                 updatePayload.approvedDate = serverTimestamp();
            }

            await updateDoc(docRef, updatePayload);

            toast({ title: "Estado Actualizado", description: "La solicitud ha sido actualizada." });
            fetchRequest(); // Re-fetch data to show the update
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado." });
        } finally {
            setIsUpdating(false);
            setStatusToUpdate("");
            setFinalAmount(undefined);
        }
    };
    
    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser) return;
        setIsUpdating(true);
        try {
            const docRef = doc(db, "purchaseRequests", id);
            
            const commentToAdd = {
                text: newComment,
                author: currentUser.email || "Usuario del Sistema",
                date: new Date(),
            };

            await updateDoc(docRef, {
                comments: arrayUnion(commentToAdd)
            });

            toast({ title: "Comentario Añadido" });
            setNewComment("");
            fetchRequest(); // Re-fetch data
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el comentario." });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading || !currentUser) {
        return <MainLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></MainLayout>;
    }

    if (error) {
        return <MainLayout><div className="text-center text-red-500">{error}</div></MainLayout>;
    }
    
    if (!request) {
        return null; // or a not found component
    }

    const formatCurrency = (amount: number, currency: 'USD' | 'UYU') => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount);
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </Button>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">Detalle de Solicitud</CardTitle>
                            <CardDescription>ID: {request.id}</CardDescription>
                        </div>
                        <RequestStatusBadge status={request.status} />
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {/* Request Details */}
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                           <div><strong className="block text-muted-foreground">Solicitante:</strong> {request.requesterName}</div>
                           <div><strong className="block text-muted-foreground">Área:</strong> <span className="capitalize">{request.requesterArea}</span></div>
                           <div><strong className="block text-muted-foreground">Fecha:</strong> {new Date(request.submittedDate).toLocaleDateString()}</div>
                           <div><strong className="block text-muted-foreground">Prioridad:</strong> {request.priority}</div>
                           <div><strong className="block text-muted-foreground">Monto Estimado:</strong> {formatCurrency(request.amount, request.currency)}</div>
                           {request.finalAmount && <div><strong className="block text-muted-foreground">Monto Final:</strong> {formatCurrency(request.finalAmount, request.currency)}</div>}
                           {request.approvedDate && <div><strong className="block text-muted-foreground">Fecha Cierre:</strong> {new Date(request.approvedDate).toLocaleDateString()}</div>}
                        </div>
                        
                        {/* Item and Description */}
                        <div className="space-y-2">
                             <div><strong className="block text-muted-foreground">Artículo/Servicio:</strong> {request.item}</div>
                             <div><strong className="block text-muted-foreground">Descripción:</strong><p className="text-muted-foreground">{request.description}</p></div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end pt-4 border-t">
                            {/* Update Status Dialog */}
                            <Dialog onOpenChange={(open) => !open && setStatusToUpdate("")}>
                                <DialogTrigger asChild><Button variant="outline">Actualizar Estado</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Actualizar Estado de la Solicitud</DialogTitle>
                                        <DialogDescription>
                                            Selecciona un nuevo estado para la solicitud. Si es necesario, ingresa el monto final.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Select onValueChange={(v) => setStatusToUpdate(v as RequestStatus)}>
                                            <SelectTrigger><SelectValue placeholder="Cambiar estado" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Ingresado">Ingresado</SelectItem>
                                                <SelectItem value="Cotización Solicitada">Cotización Solicitada</SelectItem>
                                                <SelectItem value="Pago Realizado">Pago Realizado</SelectItem>
                                                <SelectItem value="Completado">Completado</SelectItem>
                                                <SelectItem value="Rechazado">Rechazado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(statusToUpdate === "Completado") && (
                                            <Input 
                                                type="number"
                                                placeholder="Monto Final"
                                                value={finalAmount === undefined ? '' : finalAmount}
                                                onChange={(e) => setFinalAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleUpdateStatus} disabled={isUpdating || !statusToUpdate}>
                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Actualizar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                             {/* Add Comment Dialog */}
                            <Dialog>
                                <DialogTrigger asChild><Button>Añadir Comentario</Button></DialogTrigger>
                                <DialogContent>
                                     <DialogHeader>
                                        <DialogTitle>Añadir Comentario</DialogTitle>
                                        <DialogDescription>
                                            Escribe un comentario o una actualización sobre esta solicitud.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Textarea 
                                        placeholder="Escribe tu comentario aquí..." 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <DialogFooter>
                                        <Button onClick={handleAddComment} disabled={isUpdating || !newComment.trim()}>
                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Añadir
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                         {/* Comments Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold">Historial y Comentarios</h4>
                            {request.comments && request.comments.length > 0 ? (
                                <ul className="space-y-4">
                                    {request.comments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((comment, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="text-sm">
                                                <p className="font-semibold">{comment.author}</p>
                                                <p className="text-muted-foreground">{comment.text}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(comment.date).toLocaleString()}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay comentarios todavía.</p>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

    