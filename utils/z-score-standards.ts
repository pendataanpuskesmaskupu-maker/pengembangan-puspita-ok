// Data referensi Z-score WHO untuk anak 0-60 bulan (Permenkes No. 2 Tahun 2020)
// Kunci objek adalah bulan (untuk WFA/HFA) atau cm (untuk WFH/WFL)
// sd3neg = -3 SD, sd2neg = -2 SD, sd1neg = -1 SD, sd0 = Median, sd1 = +1 SD, sd2 = +2 SD, sd3 = +3 SD

type ZScoreData = { [key: number]: { sd3neg: number; sd2neg: number; sd1neg: number; sd0: number; sd1: number; sd2: number; sd3: number; } };

// --- Weight-for-Age (BB/U) ---
export const wfaBoys: ZScoreData = {
    0: { sd3neg: 2.1, sd2neg: 2.5, sd1neg: 2.9, sd0: 3.3, sd1: 3.9, sd2: 4.4, sd3: 5.0 },
    1: { sd3neg: 3.2, sd2neg: 3.6, sd1neg: 4.0, sd0: 4.5, sd1: 5.1, sd2: 5.8, sd3: 6.6 },
    2: { sd3neg: 4.1, sd2neg: 4.5, sd1neg: 5.0, sd0: 5.6, sd1: 6.3, sd2: 7.1, sd3: 8.0 },
    3: { sd3neg: 4.8, sd2neg: 5.2, sd1neg: 5.7, sd0: 6.4, sd1: 7.2, sd2: 8.0, sd3: 9.0 },
    4: { sd3neg: 5.3, sd2neg: 5.7, sd1neg: 6.3, sd0: 7.0, sd1: 7.8, sd2: 8.7, sd3: 9.7 },
    5: { sd3neg: 5.7, sd2neg: 6.2, sd1neg: 6.8, sd0: 7.5, sd1: 8.4, sd2: 9.3, sd3: 10.4 },
    6: { sd3neg: 6.0, sd2neg: 6.5, sd1neg: 7.2, sd0: 7.9, sd1: 8.8, sd2: 9.8, sd3: 11.0 },
    7: { sd3neg: 6.3, sd2neg: 6.8, sd1neg: 7.5, sd0: 8.3, sd1: 9.2, sd2: 10.3, sd3: 11.5 },
    8: { sd3neg: 6.6, sd2neg: 7.1, sd1neg: 7.8, sd0: 8.6, sd1: 9.6, sd2: 10.7, sd3: 12.0 },
    9: { sd3neg: 6.8, sd2neg: 7.3, sd1neg: 8.1, sd0: 9.0, sd1: 10.0, sd2: 11.1, sd3: 12.5 },
    10: { sd3neg: 7.0, sd2neg: 7.6, sd1neg: 8.4, sd0: 9.3, sd1: 10.4, sd2: 11.5, sd3: 12.9 },
    11: { sd3neg: 7.2, sd2neg: 7.8, sd1neg: 8.6, sd0: 9.6, sd1: 10.7, sd2: 11.9, sd3: 13.3 },
    12: { sd3neg: 7.4, sd2neg: 8.0, sd1neg: 8.9, sd0: 9.9, sd1: 11.0, sd2: 12.3, sd3: 13.7 },
    13: { sd3neg: 7.6, sd2neg: 8.2, sd1neg: 9.1, sd0: 10.1, sd1: 11.3, sd2: 12.6, sd3: 14.1 },
    14: { sd3neg: 7.8, sd2neg: 8.4, sd1neg: 9.3, sd0: 10.3, sd1: 11.6, sd2: 12.9, sd3: 14.5 },
    15: { sd3neg: 8.0, sd2neg: 8.6, sd1neg: 9.6, sd0: 10.6, sd1: 11.8, sd2: 13.2, sd3: 14.8 },
    16: { sd3neg: 8.1, sd2neg: 8.8, sd1neg: 9.8, sd0: 10.8, sd1: 12.1, sd2: 13.5, sd3: 15.2 },
    17: { sd3neg: 8.3, sd2neg: 9.0, sd1neg: 10.0, sd0: 11.1, sd1: 12.4, sd2: 13.8, sd3: 15.5 },
    18: { sd3neg: 8.5, sd2neg: 9.2, sd1neg: 10.2, sd0: 11.3, sd1: 12.6, sd2: 14.1, sd3: 15.9 },
    19: { sd3neg: 8.7, sd2neg: 9.4, sd1neg: 10.4, sd0: 11.5, sd1: 12.9, sd2: 14.4, sd3: 16.2 },
    20: { sd3neg: 8.8, sd2neg: 9.6, sd1neg: 10.6, sd0: 11.8, sd1: 13.2, sd2: 14.7, sd3: 16.6 },
    21: { sd3neg: 9.0, sd2neg: 9.8, sd1neg: 10.9, sd0: 12.0, sd1: 13.4, sd2: 15.0, sd3: 16.9 },
    22: { sd3neg: 9.2, sd2neg: 10.0, sd1neg: 11.1, sd0: 12.3, sd1: 13.7, sd2: 15.3, sd3: 17.2 },
    23: { sd3neg: 9.4, sd2neg: 10.2, sd1neg: 11.3, sd0: 12.5, sd1: 14.0, sd2: 15.6, sd3: 17.6 },
    24: { sd3neg: 9.5, sd2neg: 10.4, sd1neg: 11.5, sd0: 12.8, sd1: 14.3, sd2: 15.9, sd3: 17.9 },
    30: { sd3neg: 10.5, sd2neg: 11.4, sd1neg: 12.7, sd0: 14.1, sd1: 15.7, sd2: 17.5, sd3: 19.6 },
    36: { sd3neg: 11.3, sd2neg: 12.3, sd1neg: 13.7, sd0: 15.2, sd1: 17.0, sd2: 18.9, sd3: 21.1 },
    42: { sd3neg: 12.1, sd2neg: 13.2, sd1neg: 14.6, sd0: 16.3, sd1: 18.2, sd2: 20.3, sd3: 22.7 },
    48: { sd3neg: 12.8, sd2neg: 14.0, sd1neg: 15.5, sd0: 17.3, sd1: 19.3, sd2: 21.6, sd3: 24.2 },
    54: { sd3neg: 13.5, sd2neg: 14.8, sd1neg: 16.4, sd0: 18.3, sd1: 20.4, sd2: 22.8, sd3: 25.6 },
    60: { sd3neg: 14.1, sd2neg: 15.5, sd1neg: 17.2, sd0: 19.2, sd1: 21.5, sd2: 24.0, sd3: 27.0 }
};

