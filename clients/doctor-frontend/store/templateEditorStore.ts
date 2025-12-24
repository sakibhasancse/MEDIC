import { create } from 'zustand';
import { Element, PrintLayout, HistoryState, AlignmentGuide } from '@/types/templateV2';

interface TemplateEditorState {
  // Template metadata
  templateId: string | null;
  templateName: string;
  templateDescription: string;

  // Canvas state
  elements: Element[];
  selectedElementIds: string[];
  canvasBg: string;
  printLayout: PrintLayout;

  // UI state
  showToolbox: boolean;
  showProperties: boolean;
  showPreview: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showGuides: boolean;
  alignmentGuides: AlignmentGuide[];

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;

  // Actions - Template
  setTemplateId: (id: string | null) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  loadTemplate: (elements: Element[], printLayout: PrintLayout, canvasBg: string, name: string, description: string) => void;

  // Actions - Elements
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  duplicateElement: (id: string) => void;
  duplicateSelectedElements: () => void;

  // Actions - Selection
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Actions - Transform
  moveElement: (id: string, delta: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  rotateElement: (id: string, rotation: number) => void;

  // Actions - Layer management
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Actions - Canvas
  setCanvasBg: (color: string) => void;
  setPrintLayout: (layout: Partial<PrintLayout>) => void;

  // Actions - UI
  toggleToolbox: () => void;
  toggleProperties: () => void;
  togglePreview: () => void;
  setZoom: (zoom: number) => void;
  toggleSnapToGrid: () => void;
  toggleShowGrid: () => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
  clearHistory: () => void;
}

const DEFAULT_PRINT_LAYOUT: PrintLayout = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  showBorders: false,
};

export const useTemplateEditorStore = create<TemplateEditorState>((set, get) => ({
  // Initial state
  templateId: null,
  templateName: '',
  templateDescription: '',
  elements: [],
  selectedElementIds: [],
  canvasBg: '#ffffff',
  printLayout: DEFAULT_PRINT_LAYOUT,
  showToolbox: true,
  showProperties: true,
  showPreview: false,
  zoom: 1,
  snapToGrid: true,
  gridSize: 10,
  showGrid: true,
  showGuides: true,
  alignmentGuides: [],
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Template actions
  setTemplateId: (id) => set({ templateId: id }),
  setTemplateName: (name) => set({ templateName: name }),
  setTemplateDescription: (description) => set({ templateDescription: description }),

  loadTemplate: (elements, printLayout, canvasBg, name, description) => {
    set({
      elements,
      printLayout,
      canvasBg,
      templateName: name,
      templateDescription: description,
      selectedElementIds: [],
      history: [],
      historyIndex: -1,
    });
  },

  // Element actions
  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
    get().addToHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
    get().addToHistory();
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((selectedId) => selectedId !== id),
    }));
    get().addToHistory();
  },

  deleteSelectedElements: () => {
    const { selectedElementIds } = get();
    set((state) => ({
      elements: state.elements.filter((el) => !selectedElementIds.includes(el.id)),
      selectedElementIds: [],
    }));
    get().addToHistory();
  },

  duplicateElement: (id) => {
    const element = get().elements.find((el) => el.id === id);
    if (!element) return;

    const newElement: Element = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementIds: [newElement.id],
    }));
    get().addToHistory();
  },

  duplicateSelectedElements: () => {
    const { selectedElementIds, elements } = get();
    const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));

    const newElements = selectedElements.map((element) => ({
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    }));

    set((state) => ({
      elements: [...state.elements, ...newElements],
      selectedElementIds: newElements.map((el) => el.id),
    }));
    get().addToHistory();
  },

  // Selection actions
  selectElement: (id, multi = false) => {
    set((state) => {
      if (multi) {
        const isSelected = state.selectedElementIds.includes(id);
        return {
          selectedElementIds: isSelected
            ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedElementIds, id],
        };
      }
      return { selectedElementIds: [id] };
    });
  },

  clearSelection: () => set({ selectedElementIds: [] }),

  selectAll: () => {
    set((state) => ({
      selectedElementIds: state.elements.map((el) => el.id),
    }));
  },

  // Transform actions
  moveElement: (id, delta) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
            ...el,
            position: {
              x: Math.max(0, el.position.x + delta.x),
              y: Math.max(0, el.position.y + delta.y),
            },
          }
          : el
      ),
    }));
  },

  resizeElement: (id, size) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, size } : el
      ),
    }));
  },

  rotateElement: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
    }));
  },

  // Layer management
  bringForward: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;

      return {
        elements: state.elements.map((el) =>
          el.id === id
            ? { ...el, style: { ...el.style, zIndex: el.style.zIndex + 1 } }
            : el
        ),
      };
    });
    get().addToHistory();
  },

  sendBackward: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;

      return {
        elements: state.elements.map((el) =>
          el.id === id
            ? { ...el, style: { ...el.style, zIndex: Math.max(0, el.style.zIndex - 1) } }
            : el
        ),
      };
    });
    get().addToHistory();
  },

  bringToFront: (id) => {
    set((state) => {
      const maxZIndex = Math.max(...state.elements.map((el) => el.style.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id
            ? { ...el, style: { ...el.style, zIndex: maxZIndex + 1 } }
            : el
        ),
      };
    });
    get().addToHistory();
  },

  sendToBack: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, style: { ...el.style, zIndex: 0 } }
          : el
      ),
    }));
    get().addToHistory();
  },

  // Canvas actions
  setCanvasBg: (color) => {
    set({ canvasBg: color });
    get().addToHistory();
  },

  setPrintLayout: (layout) => {
    set((state) => ({
      printLayout: { ...state.printLayout, ...layout },
    }));
    get().addToHistory();
  },

  // UI actions
  toggleToolbox: () => set((state) => ({ showToolbox: !state.showToolbox })),
  toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
  togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),

  // History actions
  addToHistory: () => {
    const { elements, history, historyIndex, maxHistorySize } = get();

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(elements)),
      timestamp: Date.now(),
    });

    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      set({
        elements: JSON.parse(JSON.stringify(previousState.elements)),
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        elements: JSON.parse(JSON.stringify(nextState.elements)),
        historyIndex: historyIndex + 1,
      });
    }
  },

  clearHistory: () => set({ history: [], historyIndex: -1 }),
}));
