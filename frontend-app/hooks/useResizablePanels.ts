import { useState, useEffect, useCallback } from 'react';

interface PanelSizes {
  leftPanelWidth: number;
  rightPanelWidth: number;
}

const STORAGE_KEY = 'template-editor-panel-sizes';
const DEFAULT_LEFT_WIDTH = 320;
const DEFAULT_RIGHT_WIDTH = 320;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

/**
 * Custom hook for managing resizable panel widths with localStorage persistence
 */
export function useResizablePanels() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Load saved sizes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { leftPanelWidth: savedLeft, rightPanelWidth: savedRight } = JSON.parse(saved) as PanelSizes;
        setLeftPanelWidth(savedLeft);
        setRightPanelWidth(savedRight);
      } catch (error) {
        console.error('Failed to parse saved panel sizes:', error);
      }
    }
  }, []);

  // Save sizes to localStorage
  const saveSizes = useCallback((left: number, right: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ leftPanelWidth: left, rightPanelWidth: right }));
  }, []);

  // Update left panel width
  const updateLeftPanelWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    setLeftPanelWidth(clampedWidth);
    saveSizes(clampedWidth, rightPanelWidth);
  }, [rightPanelWidth, saveSizes]);

  // Update right panel width
  const updateRightPanelWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    setRightPanelWidth(clampedWidth);
    saveSizes(leftPanelWidth, clampedWidth);
  }, [leftPanelWidth, saveSizes]);

  // Handle left panel resize
  const startResizingLeft = useCallback(() => {
    setIsResizingLeft(true);
  }, []);

  const stopResizingLeft = useCallback(() => {
    setIsResizingLeft(false);
  }, []);

  // Handle right panel resize
  const startResizingRight = useCallback(() => {
    setIsResizingRight(true);
  }, []);

  const stopResizingRight = useCallback(() => {
    setIsResizingRight(false);
  }, []);

  // Mouse move handler for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        updateLeftPanelWidth(e.clientX);
      } else if (isResizingRight) {
        const windowWidth = window.innerWidth;
        updateRightPanelWidth(windowWidth - e.clientX);
      }
    };

    const handleMouseUp = () => {
      stopResizingLeft();
      stopResizingRight();
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingLeft, isResizingRight, updateLeftPanelWidth, updateRightPanelWidth, stopResizingLeft, stopResizingRight]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    setLeftPanelWidth: updateLeftPanelWidth,
    setRightPanelWidth: updateRightPanelWidth,
    startResizingLeft,
    stopResizingLeft,
    startResizingRight,
    stopResizingRight,
    isResizingLeft,
    isResizingRight,
  };
}
