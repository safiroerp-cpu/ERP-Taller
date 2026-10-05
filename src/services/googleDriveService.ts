import { getAccessToken } from './googleAuth';

export interface DriveUploadedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

const DEFAULT_FOLDER_NAME = 'SAFIRO GROUP - ERP Taller Automotriz';

/**
 * Finds or creates the default folder in Google Drive for workshop PDFs and backups
 */
export async function getOrCreateWorkshopFolder(folderName: string = DEFAULT_FOLDER_NAME): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay una sesión activa de Google Drive. Inicie sesión para continuar.');
  }

  // 1. Search for existing folder
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Error al consultar carpeta en Google Drive: ${searchRes.statusText} (${errorText})`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Error al crear carpeta en Google Drive: ${createRes.statusText} (${errorText})`);
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Uploads a PDF Blob to Google Drive using multipart upload
 */
export async function uploadPdfToDrive(
  pdfBlob: Blob,
  fileName: string,
  options?: {
    description?: string;
    folderId?: string;
  }
): Promise<DriveUploadedFile> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debe iniciar sesión con Google para subir archivos a Drive.');
  }

  const targetFolderId = options?.folderId || await getOrCreateWorkshopFolder();

  const metadata = {
    name: fileName,
    mimeType: 'application/pdf',
    description: options?.description || 'Documento generado automáticamente por SAFIRO GROUP ERP Taller',
    parents: targetFolderId ? [targetFolderId] : []
  };

  const boundary = `-------safiro_erp_drive_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata);

  const filePartHeader = delimiter +
    'Content-Type: application/pdf\r\n\r\n';

  // Read blob as array buffer
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  // Assemble full payload
  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const fileHeaderBytes = encoder.encode(filePartHeader);
  const closeBytes = encoder.encode(closeDelimiter);

  const totalLength = metadataBytes.length + fileHeaderBytes.length + fileBytes.length + closeBytes.length;
  const multipartBody = new Uint8Array(totalLength);

  let offset = 0;
  multipartBody.set(metadataBytes, offset);
  offset += metadataBytes.length;

  multipartBody.set(fileHeaderBytes, offset);
  offset += fileHeaderBytes.length;

  multipartBody.set(fileBytes, offset);
  offset += fileBytes.length;

  multipartBody.set(closeBytes, offset);

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Error al subir PDF a Google Drive: ${uploadRes.statusText} (${errorText})`);
  }

  const uploadData: DriveUploadedFile = await uploadRes.json();
  return uploadData;
}

/**
 * Uploads a JSON backup to Google Drive
 */
export async function uploadBackupJsonToDrive(
  jsonData: string,
  fileName: string = `SAFIRO_ERP_BACKUP_${new Date().toISOString().slice(0, 10)}.json`
): Promise<DriveUploadedFile> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debe iniciar sesión con Google para subir respaldos a Drive.');
  }

  const folderId = await getOrCreateWorkshopFolder();

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Copia de seguridad completa del sistema SAFIRO GROUP ERP',
    parents: [folderId]
  };

  const boundary = `-------safiro_erp_backup_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const bodyString = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    jsonData +
    closeDelimiter;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: bodyString
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Error al subir respaldo a Google Drive: ${uploadRes.statusText} (${errorText})`);
  }

  return await uploadRes.json();
}

/**
 * Lists the files uploaded in the SAFIRO workshop folder
 */
export async function listWorkshopDriveFiles(): Promise<DriveUploadedFile[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const folderId = await getOrCreateWorkshopFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&pageSize=20&fields=files(id,name,mimeType,webViewLink,createdTime,size)`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error al listar archivos de Drive:', err);
    return [];
  }
}
