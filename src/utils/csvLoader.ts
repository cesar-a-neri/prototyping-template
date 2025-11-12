// Utility functions for loading and parsing CSV files

export interface EvaluationMetadata {
  name: string;
  date: string;
  dateLabel: string;
  tags: string[];
  csvFile: string;
}

export interface EvaluationData {
  id: string;
  outputLatency: string;
  transcript: string;
  annotatorOutput: string;
  [key: string]: string; // Allow for additional dynamic columns
}

export interface EvaluationGroup {
  id: string;
  name: string;
  evaluations: string[];
  createdDate: string;
  tags: string[];
}

/**
 * Load evaluation metadata from JSON file
 */
export async function loadEvaluationMetadata(): Promise<EvaluationMetadata[]> {
  try {
    const response = await fetch('/data/evaluations/evaluations.json');
    if (!response.ok) {
      throw new Error('Failed to load evaluation metadata');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading evaluation metadata:', error);
    return [];
  }
}

/**
 * Parse CSV text into an array of objects
 */
export function parseCSV(csvText: string): EvaluationData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());

  // Parse data rows
  const data: EvaluationData[] = [];
  
  let i = 1;
  while (i < lines.length) {
    const row: Record<string, string> = {};
    let currentValue = '';
    let insideQuotes = false;
    let fieldIndex = 0;
    let line = lines[i];

    // Parse CSV respecting quoted fields that may contain commas and newlines
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        // Check if this is an escaped quote (doubled quotes)
        if (insideQuotes && j + 1 < line.length && line[j + 1] === '"') {
          currentValue += '"';
          j++; // Skip the next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        row[headers[fieldIndex]] = currentValue.trim();
        currentValue = '';
        fieldIndex++;
      } else {
        currentValue += char;
      }
    }

    // Handle multi-line values that span multiple lines in the CSV
    while (insideQuotes && i + 1 < lines.length) {
      i++;
      currentValue += '\n' + lines[i];
      line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          if (j + 1 < line.length && line[j + 1] === '"') {
            j++; // Skip escaped quote
          } else {
            insideQuotes = !insideQuotes;
          }
        }
      }
    }
    
    // Don't forget the last field
    if (fieldIndex < headers.length) {
      row[headers[fieldIndex]] = currentValue.trim();
    }

    if (Object.keys(row).length > 0) {
      data.push(row as EvaluationData);
    }
    
    i++;
  }

  return data;
}

/**
 * Load CSV data for a specific evaluation
 */
export async function loadEvaluationData(csvFile: string): Promise<EvaluationData[]> {
  try {
    const response = await fetch(`/data/evaluations/${csvFile}`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${csvFile}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading evaluation data:', error);
    return [];
  }
}

/**
 * Load evaluation data by name
 */
export async function loadEvaluationByName(
  evaluations: EvaluationMetadata[],
  name: string
): Promise<EvaluationData[]> {
  const evaluation = evaluations.find(e => e.name === name);
  if (!evaluation) {
    console.error(`Evaluation not found: ${name}`);
    return [];
  }
  return loadEvaluationData(evaluation.csvFile);
}

/**
 * Load evaluation groups from JSON file
 */
export async function loadEvaluationGroups(): Promise<EvaluationGroup[]> {
  try {
    const response = await fetch('/data/evaluations/evaluation-groups.json');
    if (!response.ok) {
      throw new Error('Failed to load evaluation groups');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading evaluation groups:', error);
    return [];
  }
}

/**
 * Save evaluation groups to JSON file
 * Note: This writes to the public directory which requires a server endpoint
 * For a client-only solution, we'll use localStorage as a fallback
 */
export async function saveEvaluationGroups(groups: EvaluationGroup[]): Promise<void> {
  try {
    // For now, we'll use localStorage since we can't directly write to public files from client
    localStorage.setItem('evaluation-groups', JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving evaluation groups:', error);
  }
}

/**
 * Load evaluation groups from localStorage (used as primary storage)
 */
export function loadEvaluationGroupsFromLocalStorage(): EvaluationGroup[] {
  try {
    const stored = localStorage.getItem('evaluation-groups');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading evaluation groups from localStorage:', error);
    return [];
  }
}