export const wfaGirls: ZScoreData = {
    0: { sd3neg: 2.0, sd2neg: 2.4, sd1neg: 2.8, sd0: 3.2, sd1: 3.7, sd2: 4.2, sd3: 4.8 },
    1: { sd3neg: 2.9, sd2neg: 3.2, sd1neg: 3.6, sd0: 4.2, sd1: 4.8, sd2: 5.5, sd3: 6.2 },
    2: { sd3neg: 3.6, sd2neg: 4.0, sd1neg: 4.5, sd0: 5.1, sd1: 5.8, sd2: 6.6, sd3: 7.5 },
    3: { sd3neg: 4.2, sd2neg: 4.6, sd1neg: 5.1, sd0: 5.8, sd1: 6.6, sd2: 7.5, sd3: 8.5 },
    4: { sd3neg: 4.7, sd2neg: 5.1, sd1neg: 5.6, sd0: 6.4, sd1: 7.3, sd2: 8.2, sd3: 9.3 },
    5: { sd3neg: 5.0, sd2neg: 5.5, sd1neg: 6.1, sd0: 6.9, sd1: 7.8, sd2: 8.8, sd3: 10.0 },
    6: { sd3neg: 5.4, sd2neg: 5.8, sd1neg: 6.5, sd0: 7.3, sd1: 8.3, sd2: 9.3, sd3: 10.6 },
    7: { sd3neg: 5.6, sd2neg: 6.1, sd1neg: 6.8, sd0: 7.6, sd1: 8.7, sd2: 9.8, sd3: 11.1 },
    8: { sd3neg: 5.9, sd2neg: 6.4, sd1neg: 7.1, sd0: 8.0, sd1: 9.0, sd2: 10.2, sd3: 11.6 },
    9: { sd3neg: 6.1, sd2neg: 6.6, sd1neg: 7.3, sd0: 8.2, sd1: 9.3, sd2: 10.5, sd3: 12.0 },
    10: { sd3neg: 6.3, sd2neg: 6.8, sd1neg: 7.6, sd0: 8.5, sd1: 9.6, sd2: 10.9, sd3: 12.4 },
    11: { sd3neg: 6.5, sd2neg: 7.0, sd1neg: 7.8, sd0: 8.7, sd1: 9.9, sd2: 11.2, sd3: 12.8 },
    12: { sd3neg: 6.6, sd2neg: 7.2, sd1neg: 8.0, sd0: 9.0, sd1: 10.2, sd2: 11.5, sd3: 13.1 },
    13: { sd3neg: 6.8, sd2neg: 7.4, sd1neg: 8.2, sd0: 9.2, sd1: 10.4, sd2: 11.8, sd3: 13.5 },
    14: { sd3neg: 7.0, sd2neg: 7.6, sd1neg: 8.4, sd0: 9.4, sd1: 10.7, sd2: 12.1, sd3: 13.8 },
    15: { sd3neg: 7.2, sd2neg: 7.8, sd1neg: 8.6, sd0: 9.7, sd1: 10.9, sd2: 12.4, sd3: 14.1 },
    16: { sd3neg: 7.3, sd2neg: 8.0, sd1neg: 8.8, sd0: 9.9, sd1: 11.2, sd2: 12.7, sd3: 14.5 },
    17: { sd3neg: 7.5, sd2neg: 8.2, sd1neg: 9.1, sd0: 10.1, sd1: 11.4, sd2: 13.0, sd3: 14.8 },
    18: { sd3neg: 7.7, sd2neg: 8.4, sd1neg: 9.3, sd0: 10.4, sd1: 11.7, sd2: 13.2, sd3: 15.1 },
    19: { sd3neg: 7.9, sd2neg: 8.6, sd1neg: 9.5, sd0: 10.6, sd1: 12.0, sd2: 13.5, sd3: 15.4 },
    20: { sd3neg: 8.1, sd2neg: 8.8, sd1neg: 9.7, sd0: 10.9, sd1: 12.2, sd2: 13.8, sd3: 15.8 },
    21: { sd3neg: 8.2, sd2neg: 9.0, sd1neg: 9.9, sd0: 11.1, sd1: 12.5, sd2: 14.1, sd3: 16.1 },
    22: { sd3neg: 8.4, sd2neg: 9.2, sd1neg: 10.1, sd0: 11.3, sd1: 12.8, sd2: 14.4, sd3: 16.4 },
    23: { sd3neg: 8.6, sd2neg: 9.4, sd1neg: 10.3, sd0: 11.5, sd1: 13.0, sd2: 14.7, sd3: 16.8 },
    24: { sd3neg: 8.8, sd2neg: 9.6, sd1neg: 10.5, sd0: 11.8, sd1: 13.3, sd2: 15.0, sd3: 17.1 },
    30: { sd3neg: 9.6, sd2neg: 10.5, sd1neg: 11.7, sd0: 13.1, sd1: 14.7, sd2: 16.5, sd3: 18.6 },
    36: { sd3neg: 10.4, sd2neg: 11.4, sd1neg: 12.7, sd0: 14.3, sd1: 16.1, sd2: 18.1, sd3: 20.2 },
    42: { sd3neg: 11.1, sd2neg: 12.2, sd1neg: 13.6, sd0: 15.3, sd1: 17.2, sd2: 19.3, sd3: 21.7 },
    48: { sd3neg: 11.8, sd2neg: 13.0, sd1neg: 14.5, sd0: 16.3, sd1: 18.3, sd2: 20.6, sd3: 23.2 },
    54: { sd3neg: 12.4, sd2neg: 13.7, sd1neg: 15.3, sd0: 17.2, sd1: 19.4, sd2: 21.8, sd3: 24.6 },
    60: { sd3neg: 13.0, sd2neg: 14.4, sd1neg: 16.1, sd0: 18.1, sd1: 20.4, sd2: 23.0, sd3: 25.9 }
};

