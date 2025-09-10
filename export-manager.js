// export-manager.js - Gestion des exports CSV et PDF

export class ExportManager {
  constructor() {
    // Helper methods for PDF
    this.getScoreLevel = this.getScoreLevel.bind(this);
    this.getScoreColor = this.getScoreColor.bind(this);
  }

  exportCSV(podName, quarter, overallScore, endTime, focusAreas, dimensionScores, assessmentData, allQuestions, scores) {
    const csvData = this.generateCSVData(podName, quarter, overallScore, endTime, focusAreas, dimensionScores, assessmentData, allQuestions, scores);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.style.display = 'none';
    a.href = url;
    a.download = `${podName}_${quarter}_Assessment.csv`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  generateCSVData(podName, quarter, overallScore, endTime, focusAreas, dimensionScores, assessmentData, allQuestions, scores) {
    let csv = 'Pod Assessment Results\n\n';
    csv += `Pod Name,${podName}\n`;
    csv += `Quarter,${quarter}\n`;
    csv += `Overall Score,${overallScore.toFixed(2)}\n`;
    csv += `Assessment Date,${endTime.toLocaleDateString('fr-FR')}\n\n`;

    // Focus Areas section
    if (focusAreas && focusAreas.length > 0) {
      csv += 'Main Focus Areas for Next Period\n';
      csv += 'Priority,Title,Description,Recommended Actions\n';
      
      focusAreas.forEach(area => {
        const actions = area.recommendations.join('; ');
        csv += `"${area.priority}","${area.title}","${area.description}","${actions}"\n`;
      });
      csv += '\n';
    }

    // Dimension scores
    csv += 'Dimension Scores\n';
    csv += 'Dimension,Average Score,Total Points,Questions Count\n';
    
    assessmentData.dimensions.forEach(dimension => {
      const score = dimensionScores[dimension.id];
      csv += `"${dimension.name}",${score.average.toFixed(2)},${score.total},${score.count}\n`;
    });

    csv += '\nDetailed Responses\n';
    csv += 'Question ID,Dimension,Question,Raw Response,Normalized Score\n';

    allQuestions.forEach(question => {
      const scoreData = scores[question.id];
      if (scoreData) {
        csv += `${question.id},"${question.dimensionName}","${question.text}","${scoreData.rawValue}",${scoreData.normalizedScore}\n`;
      } else {
        csv += `${question.id},"${question.dimensionName}","${question.text}","No Response","No Response"\n`;
      }
    });

    return csv;
  }

  exportPDF(podName, quarter, overallScore, endTime, focusAreas, dimensionScores, assessmentData, allQuestions, scores) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up colors and fonts
    const primaryColor = [37, 99, 235]; // #2563EB
    const textColor = [31, 41, 55]; // #1F2937
    const secondaryColor = [107, 114, 128]; // #6B7280
    
    let yPos = 20;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('Pod Delivery Assessment Report', 20, yPos);
    yPos += 15;
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text(`${podName} - ${quarter}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Assessment Date: ${endTime.toLocaleDateString('fr-FR')}`, 20, yPos);
    yPos += 20;
    
    // Overall Score Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 25, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Overall Score', 25, yPos + 5);
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(overallScore.toFixed(1), 25, yPos + 15);
    yPos += 35;
    
    // Dimension Scores
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Dimension Scores', 20, yPos);
    yPos += 10;
    
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text('Dimension', 20, yPos);
    doc.text('Score', 120, yPos);
    doc.text('Level', 150, yPos);
    yPos += 5;
    
    // Draw line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Dimension rows
    doc.setTextColor(...textColor);
    assessmentData.dimensions.forEach((dimension) => {
      const score = dimensionScores[dimension.id];
      const level = this.getScoreLevel(score.average);
      
      // Handle long dimension names by breaking them manually
      let dimensionName = dimension.name;
      const maxWidth = 95; // Available width for dimension name
      
      // Check if name is too long and split it
      if (doc.getTextWidth(dimensionName) > maxWidth) {
        // Split long names at logical points
        if (dimensionName.includes('&')) {
          const parts = dimensionName.split('&');
          doc.text(parts[0].trim(), 20, yPos);
          doc.text('& ' + parts[1].trim(), 20, yPos + 4);
          yPos += 4; // Extra space for second line
        } else if (dimensionName.includes(' ')) {
          // Split at space if no &
          const words = dimensionName.split(' ');
          const midPoint = Math.ceil(words.length / 2);
          doc.text(words.slice(0, midPoint).join(' '), 20, yPos);
          doc.text(words.slice(midPoint).join(' '), 20, yPos + 4);
          yPos += 4; // Extra space for second line
        } else {
          // Fallback: just print it (might be cut)
          doc.text(dimensionName, 20, yPos);
        }
      } else {
        doc.text(dimensionName, 20, yPos);
      }
      
      doc.text(score.average.toFixed(1), 120, yPos);
      doc.text(level, 150, yPos);
      yPos += 8;
    });
    
    yPos += 15;
    
    // Add radar chart to PDF
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    // Center the chart title
    const chartTitle = 'Performance Radar Chart';
    const titleWidth = doc.getTextWidth(chartTitle);
    const titleXPos = (210 - titleWidth) / 2; // Center horizontally
    doc.text(chartTitle, titleXPos, yPos);
    yPos += 10;
    
    // Capture the radar chart as image and add to PDF
    try {
      const canvas = document.getElementById('radar-chart');
      if (canvas) {
        const chartImage = canvas.toDataURL('image/png');
        // Add chart image to PDF (centered and optimized size)
        const imgWidth = 160;
        const imgHeight = 160;
        const xPos = (210 - imgWidth) / 2; // Center horizontally (A4 width = 210mm)
        doc.addImage(chartImage, 'PNG', xPos, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      }
    } catch (error) {
      console.warn('Could not add radar chart to PDF:', error);
    }
    
    // Main Focus Areas section
    if (focusAreas && focusAreas.length > 0) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Main Focus Areas for Next Period', 20, yPos);
      yPos += 15;
      
      focusAreas.forEach((area, index) => {
        // Check if we need a new page for this focus area
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        // Priority indicator with color coding
        doc.setFontSize(12);
        const priorityColors = {
          'CRITICAL': [239, 68, 68],    // Red
          'HIGH': [245, 158, 11],       // Orange  
          'MEDIUM': [59, 130, 246],     // Blue
          'OPTIMIZE': [16, 185, 129]    // Green
        };
        
        doc.setTextColor(...(priorityColors[area.priority] || textColor));
        doc.text(`${area.priority} PRIORITY`, 20, yPos);
        yPos += 8;
        
        // Title
        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.text(area.title, 20, yPos);
        yPos += 8;
        
        // Description
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        const descLines = doc.splitTextToSize(area.description, 170);
        descLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 5;
        });
        yPos += 3;
        
        // Recommendations
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text('Recommended Actions:', 20, yPos);
        yPos += 6;
        
        area.recommendations.forEach((rec, recIndex) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setTextColor(...textColor);
          const recLines = doc.splitTextToSize(`• ${rec}`, 165);
          recLines.forEach(line => {
            doc.text(line, 25, yPos);
            yPos += 4;
          });
        });
        
        yPos += 8;
      });
      
      yPos += 5;
    }
    
    // Score Guide
    // Check if we need a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text('Score Guide', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    Object.entries(assessmentData.scoreGuide).reverse().forEach(([score, guide]) => {
      doc.setTextColor(...this.getScoreColor(parseInt(score)));
      doc.text(`${score} - ${guide.level}:`, 20, yPos);
      doc.setTextColor(...textColor);
      doc.text(guide.description, 55, yPos);
      yPos += 6;
    });
    
    // New page for detailed responses
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Detailed Responses by Dimension', 20, yPos);
    yPos += 15;
    
    // Detailed responses
    assessmentData.dimensions.forEach((dimension) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      
      // Handle long dimension names in detailed section
      let dimensionName = dimension.name;
      const maxTitleWidth = 170;
      
      if (doc.getTextWidth(dimensionName) > maxTitleWidth) {
        if (dimensionName.includes('&')) {
          const parts = dimensionName.split('&');
          doc.text(parts[0].trim(), 20, yPos);
          doc.text('& ' + parts[1].trim(), 20, yPos + 6);
          yPos += 6; // Extra space for second line
        } else if (dimensionName.includes(' ')) {
          const words = dimensionName.split(' ');
          const midPoint = Math.ceil(words.length / 2);
          doc.text(words.slice(0, midPoint).join(' '), 20, yPos);
          doc.text(words.slice(midPoint).join(' '), 20, yPos + 6);
          yPos += 6; // Extra space for second line
        } else {
          doc.text(dimensionName, 20, yPos);
        }
      } else {
        doc.text(dimensionName, 20, yPos);
      }
      yPos += 8;
      
      const dimensionQuestions = assessmentData.questions.filter(q => q.dimensionId === dimension.id);
      dimensionQuestions.forEach((question) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const scoreData = scores[question.id];
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        
        // Question text (wrapped)
        const questionLines = doc.splitTextToSize(`Q${question.id}: ${question.text}`, 150);
        questionLines.forEach((line, index) => {
          doc.text(line, 25, yPos);
          if (index === 0 && scoreData) {
            // Add score on the first line
            doc.setTextColor(...this.getScoreColor(scoreData.normalizedScore));
            doc.text(`Score: ${scoreData.normalizedScore}`, 175, yPos);
            doc.setTextColor(...textColor);
          }
          yPos += 4;
        });
        
        // Response details
        if (scoreData) {
          doc.setTextColor(...secondaryColor);
          doc.text(`Response: ${scoreData.rawValue}`, 30, yPos);
        } else {
          doc.setTextColor(...secondaryColor);
          doc.text('No response provided', 30, yPos);
        }
        yPos += 8;
      });
      
      yPos += 5;
    });
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text(`Generated by Pod Assessment Tool - Page ${i} of ${pageCount}`, 20, 285);
    }
    
    // Save the PDF
    doc.save(`${podName}_${quarter}_Assessment.pdf`);
  }
  
  getScoreLevel(score) {
    if (score >= 5.5) return 'Mastered';
    if (score >= 4.5) return 'Proficient';
    if (score >= 3.5) return 'Capable';
    if (score >= 2.5) return 'Developing';
    if (score >= 1.5) return 'Struggling';
    return 'Not Present';
  }
  
  getScoreColor(score) {
    if (score >= 5) return [16, 185, 129]; // Green
    if (score >= 3) return [245, 158, 11]; // Orange
    return [239, 68, 68]; // Red
  }
}