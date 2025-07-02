
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  const canvas = await html2canvas(element, {
    scale: 3, // Increased scale for better quality
    useCORS: true,
    backgroundColor: '#ffffff',
    allowTaint: false,
    imageTimeout: 0,
    removeContainer: true
  });

  const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Center the image on the page
  const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
  const y = 10;
  
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
  pdf.save('쌤BTI_나의브랜딩리포트.pdf');
}

export async function downloadImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  const canvas = await html2canvas(element, {
    scale: 3, // Increased scale for better quality
    useCORS: true,
    backgroundColor: '#ffffff',
    allowTaint: false,
    imageTimeout: 0,
    removeContainer: true
  });

  // Convert to high quality PNG
  canvas.toBlob((blob) => {
    if (blob) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, 'image/png', 1.0); // Maximum quality
}
