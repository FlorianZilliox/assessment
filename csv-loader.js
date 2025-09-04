// csv-loader.js - CSV parser and data loader

class CSVLoader {
  static async loadQuestions(csvPath = 'questions.csv') {
    try {
      // Try to fetch the CSV file
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.warn('Cannot load CSV via fetch (likely local file access blocked):', error.message);
      console.log('Using embedded fallback data...');
      
      // Fallback to embedded CSV data
      return this.parseCSV(this.getEmbeddedCSV());
    }
  }

  static getEmbeddedCSV() {
    return `dimension_id,dimension_name,dimension_description,question_id,question_text,question_type,option_1_label,option_1_value,option_2_label,option_2_value,option_3_label,option_3_value,option_4_label,option_4_value,option_5_label,option_5_value,option_6_label,option_6_value
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,1,The pod tracks workflow KPIs and clearly identifies bottlenecks in their process,A,,,,,,,,,,,,
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,2,How well does the pod manage concurrent work to maintain flow?,C,Chaos - Everyone works on everything constant context switching,1,Overloaded - People juggle many items lots of 90% done work,2,Some awareness - Pod tries to limit WIP but often fails under pressure,3,Usually controlled - Most members focus on 1-2 items occasional overload,4,Well managed - Clear focus items flow smoothly rare bottlenecks,5,Optimized flow - Pod proactively manages WIP pulls work at sustainable pace,6
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,3,"The pod knows and actively works to reduce the time from ""started"" to ""done""",A,,,,,,,,,,,,
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,4,Bottlenecks are made visible and the pod actively works to eliminate them,A,,,,,,,,,,,,
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,5,Dependencies with other pods (code reviews cross-pod projects) are identified and optimized to avoid delays,A,,,,,,,,,,,,
workflow,WORKFLOW MASTERY,How well does the pod control and optimize their flow of work?,6,The number of items completed per sprint is predictable and stable,A,,,,,,,,,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,7,Each iteration has a proper preparation (refinement) and planning session,C,No planning sessions,1,Planning exists but poorly prepared,2,Planning exists sometimes prepared,3,Planning exists usually well prepared,4,Planning exists always well prepared,5,Planning refined regularly always excellent,6
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,8,Daily check-ins effectively identify blockers and coordinate work,A,,,,,,,,,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,9,The pod demonstrates completed work and tracks delivery metrics each sprint,A,,,,,,,,,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,10,Product demos conducted with stakeholders this quarter,B,0 demos,1,1 demo,3,2 demos,5,3+ demos,6,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,11,Backlog refinement happens regularly and keeps upcoming work ready,A,,,,,,,,,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,12,The pod has a dedicated ritual for continuous improvement each iteration (retrospective),A,,,,,,,,,,,,
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,13,Pod member attendance at ceremonies,B,Less than 60%,1,60-69%,2,70-79%,3,80-89%,4,90-94%,5,95% or higher,6
rituals,RITUALS & CADENCE,How effective are the pod's ceremonies and regular practices?,14,Pod members find the ceremonies valuable and wouldn't want to skip them,A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,15,Sprint goals are clear and written by PM/EM,C,No sprint goals defined,1,"""Goal"" is just the list of stories/tasks",2,Multiple goals to cover different priorities,3,Single goal focused on delivery (output),4,Single goal focused on user/business value (outcome),5,Single outcome goal with clear success metric,6
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,16,The pod has clear visibility of the portfolio of initiatives in their quarterly roadmap,A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,17,The functional and technical source of truth is clearly identified and kept up-to-date by the pod,A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,18,Sprint progress and blockers are visible to all pod members and stakeholders (Kanban board Up to date),A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,19,Regular clear communication keeps stakeholders informed of progress and challenges,A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,20,Decisions are documented and communicated clearly,C,No decision documentation,1,Some decisions documented,2,Important decisions usually documented,3,Most decisions documented,4,All decisions documented,5,All decisions documented with context and rationale,6
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,21,How visible and trackable is all the pod's work?,C,Invisible work - No idea who works on what lots of surprise tasks,1,Scattered - Some work in Jira some in slack some nowhere,2,Partially visible - Main work tracked but side tasks are hidden,3,Mostly visible - Most work is tracked occasional invisible tasks,4,Fully transparent - All work visible everyone knows where to look,5,Optimized visibility - Real-time view of all work with clear status,6
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,22,The pod clearly understands the priority and rationale behind work items,A,,,,,,,,,,,,
visibility,VISIBILITY & ALIGNMENT,How clear and transparent are goals progress and information?,23,Critical knowledge is documented and shared not held by individuals,A,,,,,,,,,,,,
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,24,How ready is work when the pod starts it?,C,Not ready - Immediately blocked can't even begin,1,Barely ready - Start but quickly blocked on basics,2,Somewhat ready - Can start but need significant clarifications,3,Mostly ready - Good to start minor clarifications needed,4,Well ready - Everything clear rare questions during work,5,Perfectly ready - Crystal clear zero blocks from start to done,6
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,25,When work is marked 'done' how complete is it really?,C,Done = coded - Always needs testing review documentation,1,Done = works on my machine - Often breaks in other environments,2,Done = technically complete - Functional but missing polish documentation,3,Done = mostly shippable - Small tweaks needed before release,4,Done = ready to ship - Could go to production immediately,5,Done = in production creating value - Deployed monitored validated by users,6
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,26,Sprint commitment completion rate,B,Less than 50%,1,50-59%,2,60-69%,3,70-79%,4,80-89%,5,90% or higher,6
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,27,Test execution is owned by the entire pod to avoid bottlenecks in the workflow,A,,,,,,,,,,,,
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,28,Quality checks are built into the process and prevent defects from moving forward,A,,,,,,,,,,,,
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,29,"Defect rate after work is marked ""done""",B,Many defects found regularly,1,Frequent defects found,2,Some defects found occasionally,3,Few defects found,4,Very few defects found,5,Rare or no defects found,6
execution,EXECUTION QUALITY,How well does the pod deliver on commitments with quality?,30,Frequency of rework due to misunderstandings or quality issues,B,Rework happens frequently,1,Rework happens often,2,Rework happens sometimes,3,Rework happens occasionally,4,Rework happens rarely,5,Rework almost never happens,6
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,31,Improvements implemented in how the pod works together this quarter,B,0 improvements,1,1-2 improvements,3,3-4 improvements,5,5+ improvements,6,,,,
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,32,Do retrospective actions lead to real improvements?,C,Actions lost - Identified but forgotten immediately,1,Actions logged nothing happens - Written somewhere never done,2,Few actions completed - Some effort but little change,3,Some improvements implemented - Visible progress on key items,4,Most improvements delivered - Real changes each sprint,5,Continuous improvement culture - Improvements + measurement of impact,6
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,33,The pod regularly tries new practices and techniques,A,,,,,,,,,,,,
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,34,Problems and failures are analyzed for root causes and learning (post-mortem),A,,,,,,,,,,,,
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,35,Fast feedback loops exist at multiple levels (code product process),A,,,,,,,,,,,,
improvement,CONTINUOUS IMPROVEMENT,How well does the pod learn and evolve their practices?,36,Improvements and their impacts are celebrated and shared,A,,,,,,,,,,,,`;
  }