// --- Length-for-Age (PB/U) for 0-24 months ---
export const lfaBoys: ZScoreData = {
    0: { sd3neg: 44.2, sd2neg: 46.1, sd1neg: 48.0, sd0: 49.9, sd1: 51.8, sd2: 53.7, sd3: 55.6 },
    1: { sd3neg: 48.9, sd2neg: 50.8, sd1neg: 52.8, sd0: 54.7, sd1: 56.7, sd2: 58.6, sd3: 60.6 },
    2: { sd3neg: 52.4, sd2neg: 54.4, sd1neg: 56.4, sd0: 58.4, sd1: 60.4, sd2: 62.4, sd3: 64.4 },
    3: { sd3neg: 55.3, sd2neg: 57.3, sd1neg: 59.4, sd0: 61.4, sd1: 63.5, sd2: 65.5, sd3: 67.6 },
    4: { sd3neg: 57.6, sd2neg: 59.7, sd1neg: 61.8, sd0: 63.9, sd1: 66.0, sd2: 68.0, sd3: 70.1 },
    5: { sd3neg: 59.6, sd2neg: 61.7, sd1neg: 63.8, sd0: 65.9, sd1: 68.0, sd2: 70.1, sd3: 72.2 },
    6: { sd3neg: 61.2, sd2neg: 63.3, sd1neg: 65.5, sd0: 67.6, sd1: 69.8, sd2: 71.9, sd3: 74.0 },
    7: { sd3neg: 62.7, sd2neg: 64.8, sd1neg: 67.0, sd0: 69.2, sd1: 71.3, sd2: 73.5, sd3: 75.7 },
    8: { sd3neg: 64.0, sd2neg: 66.2, sd1neg: 68.4, sd0: 70.6, sd1: 72.8, sd2: 75.0, sd3: 77.2 },
    9: { sd3neg: 65.2, sd2neg: 67.5, sd1neg: 69.7, sd0: 72.0, sd1: 74.2, sd2: 76.5, sd3: 78.7 },
    10: { sd3neg: 66.4, sd2neg: 68.7, sd1neg: 71.0, sd0: 73.3, sd1: 75.6, sd2: 77.9, sd3: 80.1 },
    11: { sd3neg: 67.6, sd2neg: 69.9, sd1neg: 72.2, sd0: 74.5, sd1: 76.9, sd2: 79.2, sd3: 81.5 },
    12: { sd3neg: 68.6, sd2neg: 71.0, sd1neg: 73.4, sd0: 75.7, sd1: 78.1, sd2: 80.5, sd3: 82.9 },
    13: { sd3neg: 69.6, sd2neg: 72.0, sd1neg: 74.5, sd0: 76.9, sd1: 79.3, sd2: 81.8, sd3: 84.2 },
    14: { sd3neg: 70.6, sd2neg: 73.1, sd1neg: 75.6, sd0: 78.0, sd1: 80.5, sd2: 83.0, sd3: 85.5 },
    15: { sd3neg: 71.6, sd2neg: 74.1, sd1neg: 76.6, sd0: 79.1, sd1: 81.7, sd2: 84.2, sd3: 86.7 },
    16: { sd3neg: 72.5, sd2neg: 75.0, sd1neg: 77.6, sd0: 80.2, sd1: 82.8, sd2: 85.4, sd3: 88.0 },
    17: { sd3neg: 73.3, sd2neg: 76.0, sd1neg: 78.6, sd0: 81.2, sd1: 83.9, sd2: 86.5, sd3: 89.2 },
    18: { sd3neg: 74.2, sd2neg: 76.9, sd1neg: 79.6, sd0: 82.3, sd1: 85.0, sd2: 87.7, sd3: 90.4 },
    19: { sd3neg: 75.0, sd2neg: 77.7, sd1neg: 80.5, sd0: 83.2, sd1: 86.0, sd2: 88.8, sd3: 91.5 },
    20: { sd3neg: 75.8, sd2neg: 78.6, sd1neg: 81.4, sd0: 84.2, sd1: 87.0, sd2: 89.8, sd3: 92.6 },
    21: { sd3neg: 76.5, sd2neg: 79.4, sd1neg: 82.2, sd0: 85.1, sd1: 88.0, sd2: 90.8, sd3: 93.7 },
    22: { sd3neg: 77.2, sd2neg: 80.1, sd1neg: 83.0, sd0: 86.0, sd1: 88.9, sd2: 91.8, sd3: 94.7 },
    23: { sd3neg: 78.0, sd2neg: 80.9, sd1neg: 83.8, sd0: 86.8, sd1: 89.8, sd2: 92.8, sd3: 95.7 },
    24: { sd3neg: 78.6, sd2neg: 81.7, sd1neg: 84.6, sd0: 87.8, sd1: 90.7, sd2: 93.7, sd3: 96.7 }
};

