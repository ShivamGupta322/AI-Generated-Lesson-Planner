import { jsPDF } from 'jspdf';
import type { LessonPlan } from './types';

export function generatePDF(lessonPlan: Partial<LessonPlan>): string {
  const doc = new jsPDF();
  const lineHeight = 10;
  let yPosition = 20;

  // Helper function to add text and advance position
  const addText = (text: string, size = 12, isBold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, 20, yPosition);
    yPosition += lineHeight;
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, size = 12, isBold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text || '', 170);
    lines.forEach((line: string) => {
      // Check if we need to add a new page
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  };

  // Title
  addText(lessonPlan.topic || 'Lesson Plan', 18, true);
  yPosition += 5;

  // Basic Information
  addText(`Grade Level: ${lessonPlan.gradeLevel}`, 12);
  addText(`Main Concept: ${lessonPlan.mainConcept}`, 12);
  yPosition += 5;

  // Sub-topics
  if (lessonPlan.subTopics?.length) {
    addText('Sub-topics:', 14, true);
    lessonPlan.subTopics.forEach(topic => {
      addText(`• ${topic}`, 12);
    });
    yPosition += 5;
  }

  // Materials
  if (lessonPlan.materials?.length) {
    addText('Materials Needed:', 14, true);
    lessonPlan.materials.forEach(material => {
      addText(`• ${material}`, 12);
    });
    yPosition += 5;
  }

  // Objectives
  if (lessonPlan.objectives?.length) {
    addText('Learning Objectives:', 14, true);
    lessonPlan.objectives.forEach(objective => {
      addText(`• ${objective}`, 12);
    });
    yPosition += 5;
  }

  // Lesson Outline
  if (lessonPlan.outline) {
    addText('Lesson Outline', 14, true);
    yPosition += 5;

    addText('Introduction:', 12, true);
    addWrappedText(lessonPlan.outline.introduction || '');

    addText('Development:', 12, true);
    addWrappedText(lessonPlan.outline.development || '');

    addText('Practice:', 12, true);
    addWrappedText(lessonPlan.outline.practice || '');

    addText('Assessment:', 12, true);
    addWrappedText(lessonPlan.outline.assessment || '');

    addText('Closure:', 12, true);
    addWrappedText(lessonPlan.outline.closure || '');
  }

  // AI Generated Content
  if (lessonPlan.aiContent) {
    // Add a new page for AI content if we're running low on space
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    addText('AI-Generated Content', 14, true);
    yPosition += 5;
    addWrappedText(lessonPlan.aiContent);
  }

  return doc.output('datauristring');
}