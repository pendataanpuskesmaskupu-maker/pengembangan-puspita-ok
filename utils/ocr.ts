import { GoogleGenAI } from "@google/genai";
import type { Participant } from '../types';

// The function now accepts the API key as a parameter
export const extractIdentityData = async (base64Image: string, mimeType: string, apiKey: string): Promise<Partial<Participant>[]> => {
    if (!apiKey) {
        throw new Error("API Key tidak ditemukan.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Analisis gambar dokumen kependudukan Indonesia ini. Dokumen bisa berupa KTP, KIA, atau Kartu Keluarga (KK).
    
    Instruksi Khusus:
    1. Kembalikan data dalam bentuk ARRAY of Objects (JSON Array).
    2. Jika KTP/KIA: Array berisi 1 objek data pemegang kartu.
    3. Jika Kartu Keluarga (KK): 
       - Ekstrak SEMUA anggota keluarga yang terdaftar dalam tabel.
       - Ambil RT dan RW dari bagian kop/atas dokumen KK dan terapkan ke setiap anggota keluarga.
    
    Kunci JSON untuk setiap objek:
    - nik (string, harus 16 digit angka)
    - nama (string, nama lengkap, hapus gelar jika ada)
    - tanggal_lahir (string, format YYYY-MM-DD)
    - jenis_kelamin (string, tepat "Laki-laki" atau "Perempuan")
    - rt (string, ambil angkanya saja, contoh "001")
    - rw (string, ambil angkanya saja, contoh "002")

    Contoh Output JSON:
    [
      { "nik": "123...", "nama": "Budi", ... },
      { "nik": "456...", "nama": "Siti", ... }
    ]

    Kembalikan HANYA JSON valid tanpa markdown formatting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                temperature: 0.1,
            }
        });

        const textResponse = response.text;
        if (!textResponse) return [];

        // Clean up markdown code blocks if present
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON:", jsonString);
            return [];
        }

        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [data];

        return dataArray.map((item: any) => ({
            nik: item.nik || '',
            nama: item.nama || '',
            tanggal_lahir: item.tanggal_lahir || '',
            jenis_kelamin: item.jenis_kelamin === 'Laki-laki' || item.jenis_kelamin === 'Perempuan' ? item.jenis_kelamin : 'Laki-laki',
            rt: item.rt || '',
            rw: item.rw || '',
        }));

    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Gagal memproses gambar. Silakan coba lagi atau isi manual.");
    }
};