# Evaluation Data Directory

This directory contains CSV files for evaluation data and metadata.

## Structure

```
public/data/evaluations/
├── evaluations.json          # Metadata file (required)
├── evaluation-name.csv       # Data file
├── medical-records-eval.csv  # Data file
└── ...                       # More CSV files
```

## How to Add New Evaluations

### 1. Create a CSV File

Create a new CSV file with your evaluation data. The CSV should have a header row with column names.

**Example CSV format:**
```csv
id,outputLatency,transcript,annotatorOutput
12345,60 ms,"Agent: Hello...
Patient: Hi...",Yes
12346,45 ms,"Agent: How are you?",No
```

**Important Notes:**
- You can have any columns you want in your CSV
- Multi-line values should be wrapped in quotes
- Save the file with a descriptive name (e.g., `my-evaluation.csv`)

### 2. Update evaluations.json

Add an entry to `evaluations.json` with the metadata for your evaluation:

```json
{
  "name": "My New Evaluation",
  "date": "Feb 23, 2025",
  "dateLabel": "Created",
  "tags": ["Tag1", "Tag2"],
  "csvFile": "my-evaluation.csv"
}
```

**Fields:**
- `name`: Display name of the evaluation (will appear in the UI)
- `date`: Date string to display
- `dateLabel`: Label for the date (e.g., "Created", "Last updated")
- `tags`: Array of tag strings to display
- `csvFile`: Filename of the CSV file (must match the actual filename)

### 3. Test Your Data

After adding your files:
1. Reload the application
2. The new evaluation should appear in the left panel
3. Click on it to load and display the CSV data

## CSV Column Guidelines

The table will automatically display all columns from your CSV. Common columns include:

- `id`: Identifier for each row
- `outputLatency`: Timing information
- `transcript`: Conversation or text data
- `annotatorOutput`: Result or classification

You can add any custom columns - they will all be displayed in the table.

## Troubleshooting

If your data doesn't load:
1. Check the browser console for errors
2. Verify the CSV file is in the correct location
3. Ensure `evaluations.json` has the correct `csvFile` value
4. Check that your CSV has a valid header row
5. Make sure multi-line values are properly quoted

