

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
};

export type RequestStatus = 'Ingresado' | 'Cotización Solicitada' | 'Pago Realizado' | 'Completado' | 'Rechazado' | 'Pendiente';
export type RequestPriority = 'Baja' | 'Media' | 'Alta';
export type Currency = 'USD' | 'UYU';
export type RequesterArea = "comercial" | "gerencia general" | "direccion" | "administracion" | "soporte tecnico" | "produccion" | "calidad";


export type RequestHistory = {
  id: string;
  timestamp: string;
  status: RequestStatus;
  comment: string;
  authorId: string;
  authorName: string;
};

export interface Comment {
  text: string;
  author: string;
  date: any; 
}


export type PurchaseRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterArea: RequesterArea;
  item: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  currency: Currency;
  amount: number;
  submittedDate: any;
  approvedDate?: any;
  finalAmount?: number;
  comments: Comment[];
};

    

    