export const lfaGirls: ZScoreData = {
    0: { sd3neg: 43.6, sd2neg: 45.4, sd1neg: 47.3, sd0: 49.1, sd1: 51.0, sd2: 52.9, sd3: 54.7 },
    1: { sd3neg: 47.8, sd2neg: 49.7, sd1neg: 51.7, sd0: 53.7, sd1: 55.6, sd2: 57.6, sd3: 59.5 },
    2: { sd3neg: 51.0, sd2neg: 53.0, sd1neg: 55.0, sd0: 57.1, sd1: 59.1, sd2: 61.1, sd3: 63.2 },
    3: { sd3neg: 53.5, sd2neg: 55.6, sd1neg: 57.7, sd0: 59.8, sd1: 61.9, sd2: 64.0, sd3: 66.1 },
    4: { sd3neg: 55.6, sd2neg: 57.8, sd1neg: 59.9, sd0: 62.1, sd1: 64.3, sd2: 66.4, sd3: 68.6 },
    5: { sd3neg: 57.4, sd2neg: 59.6, sd1neg: 61.8, sd0: 64.0, sd1: 66.2, sd2: 68.5, sd3: 70.7 },
    6: { sd3neg: 58.9, sd2neg: 61.2, sd1neg: 63.5, sd0: 65.7, sd1: 68.0, sd2: 70.3, sd3: 72.5 },
    7: { sd3neg: 60.3, sd2neg: 62.7, sd1neg: 65.0, sd0: 67.3, sd1: 69.6, sd2: 71.9, sd3: 74.2 },
    8: { sd3neg: 61.7, sd2neg: 64.0, sd1neg: 66.4, sd0: 68.8, sd1: 71.1, sd2: 73.5, sd3: 75.8 },
    9: { sd3neg: 62.9, sd2neg: 65.3, sd1neg: 67.7, sd0: 70.1, sd1: 72.6, sd2: 75.0, sd3: 77.4 },
    10: { sd3neg: 64.1, sd2neg: 66.5, sd1neg: 69.0, sd0: 71.5, sd1: 73.9, sd2: 76.4, sd3: 78.9 },
    11: { sd3neg: 65.3, sd2neg: 67.7, sd1neg: 70.3, sd0: 72.8, sd1: 75.3, sd2: 77.8, sd3: 80.3 },
    12: { sd3neg: 66.4, sd2neg: 68.9, sd1neg: 71.4, sd0: 74.0, sd1: 76.6, sd2: 79.1, sd3: 81.7 },
    13: { sd3neg: 67.4, sd2neg: 70.0, sd1neg: 72.6, sd0: 75.2, sd1: 77.8, sd2: 80.4, sd3: 83.0 },
    14: { sd3neg: 68.5, sd2neg: 71.1, sd1neg: 73.8, sd0: 76.4, sd1: 79.1, sd2: 81.7, sd3: 84.4 },
    15: { sd3neg: 69.4, sd2neg: 72.1, sd1neg: 74.8, sd0: 77.5, sd1: 80.2, sd2: 82.9, sd3: 85.6 },
    16: { sd3neg: 70.4, sd2neg: 73.1, sd1neg: 75.8, sd0: 78.6, sd1: 81.4, sd2: 84.1, sd3: 86.9 },
    17: { sd3neg: 71.3, sd2neg: 74.0, sd1neg: 76.8, sd0: 79.7, sd1: 82.5, sd2: 85.3, sd3: 88.1 },
    18: { sd3neg: 72.2, sd2neg: 74.9, sd1neg: 77.8, sd0: 80.7, sd1: 83.6, sd2: 86.5, sd3: 89.4 },
    19: { sd3neg: 73.0, sd2neg: 75.8, sd1neg: 78.7, sd0: 81.7, sd1: 84.6, sd2: 87.6, sd3: 90.5 },
    20: { sd3neg: 73.8, sd2neg: 76.6, sd1neg: 79.6, sd0: 82.6, sd1: 85.6, sd2: 88.6, sd3: 91.6 },
    21: { sd3neg: 74.5, sd2neg: 77.5, sd1neg: 80.5, sd0: 83.5, sd1: 86.5, sd2: 89.6, sd3: 92.6 },
    22: { sd3neg: 75.3, sd2neg: 78.3, sd1neg: 81.3, sd0: 84.4, sd1: 87.5, sd2: 90.5, sd3: 93.6 },
    23: { sd3neg: 76.0, sd2neg: 79.1, sd1neg: 82.1, sd0: 85.3, sd1: 88.4, sd2: 91.5, sd3: 94.6 },
    24: { sd3neg: 76.7, sd2neg: 79.9, sd1neg: 82.9, sd0: 86.4, sd1: 89.3, sd2: 92.4, sd3: 95.5 }
};

