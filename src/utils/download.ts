
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: [imgWidth, imgHeight]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save('쌤BTI_나의브랜딩리포트.pdf');
}

export async function downloadImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
