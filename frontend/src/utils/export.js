/**
 * Export utilities for whiteboard and notes
 */

/**
 * Export canvas as PNG image
 * @param {HTMLCanvasElement} canvas - Canvas element to export
 * @param {string} filename - Filename for the download
 */
export const exportCanvasAsPNG = (canvas, filename = 'whiteboard.png') => {
  try {
    // Create a new canvas with white background
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    
    // Fill with white background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Draw the original canvas content
    exportCtx.drawImage(canvas, 0, 0);
    
    // Create download link
    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
    
    return true;
  } catch (error) {
    console.error('Error exporting canvas:', error);
    return false;
  }
};

/**
 * Export notes as text file
 * @param {string} content - Notes content to export
 * @param {string} filename - Filename for the download
 */
export const exportNotesAsText = (content, filename = 'notes.txt') => {
  try {
    // Add timestamp header
    const timestamp = new Date().toLocaleString();
    const exportContent = `Collaborative Notes - Exported on ${timestamp}\n\n${content}`;
    
    // Create blob and download
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting notes:', error);
    return false;
  }
};

/**
 * Generate filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} extension - File extension
 * @returns {string} Filename with timestamp
 */
export const generateTimestampedFilename = (baseName, extension) => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
  return `${baseName}_${timestamp}.${extension}`;
};

/**
 * Copy content to clipboard
 * @param {string} content - Content to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (content) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};