// --- Height-for-Age (TB/U) for 24-60 months ---
export const hfaBoys: ZScoreData = {
    24: { sd3neg: 81.0, sd2neg: 83.2, sd1neg: 85.1, sd0: 87.1, sd1: 89.1, sd2: 91.0, sd3: 93.0 },
    25: { sd3neg: 81.7, sd2neg: 84.0, sd1neg: 85.8, sd0: 88.0, sd1: 90.0, sd2: 92.0, sd3: 94.1 },
    30: { sd3neg: 85.1, sd2neg: 87.5, sd1neg: 89.4, sd0: 91.9, sd1: 94.1, sd2: 96.3, sd3: 98.5 },
    36: { sd3neg: 88.7, sd2neg: 91.2, sd1neg: 93.2, sd0: 96.1, sd1: 98.4, sd2: 100.7, sd3: 103.0 },
    42: { sd3neg: 91.9, sd2neg: 94.5, sd1neg: 96.6, sd0: 99.7, sd1: 102.2, sd2: 104.7, sd3: 107.2 },
    48: { sd3neg: 94.9, sd2neg: 97.6, sd1neg: 99.8, sd0: 103.0, sd1: 105.6, sd2: 108.2, sd3: 110.8 },
    54: { sd3neg: 97.6, sd2neg: 100.4, sd1neg: 102.7, sd0: 106.1, sd1: 108.8, sd2: 111.5, sd3: 114.2 },
    60: { sd3neg: 100.1, sd2neg: 103.0, sd1neg: 105.4, sd0: 109.0, sd1: 111.8, sd2: 114.6, sd3: 117.4 }
};

