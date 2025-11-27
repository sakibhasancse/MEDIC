'use client';

import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

interface StylePanelProps {
  selectedElement: any;
  onStyleChange: (style: any) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Tahoma',
];

export default function StylePanel({ selectedElement, onStyleChange }: StylePanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  console.log('StylePanel render:', { selectedElement, hasElement: !!selectedElement });

  if (!selectedElement) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-2">🎨</div>
        <p className="text-sm">Select an element to customize its style</p>
      </div>
    );
  }

  const style = selectedElement.style || {};
  const isLine = selectedElement.type?.startsWith('line');

  return (
    <div className="space-y-4">
      {/* Font Family - Only for non-line elements */}
      {!isLine && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={style.fontFamily || 'Arial'}
            onChange={(e) => onStyleChange({ ...style, fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Font Size / Line Thickness */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {isLine ? 'Line Thickness' : 'Font Size'}: {style.fontSize || 14}px
        </label>
        <input
          type="range"
          min={isLine ? '1' : '8'}
          max={isLine ? '10' : '48'}
          value={style.fontSize || 14}
          onChange={(e) => onStyleChange({ ...style, fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          {isLine ? 'Line Color' : 'Text Color'}
        </label>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center gap-2"
          >
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: style.color || '#000000' }}
            />
            <span className="text-sm">{style.color || '#000000'}</span>
          </button>
          {showColorPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20" onClick={() => setShowColorPicker(false)}>
              <div 
                className="bg-white p-2 rounded-lg shadow-xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <HexColorPicker
                  color={style.color || '#000000'}
                  onChange={(color) => onStyleChange({ ...style, color })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alignment - Only for non-line elements */}
      {!isLine && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Text Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => onStyleChange({ ...style, align })}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  style.align === align
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {align === 'left' && '⬅️'}
                {align === 'center' && '↔️'}
                {align === 'right' && '➡️'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bold & Italic - Only for non-line elements */}
      {!isLine && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Text Style
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onStyleChange({ ...style, bold: !style.bold })}
              className={`flex-1 px-3 py-2 text-sm font-bold border rounded-lg transition-colors ${
                style.bold
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              B
            </button>
            <button
              onClick={() => onStyleChange({ ...style, italic: !style.italic })}
              className={`flex-1 px-3 py-2 text-sm italic border rounded-lg transition-colors ${
                style.italic
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              I
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
