export type SupportTicketCategory =
    | 'TRANSACTION_ISSUE'
    | 'ACCOUNT_ACCESS'
    | 'PAYMENT_ISSUE'
    | 'DOCUMENT_VERIFICATION'
    | 'TECHNICAL_ISSUE'
    | 'COMPLIANCE_INQUIRY'
    | 'GENERAL_INQUIRY'
    | 'OTHER';

export interface CreateSupportTicketPayload {
    category: SupportTicketCategory | string;
    description: string;
    file?: any;
}

export interface SupportTicket {
    ticketId: string;
    reference: string;
    category: string;
    description: string;
    status: string;
    priority: string;
    attachmentUrl?: string;
    createdAt: string;
    message: string;
}

export interface CreateSupportTicketResponse {
    success: boolean;
    data: SupportTicket;
    message?: string;
}

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicketListItem {
    id: string;
    reference: string;
    category: SupportTicketCategory | string;
    description: string;
    status: SupportTicketStatus | string;
    priority: string;
    assignedAgent?: {
        name: string;
        email: string;
    };
    commentsCount: number;
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetSupportTicketsParams {
    page?: number;
    limit?: number;
    status?: SupportTicketStatus | string;
    category?: SupportTicketCategory | string;
    search?: string;
}

export interface SupportTicketsPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetSupportTicketsResponse {
    success: boolean;
    data: SupportTicketListItem[];
    pagination: SupportTicketsPaginationMeta;
}

export interface SupportTicketAttachment {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
}

export interface SupportTicketComment {
    id: string;
    message: string;
    createdAt: string;
    author: {
        name: string;
        email: string;
        role: string;
    };
}

export interface SupportTicketDetails {
    id: string;
    reference: string;
    category: SupportTicketCategory | string;
    description: string;
    status: SupportTicketStatus | string;
    priority: string;
    customer: {
        name: string;
        email: string;
    };
    assignedAgent?: {
        name: string;
        email: string;
    };
    attachments: SupportTicketAttachment[];
    comments: SupportTicketComment[];
    createdAt: string;
    updatedAt: string;
}

export interface GetSupportTicketByIdResponse {
    success: boolean;
    data: SupportTicketDetails;
}
