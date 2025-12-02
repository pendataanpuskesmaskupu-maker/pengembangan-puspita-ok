import React, { useState, useMemo, useEffect } from 'react';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import type { Category, Participant, ReportType, ReportTemplate, Desa } from '../../types';
import { getCategoryLabel, formatDate, generateParticipantReportHTML, calculateAgeInMonths } from '../../utils/helpers';
import { AVAILABLE_COLUMNS, AVAILABLE_INDICATORS, getColumnValue, checkIndicator, AGE_GROUPS } from '../../utils/reportDefinitions';
import { DownloadIcon, EditIcon } from '../icons';
import { useToast } from '../../contexts/ToastContext';

interface ReportViewProps {
  data: UsePosyanduDataResult;
  isSuperAdmin: boolean;
  isAdmin?: boolean; 
  reportType: ReportType;
  reportTemplates: ReportTemplate[];
  onOpenTemplateManager: () => void;
  userDesa?: string | null;
}

const StatCard: React.FC<{ value: string | number; label: string; color: string }> = ({ value, label, color }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl shadow-lg border border-${color}-200 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
        <div className={`text-4xl font-bold text-${color}-600 mb-2`}>{value}</div>
        <div className={`text-sm text-${color}-800 font-medium tracking-wide`}>{label}</div>
    </div>
);

// Hardcoded Desa list for filter
const desaOptions: Desa[] = ['Kupu', 'Ketanggungan', 'Lawatan', 'Pengarasan', 'Sidakaton', 'Sidapurna', 'Dukuhturi'];

