import { storage } from './firebase';
import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'timetables/2024/spring.pdf')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Upload a file with progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - The storage path
 * @param {Function} onProgress - Callback function for progress updates (0-100)
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFileWithProgress = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                console.error('Error uploading file:', error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The storage path of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Get download URL for a file
 * @param {string} path - The storage path
 * @returns {Promise<string>} - The download URL
 */
export const getFileURL = async (path) => {
    try {
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error getting file URL:', error);
        throw error;
    }
};

/**
 * List all files in a directory
 * @param {string} path - The storage directory path
 * @returns {Promise<Array>} - Array of file references
 */
export const listFiles = async (path) => {
    try {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);
        return result.items;
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
};

/**
 * Upload timetable as PDF
 * @param {Blob} pdfBlob - The PDF blob to upload
 * @param {string} filename - The filename (e.g., 'timetable-2024-spring.pdf')
 * @returns {Promise<string>} - The download URL
 */
export const uploadTimetablePDF = async (pdfBlob, filename) => {
    const path = `timetables/${filename}`;
    return uploadFile(pdfBlob, path);
};

/**
 * Upload timetable data as JSON
 * @param {Object} timetableData - The timetable data object
 * @param {string} filename - The filename (e.g., 'timetable-2024-spring.json')
 * @returns {Promise<string>} - The download URL
 */
export const uploadTimetableData = async (timetableData, filename) => {
    const jsonBlob = new Blob([JSON.stringify(timetableData, null, 2)], {
        type: 'application/json'
    });
    const path = `timetables/data/${filename}`;
    return uploadFile(jsonBlob, path);
};
