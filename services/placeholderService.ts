const getInitials = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1 && words[0].length > 0) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

export const generatePlaceholder = async (name: string, theme: 'light' | 'dark'): Promise<{ file: File, objectURL: string } | null> => {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error("Could not get 2D context from canvas");
    return null;
  }

  // Create a radial gradient background that matches the app's theme
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (theme === 'dark') {
    gradient.addColorStop(0, '#404040'); // Lighter neutral grey
    gradient.addColorStop(1, '#1f1f1f'); // Darker neutral grey
  } else {
    gradient.addColorStop(0, '#e5e5e5'); // Lighter neutral light grey
    gradient.addColorStop(1, '#a3a3a3'); // Darker neutral light grey
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw initials
  const initials = getInitials(name);
  if (initials) {
    ctx.font = `bold ${size / 3}px 'Atkinson Hyperlegible', sans-serif`;
    ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2 + size * 0.05); // Adjust baseline slightly
  }
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const file = new File([blob], 'placeholder.png', { type: 'image/png' });
      const objectURL = URL.createObjectURL(blob);
      resolve({ file, objectURL });
    }, 'image/png');
  });
};