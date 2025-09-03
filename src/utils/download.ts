
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
    scale: 2, // 원래 화질로 복원
    useCORS: true,
    allowTaint: true,
    backgroundColor: null, // 배경 투명도 제거
    imageTimeout: 60000,
    logging: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    removeContainer: false,
    x: 0,
    y: 0,
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(elementId);
      if (clonedElement) {
        // 모든 스타일을 명확하게 설정
        clonedElement.style.display = 'block';
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.transform = 'none';
        clonedElement.style.filter = 'none'; // 필터 제거
        clonedElement.style.mixBlendMode = 'normal'; // 블렌드 모드 정상화
        
        // 모든 자식 요소의 투명도 정상화
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.visibility = 'visible';
          (el as HTMLElement).style.filter = 'none';
        });
        
        // 이미지 요소 특별 처리
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
          img.style.filter = 'none';
          img.style.mixBlendMode = 'normal';
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

  console.log('Starting image download process...');
  
  // 애니메이션 클래스들을 임시로 제거
  const originalClasses = element.className;
  console.log('Original classes:', originalClasses);
  
  // 애니메이션 관련 클래스 제거
  element.className = originalClasses
    .replace(/animate-in/g, '')
    .replace(/fade-in/g, '')
    .replace(/duration-\d+/g, '')
    .trim();
  
  // 요소 스타일 강제 설정
  const originalStyle = {
    opacity: element.style.opacity,
    visibility: element.style.visibility,
    transform: element.style.transform
  };
  
  element.style.opacity = '1';
  element.style.visibility = 'visible';
  element.style.transform = 'none';
  
  console.log('Animation classes removed, element prepared');
  
  try {
    // 스크롤 위치 조정
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    
    // 이미지 로딩 완료 대기
    await waitForImages(element);
    
    // 렌더링 완료 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Starting canvas capture...');
    
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      width: element.scrollWidth,
      height: element.scrollHeight,
      backgroundColor: '#ffffff',
      logging: true,
      imageTimeout: 0,
      removeContainer: false,
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        // 클론된 문서에서도 애니메이션 제거
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.opacity = '1';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.transform = 'none';
          clonedElement.style.animation = 'none';
          clonedElement.style.transition = 'none';
          
          // 모든 자식 요소도 처리
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.animation = 'none';
            el.style.transition = 'none';
          });
        }
      }
    });

    console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

    // 캔버스 내용 검증
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 완전히 투명한 픽셀의 개수 확인
      let transparentPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) { // 알파값이 0인 경우
          transparentPixels++;
        }
      }
      
      const totalPixels = data.length / 4;
      const transparencyRatio = transparentPixels / totalPixels;
      
      console.log(`Canvas analysis: ${transparentPixels}/${totalPixels} transparent pixels (${(transparencyRatio * 100).toFixed(2)}%)`);
      
      if (transparencyRatio > 0.9) {
        throw new Error('생성된 이미지가 거의 비어있습니다. 페이지가 완전히 로드된 후 다시 시도해주세요.');
      }
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('이미지 변환에 실패했습니다.');
      }
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      console.log('Download completed successfully');
    }, 'image/png', 1.0);

  } catch (error) {
    console.error('Canvas capture failed:', error);
    throw error;
  } finally {
    // 원래 클래스와 스타일 복원
    element.className = originalClasses;
    element.style.opacity = originalStyle.opacity;
    element.style.visibility = originalStyle.visibility;
    element.style.transform = originalStyle.transform;
    console.log('Original classes and styles restored');
  }
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