export const hfaGirls: ZScoreData = {
    24: { sd3neg: 80.0, sd2neg: 82.2, sd1neg: 84.1, sd0: 86.4, sd1: 88.3, sd2: 90.5, sd3: 92.8 },
    25: { sd3neg: 80.8, sd2neg: 83.1, sd1neg: 85.0, sd0: 87.4, sd1: 89.3, sd2: 91.6, sd3: 93.9 },
    30: { sd3neg: 84.4, sd2neg: 86.8, sd1neg: 88.8, sd0: 91.7, sd1: 93.9, sd2: 96.3, sd3: 98.7 },
    36: { sd3neg: 87.9, sd2neg: 90.5, sd1neg: 92.6, sd0: 95.8, sd1: 98.3, sd2: 100.8, sd3: 103.3 },
    42: { sd3neg: 91.0, sd2neg: 93.7, sd1neg: 96.0, sd0: 99.4, sd1: 102.0, sd2: 104.7, sd3: 107.3 },
    48: { sd3neg: 93.8, sd2neg: 96.6, sd1neg: 99.0, sd0: 102.7, sd1: 105.4, sd2: 108.2, sd3: 111.0 },
    54: { sd3neg: 96.4, sd2neg: 99.3, sd1neg: 101.8, sd0: 105.7, sd1: 108.5, sd2: 111.4, sd3: 114.3 },
    60: { sd3neg: 98.9, sd2neg: 101.8, sd1neg: 104.5, sd0: 108.4, sd1: 111.4, sd2: 114.4, sd3: 117.4 }
};

// --- Weight-for-Length (BB/PB) untuk anak 0-24 bulan (per 0.5 cm) ---
export const wflBoys: ZScoreData = {
    45.0: { sd3neg: 1.9, sd2neg: 2.1, sd1neg: 2.3, sd0: 2.5, sd1: 2.8, sd2: 3.1, sd3: 3.4 },
    50.0: { sd3neg: 2.6, sd2neg: 2.8, sd1neg: 3.1, sd0: 3.4, sd1: 3.8, sd2: 4.2, sd3: 4.6 },
    55.0: { sd3neg: 3.5, sd2neg: 3.8, sd1neg: 4.1, sd0: 4.4, sd1: 4.9, sd2: 5.4, sd3: 5.9 },
    60.0: { sd3neg: 4.5, sd2neg: 4.8, sd1neg: 5.2, sd0: 5.6, sd1: 6.2, sd2: 6.8, sd3: 7.5 },
    65.0: { sd3neg: 5.7, sd2neg: 6.1, sd1neg: 6.5, sd0: 7.0, sd1: 7.7, sd2: 8.4, sd3: 9.2 },
    70.0: { sd3neg: 6.9, sd2neg: 7.3, sd1neg: 7.8, sd0: 8.3, sd1: 9.1, sd2: 9.9, sd3: 10.8 },
    75.0: { sd3neg: 7.9, sd2neg: 8.4, sd1neg: 8.9, sd0: 9.5, sd1: 10.3, sd2: 11.2, sd3: 12.2 },
    80.0: { sd3neg: 8.8, sd2neg: 9.3, sd1neg: 9.9, sd0: 10.6, sd1: 11.5, sd2: 12.5, sd3: 13.6 },
    85.0: { sd3neg: 9.6, sd2neg: 10.2, sd1neg: 10.9, sd0: 11.7, sd1: 12.7, sd2: 13.8, sd3: 15.0 },
    90.0: { sd3neg: 10.5, sd2neg: 11.1, sd1neg: 11.9, sd0: 12.8, sd1: 13.9, sd2: 15.1, sd3: 16.4 },
    95.0: { sd3neg: 11.4, sd2neg: 12.1, sd1neg: 12.9, sd0: 13.9, sd1: 15.1, sd2: 16.4, sd3: 17.8 },
    100.0: { sd3neg: 12.3, sd2neg: 13.1, sd1neg: 14.0, sd0: 15.0, sd1: 16.3, sd2: 17.7, sd3: 19.3 },
    105.0: { sd3neg: 13.3, sd2neg: 14.1, sd1neg: 15.1, sd0: 16.2, sd1: 17.6, sd2: 19.1, sd3: 20.8 },
    110.0: { sd3neg: 14.3, sd2neg: 15.2, sd1neg: 16.2, sd0: 17.4, sd1: 18.9, sd2: 20.6, sd3: 22.4 }
};

