import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logoutGoogle } from '../services/googleAuth';
import { 
  uploadPdfToDrive, 
  uploadBackupJsonToDrive, 
  listWorkshopDriveFiles, 
  DriveUploadedFile,
  getOrCreateWorkshopFolder
} from '../services/googleDriveService';
import { exportDiagnosisPDF, exportQuotationPDF, DiagnosisExportOptions, QuotationExportOptions } from '../utils/pdfExport';
import { TechnicalDiagnosis, Quotation } from '../types/erp';

interface GoogleDriveContextType {
  user: User | null;
  token: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  accountEmail: string | null;
  error: string | null;
  recentDriveFiles: DriveUploadedFile[];
  isDriveModalOpen: boolean;
  openDriveModal: () => void;
  closeDriveModal: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signOutGoogle: () => Promise<void>;
  uploadDiagnosisPDFToDrive: (
    diagnosis: TechnicalDiagnosis, 
    options: DiagnosisExportOptions
  ) => Promise<DriveUploadedFile>;
  uploadQuotationPDFToDrive: (
    quotation: Quotation, 
    options: QuotationExportOptions
  ) => Promise<DriveUploadedFile>;
  uploadSystemBackupToDrive: (jsonData: string) => Promise<DriveUploadedFile>;
  refreshRecentFiles: () => Promise<void>;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentDriveFiles, setRecentDriveFiles] = useState<DriveUploadedFile[]>([]);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  const openDriveModal = () => setIsDriveModalOpen(true);
  const closeDriveModal = () => setIsDriveModalOpen(false);

  // Initialize Auth state listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setError(null);
        // Load recent files if token is available
        if (currentToken) {
          listWorkshopDriveFiles()
            .then(files => setRecentDriveFiles(files))
            .catch(() => {});
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setRecentDriveFiles([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshRecentFiles = async () => {
    try {
      const files = await listWorkshopDriveFiles();
      setRecentDriveFiles(files);
    } catch (err: any) {
      console.warn('No se pudieron recargar archivos de Drive:', err);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        // Ensure workshop folder exists
        await getOrCreateWorkshopFolder();
        await refreshRecentFiles();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error al conectar Google Drive:', err);
      setError(err?.message || 'No se pudo completar la vinculación con Google Drive');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const signOutGoogle = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setToken(null);
      setRecentDriveFiles([]);
    } catch (err: any) {
      console.error('Error al cerrar sesión de Google:', err);
    }
  };

  const uploadDiagnosisPDFToDrive = async (
    diagnosis: TechnicalDiagnosis,
    options: DiagnosisExportOptions
  ): Promise<DriveUploadedFile> => {
    const { blob, fileName } = exportDiagnosisPDF(diagnosis, { ...options, autoDownload: false });
    const description = `Informe Técnico ${diagnosis.code} - Placa ${options.vehicle?.plate || 'S/P'}`;
    const uploaded = await uploadPdfToDrive(blob, fileName, { description });
    await refreshRecentFiles();
    return uploaded;
  };

  const uploadQuotationPDFToDrive = async (
    quotation: Quotation,
    options: QuotationExportOptions
  ): Promise<DriveUploadedFile> => {
    const { blob, fileName } = exportQuotationPDF(quotation, { ...options, autoDownload: false });
    const description = `Cotización Proforma ${quotation.code} - Placa ${options.vehicle?.plate || 'S/P'} - Total S/ ${quotation.grandTotal}`;
    const uploaded = await uploadPdfToDrive(blob, fileName, { description });
    await refreshRecentFiles();
    return uploaded;
  };

  const uploadSystemBackupToDrive = async (jsonData: string): Promise<DriveUploadedFile> => {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `SAFIRO_ERP_BACKUP_${dateStr}.json`;
    const uploaded = await uploadBackupJsonToDrive(jsonData, fileName);
    await refreshRecentFiles();
    return uploaded;
  };

  const isConnected = !!user && !!token;
  const accountEmail = user?.email || null;

  return (
    <GoogleDriveContext.Provider
      value={{
        user,
        token,
        isConnected,
        isConnecting,
        accountEmail,
        error,
        recentDriveFiles,
        isDriveModalOpen,
        openDriveModal,
        closeDriveModal,
        signInWithGoogle,
        signOutGoogle,
        uploadDiagnosisPDFToDrive,
        uploadQuotationPDFToDrive,
        uploadSystemBackupToDrive,
        refreshRecentFiles
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};
