// Global state for tracking currently dragged worker
// This is needed because mobile touch events don't have dataTransfer like desktop drag events

export type WorkerType = 'red' | 'blue' | 'green' | 'options';

export interface DraggedWorkerData {
  id: string;
  type: WorkerType;
  element: HTMLElement | null;
}

// Global variable to store the currently dragged worker data
export const draggedWorkerData: DraggedWorkerData = {
  id: '',
  type: 'red',
  element: null
};