export const wflGirls: ZScoreData = {
    45.0: { sd3neg: 1.8, sd2neg: 2.0, sd1neg: 2.2, sd0: 2.4, sd1: 2.7, sd2: 2.9, sd3: 3.2 },
    50.0: { sd3neg: 2.6, sd2neg: 2.8, sd1neg: 3.1, sd0: 3.4, sd1: 3.7, sd2: 4.1, sd3: 4.4 },
    55.0: { sd3neg: 3.6, sd2neg: 3.9, sd1neg: 4.2, sd0: 4.5, sd1: 5.0, sd2: 5.4, sd3: 5.9 },
    60.0: { sd3neg: 4.6, sd2neg: 5.0, sd1neg: 5.4, sd0: 5.8, sd1: 6.4, sd2: 7.0, sd3: 7.6 },
    65.0: { sd3neg: 5.7, sd2neg: 6.1, sd1neg: 6.5, sd0: 7.0, sd1: 7.6, sd2: 8.3, sd3: 9.1 },
    70.0: { sd3neg: 6.6, sd2neg: 7.1, sd1neg: 7.6, sd0: 8.2, sd1: 8.9, sd2: 9.7, sd3: 10.6 },
    75.0: { sd3neg: 7.5, sd2neg: 8.0, sd1neg: 8.6, sd0: 9.2, sd1: 10.0, sd2: 10.9, sd3: 11.9 },
    80.0: { sd3neg: 8.3, sd2neg: 8.9, sd1neg: 9.5, sd0: 10.2, sd1: 11.1, sd2: 12.1, sd3: 13.2 },
    85.0: { sd3neg: 9.1, sd2neg: 9.8, sd1neg: 10.5, sd0: 11.3, sd1: 12.3, sd2: 13.4, sd3: 14.6 },
    90.0: { sd3neg: 10.0, sd2neg: 10.7, sd1neg: 11.5, sd0: 12.3, sd1: 13.4, sd2: 14.6, sd3: 15.9 },
    95.0: { sd3neg: 10.9, sd2neg: 11.6, sd1neg: 12.4, sd0: 13.3, sd1: 14.5, sd2: 15.8, sd3: 17.2 },
    100.0: { sd3neg: 11.8, sd2neg: 12.6, sd1neg: 13.5, sd0: 14.5, sd1: 15.8, sd2: 17.2, sd3: 18.7 },
    105.0: { sd3neg: 12.8, sd2neg: 13.7, sd1neg: 14.6, sd0: 15.8, sd1: 17.1, sd2: 18.6, sd3: 20.2 },
    110.0: { sd3neg: 13.8, sd2neg: 14.8, sd1neg: 15.8, sd0: 17.0, sd1: 18.5, sd2: 20.1, sd3: 21.8 }
};

