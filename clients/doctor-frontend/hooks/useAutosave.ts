import { useEffect, useRef, useCallback } from 'react';
import { printTemplateAPI } from '@/lib/api';
import { Element } from '@/types/templateV2';
import { generateTemplateHTML } from '@/lib/htmlGenerator';

interface UseAutosaveOptions {
  templateId: string | null;
  elements: Element[];
  printLayout: any;
  canvasBg: string;
  templateName: string;
  templateDescription: string;
  interval?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Custom hook for autosaving template changes
 */
export function useAutosave({
  templateId,
  elements,
  printLayout,
  canvasBg,
  templateName,
  templateDescription,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseAutosaveOptions) {
  const lastSavedRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const saveTemplate = useCallback(async () => {
    if (!templateId || !enabled) return;

    // Validate templateId format (MongoDB ObjectId is 24 hex characters)
    if (typeof templateId !== 'string' || templateId.length !== 24) {
      console.warn('⚠️ Invalid template ID format:', templateId);
      return;
    }

    // Create a hash of current state to avoid unnecessary saves
    const currentState = JSON.stringify({
      elements,
      printLayout,
      canvasBg,
      templateName,
      templateDescription,
    });

    // Don't save if nothing changed
    if (currentState === lastSavedRef.current) {
      return;
    }

    try {
      const { html, css } = generateTemplateHTML(elements, printLayout);

      const design = {
        elements,
        printLayout,
        canvasBg,
      };

      await printTemplateAPI.update(templateId, {
        name: templateName,
        description: templateDescription,
        design,
        htmlContent: html,
        cssContent: css,
      });

      lastSavedRef.current = currentState;
      console.log('✅ Template autosaved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Autosave failed:', error);
      // Don't throw - autosave failures shouldn't break the UI
    }
  }, [templateId, elements, printLayout, canvasBg, templateName, templateDescription, enabled]);

  useEffect(() => {
    if (!enabled || !templateId) return;

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up autosave interval
    timerRef.current = setInterval(() => {
      saveTemplate();
    }, interval);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [saveTemplate, interval, enabled, templateId]);

  // Save on unmount (if changes exist)
  useEffect(() => {
    return () => {
      if (enabled && templateId) {
        saveTemplate();
      }
    };
  }, [saveTemplate, enabled, templateId]);

  return { saveTemplate };
}