  static parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const questionsData = {};
    const dimensionsMap = {};

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length < headers.length) continue; // Skip incomplete lines
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Create dimension if not exists
      if (!dimensionsMap[row.dimension_id]) {
        dimensionsMap[row.dimension_id] = {
          id: row.dimension_id,
          name: row.dimension_name,
          description: row.dimension_description,
          questions: []
        };
      }

      // Create question object
      const question = {
        id: parseInt(row.question_id),
        text: row.question_text,
        type: row.question_type
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
    }

    // Convert map to array and sort questions by ID
    const dimensions = Object.values(dimensionsMap);
    dimensions.forEach(dimension => {
      dimension.questions.sort((a, b) => a.id - b.id);
    });

    return {
      dimensions: dimensions,
      scoreGuide: {
        6: { level: 'Mastered', description: 'Consistently excellent, could teach others', meaning: 'This is a pod strength' },
        5: { level: 'Proficient', description: 'Usually works well, minor tweaks only', meaning: 'Maintain and refine' },
        4: { level: 'Capable', description: 'Generally good, some gaps to address', meaning: 'Steady improvement needed' },
        3: { level: 'Developing', description: 'Hit and miss, needs focus', meaning: 'Priority for improvement' },
        2: { level: 'Struggling', description: 'More often problematic than not', meaning: 'Requires urgent attention' },
        1: { level: 'Not Present', description: 'Rarely or never happens', meaning: 'Critical gap to address' }
      }
    };
  }

  // Parse a CSV line handling quotes and commas properly
  static parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  }

  // Validate loaded data structure
  static validateData(data) {
    const errors = [];

    if (!data.dimensions || !Array.isArray(data.dimensions)) {
      errors.push('Invalid dimensions data structure');
      return errors;
    }

    data.dimensions.forEach((dimension, dimIndex) => {
      if (!dimension.id || !dimension.name || !dimension.questions) {
        errors.push(`Dimension ${dimIndex + 1}: Missing required fields`);
        return;
      }

      dimension.questions.forEach((question, qIndex) => {
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
      throw new Error('Invalid CSV data: ' + validationErrors.join(', '));
    }

    // Flatten all questions for easy access (same logic as before)
    allQuestions = [];
    let questionIndex = 0;

    assessmentData.dimensions.forEach((dimension, dimIndex) => {
      dimension.questions.forEach((question, qIndex) => {
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
    return true;
  } catch (error) {
    console.error('Failed to initialize assessment data:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="background: #fee; border: 1px solid #fcc; padding: 20px; margin: 20px; border-radius: 8px;">
        <h3 style="color: #c33; margin-top: 0;">Configuration Error</h3>
        <p><strong>Unable to load questions configuration.</strong></p>
        <p>Please check that the <code>questions.csv</code> file exists and is properly formatted.</p>
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