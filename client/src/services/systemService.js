
import api from "../api/api";

export const downloadBackup = async () => {
    const response = await api.get('/system/backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ims_backup_${new Date().toISOString().split('T')[0]}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const restoreSystem = async (fileObj) => {
    const formData = new FormData();
    formData.append('backupFile', fileObj);
//TODO move api to its own file
    return api.post('/system/restore', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    
};

export const clearSystemData = async (target) => {
    return api.post('/system/clear', { target });
};

export const performFactoryReset = async (confirmationPhrase) => {
    return api.post('/system/reset', { confirmation: confirmationPhrase });
};