// --- Weight-for-Height (BB/TB) untuk anak 24-60 bulan ---
export const wfhBoys: ZScoreData = {
    65.0: { sd3neg: 5.9, sd2neg: 6.4, sd1neg: 6.9, sd0: 7.4, sd1: 8.0, sd2: 8.7, sd3: 9.3 },
    70.0: { sd3neg: 7.0, sd2neg: 7.5, sd1neg: 8.0, sd0: 8.6, sd1: 9.2, sd2: 10.0, sd3: 10.7 },
    75.0: { sd3neg: 8.0, sd2neg: 8.5, sd1neg: 9.1, sd0: 9.8, sd1: 10.5, sd2: 11.4, sd3: 12.2 },
    80.0: { sd3neg: 9.0, sd2neg: 9.6, sd1neg: 10.2, sd0: 11.0, sd1: 11.8, sd2: 12.7, sd3: 13.7 },
    85.0: { sd3neg: 10.0, sd2neg: 10.7, sd1neg: 11.4, sd0: 12.2, sd1: 13.1, sd2: 14.1, sd3: 15.2 },
    90.0: { sd3neg: 11.1, sd2neg: 11.8, sd1neg: 12.6, sd0: 13.5, sd1: 14.5, sd2: 15.7, sd3: 16.8 },
    95.0: { sd3neg: 12.2, sd2neg: 13.0, sd1neg: 13.8, sd0: 14.8, sd1: 15.9, sd2: 17.2, sd3: 18.4 },
    100.0: { sd3neg: 13.4, sd2neg: 14.2, sd1neg: 15.1, sd0: 16.2, sd1: 17.4, sd2: 18.8, sd3: 20.1 },
    105.0: { sd3neg: 14.6, sd2neg: 15.5, sd1neg: 16.5, sd0: 17.7, sd1: 19.0, sd2: 20.5, sd3: 22.0 },
    110.0: { sd3neg: 15.9, sd2neg: 16.9, sd1neg: 18.0, sd0: 19.2, sd1: 20.7, sd2: 22.4, sd3: 24.0 },
    115.0: { sd3neg: 17.3, sd2neg: 18.3, sd1neg: 19.5, sd0: 20.9, sd1: 22.5, sd2: 24.3, sd3: 26.1 },
    120.0: { sd3neg: 18.7, sd2neg: 19.8, sd1neg: 21.1, sd0: 22.6, sd1: 24.3, sd2: 26.2, sd3: 28.1 }
};

export const wfhGirls: ZScoreData = {
    65.0: { sd3neg: 5.8, sd2neg: 6.3, sd1neg: 6.8, sd0: 7.3, sd1: 8.0, sd2: 8.7, sd3: 9.4 },
    70.0: { sd3neg: 6.8, sd2neg: 7.3, sd1neg: 7.9, sd0: 8.5, sd1: 9.2, sd2: 9.9, sd3: 10.7 },
    75.0: { sd3neg: 7.8, sd2neg: 8.3, sd1neg: 8.9, sd0: 9.6, sd1: 10.4, sd2: 11.3, sd3: 12.2 },
    80.0: { sd3neg: 8.8, sd2neg: 9.4, sd1neg: 10.0, sd0: 10.8, sd1: 11.7, sd2: 12.7, sd3: 13.7 },
    85.0: { sd3neg: 9.8, sd2neg: 10.5, sd1neg: 11.3, sd0: 12.1, sd1: 13.1, sd2: 14.2, sd3: 15.3 },
    90.0: { sd3neg: 10.9, sd2neg: 11.7, sd1neg: 12.5, sd0: 13.5, sd1: 14.6, sd2: 15.8, sd3: 17.0 },
    95.0: { sd3neg: 12.1, sd2neg: 12.9, sd1neg: 13.8, sd0: 14.8, sd1: 16.0, sd2: 17.4, sd3: 18.7 },
    100.0: { sd3neg: 13.3, sd2neg: 14.2, sd1neg: 15.2, sd0: 16.3, sd1: 17.6, sd2: 19.1, sd3: 20.6 },
    105.0: { sd3neg: 14.6, sd2neg: 15.6, sd1neg: 16.7, sd0: 17.9, sd1: 19.4, sd2: 21.0, sd3: 22.7 },
    110.0: { sd3neg: 16.0, sd2neg: 17.1, sd1neg: 18.3, sd0: 19.6, sd1: 21.2, sd2: 22.9, sd3: 24.8 },
    115.0: { sd3neg: 17.5, sd2neg: 18.7, sd1neg: 20.0, sd0: 21.4, sd1: 23.1, sd2: 25.0, sd3: 27.0 },
    120.0: { sd3neg: 19.0, sd2neg: 20.3, sd1neg: 21.7, sd0: 23.2, sd1: 25.0, sd2: 27.1, sd3: 29.3 }
};
