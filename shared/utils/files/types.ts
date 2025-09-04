export const getImageMimeType = (uri: string) => {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
};

export const getDocumentMimeType = (uri: string) => {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'rtf': 'application/rtf'
    };
    return mimeTypes[extension] || 'application/octet-stream';
}; 
