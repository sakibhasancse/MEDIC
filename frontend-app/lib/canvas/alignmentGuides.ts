import { Element, AlignmentGuide } from '@/types/templateV2';

/**
 * Detects alignment guides when dragging an element
 * Returns guides when elements align horizontally or vertically within threshold
 */
export function detectAlignmentGuides(
  elements: Element[],
  activeElementId: string,
  threshold: number = 5
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const activeElement = elements.find((el) => el.id === activeElementId);

  if (!activeElement) return guides;

  const otherElements = elements.filter((el) => el.id !== activeElementId);

  // Calculate active element edges
  const activeLeft = activeElement.position.x;
  const activeRight = activeElement.position.x + activeElement.size.width;
  const activeCenterX = activeElement.position.x + activeElement.size.width / 2;
  const activeTop = activeElement.position.y;
  const activeBottom = activeElement.position.y + activeElement.size.height;
  const activeCenterY = activeElement.position.y + activeElement.size.height / 2;

  otherElements.forEach((element) => {
    const left = element.position.x;
    const right = element.position.x + element.size.width;
    const centerX = element.position.x + element.size.width / 2;
    const top = element.position.y;
    const bottom = element.position.y + element.size.height;
    const centerY = element.position.y + element.size.height / 2;

    // Vertical alignment guides (X-axis)
    if (Math.abs(activeLeft - left) < threshold) {
      addOrUpdateGuide(guides, 'vertical', left, [activeElementId, element.id]);
    }
    if (Math.abs(activeRight - right) < threshold) {
      addOrUpdateGuide(guides, 'vertical', right, [activeElementId, element.id]);
    }
    if (Math.abs(activeCenterX - centerX) < threshold) {
      addOrUpdateGuide(guides, 'vertical', centerX, [activeElementId, element.id]);
    }
    if (Math.abs(activeLeft - right) < threshold) {
      addOrUpdateGuide(guides, 'vertical', right, [activeElementId, element.id]);
    }
    if (Math.abs(activeRight - left) < threshold) {
      addOrUpdateGuide(guides, 'vertical', left, [activeElementId, element.id]);
    }

    // Horizontal alignment guides (Y-axis)
    if (Math.abs(activeTop - top) < threshold) {
      addOrUpdateGuide(guides, 'horizontal', top, [activeElementId, element.id]);
    }
    if (Math.abs(activeBottom - bottom) < threshold) {
      addOrUpdateGuide(guides, 'horizontal', bottom, [activeElementId, element.id]);
    }
    if (Math.abs(activeCenterY - centerY) < threshold) {
      addOrUpdateGuide(guides, 'horizontal', centerY, [activeElementId, element.id]);
    }
    if (Math.abs(activeTop - bottom) < threshold) {
      addOrUpdateGuide(guides, 'horizontal', bottom, [activeElementId, element.id]);
    }
    if (Math.abs(activeBottom - top) < threshold) {
      addOrUpdateGuide(guides, 'horizontal', top, [activeElementId, element.id]);
    }
  });

  return guides;
}

/**
 * Helper function to add or update a guide in the guides array
 */
function addOrUpdateGuide(
  guides: AlignmentGuide[],
  type: 'vertical' | 'horizontal',
  position: number,
  elements: string[]
): void {
  const existingGuide = guides.find(
    (g) => g.type === type && Math.abs(g.position - position) < 1
  );

  if (existingGuide) {
    // Merge elements
    elements.forEach((id) => {
      if (!existingGuide.elements.includes(id)) {
        existingGuide.elements.push(id);
      }
    });
  } else {
    guides.push({ type, position, elements });
  }
}

/**
 * Snaps a position to the nearest alignment guide if within threshold
 */
export function snapToAlignmentGuide(
  position: { x: number; y: number },
  guides: AlignmentGuide[],
  threshold: number = 5
): { x: number; y: number } {
  let snappedX = position.x;
  let snappedY = position.y;

  guides.forEach((guide) => {
    if (guide.type === 'vertical') {
      if (Math.abs(position.x - guide.position) < threshold) {
        snappedX = guide.position;
      }
    } else if (guide.type === 'horizontal') {
      if (Math.abs(position.y - guide.position) < threshold) {
        snappedY = guide.position;
      }
    }
  });

  return { x: snappedX, y: snappedY };
}
