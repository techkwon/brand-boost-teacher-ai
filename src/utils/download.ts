
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('요소를 찾을 수 없습니다.');
  }

  // Wait for images to load
  await waitForImages(element);

  // Additional wait to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Ensure the element is visible and properly styled
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.transform = 'none';

  const canvas = await html2canvas(element, {
    scale: 4, // Increased for better quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 60000, // Increased timeout
    logging: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    removeContainer: false, // Changed to false
    onclone: (clonedDoc) => {
      // Ensure all styles are copied properly
      const clonedElement = clonedDoc.getElementById(elementId);
      if (clonedElement) {
        // Copy all computed styles
        const originalStyles = window.getComputedStyle(element);
        for (let i = 0; i < originalStyles.length; i++) {
          const prop = originalStyles[i];
          clonedElement.style.setProperty(prop, originalStyles.getPropertyValue(prop));
        }
        
        clonedElement.style.display = 'block';
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.transform = 'none';
        
        // Ensure all child images are loaded
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        });
      }
    }
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

  // Additional wait to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Ensure the element is visible and properly styled
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.transform = 'none';

  const canvas = await html2canvas(element, {
    scale: 4, // Increased for better quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 60000, // Increased timeout
    logging: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    removeContainer: false, // Changed to false
    onclone: (clonedDoc) => {
      // Ensure all styles are copied properly
      const clonedElement = clonedDoc.getElementById(elementId);
      if (clonedElement) {
        // Copy all computed styles
        const originalStyles = window.getComputedStyle(element);
        for (let i = 0; i < originalStyles.length; i++) {
          const prop = originalStyles[i];
          clonedElement.style.setProperty(prop, originalStyles.getPropertyValue(prop));
        }
        
        clonedElement.style.display = 'block';
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.transform = 'none';
        
        // Ensure all child images are loaded
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        });
      }
    }
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

    console.log(`대기 중인 이미지 수: ${totalImages}`);

    if (totalImages === 0) {
      resolve();
      return;
    }

    const onImageLoad = () => {
      loadedCount++;
      console.log(`이미지 로드 완료: ${loadedCount}/${totalImages}`);
      if (loadedCount === totalImages) {
        // Add a longer delay to ensure rendering is complete
        setTimeout(resolve, 1500); // Increased delay
      }
    };

    images.forEach((img, index) => {
      console.log(`이미지 ${index + 1} 상태:`, img.complete ? '로드됨' : '로딩중', img.src);
      if (img.complete && img.naturalWidth > 0) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', (e) => {
          console.error(`이미지 로드 실패: ${img.src}`, e);
          onImageLoad(); // Count errors as loaded to avoid hanging
        });
      }
    });
  });
}
