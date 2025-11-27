// Snap to grid utility functions

/**
 * Snaps a single value to the nearest grid point
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snaps a position object to the nearest grid points
 */
export function snapPositionToGrid(
  position: { x: number; y: number },
  gridSize: number = 10
): { x: number; y: number } {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize),
  };
}

/**
 * Snaps a size object to the nearest grid points
 */
export function snapSizeToGrid(
  size: { width: number; height: number },
  gridSize: number = 10
): { width: number; height: number } {
  return {
    width: Math.max(gridSize, snapToGrid(size.width, gridSize)),
    height: Math.max(gridSize, snapToGrid(size.height, gridSize)),
  };
}

/**
 * Checks if snap to grid is enabled and applies snapping
 */
export function applySnapIfEnabled(
  value: number,
  snapEnabled: boolean,
  gridSize: number = 10
): number {
  return snapEnabled ? snapToGrid(value, gridSize) : value;
}
