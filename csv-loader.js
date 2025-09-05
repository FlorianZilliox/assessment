// csv-loader.js - CSV parser and data loader with ROBUST CSV PARSING

class CSVLoader {
  static async loadQuestions(csvPath = 'questions.csv') {
    try {
      // Try to fetch the CSV file
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV loaded successfully, length:', csvText.length, 'characters');
      const result = this.parseCSV(csvText);
      console.log('Questions parsed:', result.dimensions.reduce((total, dim) => total + dim.questions.length, 0));
      return result;
    } catch (error) {
      console.error('CSV LOAD ERROR:', error);
      console.warn('Cannot load CSV via fetch (likely local file access blocked):', error.message);
      console.log('Using embedded fallback data...');
      
      // Fallback to embedded CSV data
      const csvText = this.getEmbeddedCSV();
      const result = this.parseCSV(csvText);
      console.log('Fallback questions parsed:', result.dimensions.reduce((total, dim) => total + dim.questions.length, 0));
      return result;
    }
  }

  static getEmbeddedCSV() {
    // Return the same CSV content as in questions.csv
    // This is a fallback for when the file can't be loaded
    return `dimension_id,dimension_name,dimension_description,question_id,question_text,question_type,option_1_label,option_1_value,option_2_label,option_2_value,option_3_label,option_3_value,option_4_label,option_4_value,option_5_label,option_5_value,option_6_label,option_6_value,why_matters,when_done_well,problems_without
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,1,The pod tracks workflow KPIs and clearly identifies bottlenecks in their process,A,,,,,,,,,,,,,,"Without metrics you're flying blind. KPIs reveal where work actually gets stuck - often not where teams think. Data beats opinions every time when improving flow.","Decisions based on facts not feelings|Team knows exactly where to focus improvement efforts|Problems visible before they become critical|Continuous flow optimization becomes possible","Optimizing the wrong things wastes effort|Arguments about what's really slowing the team|Hidden wait times kill productivity|Can't prove improvements actually worked"`;
  }

