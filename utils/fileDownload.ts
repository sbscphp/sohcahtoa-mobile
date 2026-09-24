import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';

export interface DownloadFileOptions {
    url: string;
    fileName: string;
    mimeType?: string;
    dialogTitle?: string;
}

export interface DownloadFileResult {
    success: boolean;
    method: 'share' | 'web_download' | 'browser';
    uri?: string;
}

/**
 * Downloads, saves, and opens/displays a file across Android, iOS, and Web.
 * - On Web: Triggers a direct browser download and opens in a new tab.
 * - On Android: Downloads locally to document storage, opens via external browser/viewer
 *   (which triggers system DownloadManager to save to the Downloads folder and views the PDF),
 *   with fallback to WebBrowser or Sharing.
 * - On iOS: Downloads to documents and opens the native Share sheet ("Save to Files" / preview).
 */
export async function downloadAndSaveFile({
    url,
    fileName,
    mimeType = 'application/pdf',
    dialogTitle = 'Transaction Receipt',
}: DownloadFileOptions): Promise<DownloadFileResult> {
    // 1. Web browser download
    if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return { success: true, method: 'web_download', uri: url };
        }
    }

    try {
        // 2. Prepare local persistent storage path
        const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        const localUri = baseDir ? `${baseDir}${fileName}` : null;
        let localFileUri = localUri || url;

        // 3. Download or write file locally if filesystem is available
        if (localUri) {
            try {
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const downloadResult = await FileSystem.downloadAsync(url, localUri);
                    localFileUri = downloadResult.uri;
                } else if (url.startsWith('data:')) {
                    const base64Data = url.replace(/^data:[^;]+;base64,/, '');
                    await FileSystem.writeAsStringAsync(localUri, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                } else if (!url.startsWith('file://')) {
                    // Raw base64 string
                    await FileSystem.writeAsStringAsync(localUri, url, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                }
            } catch (fsErr) {
                console.warn('Local filesystem download error, proceeding with direct URL:', fsErr);
            }
        }

        // 4. Android: Open directly via external browser/viewer (saves to Downloads & views)
        if (Platform.OS === 'android') {
            const isRemoteUrl = url.startsWith('http://') || url.startsWith('https://');
            if (isRemoteUrl) {
                try {
                    await Linking.openURL(url);
                    return { success: true, method: 'browser', uri: url };
                } catch (linkingErr) {
                    console.warn('Linking.openURL failed, trying WebBrowser:', linkingErr);
                    try {
                        await WebBrowser.openBrowserAsync(url);
                        return { success: true, method: 'browser', uri: url };
                    } catch (wbErr) {
                        console.warn('WebBrowser failed, falling back to Sharing:', wbErr);
                    }
                }
            }

            // If not remote URL or Linking failed, share local file
            if (await Sharing.isAvailableAsync().catch(() => false)) {
                await Sharing.shareAsync(localFileUri, {
                    mimeType,
                    dialogTitle,
                });
                return { success: true, method: 'share', uri: localFileUri };
            }

            return { success: true, method: 'browser', uri: url };
        }

        // 5. iOS: Open native Share sheet ("Save to Files" / preview)
        if (Platform.OS === 'ios') {
            if (await Sharing.isAvailableAsync().catch(() => false)) {
                await Sharing.shareAsync(localFileUri, {
                    mimeType,
                    dialogTitle,
                    UTI: 'com.adobe.pdf',
                });
                return { success: true, method: 'share', uri: localFileUri };
            }

            // Fallback for iOS
            try {
                await WebBrowser.openBrowserAsync(url);
                return { success: true, method: 'browser', uri: url };
            } catch {
                await Linking.openURL(url);
                return { success: true, method: 'browser', uri: url };
            }
        }

        // 6. Generic Fallback
        try {
            await Linking.openURL(url);
            return { success: true, method: 'browser', uri: url };
        } catch {
            await WebBrowser.openBrowserAsync(url);
            return { success: true, method: 'browser', uri: url };
        }
    } catch (err) {
        try {
            await Linking.openURL(url);
            return { success: true, method: 'browser', uri: url };
        } catch {
            await WebBrowser.openBrowserAsync(url);
            return { success: true, method: 'browser', uri: url };
        }
    }
}
