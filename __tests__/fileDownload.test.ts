import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { downloadAndSaveFile } from '../utils/fileDownload';

jest.mock('expo-file-system/legacy', () => ({
    cacheDirectory: 'file:///cache/',
    documentDirectory: 'file:///documents/',
    EncodingType: {
        Base64: 'base64',
    },
    downloadAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(),
    shareAsync: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(),
}));

describe('fileDownload utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    });

    it('downloads locally and opens in browser/viewer on Android', async () => {
        Platform.OS = 'android';

        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
            uri: 'file:///documents/receipt_123.pdf',
        });

        const result = await downloadAndSaveFile({
            url: 'https://example.com/receipt.pdf',
            fileName: 'receipt_123.pdf',
        });

        expect(result.success).toBe(true);
        expect(result.method).toBe('browser');
        expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
            'https://example.com/receipt.pdf',
            'file:///documents/receipt_123.pdf'
        );
        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/receipt.pdf');
    });

    it('falls back to WebBrowser on Android if Linking.openURL fails', async () => {
        Platform.OS = 'android';

        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
            uri: 'file:///documents/receipt_123.pdf',
        });
        jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('Linking failed'));
        (WebBrowser.openBrowserAsync as jest.Mock).mockResolvedValue({ type: 'opened' });

        const result = await downloadAndSaveFile({
            url: 'https://example.com/receipt.pdf',
            fileName: 'receipt_123.pdf',
        });

        expect(result.success).toBe(true);
        expect(result.method).toBe('browser');
        expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://example.com/receipt.pdf');
    });

    it('uses Sharing on iOS', async () => {
        Platform.OS = 'ios';

        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
            uri: 'file:///documents/receipt_123.pdf',
        });
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

        const result = await downloadAndSaveFile({
            url: 'https://example.com/receipt.pdf',
            fileName: 'receipt_123.pdf',
            dialogTitle: 'Save Receipt',
        });

        expect(result.success).toBe(true);
        expect(result.method).toBe('share');
        expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///documents/receipt_123.pdf', {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Receipt',
            UTI: 'com.adobe.pdf',
        });
    });

    it('handles base64 data url properly', async () => {
        Platform.OS = 'ios';
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

        const result = await downloadAndSaveFile({
            url: 'data:application/pdf;base64,JVBERi0xLjQK...',
            fileName: 'receipt_data.pdf',
        });

        expect(result.success).toBe(true);
        expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
            'file:///documents/receipt_data.pdf',
            'JVBERi0xLjQK...',
            { encoding: 'base64' }
        );
        expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///documents/receipt_data.pdf', expect.any(Object));
    });

    it('handles web download', async () => {
        Platform.OS = 'web';
        const mockClick = jest.fn();
        const originalDocument = (globalThis as any).document;
        (globalThis as any).document = {
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn(),
            },
            createElement: jest.fn().mockReturnValue({
                click: mockClick,
                set href(val: string) {},
                set download(val: string) {},
                set target(val: string) {},
            }),
        };

        const result = await downloadAndSaveFile({
            url: 'https://example.com/receipt.pdf',
            fileName: 'receipt_web.pdf',
        });

        expect(result.success).toBe(true);
        expect(result.method).toBe('web_download');
        expect(mockClick).toHaveBeenCalled();

        (globalThis as any).document = originalDocument;
    });
});
