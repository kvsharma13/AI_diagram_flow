import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export service for generating PDF and image exports
 *
 * Provides utilities for exporting editor views to various formats.
 */

/**
 * Export an element to PDF
 * @param elementId - The DOM element ID to export
 * @param fileName - The output PDF file name
 * @returns Promise<boolean> - Success status
 */
export const exportToPDF = async (
  elementId: string,
  fileName: string = 'export.pdf'
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Convert to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);

    console.log('Exported to PDF:', fileName);
    return true;
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    return false;
  }
};

/**
 * Export an element to PNG image
 * @param elementId - The DOM element ID to export
 * @param fileName - The output image file name
 * @returns Promise<boolean> - Success status
 */
export const exportToImage = async (
  elementId: string,
  fileName: string = 'export.png'
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Download as image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    });

    console.log('Exported to image:', fileName);
    return true;
  } catch (error) {
    console.error('Failed to export to image:', error);
    return false;
  }
};

/**
 * Export multiple views to a single PDF
 * @param elementIds - Array of DOM element IDs to export
 * @param fileName - The output PDF file name
 * @returns Promise<boolean> - Success status
 */
export const exportMultipleToPDF = async (
  elementIds: string[],
  fileName: string = 'export.pdf'
): Promise<boolean> => {
  try {
    const pdf = new jsPDF();
    let isFirstPage = true;

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(fileName);
    console.log('Exported multiple views to PDF:', fileName);
    return true;
  } catch (error) {
    console.error('Failed to export multiple views to PDF:', error);
    return false;
  }
};
