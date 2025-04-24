import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

export const generatePDF = (result: any) => {
  // Create a new PDF document
  const doc = new jsPDF();

  // Add title and header
  doc.setFontSize(20);
  doc.setTextColor(66, 139, 202);
  doc.text('Maxillary Impacted Canine Analysis Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Add patient info
  doc.text(`Analysis Date: ${new Date(result.created_at).toLocaleDateString()}`, 20, 40);
  doc.text(`Case ID: ${result.id}`, 20, 50);

  // Add prediction result
  doc.setFontSize(16);
  doc.text('Prediction Result:', 20, 70);

  const formattedResult = result.prediction_result
    ? result.prediction_result
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown';

  // Set text color based on prediction
  if (result.prediction_result?.includes('normal')) {
    doc.setTextColor(0, 128, 0); // Green
  } else if (result.prediction_result?.includes('severely')) {
    doc.setTextColor(255, 0, 0); // Red
  } else {
    doc.setTextColor(255, 140, 0); // Orange
  }

  doc.setFontSize(14);
  doc.text(formattedResult, 120, 70);
  doc.setTextColor(0, 0, 0);

  // Add analysis details
  if (result.analysis) {
    // Sector Analysis
    if (result.analysis.sector_analysis) {
      doc.setFontSize(14);
      doc.text('Sector Analysis', 20, 90);

      autoTable(doc, {
        startY: 95,
        head: [['Parameter', 'Value']],
        body: [
          ['Sector', String(result.analysis.sector_analysis.sector || '')],
          ['Impaction Type', result.analysis.sector_analysis.impaction_type || '']
        ],
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Canine Assessment
    if (result.analysis.canine_assessment) {
      const lastTableEnd = (doc as any).lastAutoTable?.finalY || 95;

      doc.setFontSize(14);
      doc.text('Canine Assessment', 20, lastTableEnd + 15);

      const canineAssessment = result.analysis.canine_assessment;

      autoTable(doc, {
        startY: lastTableEnd + 20,
        head: [['Parameter', 'Value', 'Unfavorable']],
        body: [
          ['Overlap with Lateral', canineAssessment.overlap || '',
            canineAssessment.overlap === 'Yes' ? 'Unfavorable' : canineAssessment.overlap === 'No' ? 'Favorable' : ''],
          ['Vertical Height', canineAssessment.vertical_height || '',
            canineAssessment.vertical_height?.includes('Beyond') ? 'Unfavorable' : 'Favorable'],
          ['Root Position', canineAssessment.root_position || '',
            canineAssessment.root_position?.includes('Above') ? 'Favorable' : 'Unfavorable'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Angle Measurements
    if (result.analysis.angle_measurements && Object.keys(result.analysis.angle_measurements).length > 0) {
      const lastTableEnd = (doc as any).lastAutoTable?.finalY || 95;

      doc.setFontSize(14);
      doc.text('Angle Measurements', 20, lastTableEnd + 15);

      const angleMeasurements = result.analysis.angle_measurements;
      const angleData = [];

      if (angleMeasurements.angle_with_midline) {
        angleData.push([
          'Angle with Midline',
          `${angleMeasurements.angle_with_midline.value.toFixed(2)}°`,
          angleMeasurements.angle_with_midline.difficulty
        ]);
      }

      if (angleMeasurements.angle_with_lateral) {
        angleData.push([
          'Angle with Lateral Incisor',
          `${angleMeasurements.angle_with_lateral.value.toFixed(2)}°`,
          angleMeasurements.angle_with_lateral.difficulty
        ]);
      }

      if (angleMeasurements.angle_with_occlusal) {
        angleData.push([
          'Angle with Occlusal Plane',
          `${angleMeasurements.angle_with_occlusal.value.toFixed(2)}°`,
          angleMeasurements.angle_with_occlusal.difficulty
        ]);
      }

      autoTable(doc, {
        startY: lastTableEnd + 20,
        head: [['Measurement', 'Value', 'Unfavorable']],
        body: angleData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Final Assessment
    const lastTableEnd = (doc as any).lastAutoTable?.finalY || 95;

    doc.setFontSize(14);
    doc.text('Final Assessment', 20, lastTableEnd + 15);

    autoTable(doc, {
      startY: lastTableEnd + 20,
      head: [['Parameter', 'Value']],
      body: [
        ['Difficult Factors', `${result.analysis.difficult_factors || 0} / 6`],
        ['Final Prediction', formattedResult]
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Clinical Recommendations
    const lastTableEnd2 = (doc as any).lastAutoTable?.finalY || 95;

    doc.setFontSize(14);
    doc.text('Clinical Recommendations', 20, lastTableEnd2 + 15);

    let recommendations = '';

    if (result.prediction_result?.includes('impacted')) {
      recommendations = 'The analysis indicates canine impaction. Clinical recommendations include:\n' +
        '• Comprehensive clinical evaluation by an orthodontist\n' +
        '• Consider additional imaging such as CBCT for 3D assessment\n' +
        '• Potential early intervention to guide canine eruption\n' +
        '• Possible extraction of deciduous canine if present';

      if (result.prediction_result?.includes('severely')) {
        recommendations += '\n• Higher difficulty level anticipated for treatment\n' +
          '• May require surgical exposure and orthodontic traction';
      }
    } else {
      recommendations = 'The analysis indicates normal canine positioning. Recommendations include:\n' +
        '• Continue routine dental monitoring\n' +
        '• Regular orthodontic check-ups as scheduled\n' +
        '• No immediate intervention needed for the canine\n' +
        '• Maintain good oral hygiene';
    }

    doc.setFontSize(10);
    doc.text(recommendations, 20, lastTableEnd2 + 30, {
      maxWidth: 170,
      lineHeightFactor: 1.5
    });

    // Add disclaimer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const disclaimer = 'Note: This is an AI-assisted analysis and should be confirmed by a qualified dental professional.';
    doc.text(disclaimer, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  // Add page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
  }

  // Save the PDF with a filename including the case ID and date
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`canine-analysis-${result.id}-${dateStr}.pdf`);
};
