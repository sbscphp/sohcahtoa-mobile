import { renderHook, act } from '@testing-library/react-native';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUploadTransactionDocumentMutation } from '@/hooks/queries/transactions/useUploadTransactionDocumentMutation';
import * as DocumentPicker from 'expo-document-picker';

// Mock dependencies
jest.mock('@/stores/useAuthStore');
jest.mock('@/hooks/queries/transactions/useUploadTransactionDocumentMutation');
jest.mock('expo-document-picker');

describe('useDocumentUpload', () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            user: { id: 'user-123' }
        }));

        (useUploadTransactionDocumentMutation as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });

        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{
                uri: 'file://test-doc.pdf',
                name: 'test-doc.pdf',
                mimeType: 'application/pdf',
                size: 1024
            }]
        });
    });

    it('should call DocumentPicker and then mutate on upload', async () => {
        const { result } = renderHook(() => useDocumentUpload({ onSuccess: mockOnSuccess, onError: mockOnError }));

        await act(async () => {
            await result.current.upload('PASSPORT');
        });

        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-123',
                documentType: 'PASSPORT',
                document: expect.objectContaining({
                    uri: 'file://test-doc.pdf',
                    name: 'test-doc.pdf',
                }),
            }),
            expect.any(Object)
        );
    });

    it('should not call mutate if DocumentPicker is canceled', async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
            canceled: true
        });

        const { result } = renderHook(() => useDocumentUpload({ onSuccess: mockOnSuccess, onError: mockOnError }));

        await act(async () => {
            await result.current.upload('PASSPORT');
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should call onError if upload fails', async () => {
        const error = new Error('Picker failed');
        (DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(error);

        const { result } = renderHook(() => useDocumentUpload({ onSuccess: mockOnSuccess, onError: mockOnError }));

        await act(async () => {
            await result.current.upload('PASSPORT');
        });

        expect(mockOnError).toHaveBeenCalledWith(error);
    });
});
