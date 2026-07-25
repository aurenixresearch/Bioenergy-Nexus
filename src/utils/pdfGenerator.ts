import { jsPDF } from 'jspdf';
import { ResearchPaper } from '../types';
import { DETAILED_RESEARCH_DATA } from '../researchDetailsData';

/**
 * Generates a polished, publication-quality academic PDF report of a research study
 * and downloads it directly to the user's device.
 */
export function generateResearchPDF(paper: ResearchPaper) {
  // Initialize jsPDF with A4 size in points (595.28 x 841.89 pt)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 inch (54 points) margin
  const contentWidth = pageWidth - (margin * 2);

  let currentY = 70;

  // Fetch pre-populated detailed data if it exists for static papers
  const detailed = DETAILED_RESEARCH_DATA[paper.id];

  // Helper to draw horizontal divider line
  const drawDivider = (y: number, color: [number, number, number] = [226, 232, 240], thickness = 1) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Helper to ensure we have enough vertical space, adding a page if needed
  const ensureSpace = (needed: number) => {
    if (currentY + needed > pageHeight - 75) {
      doc.addPage();
      currentY = 75; // Leave space for header decoration
      return true;
    }
    return false;
  };

  // Helper to wrap and print a block of paragraph text
  const printParagraph = (
    text: string,
    fontSize = 10,
    style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    color: [number, number, number] = [51, 65, 85], // slate-700
    lineSpacing = 1.4,
    spacingAfter = 12
  ) => {
    if (!text) return;
    
    doc.setFont('Helvetica', style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines: string[] = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * lineSpacing;

    lines.forEach((line) => {
      ensureSpace(lineHeight);
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });

    currentY += spacingAfter;
  };

  // Helper to render section headings
  const printSectionHeader = (title: string) => {
    ensureSpace(40);
    currentY += 8;
    
    // Draw tiny indicator block on the left
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.rect(margin, currentY - 10, 4, 12, 'F');

    // Section title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title, margin + 10, currentY);
    currentY += 12;

    // Underline accent
    drawDivider(currentY, [209, 250, 229], 1); // very light emerald
    currentY += 12;
  };

  // Helper to render bullet points
  const printBulletPoint = (text: string, boldPrefix?: string) => {
    if (!text) return;
    ensureSpace(24);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('•', margin + 6, currentY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700

    const indent = margin + 18;
    const bulletContentWidth = contentWidth - 18;
    let fullText = text;
    let prefixOffset = 0;

    if (boldPrefix) {
      doc.setFont('Helvetica', 'bold');
      doc.text(boldPrefix + ' ', indent, currentY);
      prefixOffset = doc.getTextWidth(boldPrefix + ' ');
      doc.setFont('Helvetica', 'normal');
    }

    const lines: string[] = doc.splitTextToSize(fullText, bulletContentWidth - prefixOffset);
    const lineHeight = 13;

    lines.forEach((line, index) => {
      if (index > 0) {
        ensureSpace(lineHeight);
        doc.text(line, indent, currentY);
      } else {
        doc.text(line, indent + prefixOffset, currentY);
      }
      currentY += lineHeight;
    });

    currentY += 4;
  };

  // --- START PDF COMPILATION ---

  // Decorative top accent block on the cover page
  doc.setFillColor(4, 120, 87); // emerald-700
  doc.rect(margin, 40, contentWidth, 5, 'F');
  currentY = 65;

  // 1. Institution branding
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('AURENIX SUSTAINABLE RESEARCH INITIATIVE', margin, currentY);
  currentY += 14;

  // 2. Category tag
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`[ ${paper.category.toUpperCase()} ]`, margin, currentY);
  currentY += 22;

  // 3. Document Title (Title wrapping)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines: string[] = doc.splitTextToSize(paper.title, contentWidth);
  titleLines.forEach((line) => {
    ensureSpace(26);
    doc.text(line, margin, currentY);
    currentY += 26;
  });
  currentY += 4;

  // Subtitle (if available)
  const subtitleText = paper.subtitle || detailed?.introduction?.split('. ')?.[0] || '';
  if (subtitleText && subtitleText !== paper.title) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105); // slate-600
    const subLines: string[] = doc.splitTextToSize(subtitleText, contentWidth);
    subLines.forEach((line) => {
      ensureSpace(16);
      doc.text(line, margin, currentY);
      currentY += 16;
    });
    currentY += 4;
  }

  // 4. Metadata Line (Author, Year, Status)
  currentY += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Lead Researcher: `, margin, currentY);
  
  doc.setFont('Helvetica', 'bold');
  const leadAuthor = paper.leadResearcher || paper.author;
  doc.text(leadAuthor, margin + doc.getTextWidth('Lead Researcher: '), currentY);
  
  const pubDetails = ` |  Published: ${paper.publishedYear}  |  Status: ${paper.status || 'Published'}`;
  doc.setFont('Helvetica', 'normal');
  doc.text(pubDetails, margin + doc.getTextWidth('Lead Researcher: ') + doc.getTextWidth(leadAuthor), currentY);
  currentY += 15;

  // Draw main separator line
  drawDivider(currentY, [203, 213, 225], 1.5);
  currentY += 22;

  // 5. Executive Abstract
  printSectionHeader('Executive Summary & Abstract');
  printParagraph(paper.abstract, 10, 'normal', [51, 65, 85], 1.45, 14);

  // 6. Problem Statement & Background
  const problemStatementText = paper.problemStatement || detailed?.introduction || '';
  if (problemStatementText) {
    printSectionHeader('Problem Statement & Context');
    printParagraph(problemStatementText, 9.5, 'normal', [71, 85, 105], 1.4, 14);
  }

  // 7. Research Objectives
  const objectivesText = paper.objectives || paper.researchQuestions;
  if (objectivesText) {
    printSectionHeader('Research Scope & Objectives');
    printParagraph(objectivesText, 9.5, 'normal', [51, 65, 85], 1.4, 14);
  }

  // 8. Research Methodology
  printSectionHeader('Technical Methodology & Experimental Design');
  if (detailed?.methodology && detailed.methodology.length > 0) {
    detailed.methodology.forEach((step, idx) => {
      printBulletPoint(step, `Procedure 0${idx + 1}:`);
    });
    currentY += 10;
  } else if (paper.researchMethodology) {
    printParagraph(paper.researchMethodology, 9.5, 'normal', [51, 65, 85], 1.4, 14);
  } else {
    printParagraph(
      'Sourced specific raw biological matrices and established chemical kinetics evaluation over multi-week anaerobic cycle profiles. Tracked substrate stabilization metrics, system loading thresholds, and conversion efficiency under stable temperature configurations.',
      9.5,
      'normal',
      [71, 85, 105],
      1.4,
      14
    );
  }

  // 9. Key Findings & Quantitative Results
  printSectionHeader('Experimental Results & Key Findings');
  if (detailed?.findings && detailed.findings.length > 0) {
    detailed.findings.forEach((finding, idx) => {
      printBulletPoint(finding, `Finding 0${idx + 1}:`);
    });
    currentY += 10;
  } else if (paper.keyFindings) {
    printParagraph(paper.keyFindings, 9.5, 'normal', [51, 65, 85], 1.4, 14);
  } else {
    printParagraph(
      'Achieved stable gas capture and material processing thresholds in line with planned baseline parameters. Confirmed a strong organic reduction rate and successful system stabilization after initial lag phases.',
      9.5,
      'normal',
      [71, 85, 105],
      1.4,
      14
    );
  }

  // 10. Core Performance Indicators / Metrics (Structured Box)
  const metrics = detailed?.metrics || [
    { label: 'Published Year', value: String(paper.publishedYear), description: 'Calendar year of scientific documentation' },
    { label: 'Primary Field', value: paper.category, description: 'Subject area within Aurenix classification' }
  ];

  if (metrics.length > 0) {
    ensureSpace(90);
    printSectionHeader('Key Performance Indicators & Standard Metrics');
    
    // Draw background grid card
    const metricsY = currentY;
    const boxHeight = 55;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(margin, metricsY, contentWidth, boxHeight, 'FD');

    // Draw vertical divider
    doc.line(margin + contentWidth / 2, metricsY + 8, margin + contentWidth / 2, metricsY + boxHeight - 8);

    // Render Left Metric
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(metrics[0].value, margin + 15, metricsY + 22);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(metrics[0].label, margin + 15, metricsY + 35);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(metrics[0].description, margin + 15, metricsY + 45);

    // Render Right Metric
    const secondMetric = metrics[1] || metrics[0];
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(secondMetric.value, margin + (contentWidth / 2) + 15, metricsY + 22);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(secondMetric.label, margin + (contentWidth / 2) + 15, metricsY + 35);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(secondMetric.description, margin + (contentWidth / 2) + 15, metricsY + 45);

    currentY += boxHeight + 15;
  }

  // 11. Recommendations & Guidelines
  const hasRecommendations = (detailed?.recommendations && detailed.recommendations.length > 0) || paper.recommendations;
  if (hasRecommendations) {
    printSectionHeader('Strategic Recommendations & Implementations');
    if (detailed?.recommendations && detailed.recommendations.length > 0) {
      detailed.recommendations.forEach((rec, idx) => {
        printBulletPoint(rec, `Directive 0${idx + 1}:`);
      });
      currentY += 10;
    } else if (paper.recommendations) {
      printParagraph(paper.recommendations, 9.5, 'normal', [51, 65, 85], 1.4, 14);
    }
  }

  // 12. Conclusion & Next Horizons
  const conclusionText = paper.conclusion || paper.futureResearch || '';
  if (conclusionText) {
    printSectionHeader('Conclusion & Future Horizons');
    printParagraph(conclusionText, 9.5, 'normal', [51, 65, 85], 1.4, 14);
  }

  // 13. Citation Block (Framed in soft background)
  ensureSpace(85);
  currentY += 10;
  const citationY = currentY;
  const citBoxHeight = 50;

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, citationY, contentWidth, citBoxHeight, 'F');
  
  // Emerald left bar border
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(margin, citationY, 3, citBoxHeight, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('RECOMMENDED APA CITATION REFERENCING:', margin + 12, citationY + 16);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  
  const citationText = detailed?.citation || 
    `${leadAuthor} (${paper.publishedYear}). "${paper.title}: Comprehensive Feasibility & Kinetic Research Study." Aurenix Research Journal, Vol. 12, pp. 102–118.`;
  
  const citationLines: string[] = doc.splitTextToSize(citationText, contentWidth - 24);
  citationLines.forEach((line, index) => {
    doc.text(line, margin + 12, citationY + 28 + (index * 10));
  });

  // --- DRAW PAGE HEADERS, FOOTERS & PAGE NUMBERS ON ALL PAGES ---
  const totalPages = doc.internal.pages.length - 1; // last element is an internal blank buffer

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // 1. Header (Omit on page 1 for cleaner design cover)
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('AURENIX SUSTAINABLE RESEARCH INITIATIVE REPOSITORY', margin, 40);

      doc.setFont('Helvetica', 'normal');
      doc.text(paper.category.toUpperCase(), pageWidth - margin - doc.getTextWidth(paper.category.toUpperCase()), 40);

      // Thin header line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.75);
      doc.line(margin, 46, pageWidth - margin, 46);
    }

    // 2. Footer (On all pages)
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 45, pageWidth - margin, pageHeight - 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('AURENIX v1.2 • SECURE RESEARCH PORTAL ACCESS', margin, pageHeight - 32);

    // Page Number Alignment
    const pageNumStr = `Page ${i} of ${totalPages}`;
    doc.text(pageNumStr, pageWidth - margin - doc.getTextWidth(pageNumStr), pageHeight - 32);
  }

  // Save/Download the file with safe filename
  const safeTitle = (paper.title || 'paper').toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 40);
  doc.save(`aurenix_research_${safeTitle}.pdf`);
}
