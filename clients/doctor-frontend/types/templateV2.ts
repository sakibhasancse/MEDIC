// Enhanced type definitions for Template Editor V2 with Material Design

export interface ElementStyle {
  // Typography
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  lineHeight: number;
  align: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;

  // Layout
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };

  // Borders & Decoration
  borderWidth: number;
  borderRadius: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  backgroundColor: string;
  opacity: number;

  // Layer
  zIndex: number;
}

export interface TableColumn {
  name: string;
  width: number;
}

export interface Element {
  id: string;
  type: 'text' | 'image' | 'logo' | 'placeholder' | 'line-horizontal' | 'line-vertical' | 'box' | 'divider';
  content: string;
  dataField?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  locked: boolean;
  visible: boolean;
  style: ElementStyle;

  // Element-specific properties
  imageUrl?: string;
  aspectRatioLocked?: boolean;
  tableColumns?: TableColumn[];
  bulletStyle?: 'disc' | 'circle' | 'square' | 'none';
  bulletSpacing?: number;
}

export interface Watermark {
  text: string;
  opacity: number;
  rotation: number;
}

export interface PrintLayout {
  pageSize: 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  showBorders: boolean;
  backgroundImage?: string;
  watermark?: Watermark;
}

export interface TemplateDesign {
  elements: Element[];
  printLayout: PrintLayout;
  canvasBg: string;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  design: TemplateDesign;
  htmlContent: string;
  cssContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  elements: string[]; // IDs of aligned elements
}

export interface HistoryState {
  elements: Element[];
  timestamp: number;
}

// Toolbox element definition
export interface ToolboxElement {
  type: string;
  dataField?: string;
  label: string;
  icon: string;
  category: 'Doctor' | 'Hospital' | 'Patient' | 'Prescription' | 'General' | 'Lines' | 'Shapes';
  description?: string;
}
