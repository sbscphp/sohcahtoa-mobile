import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import TransactionStatusView from '../components/transaction-flow/TransactionStatusView';
import { useGetTransactionReceiptMutation } from '@/hooks/queries/transactions/useGetTransactionReceiptMutation';
import { downloadAndSaveFile } from '@/utils/fileDownload';

jest.mock('@/hooks/queries/transactions/useGetTransactionReceiptMutation');
jest.mock('@/utils/fileDownload');

const mockUseGetTransactionReceiptMutation = useGetTransactionReceiptMutation as jest.MockedFunction<typeof useGetTransactionReceiptMutation>;
const mockDownloadAndSaveFile = downloadAndSaveFile as jest.MockedFunction<typeof downloadAndSaveFile>;

describe('TransactionStatusView', () => {
    const mockMutate = jest.fn();
    const mockMutateAsync = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGetTransactionReceiptMutation.mockReturnValue({
            mutate: mockMutate,
            mutateAsync: mockMutateAsync,
            isPending: false,
        } as any);
        mockDownloadAndSaveFile.mockResolvedValue({ success: true, method: 'browser' });
    });
    const defaultProps = {
        status: 'approved' as const,
        id: '123456',
        date: '25 Jun 2025',
        time: '11:00 am',
        message: 'Your request has been approved.',
    };

    it('renders approved status correctly', () => {
        const { getByText } = render(<TransactionStatusView {...defaultProps} />);

        expect(getByText('Request Approved')).toBeTruthy();
        expect(getByText('ID: 123456')).toBeTruthy();
        expect(getByText('25 Jun 2025')).toBeTruthy();
        expect(getByText('11:00 am')).toBeTruthy();
        expect(getByText('Your request has been approved.')).toBeTruthy();
        expect(getByText('Approved')).toBeTruthy();
    });

    it('renders pending status correctly', () => {
        const props = { ...defaultProps, status: 'pending' as const };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Application is Under Review')).toBeTruthy();
        expect(getByText(/Your application is currently undergoing approval/)).toBeTruthy();
    });

    it('renders rejected status correctly', () => {
        const props = { ...defaultProps, status: 'rejected' as const, message: 'Invalid documents.' };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Request Rejected')).toBeTruthy();
        expect(getByText('Invalid documents.')).toBeTruthy();
        expect(getByText('Rejected')).toBeTruthy();
    });

    it('renders more_info status correctly', () => {
        const props = { ...defaultProps, status: 'more_info' as const, message: 'Please upload TIN.' };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('More Information Requested')).toBeTruthy();
        expect(getByText('Please upload TIN.')).toBeTruthy();
        expect(getByText('Information Pending')).toBeTruthy();
    });

    it('renders awaiting_disbursement status correctly', () => {
        const props = { ...defaultProps, status: 'awaiting_disbursement' as const };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Request Approved')).toBeTruthy();
        expect(getByText('Awaiting Disbursement')).toBeTruthy();
    });

    it('renders settled status correctly and shows download receipt button', () => {
        const props = { ...defaultProps, status: 'settled' as const };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Transaction Completed')).toBeTruthy();
        expect(getByText('Settled')).toBeTruthy();
        expect(getByText('Download Receipt')).toBeTruthy();
    });

    it('renders COMPLETED apiStatus correctly and shows download receipt button', () => {
        const props = { ...defaultProps, status: 'settled' as const, apiStatus: 'COMPLETED' };
        const { getByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Transaction Completed')).toBeTruthy();
        expect(getByText('COMPLETED')).toBeTruthy();
        expect(getByText('Download Receipt')).toBeTruthy();
    });

    it('does not show download receipt button for pending or rejected status', () => {
        const pendingProps = { ...defaultProps, status: 'pending' as const };
        const { queryByText: queryByTextPending } = render(<TransactionStatusView {...pendingProps} />);
        expect(queryByTextPending('Download Receipt')).toBeNull();

        const rejectedProps = { ...defaultProps, status: 'rejected' as const };
        const { queryByText: queryByTextRejected } = render(<TransactionStatusView {...rejectedProps} />);
        expect(queryByTextRejected('Download Receipt')).toBeNull();
    });

    it('renders refunded status correctly', () => {
        const props = { ...defaultProps, status: 'refunded' as const, message: 'Transaction was refunded due to compliance limits.' };
        const { getByText, queryByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Transaction Refunded')).toBeTruthy();
        expect(getByText('Transaction was refunded due to compliance limits.')).toBeTruthy();
        expect(getByText('Refunded')).toBeTruthy();
        expect(queryByText('Application is Under Review')).toBeNull();
    });

    it('renders apiStatus REFUNDED correctly when status is pending', () => {
        const props = { ...defaultProps, status: 'pending' as const, apiStatus: 'REFUNDED', message: 'Funds have been returned.' };
        const { getByText, queryByText } = render(<TransactionStatusView {...props} />);

        expect(getByText('Transaction Refunded')).toBeTruthy();
        expect(getByText('Funds have been returned.')).toBeTruthy();
        expect(getByText('REFUNDED')).toBeTruthy();
        expect(queryByText('Application is Under Review')).toBeNull();
    });

    it('triggers receipt mutation and downloads file when download receipt button is pressed', async () => {
        mockMutateAsync.mockResolvedValue({
            success: true,
            message: 'Receipt ready',
            data: {
                receiptUrl: 'https://example.com/receipts/tx-123.pdf',
            },
        });

        const props = { ...defaultProps, status: 'settled' as const, transactionId: 'tx-123' };
        const { getByTestId } = render(<TransactionStatusView {...props} />);

        const downloadButton = getByTestId('download-receipt-button');
        fireEvent.press(downloadButton);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith('tx-123');
            expect(mockDownloadAndSaveFile).toHaveBeenCalledWith({
                url: 'https://example.com/receipts/tx-123.pdf',
                fileName: 'receipt_tx-123.pdf',
                dialogTitle: 'Transaction Receipt',
            });
        });
    });

    it('calls onDownloadReceipt callback instead of mutation if provided', async () => {
        const mockOnDownload = jest.fn();
        const props = {
            ...defaultProps,
            status: 'settled' as const,
            transactionId: 'tx-123',
            onDownloadReceipt: mockOnDownload,
        };
        const { getByTestId } = render(<TransactionStatusView {...props} />);

        const downloadButton = getByTestId('download-receipt-button');
        fireEvent.press(downloadButton);

        expect(mockOnDownload).toHaveBeenCalledTimes(1);
        expect(mockMutate).not.toHaveBeenCalled();
    });
});

