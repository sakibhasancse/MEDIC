export interface ElementStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  zIndex?: number;
}

export interface Element {
  id: string;
  type: 'text' | 'image' | 'logo' | 'placeholder' | 'line-horizontal' | 'line-vertical';
  content: string;
  dataField?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ElementStyle;
}
