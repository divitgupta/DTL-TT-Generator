import { useState } from 'react';
import { uploadFileWithProgress, uploadTimetablePDF, deleteFile } from './storageUtils';

/**
 * Example component demonstrating Firebase Storage integration
 * You can integrate these patterns into your existing components
 */
const FileUploadExample = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            const path = `uploads/${Date.now()}-${file.name}`;
            const url = await uploadFileWithProgress(
                file,
                path,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            setDownloadURL(url);
            alert('File uploaded successfully!');
        } catch (err) {
            setError(`Upload failed: ${err.message}`);
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadPDF = async (pdfBlob) => {
        // This function would be called after generating a PDF with jsPDF
        try {
            const filename = `timetable-${Date.now()}.pdf`;
            const url = await uploadTimetablePDF(pdfBlob, filename);
            console.log('PDF uploaded:', url);
            return url;
        } catch (err) {
            console.error('PDF upload failed:', err);
            throw err;
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Firebase Storage Upload</h2>

            <div className="space-y-4">
                {/* File Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select File
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                        disabled={isUploading}
                    />
                </div>

                {/* Selected File Info */}
                {file && (
                    <div className="text-sm text-gray-600">
                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors"
                >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>

                {/* Progress Bar */}
                {isUploading && (
                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            {uploadProgress.toFixed(1)}%
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Success - Download URL */}
                {downloadURL && (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                        <p className="text-sm font-medium text-green-800 mb-2">
                            Upload Successful!
                        </p>
                        <a
                            href={downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                        >
                            View File
                        </a>
                    </div>
                )}
            </div>

            {/* Usage Instructions */}
            <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
                <p className="font-medium mb-2">Integration Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Use this pattern in your timetable export feature</li>
                    <li>Call handleUploadPDF after generating PDFs</li>
                    <li>Store download URLs in Firestore for later retrieval</li>
                </ul>
            </div>
        </div>
    );
};

export default FileUploadExample;
