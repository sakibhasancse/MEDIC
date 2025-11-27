import { useEffect } from 'react';
import { useTemplateEditorStore } from '@/store/templateEditorStore';

/**
 * Custom hook to handle keyboard shortcuts for the template editor
 */
export function useKeyboardShortcuts() {
  const {
    deleteSelectedElements,
    duplicateSelectedElements,
    undo,
    redo,
    selectedElementIds,
    elements,
    updateElement,
    selectAll,
  } = useTemplateEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Delete: Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedElementIds.length > 0) {
          deleteSelectedElements();
        }
      }

      // Ctrl+D or Cmd+D: Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementIds.length > 0) {
          duplicateSelectedElements();
        }
      }

      // Ctrl+Z or Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      }

      // Ctrl+A or Cmd+A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Arrow keys: Move selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        const moveDistance = e.shiftKey ? 10 : 1; // Shift for larger movements

        selectedElementIds.forEach((id) => {
          const element = elements.find((el) => el.id === id);
          if (!element || element.locked) return;

          let deltaX = 0;
          let deltaY = 0;

          switch (e.key) {
            case 'ArrowUp':
              deltaY = -moveDistance;
              break;
            case 'ArrowDown':
              deltaY = moveDistance;
              break;
            case 'ArrowLeft':
              deltaX = -moveDistance;
              break;
            case 'ArrowRight':
              deltaX = moveDistance;
              break;
          }

          updateElement(id, {
            position: {
              x: Math.max(0, element.position.x + deltaX),
              y: Math.max(0, element.position.y + deltaY),
            },
          });
        });
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        useTemplateEditorStore.getState().clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementIds,
    elements,
    deleteSelectedElements,
    duplicateSelectedElements,
    undo,
    redo,
    updateElement,
    selectAll,
  ]);
}
