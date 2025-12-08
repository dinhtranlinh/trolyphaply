// Image rendering with Sharp and SVG
import sharp from 'sharp';

export interface TextConfig {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  textAlign?: 'start' | 'middle' | 'end';
  maxWidth?: number;
}

export async function renderTextOnImage(
  backgroundPath: string,
  texts: TextConfig[],
  outputFormat: 'png' | 'jpeg' = 'png'
): Promise<Buffer> {
  // Load background image
  const background = sharp(backgroundPath);
  const metadata = await background.metadata();
  const width = metadata.width || 1080;
  const height = metadata.height || 1920;

  // Build SVG overlay
  let svgText = `<svg width="${width}" height="${height}">`;

  for (const textConfig of texts) {
    const {
      text,
      x,
      y,
      fontSize = 48,
      fontWeight = 'bold',
      color = '#FFFFFF',
      fontFamily = 'Arial, sans-serif',
      textAlign = 'middle',
      maxWidth,
    } = textConfig;

    // Escape XML special characters
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Split text if maxWidth is specified
    if (maxWidth) {
      const words = escapedText.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        // Rough estimate: 0.6 * fontSize per character
        const estimatedWidth = testLine.length * fontSize * 0.6;

        if (estimatedWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Render multi-line text
      lines.forEach((line, index) => {
        const lineY = y + index * (fontSize * 1.2);
        svgText += `<text
          x="${x}"
          y="${lineY}"
          font-family="${fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${color}"
          text-anchor="${textAlign}"
        >${line}</text>`;
      });
    } else {
      // Single line text
      svgText += `<text
        x="${x}"
        y="${y}"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${color}"
        text-anchor="${textAlign}"
      >${escapedText}</text>`;
    }
  }

  svgText += '</svg>';

  // Composite SVG on background
  const svgBuffer = Buffer.from(svgText);

  const result = await background
    .composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toFormat(outputFormat, { quality: 90 })
    .toBuffer();

  return result;
}

export async function createImageFromScratch(
  width: number,
  height: number,
  backgroundColor: string,
  texts: TextConfig[],
  outputFormat: 'png' | 'jpeg' = 'png'
): Promise<Buffer> {
  // Create solid color background
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: backgroundColor,
    },
  });

  // Build SVG overlay
  let svgText = `<svg width="${width}" height="${height}">`;

  for (const textConfig of texts) {
    const {
      text,
      x,
      y,
      fontSize = 48,
      fontWeight = 'bold',
      color = '#000000',
      fontFamily = 'Arial, sans-serif',
      textAlign = 'middle',
    } = textConfig;

    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    svgText += `<text
      x="${x}"
      y="${y}"
      font-family="${fontFamily}"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      fill="${color}"
      text-anchor="${textAlign}"
    >${escapedText}</text>`;
  }

  svgText += '</svg>';

  const svgBuffer = Buffer.from(svgText);

  const result = await background
    .composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toFormat(outputFormat, { quality: 90 })
    .toBuffer();

  return result;
}
