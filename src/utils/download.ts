
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  // Wait for images to load
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 15000,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add some padding and center the image
  const x = 0;
  const y = 10;
  
  // If image is too tall for one page, we might need to scale it down
  const maxHeight = 280; // A4 height minus margins
  let finalWidth = imgWidth;
  let finalHeight = imgHeight;
  
  if (imgHeight > maxHeight) {
    finalHeight = maxHeight;
    finalWidth = (canvas.width * maxHeight) / canvas.height;
  }
  
  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
  pdf.save('쌤BTI_나의브랜딩리포트.pdf');
}

export async function downloadImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  // Wait for images to load
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 15000,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false
  });

  // Convert to high quality PNG
  canvas.toBlob((blob) => {
    if (blob) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }, 'image/png', 1.0);
}

// Helper function to wait for all images to load
function waitForImages(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = element.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Add a small delay to ensure rendering is complete
        setTimeout(resolve, 100);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad); // Count errors as loaded to avoid hanging
      }
    });
  });
}
