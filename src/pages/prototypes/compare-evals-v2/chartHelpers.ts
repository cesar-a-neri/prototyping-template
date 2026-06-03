import { type EvaluationData } from '@/utils/csvLoader';

// Dummy data for the table
export const dummyTableData = [
    {
        id: '12345',
        outputLatency: '60 ms',
        transcript: 'Agent: Good morning, how are you feeling today?\nPatient: A little tired, but otherwise okay.\nAgent: Any new symptoms since your last visit?\nPatient: Just some mild dizziness after standing up.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '60 ms',
        transcript: 'Agent: Hi, I\'m calling to confirm your follow-up appointment for next Tuesday. Does that still work for you?\nPatient: Yes, that\'s fine. What time is it again?\nAgent: 10:30 a.m. at the Rochester campus.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: I\'m checking in after your knee injection last week. How\'s the pain level now?\nPatient: Much better, maybe a three out of ten.\nAgent: That\'s great to hear. Any swelling or redness around the joint?...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: Just to confirm, you\'re taking the new dosage of metformin twice a day, correct?\nPatient: Yes, morning and night.\nAgent: Perfect. Any side effects so far?...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: Your blood test came back with slightly elevated cholesterol levels.\nPatient: Oh, I see. Is that serious?\nAgent: Nothing alarming, but we\'ll adjust your diet and recheck in three...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '45 ms',
        transcript: 'Agent: What brings you in today?\nPatient: I\'ve been having some chest tightness when I exercise.\nAgent: How long has that been happening?\nPatient: About a week, maybe a little longer.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '45 ms',
        transcript: 'Agent: Your test results look good. The doctor recommends a follow-up in six months.\nPatient: Okay, should I schedule that now?\nAgent: Yes, let\'s go ahead and set that up before you leave today....',
        annotatorOutput: 'Yes'
    },
];

// Helper function to check if a column contains numerical data
export const isNumericalColumn = (data: EvaluationData[], columnName: string): boolean => {
    // Check the first few non-empty values
    const sampleSize = Math.min(10, data.length);
    let numericalCount = 0;

    for (let i = 0; i < sampleSize; i++) {
        const value = data[i][columnName];
        if (value !== '' && value !== null && value !== undefined) {
            const num = Number(value);
            if (!isNaN(num)) {
                numericalCount++;
            }
        }
    }

    // If more than 80% of samples are numerical, consider it a numerical column
    return numericalCount / sampleSize > 0.8;
};

// Helper function to prepare histogram data for numerical columns
export const prepareHistogramData = (data: EvaluationData[], columnName: string) => {
    const values = data
        .map(row => Number(row[columnName]))
        .filter(val => !isNaN(val));

    if (values.length === 0) return [];

    // Check if all values are integers
    const areAllIntegers = values.every(val => Number.isInteger(val));

    // For integers, create discrete bars for each unique value
    if (areAllIntegers) {
        const valueCounts = new Map<number, number>();

        values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });

        // Convert to array and sort by value
        return Array.from(valueCounts.entries())
            .map(([value, count]) => ({
                range: value.toString(),
                count,
                midpoint: value
            }))
            .sort((a, b) => a.midpoint - b.midpoint);
    }

    // For floats, use binned ranges
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`,
        count: 0,
        midpoint: min + (i + 0.5) * binSize
    }));

    // Fill bins
    values.forEach(value => {
        const binIndex = Math.min(
            Math.floor((value - min) / binSize),
            binCount - 1
        );
        bins[binIndex].count++;
    });

    return bins;
};

// Helper function to prepare bar chart data for categorical columns
export const prepareCategoricalData = (data: EvaluationData[], columnName: string) => {
    const valueCounts = new Map<string, number>();

    data.forEach(row => {
        const value = String(row[columnName] || '').trim();
        if (value !== '') {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        }
    });

    // Convert to array and sort by count
    return Array.from(valueCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
};
