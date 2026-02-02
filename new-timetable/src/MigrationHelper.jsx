import React, { useState, useEffect } from 'react';
import { migrateLocalStorageToFirestore, isMigrationComplete, COLLECTIONS } from './firestoreUtils';
import { CheckCircle, AlertCircle, Loader, Database, Cloud } from 'lucide-react';

const DB_KEYS = {
    USERS: 'timetable_users',
    BRANCHES: 'timetable_branches',
    SUBJECTS: 'timetable_subjects',
    TEACHERS: 'timetable_teachers',
    MAPPINGS: 'timetable_mappings',
    CLASSROOMS: 'timetable_classrooms',
    LABS: 'timetable_labs',
    WORKING_DAYS: 'timetable_working_days',
    TIME_SLOTS: 'timetable_time_slots',
    BREAKS: 'timetable_breaks',
    HALF_DAYS: 'timetable_half_days',
    COUNSELING: 'timetable_counseling',
    GENERATED_TIMETABLE: 'timetable_generated',
    TEACHER_SCHEDULES: 'timetable_teacher_schedules',
    CONSTRAINT_REPORT: 'timetable_constraint_report',
};

const MigrationHelper = ({ onComplete, isDarkMode }) => {
    const [migrationStatus, setMigrationStatus] = useState('checking'); // checking, needed, migrating, complete, error
    const [migrationResults, setMigrationResults] = useState(null);
    const [error, setError] = useState('');

    const theme = {
        cardBg: isDarkMode ? '#1e293b' : 'white',
        cardText: isDarkMode ? '#f1f5f9' : '#1a202c',
        cardSubText: isDarkMode ? '#94a3b8' : '#718096',
        accent: isDarkMode ? '#4ecca3' : '#667eea',
        cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    };

    useEffect(() => {
        checkMigrationStatus();
    }, []);

    const checkMigrationStatus = async () => {
        try {
            const isComplete = await isMigrationComplete();

            if (isComplete) {
                setMigrationStatus('complete');
                setTimeout(() => onComplete(), 1000);
                return;
            }

            // Check if there's any localStorage data to migrate
            const hasLocalData = Object.values(DB_KEYS).some(key => {
                const data = localStorage.getItem(key);
                return data && data !== 'null' && data !== '[]';
            });

            if (hasLocalData) {
                setMigrationStatus('needed');
            } else {
                // No data to migrate, mark as complete
                setMigrationStatus('complete');
                setTimeout(() => onComplete(), 1000);
            }
        } catch (err) {
            console.error('Failed to check migration status:', err);
            setError(err.message);
            setMigrationStatus('error');
        }
    };

    const handleMigrate = async () => {
        setMigrationStatus('migrating');
        setError('');

        try {
            const localStorageMapping = {
                [COLLECTIONS.USERS]: DB_KEYS.USERS,
                [COLLECTIONS.BRANCHES]: DB_KEYS.BRANCHES,
                [COLLECTIONS.SUBJECTS]: DB_KEYS.SUBJECTS,
                [COLLECTIONS.TEACHERS]: DB_KEYS.TEACHERS,
                [COLLECTIONS.MAPPINGS]: DB_KEYS.MAPPINGS,
                [COLLECTIONS.CLASSROOMS]: DB_KEYS.CLASSROOMS,
                [COLLECTIONS.LABS]: DB_KEYS.LABS,
                [COLLECTIONS.WORKING_DAYS]: DB_KEYS.WORKING_DAYS,
                [COLLECTIONS.TIME_SLOTS]: DB_KEYS.TIME_SLOTS,
                [COLLECTIONS.BREAKS]: DB_KEYS.BREAKS,
                [COLLECTIONS.HALF_DAYS]: DB_KEYS.HALF_DAYS,
                [COLLECTIONS.COUNSELING]: DB_KEYS.COUNSELING,
                [COLLECTIONS.GENERATED_TIMETABLE]: DB_KEYS.GENERATED_TIMETABLE,
                [COLLECTIONS.TEACHER_SCHEDULES]: DB_KEYS.TEACHER_SCHEDULES,
                [COLLECTIONS.CONSTRAINT_REPORT]: DB_KEYS.CONSTRAINT_REPORT,
            };

            const results = await migrateLocalStorageToFirestore(localStorageMapping);
            setMigrationResults(results);
            setMigrationStatus('complete');

            // Wait a bit to show success message, then complete
            setTimeout(() => onComplete(), 2000);
        } catch (err) {
            console.error('Migration failed:', err);
            setError(err.message);
            setMigrationStatus('error');
        }
    };

    const handleSkip = () => {
        setMigrationStatus('complete');
        onComplete();
    };

    if (migrationStatus === 'checking') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <Loader size={48} color={theme.accent} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: theme.cardText, fontSize: '1.125rem', fontWeight: '600' }}>
                        Checking migration status...
                    </p>
                </div>
            </div>
        );
    }

    if (migrationStatus === 'needed') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}>
                <div style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    border: `1px solid ${theme.cardBorder}`
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Database size={48} color={theme.cardSubText} />
                            <div style={{ fontSize: '2rem', color: theme.cardSubText }}>→</div>
                            <Cloud size={48} color={theme.accent} />
                        </div>
                        <h2 style={{ color: theme.cardText, fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Cloud Sync Available!
                        </h2>
                        <p style={{ color: theme.cardSubText, fontSize: '0.9375rem' }}>
                            Migrate your local data to the cloud for real-time synchronization across all devices
                        </p>
                    </div>

                    <div style={{
                        background: isDarkMode ? '#0f172a' : '#f8fafc',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ color: theme.cardText, fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Benefits:
                        </h3>
                        <ul style={{ color: theme.cardSubText, fontSize: '0.875rem', paddingLeft: '1.5rem', margin: 0 }}>
                            <li>✨ Real-time sync across all devices</li>
                            <li>☁️ Cloud backup of your data</li>
                            <li>🔄 Automatic updates when others make changes</li>
                            <li>📱 Access from anywhere</li>
                        </ul>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee',
                            border: '1px solid #fcc',
                            color: '#c00',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleMigrate}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1.5rem',
                                background: `linear-gradient(135deg, ${theme.accent} 0%, #7c3aed 100%)`,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9375rem'
                            }}
                        >
                            Migrate to Cloud
                        </button>
                        <button
                            onClick={handleSkip}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                color: theme.cardSubText,
                                border: `1px solid ${theme.cardBorder}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9375rem'
                            }}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (migrationStatus === 'migrating') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <Loader size={48} color={theme.accent} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: theme.cardText, fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Migrating your data...
                    </p>
                    <p style={{ color: theme.cardSubText, fontSize: '0.875rem' }}>
                        This may take a few moments
                    </p>
                </div>
            </div>
        );
    }

    if (migrationStatus === 'complete') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: theme.cardText, fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Migration Complete!
                    </p>
                    <p style={{ color: theme.cardSubText, fontSize: '0.875rem' }}>
                        Your data is now synced to the cloud
                    </p>
                    {migrationResults && (
                        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: theme.cardSubText }}>
                            <div>✓ Migrated: {migrationResults.success.length} collections</div>
                            {migrationResults.failed.length > 0 && (
                                <div style={{ color: '#f59e0b' }}>⚠ Failed: {migrationResults.failed.length}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (migrationStatus === 'error') {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}>
                <div style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: theme.cardText, fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Migration Failed
                    </p>
                    <p style={{ color: theme.cardSubText, fontSize: '0.875rem', marginBottom: '1rem' }}>
                        {error || 'An error occurred during migration'}
                    </p>
                    <button
                        onClick={handleSkip}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: theme.accent,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Continue Anyway
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default MigrationHelper;
