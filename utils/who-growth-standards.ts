// Data points for WHO Child Growth Standards (0-60 months)
// Source: WHO Anthro Survey Data (simplified for visualization)
// Values represent Z-scores: +3, +2 (batas atas), 0 (median), -2 (batas bawah), -3

const standardLines = (labelPrefix: string, colors: string[], dataArrays: { age: number; value: number }[][]) => {
    const labels = [`${labelPrefix} +3 SD`, `${labelPrefix} +2 SD`, `${labelPrefix} Median`, `${labelPrefix} -2 SD`, `${labelPrefix} -3 SD`];
    return dataArrays.map((data, i) => ({
        label: labels[i],
        color: colors[i],
        data: data.map(d => ({ x: d.age, y: d.value }))
    }));
};

const colors = ['#f87171', '#fb923c', '#16a34a', '#fb923c', '#f87171']; // Red, Orange, Green, Orange, Red

// --- Weight-for-age ---
const wfa_boys_data = [
    // +3 SD
    [{age: 0, value: 4.4}, {age: 6, value: 9.3}, {age: 12, value: 11.5}, {age: 24, value: 14.7}, {age: 36, value: 17.2}, {age: 48, value: 19.5}, {age: 60, value: 21.9}],
    // +2 SD
    [{age: 0, value: 3.9}, {age: 6, value: 8.6}, {age: 12, value: 10.8}, {age: 24, value: 13.6}, {age: 36, value: 15.8}, {age: 48, value: 17.8}, {age: 60, value: 20.2}],
    // Median (0)
    [{age: 0, value: 3.3}, {age: 6, value: 7.9}, {age: 12, value: 9.6}, {age: 24, value: 12.2}, {age: 36, value: 14.3}, {age: 48, value: 16.3}, {age: 60, value: 18.2}],
    // -2 SD
    [{age: 0, value: 2.5}, {age: 6, value: 6.4}, {age: 12, value: 7.8}, {age: 24, value: 10.0}, {age: 36, value: 11.7}, {age: 48, value: 13.4}, {age: 60, value: 14.8}],
    // -3 SD
    [{age: 0, value: 2.1}, {age: 6, value: 5.7}, {age: 12, value: 7.0}, {age: 24, value: 9.0}, {age: 36, value: 10.5}, {age: 48, value: 12.0}, {age: 60, value: 13.2}]
];

const wfa_girls_data = [
    // +3 SD
    [{age: 0, value: 4.2}, {age: 6, value: 8.8}, {age: 12, value: 10.9}, {age: 24, value: 14.1}, {age: 36, value: 16.7}, {age: 48, value: 19.1}, {age: 60, value: 21.6}],
    // +2 SD
    [{age: 0, value: 3.8}, {age: 6, value: 8.1}, {age: 12, value: 10.1}, {age: 24, value: 13.0}, {age: 36, value: 15.3}, {age: 48, value: 17.5}, {age: 60, value: 19.8}],
    // Median (0)
    [{age: 0, value: 3.2}, {age: 6, value: 7.3}, {age: 12, value: 8.9}, {age: 24, value: 11.5}, {age: 36, value: 13.9}, {age: 48, value: 15.8}, {age: 60, value: 17.8}],
    // -2 SD
    [{age: 0, value: 2.4}, {age: 6, value: 5.8}, {age: 12, value: 7.0}, {age: 24, value: 9.0}, {age: 36, value: 10.8}, {age: 48, value: 12.3}, {age: 60, value: 13.9}],
    // -3 SD
    [{age: 0, value: 2.1}, {age: 6, value: 5.1}, {age: 12, value: 6.3}, {age: 24, value: 8.1}, {age: 36, value: 9.7}, {age: 48, value: 11.1}, {age: 60, value: 12.5}]
];

export const weightForAge = {
    boys: standardLines('BB/U', colors, wfa_boys_data),
    girls: standardLines('BB/U', colors, wfa_girls_data)
};


