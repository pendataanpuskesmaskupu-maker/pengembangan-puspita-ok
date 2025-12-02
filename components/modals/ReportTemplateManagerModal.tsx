
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { ReportTemplate, Category } from '../../types';
import { AVAILABLE_COLUMNS, AVAILABLE_INDICATORS } from '../../utils/reportDefinitions';
import { useToast } from '../../contexts/ToastContext';
import { EditIcon, TrashIcon } from '../icons';

interface ReportTemplateManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: ReportTemplate[];
    onSaveTemplate: (template: ReportTemplate) => void;
    onDeleteTemplate: (id: string) => void;
}

export const ReportTemplateManagerModal: React.FC<ReportTemplateManagerModalProps> = ({ 
    isOpen, onClose, templates, onSaveTemplate, onDeleteTemplate 
}) => {
    const { addToast } = useToast();
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
    const [editingTemplate, setEditingTemplate] = useState<Partial<ReportTemplate>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Identitas': true,
        'Pengukuran': false,
        'Pelayanan': false,
        'Survei': false,
        'Gizi Balita': true,
        'Pertumbuhan Balita': true,
        'Umum': true,
        'Penyakit Tidak Menular': true,
    });

    useEffect(() => {
        if (!isOpen) {
            setViewMode('list');
            setEditingTemplate({});
        }
    }, [isOpen]);

    const handleCreateNew = () => {
        setEditingTemplate({
            id: crypto.randomUUID(),
            name: '',
            defaultCategory: 'semua',
            format: 'detail', // Default to detail
            selectedColumns: ['nama', 'nik', 'alamat'] // Defaults
        });
        setViewMode('edit');
    };

    const handleEdit = (template: ReportTemplate) => {
        setEditingTemplate({ ...template });
        setViewMode('edit');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus template laporan ini?')) {
            onDeleteTemplate(id);
            addToast('Template berhasil dihapus', 'success');
        }
    };

    const handleSave = () => {
        if (!editingTemplate.name) {
            addToast('Nama template harus diisi', 'error');
            return;
        }
        if (!editingTemplate.selectedColumns || editingTemplate.selectedColumns.length === 0) {
            addToast('Pilih minimal satu kolom/indikator', 'error');
            return;
        }

        onSaveTemplate(editingTemplate as ReportTemplate);
        setViewMode('list');
        addToast('Template berhasil disimpan', 'success');
    };

    const toggleColumn = (colId: string) => {
        setEditingTemplate(prev => {
            const current = prev.selectedColumns || [];
            if (current.includes(colId)) {
                return { ...prev, selectedColumns: current.filter(id => id !== colId) };
            } else {
                return { ...prev, selectedColumns: [...current, colId] };
            }
        });
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const toggleSelectAllGroup = (group: string, select: boolean, sourceArray: any[]) => {
        const itemsInGroup = sourceArray.filter(c => c.group === group).map(c => c.id);
        setEditingTemplate(prev => {
            const current = new Set(prev.selectedColumns || []);
            if (select) {
                itemsInGroup.forEach(id => current.add(id));
            } else {
                itemsInGroup.forEach(id => current.delete(id));
            }
            return { ...prev, selectedColumns: Array.from(current) };
        });
    };

    const isSummary = editingTemplate.format === 'summary';
    const sourceColumns = isSummary ? AVAILABLE_INDICATORS : AVAILABLE_COLUMNS;

    const groupedColumns = sourceColumns.reduce((acc, col) => {
        if (!acc[col.group]) acc[col.group] = [];
        acc[col.group].push(col);
        return acc;
    }, {} as Record<string, typeof sourceColumns>);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manajer Template Laporan" maxWidth={viewMode === 'edit' ? "max-w-4xl" : "max-w-2xl"}>
            {viewMode === 'list' ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button 
                            onClick={handleCreateNew}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Buat Template Baru
                        </button>
                    </div>
                    
                    <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Nama Template</th>
                                    <th className="px-6 py-3">Jenis</th>
                                    <th className="px-6 py-3 hidden sm:table-cell">Kategori Filter</th>
                                    <th className="px-6 py-3 text-center">Kolom</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(template => (
                                    <tr key={template.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{template.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${template.format === 'summary' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {template.format === 'summary' ? 'Ringkas' : 'Detail'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-gray-500 capitalize">{template.defaultCategory.replace('-', ' ')}</td>
                                        <td className="px-6 py-4 text-center text-gray-500">{template.selectedColumns.length}</td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            <button onClick={() => handleEdit(template)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit">
                                                <div className="w-5 h-5"><EditIcon /></div>
                                            </button>
                                            <button onClick={() => handleDelete(template.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Hapus">
                                                <div className="w-5 h-5"><TrashIcon /></div>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {templates.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada template laporan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 border-b pb-2">Konfigurasi Umum</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 w-full sm:w-auto">
                                    <input 
                                        type="radio" 
                                        name="format" 
                                        checked={editingTemplate.format === 'detail'} 
                                        onChange={() => setEditingTemplate(prev => ({ ...prev, format: 'detail', selectedColumns: [] }))}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Laporan Detail</span>
                                        <span className="block text-xs text-gray-500">Data per individu (baris = peserta)</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 w-full sm:w-auto">
                                    <input 
                                        type="radio" 
                                        name="format" 
                                        checked={editingTemplate.format === 'summary'} 
                                        onChange={() => setEditingTemplate(prev => ({ ...prev, format: 'summary', selectedColumns: [] }))}
                                        className="h-4 w-4 text-purple-600"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Laporan Ringkas</span>
                                        <span className="block text-xs text-gray-500">Rekapitulasi per Posyandu (baris = posyandu)</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Template</label>
                                <input 
                                    type="text" 
                                    value={editingTemplate.name} 
                                    onChange={e => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={isSummary ? "Contoh: Rekap Gizi Bulanan" : "Contoh: Laporan Bulanan Gizi"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori Filter Default</label>
                                <select 
                                    value={editingTemplate.defaultCategory}
                                    onChange={e => setEditingTemplate(prev => ({ ...prev, defaultCategory: e.target.value as any }))}
                                    className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="semua">Semua Kategori</option>
                                    <option value="balita">Balita</option>
                                    <option value="ibu-hamil">Ibu Hamil</option>
                                    <option value="anak-remaja">Anak & Remaja</option>
                                    <option value="dewasa">Dewasa</option>
                                    <option value="lansia">Lansia</option>
                                    <option value="ptm">PTM (Dewasa & Lansia)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Laporan akan otomatis memfilter data sesuai kategori ini saat dibuka.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className={`p-3 font-semibold text-white border-b ${isSummary ? 'bg-purple-600' : 'bg-blue-600'}`}>
                            {isSummary ? 'Pilih Indikator Rekapitulasi' : 'Pilih Kolom Data'}
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-50 space-y-4">
                            {Object.entries(groupedColumns).map(([group, items]) => (
                                <div key={group} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                    <div 
                                        className="p-3 bg-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => toggleGroup(group)}
                                    >
                                        <h4 className="font-semibold text-gray-800">{group}</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs space-x-2" onClick={e => e.stopPropagation()}>
                                                <button type="button" onClick={() => toggleSelectAllGroup(group, true, sourceColumns)} className="text-blue-600 hover:underline">Pilih Semua</button>
                                                <span className="text-gray-300">|</span>
                                                <button type="button" onClick={() => toggleSelectAllGroup(group, false, sourceColumns)} className="text-gray-500 hover:underline">Hapus Semua</button>
                                            </div>
                                            <svg className={`w-5 h-5 transition-transform ${expandedGroups[group] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    {expandedGroups[group] && (
                                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {items.map(col => (
                                                <label key={col.id} className={`flex items-start gap-2 p-2 rounded cursor-pointer ${isSummary ? 'hover:bg-purple-50' : 'hover:bg-blue-50'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={editingTemplate.selectedColumns?.includes(col.id)} 
                                                        onChange={() => toggleColumn(col.id)}
                                                        className={`mt-1 h-4 w-4 rounded border-gray-300 ${isSummary ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'}`}
                                                    />
                                                    <span className="text-sm text-gray-700 leading-tight">{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Template</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
