import { collection, getDocs, Timestamp } from "firebase/firestore"; 
import { db } from "./firebase";
import type { PurchaseRequest } from "@/types";

export const getPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
    const querySnapshot = await getDocs(collection(db, "purchaseRequests"));
    const requests: PurchaseRequest[] = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // This is the robust fix.
        // Instead of a strict 'instanceof' check, we reliably check if 
        // the 'submittedDate' field exists and behaves like a Firestore Timestamp
        // by checking for the 'toDate' method. This avoids module resolution issues.
        if (data && data.submittedDate && typeof data.submittedDate.toDate === 'function') {
            requests.push({ 
                id: doc.id, 
                ...data,
                // Now it's safe to convert
                submittedDate: (data.submittedDate as Timestamp).toDate()
            } as PurchaseRequest);
        } else {
            // This will safely ignore any document that is malformed
            // or where the server timestamp isn't set yet.
            console.warn(`Document with ID ${doc.id} was skipped due to a missing or invalid 'submittedDate'.`);
        }
    });

    return requests;
};