  static parseCSV(csvText) {
    // Parse CSV using a proper parser that handles quoted fields
    const rows = this.parseCSVToRows(csvText);
    
    if (rows.length < 2) {
      console.error('CSV must have at least a header row and one data row');
      return { dimensions: [], scoreGuide: this.getScoreGuide() };
    }
    
    const headers = rows[0];
    console.log(`Parsing CSV with ${rows.length} rows and ${headers.length} headers`);
    
    const dimensionsMap = {};

    // Process each data row
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1}: Expected ${headers.length} columns but got ${values.length}`);
      }
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate essential fields
      if (!row.dimension_id || !row.question_id || !row.question_text || !row.question_type) {
        console.error(`Row ${i + 1}: Missing essential fields, skipping`);
        continue;
      }

      // Create dimension if not exists
      if (!dimensionsMap[row.dimension_id]) {
        dimensionsMap[row.dimension_id] = {
          id: row.dimension_id,
          name: row.dimension_name,
          description: row.dimension_description,
          questions: []
        };
      }

      // Create question object with proper "why" content handling
      const question = {
        id: parseInt(row.question_id),
        text: row.question_text,
        type: row.question_type,
        // Educational content - handle missing gracefully
        whyContent: {
          whyMatters: row.why_matters || null,
          whenDoneWell: row.when_done_well ? row.when_done_well.split('|').map(s => s.trim()).filter(s => s) : [],
          problemsWithout: row.problems_without ? row.problems_without.split('|').map(s => s.trim()).filter(s => s) : []
        }
      };

      // Add options for Type B and C questions
      if (row.question_type === 'B' || row.question_type === 'C') {
        question.options = [];
        
        // Process up to 6 option pairs (label + value)
        for (let j = 1; j <= 6; j++) {
          const labelKey = `option_${j}_label`;
          const valueKey = `option_${j}_value`;
          
          if (row[labelKey] && row[valueKey]) {
            question.options.push({
              label: row[labelKey],
              value: parseInt(row[valueKey])
            });
          }
        }
      }

      dimensionsMap[row.dimension_id].questions.push(question);
      console.log(`Added question ${question.id}: ${question.text.substring(0, 50)}... (why content: ${question.whyContent.whyMatters ? 'YES' : 'NO'})`);
    }

    // Convert map to array and sort questions by ID
    const dimensions = Object.values(dimensionsMap);
    dimensions.forEach(dimension => {
      dimension.questions.sort((a, b) => a.id - b.id);
      console.log(`Dimension ${dimension.name}: ${dimension.questions.length} questions`);
    });

    const totalQuestions = dimensions.reduce((sum, dim) => sum + dim.questions.length, 0);
    console.log(`Total questions parsed: ${totalQuestions}`);

    return {
      dimensions: dimensions,
      scoreGuide: this.getScoreGuide()
    };
  }

  // ROBUST CSV PARSER that handles RFC 4180 standard
  static parseCSVToRows(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;
    let i = 0;
    
    // Normalize line endings to \n
    csvText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    while (i < csvText.length) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (!insideQuotes) {
        if (char === '"') {
          // Start of quoted field
          insideQuotes = true;
          i++;
        } else if (char === ',') {
          // End of field
          currentRow.push(currentField);
          currentField = '';
          i++;
        } else if (char === '\n') {
          // End of row
          currentRow.push(currentField);
          if (currentRow.length > 1 || currentRow[0] !== '') {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
          i++;
        } else {
          // Regular character
          currentField += char;
          i++;
        }
      } else {
        // Inside quotes
        if (char === '"') {
          if (nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i += 2;
          } else {
            // End of quoted field
            insideQuotes = false;
            i++;
          }
        } else {
          // Regular character inside quotes
          currentField += char;
          i++;
        }
      }
    }
    
    // Handle last field if there's no trailing newline
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }
    
    return rows;
  }

  static getScoreGuide() {
    return {
      6: { level: 'Mastered', description: 'Consistently excellent, could teach others', meaning: 'This is a pod strength' },
      5: { level: 'Proficient', description: 'Usually works well, minor tweaks only', meaning: 'Maintain and refine' },
      4: { level: 'Capable', description: 'Generally good, some gaps to address', meaning: 'Steady improvement needed' },
      3: { level: 'Developing', description: 'Hit and miss, needs focus', meaning: 'Priority for improvement' },
      2: { level: 'Struggling', description: 'More often problematic than not', meaning: 'Requires urgent attention' },
      1: { level: 'Not Present', description: 'Rarely or never happens', meaning: 'Critical gap to address' }
    };
  }

  // Validate loaded data structure with better error messages
  static validateData(data) {
    const errors = [];

    if (!data.dimensions || !Array.isArray(data.dimensions)) {
      errors.push('Invalid dimensions data structure');
      return errors;
    }

    let totalQuestions = 0;
    let questionsWithWhyContent = 0;
    
    data.dimensions.forEach((dimension, dimIndex) => {
      if (!dimension.id || !dimension.name || !dimension.questions) {
        errors.push(`Dimension ${dimIndex + 1}: Missing required fields`);
        return;
      }

      dimension.questions.forEach((question, qIndex) => {
        totalQuestions++;
        
        if (question.whyContent && question.whyContent.whyMatters) {
          questionsWithWhyContent++;
        }
        
        if (!question.id || !question.text || !question.type) {
          errors.push(`Dimension ${dimension.name}, Question ${qIndex + 1}: Missing required fields`);
        }

        if (!['A', 'B', 'C'].includes(question.type)) {
          errors.push(`Dimension ${dimension.name}, Question ${question.id}: Invalid question type ${question.type}`);
        }

        if ((question.type === 'B' || question.type === 'C') && (!question.options || question.options.length === 0)) {
          errors.push(`Dimension ${dimension.name}, Question ${question.id}: Type ${question.type} questions require options`);
        }
      });
    });

    console.log(`Validation: ${totalQuestions} total questions, ${questionsWithWhyContent} have why content`);
    
    if (totalQuestions !== 36) {
      errors.push(`Expected 36 questions but found ${totalQuestions}`);
    }

    return errors;
  }
}

// Global variable to store loaded assessment data
let assessmentData = null;
let allQuestions = [];
let TOTAL_QUESTIONS = 0;

// Function to initialize the assessment data
async function initializeAssessmentData() {
  try {
    console.log('Loading questions from CSV...');
    assessmentData = await CSVLoader.loadQuestions();
    
    // Validate the loaded data
    const validationErrors = CSVLoader.validateData(assessmentData);
    if (validationErrors.length > 0) {
      console.error('CSV validation errors:', validationErrors);
      // Don't throw error immediately, try to work with what we have
      if (assessmentData.dimensions.length === 0) {
        throw new Error('No questions loaded: ' + validationErrors.join(', '));
      }
    }

    // Flatten all questions for easy access
    allQuestions = [];
    let questionIndex = 0;
    let questionsWithWhy = 0;

    assessmentData.dimensions.forEach((dimension, dimIndex) => {
      dimension.questions.forEach((question, qIndex) => {
        if (question.whyContent && question.whyContent.whyMatters) {
          questionsWithWhy++;
        }
        
        allQuestions.push({
          ...question,
          dimensionIndex: dimIndex,
          dimensionId: dimension.id,
          dimensionName: dimension.name,
          questionInDimension: qIndex + 1,
          totalInDimension: dimension.questions.length,
          globalIndex: questionIndex
        });
        questionIndex++;
      });
    });

    TOTAL_QUESTIONS = allQuestions.length;
    
    console.log(`Successfully loaded ${TOTAL_QUESTIONS} questions from ${assessmentData.dimensions.length} dimensions`);
    console.log(`Questions with why content: ${questionsWithWhy}`);
    
    if (TOTAL_QUESTIONS !== 36) {
      console.warn(`WARNING: Expected 36 questions but loaded ${TOTAL_QUESTIONS}`);
    }
    
    if (questionsWithWhy !== 36) {
      console.warn(`WARNING: Only ${questionsWithWhy} questions have why content out of ${TOTAL_QUESTIONS}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize assessment data:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="background: #fee; border: 1px solid #fcc; padding: 20px; margin: 20px; border-radius: 8px;">
        <h3 style="color: #c33; margin-top: 0;">Configuration Error</h3>
        <p><strong>Unable to load all questions.</strong></p>
        <p>Expected 36 questions but only loaded ${TOTAL_QUESTIONS}.</p>
        <p>Please check the console for details.</p>
        <details>
          <summary>Technical Details</summary>
          <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 4px;">${error.message}</pre>
        </details>
      </div>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    throw error;
  }
}