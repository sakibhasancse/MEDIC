import { Element } from '@/types/template';
import { Element as ElementV2, PrintLayout } from '@/types/templateV2';

// Type guard to check if element is V2
function isElementV2(element: Element | ElementV2): element is ElementV2 {
  return 'rotation' in element;
}

export const generateTemplateHTML = (elements: (Element | ElementV2)[], printLayout: any): { html: string; css: string } => {
  const { pageSize, orientation } = printLayout;
  const width = pageSize === 'A4' ? (orientation === 'portrait' ? 794 : 1123) : (orientation === 'portrait' ? 559 : 794);
  const height = pageSize === 'A4' ? (orientation === 'portrait' ? 1123 : 794) : (orientation === 'portrait' ? 794 : 559);

  let html = `<div class="template-container">`;
  const css = `
    .template-container {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      background: white;
    }
  `;

  elements.forEach((el) => {
    const { id, type, content, position, size, style } = el;
    const isV2 = isElementV2(el);

    // Base styles
    let elementCss = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: ${size.width}px;
      height: ${size.height}px;
      z-index: ${style.zIndex || 1};
    `;

    // Add V2-specific styles
    if (isV2) {
      elementCss += `
        transform: rotate(${el.rotation}deg);
        padding: ${el.style.padding.top}px ${el.style.padding.right}px ${el.style.padding.bottom}px ${el.style.padding.left}px;
        margin: ${el.style.margin.top}px ${el.style.margin.right}px ${el.style.margin.bottom}px ${el.style.margin.left}px;
        background-color: ${el.style.backgroundColor};
        border: ${el.style.borderWidth}px ${el.style.borderStyle} ${el.style.borderColor};
        border-radius: ${el.style.borderRadius}px;
        opacity: ${el.style.opacity};
        ${!el.visible ? 'display: none;' : ''}
      `;
    }

    // Type specific rendering
    if (type === 'text' || type === 'placeholder') {
      elementCss += `
        font-size: ${style.fontSize}px;
        font-family: ${style.fontFamily}, sans-serif;
        color: ${style.color};
        text-align: ${style.align};
        font-weight: ${style.bold ? 'bold' : (isV2 && 'fontWeight' in style ? style.fontWeight : 'normal')};
        font-style: ${style.italic ? 'italic' : 'normal'};
        ${isV2 && 'underline' in style && style.underline ? 'text-decoration: underline;' : ''}
        ${isV2 && 'lineHeight' in style ? `line-height: ${style.lineHeight};` : ''}
        white-space: pre-wrap;
      `;

      // Handle dataField placeholders
      if (el.dataField) {
        html += `<div id="${id}" style="${elementCss.replace(/\n/g, '')}">{{${el.dataField}}}</div>`;
      } else {
        html += `<div id="${id}" style="${elementCss.replace(/\n/g, '')}">${content}</div>`;
      }

    } else if (type === 'image' || type === 'logo') {
      // For images, we use the content as src
      if (content === '{{hospital.logo}}' || content === 'Logo') {
        html += `<img id="${id}" src="{{hospital.logo}}" style="${elementCss.replace(/\n/g, '')}; object-fit: contain;" />`;
      } else {
        html += `<img id="${id}" src="${content}" style="${elementCss.replace(/\n/g, '')}; object-fit: contain;" />`;
      }

    } else if (type === 'line-horizontal') {
      elementCss += `
        border-top: ${style.fontSize}px solid ${style.color};
      `;
      html += `<div id="${id}" style="${elementCss.replace(/\n/g, '')}"></div>`;

    } else if (type === 'line-vertical') {
      elementCss += `
        border-left: ${style.fontSize}px solid ${style.color};
      `;
      html += `<div id="${id}" style="${elementCss.replace(/\n/g, '')}"></div>`;

    } else if (type === 'box' || type === 'divider') {
      // V2 box/divider elements
      html += `<div id="${id}" style="${elementCss.replace(/\n/g, '')}"></div>`;
    }
  });

  html += `</div>`;

  return { html, css };
};