// --- Length/Height-for-age ---
const hfa_boys_data = [
    // +3 SD
    [{age: 0, value: 54.7}, {age: 6, value: 71.3}, {age: 12, value: 81.0}, {age: 24, value: 94.9}, {age: 36, value: 103.5}, {age: 48, value: 111.2}, {age: 60, value: 118.0}],
    // +2 SD
    [{age: 0, value: 53.0}, {age: 6, value: 69.2}, {age: 12, value: 78.5}, {age: 24, value: 92.2}, {age: 36, value: 100.7}, {age: 48, value: 108.0}, {age: 60, value: 115.6}],
    // Median (0)
    [{age: 0, value: 49.9}, {age: 6, value: 67.6}, {age: 12, value: 75.7}, {age: 24, value: 86.4}, {age: 36, value: 95.1}, {age: 48, value: 102.7}, {age: 60, value: 109.4}],
    // -2 SD
    [{age: 0, value: 46.1}, {age: 6, value: 62.1}, {age: 12, value: 69.9}, {age: 24, value: 80.3}, {age: 36, value: 88.7}, {age: 48, value: 95.9}, {age: 60, value: 101.9}],
    // -3 SD
    [{age: 0, value: 44.2}, {age: 6, value: 59.4}, {age: 12, value: 67.1}, {age: 24, value: 77.2}, {age: 36, value: 85.5}, {age: 48, value: 92.5}, {age: 60, value: 98.4}]
];

const hfa_girls_data = [
    // +3 SD
    [{age: 0, value: 53.7}, {age: 6, value: 69.2}, {age: 12, value: 79.1}, {age: 24, value: 92.9}, {age: 36, value: 101.9}, {age: 48, value: 110.0}, {age: 60, value: 117.2}],
    // +2 SD
    [{age: 0, value: 52.0}, {age: 6, value: 67.1}, {age: 12, value: 76.8}, {age: 24, value: 90.3}, {age: 36, value: 99.0}, {age: 48, value: 107.2}, {age: 60, value: 114.6}],
    // Median (0)
    [{age: 0, value: 49.1}, {age: 6, value: 65.7}, {age: 12, value: 74.0}, {age: 24, value: 85.5}, {age: 36, value: 94.1}, {age: 48, value: 101.6}, {age: 60, value: 108.4}],
    // -2 SD
    [{age: 0, value: 45.4}, {age: 6, value: 60.3}, {age: 12, value: 67.5}, {age: 24, value: 78.0}, {age: 36, value: 85.1}, {age: 48, value: 91.7}, {age: 60, value: 97.3}],
    // -3 SD
    [{age: 0, value: 43.6}, {age: 6, value: 57.8}, {age: 12, value: 64.5}, {age: 24, value: 74.9}, {age: 36, value: 81.8}, {age: 48, value: 88.2}, {age: 60, value: 93.9}]
];


export const heightForAge = {
    boys: standardLines('TB/U', colors, hfa_boys_data),
    girls: standardLines('TB/U', colors, hfa_girls_data)
};

// --- Weight-for-Height ---
// NOTE: "age" property here represents height in cm for x-axis mapping
const wfh_boys_data = [
    // +3 SD
    [{age: 50, value: 4.7}, {age: 65, value: 9.4}, {age: 85, value: 15.7}, {age: 110, value: 24.1}],
    // +2 SD
    [{age: 50, value: 4.2}, {age: 65, value: 8.6}, {age: 85, value: 14.4}, {age: 110, value: 22.1}],
    // Median (0)
    [{age: 50, value: 3.4}, {age: 65, value: 7.1}, {age: 85, value: 12.1}, {age: 110, value: 18.6}],
    // -2 SD
    [{age: 50, value: 2.7}, {age: 65, value: 5.9}, {age: 85, value: 10.2}, {age: 110, value: 15.8}],
    // -3 SD
    [{age: 50, value: 2.4}, {age: 65, value: 5.4}, {age: 85, value: 9.4}, {age: 110, value: 14.6}]
];

const wfh_girls_data = [
    // +3 SD
    [{age: 50, value: 4.6}, {age: 65, value: 9.3}, {age: 85, value: 15.4}, {age: 110, value: 24.9}],
    // +2 SD
    [{age: 50, value: 4.2}, {age: 65, value: 8.4}, {age: 85, value: 14.1}, {age: 110, value: 22.7}],
    // Median (0)
    [{age: 50, value: 3.4}, {age: 65, value: 7.0}, {age: 85, value: 11.8}, {age: 110, value: 18.8}],
    // -2 SD
    [{age: 50, value: 2.7}, {age: 65, value: 5.8}, {age: 85, value: 9.9}, {age: 110, value: 15.8}],
    // -3 SD
    [{age: 50, value: 2.4}, {age: 65, value: 5.3}, {age: 85, value: 9.1}, {age: 110, value: 14.6}]
];

export const weightForHeight = {
    boys: standardLines('BB/TB', colors, wfh_boys_data),
    girls: standardLines('BB/TB', colors, wfh_girls_data)
};