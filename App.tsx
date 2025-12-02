import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/views/HomeView';
import { RegistrationView } from './components/views/RegistrationView';
import { MeasurementView } from './components/views/MeasurementView';
import { RecordingView } from './components/views/RecordingView';
import { ServiceView } from './components/views/ServiceView';
import { EducationView } from './components/views/EducationView';
import { ReportView } from './components/views/ReportView';
import { AddEditParticipantModal } from './components/modals/AddEditParticipantModal';
import { MeasurementModal } from './components/modals/MeasurementModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { ImportDataModal } from './components/modals/ImportDataModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { HomeVisitModal } from './components/modals/HomeVisitModal';
import { SurveyModal } from './components/modals/SurveyModal';
import { GrowthCheckModal } from './components/modals/GrowthCheckModal';
import { ReportTemplateManagerModal } from './components/modals/ReportTemplateManagerModal';
import { usePosyanduData } from './hooks/usePosyanduData';
import type { View, Participant, QueueItem, HomeVisitRecord, SurveiKeluarga, HealthNotification, ReportType, ReportTemplate } from './types';
import { LoginView } from './components/views/LoginView';
import { PosyanduSelectionView } from './components/views/PosyanduSelectionView';
import { calculatePhbsScore, normalizeDateString } from './utils/helpers';
import { Modal } from './components/modals/Modal';
import { WhatsappIcon, FacebookIcon, InstagramIcon, EmailIcon } from './components/icons';
import { NotificationPanel } from './components/notifications/NotificationPanel';
import { useToast } from './contexts/ToastContext';
import { FamilyLoginModal } from './components/modals/FamilyLoginModal';
import { FamilyPortalView } from './components/views/FamilyPortalView';
import { AVAILABLE_COLUMNS } from './utils/reportDefinitions';


