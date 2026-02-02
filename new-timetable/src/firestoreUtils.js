import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    writeBatch,
    query,
    orderBy
} from 'firebase/firestore';

/**
 * Firestore Collections
 */
export const COLLECTIONS = {
    USERS: 'users',
    BRANCHES: 'branches',
    SUBJECTS: 'subjects',
    TEACHERS: 'teachers',
    MAPPINGS: 'teacher_subject_mappings',
    CLASSROOMS: 'classrooms',
    LABS: 'labs',
    WORKING_DAYS: 'working_days',
    TIME_SLOTS: 'time_slots',
    BREAKS: 'breaks',
    HALF_DAYS: 'half_days',
    COUNSELING: 'counseling_periods',
    GENERATED_TIMETABLE: 'generated_timetables',
    TEACHER_SCHEDULES: 'teacher_schedules',
    CONSTRAINT_REPORT: 'constraint_reports',
    SETTINGS: 'settings'
};

/**
 * Save data to Firestore
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Data to save
 * @returns {Promise<boolean>}
 */
export const saveToFirestore = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error(`Failed to save to Firestore (${collectionName}/${docId}):`, error);
        return false;
    }
};

/**
 * Save array data to Firestore (stores as a single document with array field)
 * @param {string} collectionName - Firestore collection name
 * @param {Array} dataArray - Array of data to save
 * @returns {Promise<boolean>}
 */
export const saveArrayToFirestore = async (collectionName, dataArray) => {
    try {
        const docRef = doc(db, collectionName, 'data');
        await setDoc(docRef, {
            items: dataArray,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error(`Failed to save array to Firestore (${collectionName}):`, error);
        return false;
    }
};

/**
 * Load data from Firestore
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @param {*} defaultValue - Default value if document doesn't exist
 * @returns {Promise<*>}
 */
export const loadFromFirestore = async (collectionName, docId, defaultValue = null) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }
        return defaultValue;
    } catch (error) {
        console.error(`Failed to load from Firestore (${collectionName}/${docId}):`, error);
        return defaultValue;
    }
};

/**
 * Load array data from Firestore
 * @param {string} collectionName - Firestore collection name
 * @param {Array} defaultValue - Default value if document doesn't exist
 * @returns {Promise<Array>}
 */
export const loadArrayFromFirestore = async (collectionName, defaultValue = []) => {
    try {
        const docRef = doc(db, collectionName, 'data');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().items || defaultValue;
        }
        return defaultValue;
    } catch (error) {
        console.error(`Failed to load array from Firestore (${collectionName}):`, error);
        return defaultValue;
    }
};

/**
 * Subscribe to real-time updates for array data
 * @param {string} collectionName - Firestore collection name
 * @param {Function} callback - Callback function to handle updates
 * @param {Array} defaultValue - Default value if document doesn't exist
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToArray = (collectionName, callback, defaultValue = []) => {
    const docRef = doc(db, collectionName, 'data');

    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().items || defaultValue);
        } else {
            callback(defaultValue);
        }
    }, (error) => {
        console.error(`Firestore subscription error (${collectionName}):`, error);
        callback(defaultValue);
    });
};

/**
 * Subscribe to real-time updates for a single document
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @param {Function} callback - Callback function to handle updates
 * @param {*} defaultValue - Default value if document doesn't exist
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToDocument = (collectionName, docId, callback, defaultValue = null) => {
    const docRef = doc(db, collectionName, docId);

    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback(defaultValue);
        }
    }, (error) => {
        console.error(`Firestore subscription error (${collectionName}/${docId}):`, error);
        callback(defaultValue);
    });
};

/**
 * Delete a document from Firestore
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @returns {Promise<boolean>}
 */
export const deleteFromFirestore = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(`Failed to delete from Firestore (${collectionName}/${docId}):`, error);
        return false;
    }
};

/**
 * Migrate data from localStorage to Firestore
 * @param {Object} localStorageKeys - Mapping of data keys to localStorage keys
 * @returns {Promise<Object>} - Migration results
 */
export const migrateLocalStorageToFirestore = async (localStorageKeys) => {
    const results = {
        success: [],
        failed: [],
        skipped: []
    };

    const batch = writeBatch(db);
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500;

    try {
        for (const [firestoreCollection, localStorageKey] of Object.entries(localStorageKeys)) {
            try {
                const localData = localStorage.getItem(localStorageKey);

                if (!localData) {
                    results.skipped.push(firestoreCollection);
                    continue;
                }

                const parsedData = JSON.parse(localData);

                // Save to Firestore
                const success = await saveArrayToFirestore(firestoreCollection, parsedData);

                if (success) {
                    results.success.push(firestoreCollection);
                    console.log(`✓ Migrated ${firestoreCollection}`);
                } else {
                    results.failed.push(firestoreCollection);
                }

            } catch (error) {
                console.error(`Failed to migrate ${firestoreCollection}:`, error);
                results.failed.push(firestoreCollection);
            }
        }

        // Mark migration as complete
        await saveToFirestore(COLLECTIONS.SETTINGS, 'migration', {
            completed: true,
            completedAt: new Date().toISOString(),
            results
        });

        return results;
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

/**
 * Check if migration has been completed
 * @returns {Promise<boolean>}
 */
export const isMigrationComplete = async () => {
    try {
        const migrationDoc = await loadFromFirestore(COLLECTIONS.SETTINGS, 'migration');
        return migrationDoc?.completed === true;
    } catch (error) {
        console.error('Failed to check migration status:', error);
        return false;
    }
};

/**
 * Clear all Firestore data (use with caution!)
 * @returns {Promise<boolean>}
 */
export const clearAllFirestore = async () => {
    try {
        const collections = Object.values(COLLECTIONS);

        for (const collectionName of collections) {
            const docRef = doc(db, collectionName, 'data');
            await deleteDoc(docRef);
        }

        return true;
    } catch (error) {
        console.error('Failed to clear Firestore:', error);
        return false;
    }
};
