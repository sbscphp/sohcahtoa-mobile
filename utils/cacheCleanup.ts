import * as FileSystem from 'expo-file-system';

/**
 * Safely removes a file from the app's cache directory (e.g. from DocumentPicker).
 */
export const deleteCachedFile = async (uri?: string | null): Promise<void> => {
    if (!uri) return;
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        }
    } catch {
        // Silently handle if file cannot be accessed or deleted
    }
};

/**
 * Deletes multiple cached files.
 */
export const deleteCachedFiles = async (uris: Array<string | undefined | null>): Promise<void> => {
    await Promise.all(uris.map(uri => deleteCachedFile(uri)));
};