// --- START OF CONTACT MODAL COMPONENT ---
interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const contactLinks = [
    {
        name: 'WhatsApp',
        icon: <WhatsappIcon />,
        href: 'https://wa.me/6285174477112', // From Footer, with country code
        bgColor: 'bg-green-500 hover:bg-green-600'
    },
    {
        name: 'Facebook',
        icon: <FacebookIcon />,
        href: 'https://www.facebook.com/share/1GAn5kc9K9/',
        bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
        name: 'Instagram',
        icon: <InstagramIcon />,
        href: 'https://www.instagram.com/puskesmas.kupu?igsh=dWR2NzgyOG84aHdv', // Placeholder
        bgColor: 'bg-pink-500 hover:bg-pink-600'
    },
    {
        name: 'Email',
        icon: <EmailIcon />,
        href: 'mailto:puskesmas.kupu123@gmail.com', // From Footer
        bgColor: 'bg-gray-700 hover:bg-gray-800'
    },
];

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Kontak Kami">
            <p className="text-gray-600 mb-6 text-center">
                Hubungi kami melalui salah satu saluran di bawah ini.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactLinks.map(link => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-3 p-4 rounded-lg text-white font-semibold transition-transform transform hover:scale-105 shadow-lg ${link.bgColor}`}
                    >
                        <div className="w-6 h-6">{link.icon}</div>
                        <span>{link.name}</span>
                    </a>
                ))}
            </div>
             <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    Tutup
                </button>
            </div>
        </Modal>
    );
};
// --- END OF CONTACT MODAL COMPONENT ---

// Shared constants for backend communication
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9BidZOg0oHuQ7L-15hOTtS69DYLUvwFAUH-6iTPYZ9nn9CIkYfpCLtHnA-GGeLYzf/exec';
const GLOBAL_SETTINGS_KEY = 'global_settings';
const NOTIFICATION_READ_STATUS_KEY = 'puspita-read-notifications';
const REPORT_TEMPLATES_KEY = 'puspita-report-templates';

const DEFAULT_TEMPLATES: ReportTemplate[] = [
    {
        id: 'gizi',
        name: 'Laporan Gizi (Balita)',
        defaultCategory: 'balita',
        format: 'detail',
        selectedColumns: ['nama', 'nik', 'tanggal_lahir', 'jenis_kelamin', 'nama_posyandu', 'berat_badan', 'tinggi_badan', 'status_bb_u', 'status_tb_u', 'status_bb_tb', 'status_kenaikan_berat', 'imunisasi', 'vitaminA', 'obatCacing']
    },
    {
        id: 'bumil',
        name: 'Laporan Ibu Hamil',
        defaultCategory: 'ibu-hamil',
        format: 'detail',
        selectedColumns: ['nama', 'nik', 'alamat', 'status_hamil', 'berat_badan', 'tinggi_badan', 'lila', 'status_lila', 'tensi', 'pemeriksaanHB', 'kesimpulan_hb', 'tfu', 'djj', 'presentasi', 'kesimpulan_tensi']
    },
    {
        id: 'ptm',
        name: 'Laporan PTM (Dewasa & Lansia)',
        defaultCategory: 'ptm',
        format: 'detail',
        selectedColumns: ['nama', 'nik', 'alamat', 'kategori', 'tensi', 'kesimpulan_tensi', 'gds', 'kesimpulan_gds', 'kolesterol', 'kesimpulan_kolesterol', 'asamUrat', 'kesimpulan_asam_urat', 'skriningMerokok_merokok', 'status_bmi']
    },
    {
        id: 'phbs',
        name: 'Laporan Survei PHBS',
        defaultCategory: 'semua',
        format: 'detail',
        selectedColumns: ['nama', 'nik', 'alamat', 'phbsClassification', 'phbsScore', 'survei_sumberAirUtama', 'survei_tersediaJambanKeluarga', 'survei_merokokDalamRumah', 'survei_jentikNyamuk']
    },
    {
        id: 'lengkap',
        name: 'Laporan Lengkap',
        defaultCategory: 'semua',
        format: 'detail',
        selectedColumns: AVAILABLE_COLUMNS.map(c => c.id)
    }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('isAuthenticated'));
  const [userDesa, setUserDesa] = useState<string | null>(localStorage.getItem('userDesa'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [posyanduSession, setPosyanduSession] = useState<string | null>(localStorage.getItem('posyanduSession'));
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [reportType, setReportType] = useState<ReportType>('lengkap'); // New state for report type
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isLoginViewVisible, setIsLoginViewVisible] = useState(false);
  
  // State for the API key fetched from the server
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Modal states
  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [isHomeVisitModalOpen, setHomeVisitModalOpen] = useState(false);
  const [isSurveyModalOpen, setSurveyModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isGrowthCheckModalOpen, setGrowthCheckModalOpen] = useState(false);
  const [isFamilyLoginModalOpen, setIsFamilyLoginModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  // Data for modals
  const [participantToEdit, setParticipantToEdit] = useState<Participant | null>(null);
  const [participantToMeasure, setParticipantToMeasure] = useState<Participant | null>(null);
  const [participantToServe, setParticipantToServe] = useState<Participant | null>(null);
  const [participantForHistory, setParticipantForHistory] = useState<Participant | null>(null);
  const [participantToVisit, setParticipantToVisit] = useState<Participant | null>(null);
  const [participantToSurvey, setParticipantToSurvey] = useState<Participant | null>(null);
  const [scannedParticipantsToRegister, setScannedParticipantsToRegister] = useState<Partial<Participant>[]>([]);
  const [participantToCheck, setParticipantToCheck] = useState<Participant | null>(null);
  const [loggedInFamilyMember, setLoggedInFamilyMember] = useState<Participant | null>(null);


  // Notification states
  const [healthNotifications, setHealthNotifications] = useState<HealthNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    
  // Role states
  const [isSuperAdmin, setIsSuperAdmin] = useState(localStorage.getItem('isSuperAdmin') === 'true');

  // Report Templates State
  // Initialize from localStorage first for immediate availability, but will sync with backend
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(() => {
      const saved = localStorage.getItem(REPORT_TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const { addToast } = useToast();

  const isPublicView = !isAuthenticated && !loggedInFamilyMember;
  const desaForData = isPublicView ? 'Semua' : (userDesa || 'Semua');
  const isAdmin = !isPublicView && (username?.toLowerCase() === 'admin' || username?.toLowerCase() === 'puskesmas' || isSuperAdmin);
  
  const data = usePosyanduData(desaForData, posyanduSession, isAdmin);
  const { participants, loading } = data;
  
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Persist templates to localStorage as a fallback/cache
  useEffect(() => {
      localStorage.setItem(REPORT_TEMPLATES_KEY, JSON.stringify(reportTemplates));
  }, [reportTemplates]);

  // --- API KEY FETCHING LOGIC for Vercel deployment ---
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/get-key');
        if (!response.ok) {
          throw new Error('Failed to fetch API key from server.');
        }
        const data = await response.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch (error) {
         // Optionally handle error, but silent fail is okay here as feature will disable gracefully
      }
    };
    fetchApiKey();
  }, []);
  // --- END OF API KEY FETCHING LOGIC ---

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    try {
        const storedIds = localStorage.getItem(NOTIFICATION_READ_STATUS_KEY);
        if (storedIds) {
            setReadNotificationIds(new Set(JSON.parse(storedIds)));
        }
    } catch (e) {
        console.error("Failed to load read notification statuses", e);
    }
  }, []);

  useEffect(() => {
      const generateNotifications = (participants: Participant[]): HealthNotification[] => {
          const newNotifications: HealthNotification[] = [];
          
          participants.forEach(p => {
              const now = new Date().toISOString();

              // 1. Stunting Risk
              if (p.kategori === 'balita' && (p.status_tb_u?.includes('pendek') || p.status_kenaikan_berat === 'Tidak Naik')) {
                  newNotifications.push({
                      id: `${p.__backendId}-stunting`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'stunting',
                      message: p.status_kenaikan_berat === 'Tidak Naik' ? 'Berat badan tidak naik pada pengukuran terakhir.' : 'Status tinggi badan menurut umur adalah ' + p.status_tb_u,
                      createdAt: now,
                  });
              }

              // 2. Wasted/Underweight Risk
              if (p.kategori === 'balita' && (p.status_bb_tb?.includes('kurang') || p.status_bb_tb?.includes('buruk'))) {
                  newNotifications.push({
                      id: `${p.__backendId}-underweight`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'underweight',
                      message: `Status gizi BB/TB: ${p.status_bb_tb}.`,
                      createdAt: now,
                  });
              }

              // 3. Anemia Risk
              if (p.kesimpulan_hb === 'Anemia') {
                  newNotifications.push({
                      id: `${p.__backendId}-anemia`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'anemia',
                      message: `Hasil pemeriksaan HB menunjukkan Anemia (${p.pemeriksaanHB} g/dL).`,
                      createdAt: now,
                  });
              }
              
              // 4. Hypertension Risk
              if (p.kesimpulan_tensi?.includes('Hipertensi')) {
                  newNotifications.push({
                      id: `${p.__backendId}-hypertension`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'hypertension',
                      message: `Tensi ${p.tensi} (${p.kesimpulan_tensi}).`,
                      createdAt: now,
                  });
              }

              // 5. Diabetes Risk
              if (p.kesimpulan_gds?.includes('Diabetes')) {
                  newNotifications.push({
                      id: `${p.__backendId}-diabetes`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'diabetes',
                      message: `Gula darah sewaktu ${p.gds} mg/dL (${p.kesimpulan_gds}).`,
                      createdAt: now,
                  });
              }

              // 6. KEK (Chronic Energy Deficiency) for Pregnant Women
              if (p.kategori === 'ibu-hamil' && p.status_lila?.includes('KEK')) {
                   newNotifications.push({
                      id: `${p.__backendId}-kek`,
                      participantId: p.__backendId,
                      participantName: p.nama,
                      type: 'kek',
                      message: `Lingkar lengan atas (LILA) ${p.lila} cm, terindikasi KEK.`,
                      createdAt: now,
                  });
              }
          });
          return newNotifications;
      };

      if (participants.length > 0) {
          setHealthNotifications(generateNotifications(participants));
      }
  }, [participants]);

  const handleMarkNotificationsAsRead = () => {
    const allCurrentIds = new Set(healthNotifications.map(n => n.id));
    setReadNotificationIds(allCurrentIds);
    try {
        localStorage.setItem(NOTIFICATION_READ_STATUS_KEY, JSON.stringify(Array.from(allCurrentIds)));
    } catch (e) {
        console.error("Failed to save read notification statuses", e);
    }
    setShowNotificationPanel(false);
  };
  // --- END OF NOTIFICATION LOGIC ---

  // --- GLOBAL SETTINGS (LOGO & TEMPLATES) SYNC ---
  // Fetch global settings from backend on load and periodically
  const fetchGlobalSettings = useCallback(async () => {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?desa=${GLOBAL_SETTINGS_KEY}&t=${new Date().getTime()}`);
      if (response.ok) {
        const data = await response.json();
        
        // Update Custom Logo
        setCustomLogo(data?.customLogo || null);
        
        // Update Report Templates if they exist on server
        // This ensures that any device fetching this gets the synchronized templates
        if (data?.reportTemplates && Array.isArray(data.reportTemplates)) {
             setReportTemplates(data.reportTemplates);
             // Also update localStorage to keep it in sync locally
             localStorage.setItem(REPORT_TEMPLATES_KEY, JSON.stringify(data.reportTemplates));
        }
      }
    } catch (e) {
      console.error("Failed to fetch global settings", e);
    }
  }, []);

  useEffect(() => {
    fetchGlobalSettings();
    // Poll every minute to keep settings in sync across devices
    const interval = setInterval(fetchGlobalSettings, 60000);
    return () => clearInterval(interval);
  }, [fetchGlobalSettings]);

  // Unified function to save Global Settings (Logo + Templates)
  // This ensures templates created on one device are saved to the server
  const saveGlobalSettings = async (newSettings: { logo?: string | null, templates?: ReportTemplate[] }) => {
      try {
          const payload: any = {};
          // Use new values if provided, otherwise fallback to current state
          payload.customLogo = newSettings.logo !== undefined ? newSettings.logo : customLogo;
          payload.reportTemplates = newSettings.templates !== undefined ? newSettings.templates : reportTemplates;

          // The backend script needs to handle 'saveGlobalSettings' action or similar.
          // Assuming it saves whatever is in 'data' payload to the 'GLOBAL_SETTINGS' key.
          const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'saveGlobalSettings', 
                data: payload, 
                desa: GLOBAL_SETTINGS_KEY
            }),
        });

        if (!response.ok) throw new Error('Gagal menyimpan pengaturan global.');
      } catch (error) {
          console.error("Failed to save global settings:", error);
          addToast("Gagal menyinkronkan pengaturan dengan server.", "error");
          throw error; 
      }
  }

  const handleSetCustomLogo = async (logo: string | null) => {
    const oldLogo = customLogo;
    setCustomLogo(logo);
    try {
        // Save logo AND current templates to ensure full state persist
        await saveGlobalSettings({ logo, templates: reportTemplates });
        addToast('Logo berhasil diperbarui.', 'success');
    } catch (error) {
        setCustomLogo(oldLogo);
        // Error toast handled in saveGlobalSettings
    }
  };

  const handleSetProfilePic = (picDataUrl: string) => {
    if (username) {
      localStorage.setItem(`posyandu-profile-pic-${username}`, picDataUrl);
      setUserProfilePic(picDataUrl);
    }
  };

  // Modified Template Handlers to sync with backend
  const handleSaveTemplate = async (template: ReportTemplate) => {
      const newTemplates = [...reportTemplates];
      const index = newTemplates.findIndex(t => t.id === template.id);
      if (index >= 0) {
          newTemplates[index] = template;
      } else {
          newTemplates.push(template);
      }
      
      setReportTemplates(newTemplates);
      
      // If SuperAdmin, save to backend to share with others
      if (isSuperAdmin) {
        await saveGlobalSettings({ logo: customLogo, templates: newTemplates });
        addToast('Template laporan berhasil disimpan dan disinkronkan.', 'success');
      } else {
         // Local admin only saves locally (which useEffect handles via localStorage)
         addToast('Template disimpan secara lokal (Hanya Super Admin yang bisa menyimpan ke server).', 'info');
      }
      setIsTemplateManagerOpen(false);
  };

  const handleDeleteTemplate = async (id: string) => {
      const newTemplates = reportTemplates.filter(t => t.id !== id);
      setReportTemplates(newTemplates);
      
      if (isSuperAdmin) {
        await saveGlobalSettings({ logo: customLogo, templates: newTemplates });
        addToast('Template berhasil dihapus dari server.', 'success');
      } else {
          addToast('Template dihapus dari penyimpanan lokal.', 'success');
      }
  };

  // ... (Login handlers remain the same)
  const handleLogin = async (usernameInput: string, password: string): Promise<string | null> => {
    if (usernameInput.toLowerCase() === 'superadmin' && password === 'superadmin') {
        const saUsername = 'Super Admin';
        const desaToStore = 'Semua';
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userDesa', desaToStore);
        localStorage.setItem('username', saUsername);
        localStorage.setItem('isSuperAdmin', 'true');
        setIsAuthenticated(true);
        setUserDesa(desaToStore);
        setUsername(saUsername);
        setIsSuperAdmin(true);
        setIsLoginViewVisible(false);
        addToast(`Selamat datang, ${saUsername}!`, 'success');
        fetchGlobalSettings(); // Sync immediately
        return null;
    }
      
    if (usernameInput.toLowerCase() === 'admin' && password === 'admin') {
        const adminUsername = 'Admin';
        const desaToStore = 'Semua';
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userDesa', desaToStore);
        localStorage.setItem('username', adminUsername);
        localStorage.removeItem('isSuperAdmin');
        setIsAuthenticated(true);
        setUserDesa(desaToStore);
        setUsername(adminUsername);
        setIsSuperAdmin(false);
        setIsLoginViewVisible(false);
        addToast(`Selamat datang, ${adminUsername}!`, 'success');
        fetchGlobalSettings(); // Sync immediately
        return null;
    }

    // ... (Rest of login logic)
    const sheetId = '1VoG4LgtaWu1Vsp1WKAVVZ5YujdXAU7b3OEAp4DFFLQc';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Gagal mengambil data otentikasi.');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);

        const userRow = rows.find(row => {
            const [storedUsername, storedPassword] = row.split(',').map(s => s.trim().replace(/\r/g, ""));
            return storedUsername === usernameInput && storedPassword === password;
        });

        if (userRow) {
            const cols = userRow.split(',').map(s => s.trim().replace(/\r/g, ""));
            const storedUsername = cols[0];
            const storedDesa = cols[2];
            const storedPosyandu = cols[3];
            const desaToStore = storedUsername.toLowerCase() === 'puskesmas' ? 'Semua' : (storedDesa || 'Semua');
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userDesa', desaToStore);
            localStorage.setItem('username', storedUsername);
            localStorage.removeItem('isSuperAdmin');
            setIsAuthenticated(true);
            setUserDesa(desaToStore);
            setUsername(storedUsername);
            setIsSuperAdmin(false);
            setIsLoginViewVisible(false);

            addToast(`Selamat datang, ${storedUsername}!`, 'success');
            fetchGlobalSettings(); // Fetch templates for regular users too if needed

            if (storedPosyandu) {
                handleSessionSelect(storedPosyandu);
            }
            return null;
        } else {
            return 'Username atau password salah.';
        }
    } catch (error) {
        console.error('Login error:', error);
        return 'Terjadi kesalahan saat login. Periksa koneksi internet Anda.';
    }
  };

  // ... (Rest of handlers)
  const handleFamilyLogin = (nik: string, dob: string) => {
      const normalizedDob = normalizeDateString(dob);
      if (!normalizedDob) {
          addToast("Format tanggal lahir tidak valid.", "error");
          return;
      }
      const participant = participants.find(p => p.nik === nik && p.tanggal_lahir === normalizedDob);
      if (participant) {
          if (participant.kategori === 'balita') {
              setLoggedInFamilyMember(participant);
              setIsFamilyLoginModalOpen(false);
              addToast(`Selamat datang, keluarga ${participant.nama}!`, 'success');
          } else {
              addToast("Portal ini hanya tersedia untuk peserta kategori Bayi & Balita.", "error");
          }
      } else {
          addToast("Data anak tidak ditemukan. Pastikan NIK dan Tanggal Lahir benar.", "error");
      }
  };

  const handleFamilyLogout = () => {
      setLoggedInFamilyMember(null);
      addToast("Anda telah keluar dari Portal Keluarga.", "info");
  };

  const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userDesa');
      localStorage.removeItem('username');
      localStorage.removeItem('posyanduSession');
      localStorage.removeItem('isSuperAdmin');
      setIsAuthenticated(false);
      setUserDesa(null);
      setUsername(null);
      setUserProfilePic(null);
      setPosyanduSession(null);
      setIsSuperAdmin(false);
      setActiveView('home');
      addToast('Anda telah berhasil logout.', 'info');
  };

  const handleSessionSelect = (posyanduName: string) => {
    localStorage.setItem('posyanduSession', posyanduName);
    setPosyanduSession(posyanduName);
  };

  const handleAddNew = () => {
    setParticipantToEdit(null);
    setAddEditModalOpen(true);
  };
  
  const handleEdit = (participant: Participant) => {
    setParticipantToEdit(participant);
    setAddEditModalOpen(true);
  };
  
  const handleMeasure = (participant: Participant) => {
    setParticipantToMeasure(participant);
    setMeasurementModalOpen(true);
  };

  const handleServe = (participant: Participant) => {
    setParticipantToServe(participant);
    setServiceModalOpen(true);
  };
  
  const handleViewHistory = (participant: Participant) => {
    setParticipantForHistory(participant);
    setHistoryModalOpen(true);
  };

  const handleVisit = (participant: Participant) => {
    setParticipantToVisit(participant);
    setHomeVisitModalOpen(true);
  };

  const handleOpenSurvey = (participant: Participant) => {
    setParticipantToSurvey(participant);
    setSurveyModalOpen(true);
  };
  
  const handleRegisterScanned = (participantsToRegister: Partial<Participant>[]) => {
    if (participantsToRegister.length > 0) {
        setScannedParticipantsToRegister(participantsToRegister);
        setAddEditModalOpen(true);
    }
  };
  
  const handleOpenGrowthCheck = (participant: Participant) => {
    setParticipantToCheck(participant);
    setGrowthCheckModalOpen(true);
  };

  const handleConfirmGrowthCheck = async (participantId: string, checkedMilestones: Record<string, boolean>) => {
    const participant = data.participants.find(p => p.__backendId === participantId);
    if (!participant) {
        addToast("Peserta tidak ditemukan.", "error");
        setGrowthCheckModalOpen(false);
        return;
    }

    // Merge old and new history
    const newHistory = {
        ...(participant.riwayatPerkembangan || {}),
        ...checkedMilestones,
    };

    try {
        // Save the development history without triggering queue logic again
        await data.updateParticipant(participantId, { riwayatPerkembangan: newHistory }, { addToServiceQueue: false });
        
        // Now add to the queue
        data.addToQueue(participantId);
        addToast('Peserta berhasil ditambahkan ke antrian.', 'success');
    } catch (e) {
        addToast((e as Error).message, 'error');
    } finally {
        setGrowthCheckModalOpen(false);
        setParticipantToCheck(null);
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    try {
        await data.deleteParticipant(participantId);
        addToast('Data peserta berhasil dihapus.', 'success');
    } catch (error) {
        addToast(`Gagal menghapus data: ${(error as Error).message}`, 'error');
    }
  };

  const saveParticipant = async (participantData: Omit<Participant, '__backendId' | 'createdAt'>, id?: string) => {
    try {
        await data.addOrUpdateParticipant(participantData, id);
        addToast('Data peserta berhasil disimpan.', 'success');
        return true;
    } catch (error) {
        addToast(`Gagal menyimpan: ${(error as Error).message}`, 'error');
        return false;
    }
  };

  const saveMeasurement = async (participantId: string, measurementData: Partial<Participant>) => {
    try {
        await data.updateParticipant(participantId, measurementData);
        addToast('Hasil pengukuran berhasil disimpan.', 'success');
        setMeasurementModalOpen(false);
    } catch (error) {
        addToast(`Gagal menyimpan pengukuran: ${(error as Error).message}`, 'error');
    }
  };

  const saveService = async (participantId: string, serviceData: Partial<Participant>) => {
    try {
        await data.updateParticipant(participantId, serviceData, { addToServiceQueue: false });

        const movingItem = data.serviceQueue.find(p => p.__backendId === participantId);
        if (!movingItem) throw new Error("Item antrian tidak ditemukan.");
        
        data.setServiceQueue(prev => prev.map(p => 
            p.__backendId === participantId ? { ...p, ...serviceData, status: 'served' } : p
        ));
        
        const updatedParticipant = { ...movingItem, ...serviceData };
        data.setEducationQueue(prev => [...prev, { ...updatedParticipant, status: 'waiting' as const }].sort((a,b) => a.queueNumber - b.queueNumber));

        addToast('Data pelayanan berhasil disimpan.', 'success');
        setServiceModalOpen(false);
    } catch (error) {
         addToast(`Gagal menyimpan pelayanan: ${(error as Error).message}`, 'error');
    }
  };

  const saveHomeVisit = async (participantId: string, visitUpdateData: Partial<Participant>, visitRecord: HomeVisitRecord) => {
    try {
        await data.updateParticipant(participantId, { ...visitUpdateData, riwayatKunjunganRumah: [...(participantToVisit?.riwayatKunjunganRumah || []), visitRecord] }, { addToServiceQueue: false });
        addToast('Data kunjungan rumah berhasil disimpan.', 'success');
        setHomeVisitModalOpen(false);
    } catch(error) {
        addToast(`Gagal menyimpan kunjungan: ${(error as Error).message}`, 'error');
    }
  };

  const saveSurvey = async (participantId: string, surveyData: SurveiKeluarga) => {
    try {
        const { score, classification } = calculatePhbsScore(surveyData);
        await data.updateParticipant(participantId, { surveiKeluarga: surveyData, phbsScore: score, phbsClassification: classification }, { addToServiceQueue: false });
        addToast('Data survei berhasil disimpan.', 'success');
        setSurveyModalOpen(false);
    } catch(error) {
        addToast(`Gagal menyimpan survei: ${(error as Error).message}`, 'error');
    }
  };

  const handleImport = async (importedParticipants: Omit<Participant, '__backendId' | 'createdAt'>[]) => {
      try {
        for (const p of importedParticipants) {
            await data.addOrUpdateParticipant(p);
        }
        addToast(`${importedParticipants.length} data peserta berhasil diimpor.`, 'success');
        setImportModalOpen(false);
      } catch(error) {
          addToast(`Gagal mengimpor data: ${(error as Error).message}`, 'error');
      }
  };
  
  if (loggedInFamilyMember) {
      return <FamilyPortalView participant={loggedInFamilyMember} onLogout={handleFamilyLogout} customLogo={customLogo} />;
  }

  if (isLoginViewVisible) {
    return <LoginView onLogin={handleLogin} customLogo={customLogo} onCancel={() => setIsLoginViewVisible(false)} />;
  }

  if (isAuthenticated && !isAdmin && userDesa && userDesa !== 'Semua' && !posyanduSession) {
    return <PosyanduSelectionView userDesa={userDesa} onSelect={handleSessionSelect} onLogout={handleLogout} />;
  }

  if (loading && !participants.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isCollapsed={isSidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          customLogo={customLogo}
          setCustomLogo={handleSetCustomLogo}
          isAdmin={isAdmin}
          isPublicView={isPublicView}
          onContactClick={() => setContactModalOpen(true)}
          reportType={reportType}
          setReportType={setReportType}
          reportTemplates={reportTemplates}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header 
            isSidebarCollapsed={isSidebarCollapsed} 
            setSidebarCollapsed={setSidebarCollapsed}
            onLogout={handleLogout}
            username={username}
            userProfilePic={userProfilePic}
            onSetProfilePic={handleSetProfilePic}
            posyanduSession={posyanduSession}
            isPublicView={isPublicView}
            onLoginClick={() => setIsLoginViewVisible(true)}
            notificationCount={healthNotifications.filter(n => !readNotificationIds.has(n.id)).length}
            onNotificationClick={() => setShowNotificationPanel(prev => !prev)}
        />
        <main ref={mainContentRef} id="main-content" className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
            {(activeView === 'home') && <HomeView data={data} userDesa={userDesa} onFamilyPortalClick={() => setIsFamilyLoginModalOpen(true)} isPublicView={isPublicView} />}
            {!isPublicView && activeView === '1' && <RegistrationView data={data} onEdit={handleEdit} onAddNew={handleAddNew} onImport={() => setImportModalOpen(true)} onRecordVisit={handleVisit} onSurvey={handleOpenSurvey} isAdmin={isAdmin} onDelete={handleDeleteParticipant} onRegisterScanned={handleRegisterScanned} onOpenGrowthCheck={handleOpenGrowthCheck} apiKey={apiKey} />}
            {!isPublicView && activeView === '2' && <MeasurementView data={data} onMeasure={handleMeasure} />}
            {!isPublicView && activeView === '3' && <RecordingView data={data} onViewHistory={handleViewHistory} />}
            {!isPublicView && activeView === '4' && <ServiceView data={data} onServe={handleServe} />}
            {!isPublicView && activeView === '5' && <EducationView data={data} />}
            {!isPublicView && activeView === 'laporan' && (
                <ReportView 
                    data={data} 
                    isSuperAdmin={isSuperAdmin} 
                    isAdmin={isAdmin} 
                    reportType={reportType} 
                    reportTemplates={reportTemplates}
                    onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
                    userDesa={userDesa} 
                />
            )}
        </main>
        <Footer />
      </div>

      {/* Modals are rendered here... */}
      <AddEditParticipantModal isOpen={isAddEditModalOpen} onClose={() => { setAddEditModalOpen(false); setScannedParticipantsToRegister([]); }} onSave={saveParticipant} participantToEdit={participantToEdit} existingNiks={data.participants.map(p => p.nik)} userDesa={userDesa} posyanduSession={posyanduSession} initialRegistrationQueue={scannedParticipantsToRegister} />
      <MeasurementModal isOpen={isMeasurementModalOpen} onClose={() => setMeasurementModalOpen(false)} onSave={saveMeasurement} participantToMeasure={participantToMeasure} />
      <ServiceModal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)} onSave={saveService} participantToServe={participantToServe} />
      <ImportDataModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImport} existingNiks={data.participants.map(p => p.nik)} />
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} participant={participantForHistory} />
      <HomeVisitModal isOpen={isHomeVisitModalOpen} onClose={() => setHomeVisitModalOpen(false)} onSave={saveHomeVisit} participant={participantToVisit} />
      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setSurveyModalOpen(false)} onSave={saveSurvey} participant={participantToSurvey} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} />
      <NotificationPanel isOpen={showNotificationPanel} onClose={() => setShowNotificationPanel(false)} notifications={healthNotifications} readNotificationIds={readNotificationIds} onMarkAllAsRead={handleMarkNotificationsAsRead} />
      <GrowthCheckModal isOpen={isGrowthCheckModalOpen} onClose={() => setGrowthCheckModalOpen(false)} onConfirm={handleConfirmGrowthCheck} participant={participantToCheck} />
      <FamilyLoginModal isOpen={isFamilyLoginModalOpen} onClose={() => setIsFamilyLoginModalOpen(false)} onLogin={handleFamilyLogin} />
      <ReportTemplateManagerModal isOpen={isTemplateManagerOpen} onClose={() => setIsTemplateManagerOpen(false)} templates={reportTemplates} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} />
    </div>
  );
}

export default App;