import { CreateSupportTicketPayload, CreateSupportTicketResponse, GetSupportTicketByIdResponse, GetSupportTicketsParams, GetSupportTicketsResponse } from '../types/api/support';
import api from './api';

export const createSupportTicket = async (payload: CreateSupportTicketPayload): Promise<CreateSupportTicketResponse> => {
    const formData = new FormData();
    formData.append('category', payload.category);
    formData.append('description', payload.description);

    if (payload.file) {
        formData.append('file', payload.file);
    }

    const response = await api.post('/customer/support/tickets', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getSupportTickets = async (params?: GetSupportTicketsParams): Promise<GetSupportTicketsResponse> => {
    const response = await api.get('/customer/support/tickets', { params });
    return response.data;
};

export const getSupportTicketById = async (ticketId: string): Promise<GetSupportTicketByIdResponse> => {
    const response = await api.get(`/customer/support/tickets/${ticketId}`);
    return response.data;
};

export const getSupportTicketByReference = async (reference: string): Promise<GetSupportTicketByIdResponse> => {
    const response = await api.get(`/customer/support/tickets/reference/${reference}`);
    return response.data;
};

