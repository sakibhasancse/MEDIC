import html2canvas from 'html2canvas';

/**
 * Generate a thumbnail from a canvas element
 */
export async function generateThumbnail(
  canvasElement: HTMLElement,
  width: number = 300,
  height: number = 400
): Promise<string> {
  try {
    const canvas = await html2canvas(canvasElement, {
      scale: 0.5, // Lower scale for smaller file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    // Create a smaller canvas for the thumbnail
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;

    const ctx = thumbnailCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Draw the original canvas scaled down
    ctx.drawImage(canvas, 0, 0, width, height);

    // Convert to base64
    return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}

/**
 * Generate thumbnail from template design
 */
export async function generateThumbnailFromTemplate(
  templateId: string
): Promise<string> {
  const canvasElement = document.getElementById('main-canvas');
  if (!canvasElement) {
    console.error('Canvas element not found');
    return '';
  }

  return generateThumbnail(canvasElement);
}