export const ReportView: React.FC<ReportViewProps> = ({ data, isSuperAdmin, isAdmin, reportType, reportTemplates, onOpenTemplateManager, userDesa }) => {
    const { participants } = data;
    const { addToast } = useToast();
    
    // Determine if user has global access (Admin or SuperAdmin)
    // 'Semua' access means they can see all villages and filter between them.
    const hasGlobalAccess = isSuperAdmin || !!isAdmin || (userDesa && userDesa.toLowerCase() === 'semua');

    // Only Super Admin can manage templates.
    const canManageTemplates = isSuperAdmin;

    // State for filters
    // If global access, default to 'semua'. Otherwise enforce user's desa.
    const [selectedDesa, setSelectedDesa] = useState<string>(hasGlobalAccess ? 'semua' : (userDesa || 'semua'));
    const [selectedPosyandu, setSelectedPosyandu] = useState<string>('semua');
    const [selectedMonth, setSelectedMonth] = useState<string>('semua');
    
    // Internal state for category filtering based on template
    const [templateCategory, setTemplateCategory] = useState<Category | 'semua' | 'ptm'>('semua');

    // Effect to enforce desa selection logic when user role/desa changes
    useEffect(() => {
        if (!hasGlobalAccess && userDesa) {
            // If not global admin, force selection to their assigned desa
            setSelectedDesa(userDesa);
        } else if (hasGlobalAccess) {
            // If global admin, ensure state is valid.
            if (!selectedDesa || (selectedDesa !== 'semua' && !desaOptions.includes(selectedDesa as Desa))) {
                 setSelectedDesa('semua');
            }
        }
    }, [userDesa, hasGlobalAccess]);

    // Determine the effective desa to filter by
    const effectiveDesaFilter = hasGlobalAccess ? selectedDesa : (userDesa || 'semua');

    // Smart Template Logic
    useEffect(() => {
        if (reportType === 'individual') {
            setTemplateCategory('balita');
            return;
        }

        const currentTemplate = reportTemplates.find(t => t.id === reportType);
        if (currentTemplate) {
            setTemplateCategory(currentTemplate.defaultCategory);
        } else {
            setTemplateCategory('semua');
        }
    }, [reportType, reportTemplates]);

    const reportTitle = useMemo(() => {
        if (reportType === 'individual') return 'Laporan Individual Anak';
        const currentTemplate = reportTemplates.find(t => t.id === reportType);
        return currentTemplate ? currentTemplate.name : 'Laporan Posyandu';
    }, [reportType, reportTemplates]);

    const availableMonths = useMemo(() => {
        const monthSet = new Set<string>();
        participants.forEach(p => {
            if (p.tanggal_pelayanan) {
                monthSet.add(p.tanggal_pelayanan.substring(0, 7));
            }
            p.riwayatPengukuran.forEach(r => {
                if (r.tanggal_pengukuran) {
                    monthSet.add(r.tanggal_pengukuran.substring(0, 7)); // YYYY-MM
                }
            });
             p.riwayatKunjunganRumah.forEach(r => {
                if (r.tanggal_kunjungan) {
                    monthSet.add(r.tanggal_kunjungan.substring(0, 7));
                }
            });
        });
        return Array.from(monthSet).sort().reverse();
    }, [participants]);

    const availablePosyandus = useMemo(() => {
        const posyanduSet = new Set<string>();
        participants.forEach(p => {
            // Filter available posyandus based on effectiveDesaFilter
            if (effectiveDesaFilter && effectiveDesaFilter.toLowerCase() !== 'semua') {
                if (p.alamat === effectiveDesaFilter && p.nama_posyandu) {
                    posyanduSet.add(p.nama_posyandu);
                }
            } else {
                // If 'semua' desa is selected (or implicit for admin seeing all), show all posyandus
                if (p.nama_posyandu) {
                    posyanduSet.add(p.nama_posyandu);
                }
            }
        });
        return Array.from(posyanduSet).sort();
    }, [participants, effectiveDesaFilter]);
    
    const filteredData = useMemo(() => {
        const lowercasedSelectedPosyandu = selectedPosyandu.toLowerCase();
        
        return participants.filter(p => {
            // 1. Filter by Template Category
            let categoryMatch = false;
            if (templateCategory === 'semua') {
                categoryMatch = true;
            } else if (templateCategory === 'ptm') {
                categoryMatch = p.kategori === 'dewasa' || p.kategori === 'lansia';
            } else {
                categoryMatch = p.kategori === templateCategory;
            }
            if (!categoryMatch) return false;

            // 2. Filter by Desa (using effective filter)
            if (effectiveDesaFilter && effectiveDesaFilter.toLowerCase() !== 'semua') {
                 if (p.alamat !== effectiveDesaFilter) return false;
            }

            // 3. Filter by Posyandu (Applies to ALL users now if selected)
            if (selectedPosyandu !== 'semua') {
                const posyanduMatch = p.nama_posyandu?.toLowerCase() === lowercasedSelectedPosyandu;
                if (!posyanduMatch) return false;
            }

            // 4. Filter by Month
            const monthMatch = selectedMonth === 'semua' || 
                p.riwayatPengukuran.some(r => r.tanggal_pengukuran?.startsWith(selectedMonth)) ||
                p.riwayatKunjunganRumah.some(r => r.tanggal_kunjungan?.startsWith(selectedMonth)) ||
                p.tanggal_pelayanan?.startsWith(selectedMonth);
            if (!monthMatch) return false;
            
            return true;
        });
    }, [participants, templateCategory, selectedPosyandu, selectedMonth, effectiveDesaFilter]);

    const totalParticipantsInFilter = filteredData.length;
    
    const totalServedInFilter = useMemo(() => {
        return filteredData.filter(p => {
            if (selectedMonth === 'semua') {
                return !!p.tanggal_pelayanan;
            }
            return p.tanggal_pelayanan?.startsWith(selectedMonth);
        }).length;
    }, [filteredData, selectedMonth]);


    const handleDownload = () => {
        if (filteredData.length === 0) {
            addToast("Tidak ada data untuk diunduh dengan filter yang dipilih.", "info");
            return;
        }

        const currentTemplate = reportTemplates.find(t => t.id === reportType);
        const format = currentTemplate?.format || 'detail';
        const isSummary = format === 'summary';

        // Prepare Data based on Month Filter
        const participantsForReport = filteredData.map(p => {
            if (selectedMonth !== 'semua') {
                const recordForMonth = [...(p.riwayatPengukuran || [])]
                    .filter(r => r.tanggal_pengukuran && r.tanggal_pengukuran.startsWith(selectedMonth))
                    .sort((a, b) => new Date(b.tanggal_pengukuran).getTime() - new Date(a.tanggal_pengukuran).getTime())[0];

                if (recordForMonth) {
                    return {
                        ...p, 
                        ...recordForMonth, 
                        tanggal_pengukuran: recordForMonth.tanggal_pengukuran,
                        tanggal_pelayanan: recordForMonth.tanggal_pengukuran, 
                    };
                }
            }
            return p;
        });

        let tableHtml = '';

        if (isSummary) {
            // --- SUMMARY REPORT GENERATION ---
            const columnsToExport = currentTemplate 
                ? AVAILABLE_INDICATORS.filter(c => currentTemplate.selectedColumns.includes(c.id))
                : AVAILABLE_INDICATORS;

            if (reportType === 'gizi') {
                // --- GIZI SUMMARY (COMPLEX HEADER) ---
                const groupedData: Record<string, Record<string, Record<string, { L: number; P: number }>>> = {};
                const posyanduList = Array.from(new Set(participantsForReport.map(p => p.nama_posyandu || 'Tidak Diketahui'))).sort();

                posyanduList.forEach(pos => {
                    groupedData[pos] = {};
                    columnsToExport.forEach(col => {
                        groupedData[pos][col.id] = {};
                        AGE_GROUPS.forEach(ageGroup => {
                            groupedData[pos][col.id][ageGroup.label] = { L: 0, P: 0 };
                        });
                    });
                });

                participantsForReport.forEach(p => {
                    const posyandu = p.nama_posyandu || 'Tidak Diketahui';
                    const ageInMonths = calculateAgeInMonths(p.tanggal_lahir, p.tanggal_pengukuran);
                    const ageGroup = AGE_GROUPS.find(g => Math.floor(ageInMonths) >= g.min && Math.floor(ageInMonths) <= g.max);
                    if (!ageGroup) return;

                    columnsToExport.forEach(col => {
                        if (checkIndicator(p, col.id)) {
                            if (p.jenis_kelamin === 'Laki-laki') {
                                groupedData[posyandu][col.id][ageGroup.label].L++;
                            } else {
                                groupedData[posyandu][col.id][ageGroup.label].P++;
                            }
                        }
                    });
                });

                tableHtml = `<table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr style="background-color: #f2f2f2; font-weight: bold;">
                            <th rowspan="3" style="vertical-align: middle; padding: 5px;">Nama Posyandu</th>
                            ${columnsToExport.map(col => `<th colspan="${(AGE_GROUPS.length + 1) * 3}" style="padding: 5px;">${col.label}</th>`).join('')}
                        </tr>
                        <tr style="background-color: #e5e7eb; font-weight: bold;">
                            ${columnsToExport.map(() => 
                                AGE_GROUPS.map(ag => `<th colspan="3" style="padding: 5px;">${ag.label}</th>`).join('') +
                                `<th colspan="3" style="background-color: #d1d5db; padding: 5px;">Total</th>`
                            ).join('')}
                        </tr>
                        <tr style="background-color: #f2f2f2; font-weight: bold;">
                            ${columnsToExport.map(() => 
                                AGE_GROUPS.map(() => `<th style="padding: 5px; min-width: 30px;">L</th><th style="padding: 5px; min-width: 30px;">P</th><th style="padding: 5px; min-width: 40px;">Jml</th>`).join('') +
                                `<th style="padding: 5px; background-color: #e5e7eb;">L</th><th style="padding: 5px; background-color: #e5e7eb;">P</th><th style="padding: 5px; background-color: #d1d5db;">Total</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${posyanduList.map(posyandu => `
                            <tr>
                                <td style="padding: 5px;">${posyandu}</td>
                                ${columnsToExport.map(col => {
                                    let rowTotalL = 0;
                                    let rowTotalP = 0;
                                    const cells = AGE_GROUPS.map(ag => {
                                        const counts = groupedData[posyandu][col.id][ag.label];
                                        rowTotalL += counts.L;
                                        rowTotalP += counts.P;
                                        return `<td style="padding: 5px;">${counts.L}</td><td style="padding: 5px;">${counts.P}</td><td style="padding: 5px; font-weight: bold; background-color: #f9fafb;">${counts.L + counts.P}</td>`;
                                    }).join('');
                                    const totalCell = `<td style="padding: 5px; font-weight: bold; background-color: #e5e7eb;">${rowTotalL}</td><td style="padding: 5px; font-weight: bold; background-color: #e5e7eb;">${rowTotalP}</td><td style="padding: 5px; font-weight: bold; background-color: #d1d5db;">${rowTotalL + rowTotalP}</td>`;
                                    return cells + totalCell;
                                }).join('')}
                            </tr>
                        `).join('')}
                        <tr style="background-color: #e5e7eb; font-weight: bold;">
                            <td style="padding: 5px;">TOTAL</td>
                            ${columnsToExport.map(col => {
                                let grandTotalL = 0;
                                let grandTotalP = 0;
                                const footerCells = AGE_GROUPS.map(ag => {
                                    const totalL = posyanduList.reduce((acc, pos) => acc + groupedData[pos][col.id][ag.label].L, 0);
                                    const totalP = posyanduList.reduce((acc, pos) => acc + groupedData[pos][col.id][ag.label].P, 0);
                                    grandTotalL += totalL;
                                    grandTotalP += totalP;
                                    return `<td style="padding: 5px;">${totalL}</td><td style="padding: 5px;">${totalP}</td><td style="padding: 5px;">${totalL + totalP}</td>`;
                                }).join('');
                                const footerTotalCell = `<td style="padding: 5px; background-color: #d1d5db;">${grandTotalL}</td><td style="padding: 5px; background-color: #d1d5db;">${grandTotalP}</td><td style="padding: 5px; background-color: #9ca3af;">${grandTotalL + grandTotalP}</td>`;
                                return footerCells + footerTotalCell;
                            }).join('')}
                        </tr>
                    </tbody>
                </table>`;

            } else {
                // --- STANDARD SUMMARY (SIMPLE HEADER) ---
                const groupedData: Record<string, { L: number; P: number }[]> = {};
                const posyanduList = Array.from(new Set(participantsForReport.map(p => p.nama_posyandu || 'Tidak Diketahui'))).sort();

                posyanduList.forEach(posyandu => {
                    const partsInPosyandu = participantsForReport.filter(p => (p.nama_posyandu || 'Tidak Diketahui') === posyandu);
                    const counts = columnsToExport.map(col => {
                        const lCount = partsInPosyandu.filter(p => p.jenis_kelamin === 'Laki-laki' && checkIndicator(p, col.id)).length;
                        const pCount = partsInPosyandu.filter(p => p.jenis_kelamin === 'Perempuan' && checkIndicator(p, col.id)).length;
                        return { L: lCount, P: pCount };
                    });
                    groupedData[posyandu] = counts;
                });

                tableHtml = `<table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr style="background-color: #f2f2f2; font-weight: bold;">
                            <th rowspan="2" style="vertical-align: middle; padding: 5px;">Nama Posyandu</th>
                            ${columnsToExport.map(col => `<th colspan="3" style="padding: 5px;">${col.label}</th>`).join('')}
                        </tr>
                        <tr style="background-color: #f2f2f2; font-weight: bold;">
                            ${columnsToExport.map(() => `<th style="padding: 5px;">L</th><th style="padding: 5px;">P</th><th style="padding: 5px;">Total</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${posyanduList.map(posyandu => `
                            <tr>
                                <td style="padding: 5px;">${posyandu}</td>
                                ${groupedData[posyandu].map(count => `<td style="padding: 5px;">${count.L}</td><td style="padding: 5px;">${count.P}</td><td style="padding: 5px; font-weight: bold;">${count.L + count.P}</td>`).join('')}
                            </tr>
                        `).join('')}
                        <tr style="background-color: #e5e7eb; font-weight: bold;">
                            <td style="padding: 5px;">TOTAL</td>
                            ${columnsToExport.map((_, i) => {
                                const totalL = posyanduList.reduce((acc, pos) => acc + groupedData[pos][i].L, 0);
                                const totalP = posyanduList.reduce((acc, pos) => acc + groupedData[pos][i].P, 0);
                                return `<td style="padding: 5px;">${totalL}</td><td style="padding: 5px;">${totalP}</td><td style="padding: 5px;">${totalL + totalP}</td>`;
                            }).join('')}
                        </tr>
                    </tbody>
                </table>`;
            }

        } else {
            // --- DETAILED REPORT GENERATION (EXISTING LOGIC) ---
            const columnsToExport = currentTemplate 
                ? AVAILABLE_COLUMNS.filter(c => currentTemplate.selectedColumns.includes(c.id))
                : AVAILABLE_COLUMNS;

            tableHtml = `<table border="1">
                <thead>
                    <tr style="background-color: #f2f2f2; font-weight: bold;">
                        ${columnsToExport.map(col => `<th>${col.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${participantsForReport.map(p => `
                        <tr>
                            ${columnsToExport.map(col => {
                                const val = getColumnValue(p, col.id);
                                if (col.id === 'nik' || col.id.includes('nomorKartu')) {
                                    return `<td style="mso-number-format:'\\@'">${val}</td>`;
                                }
                                return `<td>${val}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
        }

        const template = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Laporan PUSPITA</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
            </head>
            <body>
                ${tableHtml}
            </body>
            </html>
        `;

        const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `laporan_puspita_${reportType}_${new Date().toISOString().slice(0,10)}.xls`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        addToast("Laporan sedang diunduh...", "success");
    };
    
    const handleDownloadIndividualReport = (participant: Participant) => {
        if (participant) {
            const reportHtml = generateParticipantReportHTML(participant);
            const reportWindow = window.open('', '_blank');
            if (reportWindow) {
                reportWindow.document.write(reportHtml);
                reportWindow.document.close();
                setTimeout(() => reportWindow.print(), 500);
            } else {
                addToast("Gagal membuka jendela baru. Mohon izinkan pop-up untuk situs ini.", "error");
            }
        }
    };

    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{reportTitle}</h3>
                            <p className="text-gray-600 mt-1 text-sm md:text-base">Filter dan unduh data kegiatan posyandu.</p>
                        </div>
                    </div>
                    {/* BUTTON FOR TEMPLATE MANAGER - ONLY VISIBLE TO SUPER ADMIN */}
                    {canManageTemplates && (
                        <button
                            onClick={onOpenTemplateManager}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <div className="w-5 h-5"><EditIcon /></div>
                            Atur Template Laporan
                        </button>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Filter Data</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Filter Desa: Visible for Admin & SuperAdmin */}
                        {hasGlobalAccess && (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Filter Desa</label>
                                <select value={selectedDesa} onChange={e => setSelectedDesa(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md bg-white shadow-sm text-gray-900">
                                    <option value="semua">Semua Desa</option>
                                    {desaOptions.map(desa => <option key={desa} value={desa}>{desa}</option>)}
                                </select>
                            </div>
                        )}
                        
                        {/* Filter Posyandu: Visible for ALL, but options depend on selected/assigned Desa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Filter Posyandu</label>
                            <select value={selectedPosyandu} onChange={e => setSelectedPosyandu(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md bg-white shadow-sm text-gray-900">
                                <option value="semua">Semua Posyandu</option>
                                {availablePosyandus.map(posyandu => <option key={posyandu} value={posyandu}>{posyandu}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Filter Bulan</label>
                            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md bg-white shadow-sm text-gray-900">
                                <option value="semua">Semua Bulan</option>
                                {availableMonths.map(month => <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-end">
                            <button onClick={handleDownload} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-px">
                                <div className="w-5 h-5 mr-2"><DownloadIcon /></div>
                                Download Excel
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatCard value={totalParticipantsInFilter} label="Total Data Peserta (Filter)" color="blue" />
                    <StatCard value={totalServedInFilter} label="Total Dilayani Sesuai Filter Bulan" color="green" />
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 p-4 bg-gray-50 border-b">Data Peserta Sesuai Filter</h4>
                    <div className="overflow-x-auto max-h-[50vh]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-600">Nama</th>
                                    <th className="p-3 text-left font-semibold text-gray-600 hidden sm:table-cell">NIK</th>
                                    <th className="p-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Kategori</th>
                                    <th className="p-3 text-left font-semibold text-gray-600 hidden md:table-cell">Tgl Lahir</th>
                                    <th className="p-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Alamat</th>
                                    <th className="p-3 text-left font-semibold text-gray-600">Tgl Pelayanan</th>
                                    <th className="p-3 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? filteredData.map(p => (
                                    <tr key={p.__backendId} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-900">{p.nama}</td>
                                        <td className="p-3 font-mono text-gray-900 hidden sm:table-cell">{p.nik}</td>
                                        <td className="p-3 text-gray-600 hidden sm:table-cell">{getCategoryLabel(p.kategori)}</td>
                                        <td className="p-3 text-gray-600 hidden md:table-cell">{formatDate(p.tanggal_lahir)}</td>
                                        <td className="p-3 text-gray-600 hidden lg:table-cell">{`${p.alamat}, RT ${p.rt}/${p.rw}`}</td>
                                        <td className="p-3 text-gray-600">{p.tanggal_pelayanan ? formatDate(p.tanggal_pelayanan) : '-'}</td>
                                        <td className="p-3 text-center">
                                            {(p.kategori === 'balita' || reportType === 'individual') && (
                                                <button
                                                    onClick={() => handleDownloadIndividualReport(p)}
                                                    className="inline-flex items-center justify-center gap-1 text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                    title={`Download laporan riwayat untuk ${p.nama}`}
                                                >
                                                    <div className="w-4 h-4"><DownloadIcon /></div>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center p-8 text-gray-500">
                                            Tidak ada data yang cocok dengan filter yang dipilih.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};