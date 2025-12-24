'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PrintLayoutEditorProps {
  value: {
    leftColumn: string[];
    rightColumn: string[];
  };
  onChange: (value: { leftColumn: string[]; rightColumn: string[] }) => void;
}

const SECTION_LABELS: Record<string, string> = {
  medicines: '💊 Medicines',
  tests: '🔬 Tests',
  advice: '💡 Advice',
  physicalExamination: '🩺 Physical Examination',
  vitalSigns: '💓 Vital Signs',
  historyOfPresentIllness: '📝 History of Present Illness',
  previousLabReports: '📋 Previous Lab Reports',
  chiefComplaint: '🗣️ Chief Complaint',
  diagnosis: '🔍 Diagnosis',
};

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded border border-gray-200 shadow-sm mb-2 cursor-move hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-2"
    >
      <span className="text-gray-400">☰</span>
      <span className="font-medium text-gray-700">{SECTION_LABELS[id] || id}</span>
    </div>
  );
}

export default function PrintLayoutEditor({ value, onChange }: PrintLayoutEditorProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which container the items belong to
    const findContainer = (id: string) => {
      if (id === 'leftColumn' || id === 'rightColumn') return id;
      if (value.leftColumn.includes(id)) return 'leftColumn';
      if (value.rightColumn.includes(id)) return 'rightColumn';
      return null;
    };

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move item to the new container's list
    const activeItems = value[activeContainer as keyof typeof value];
    const overItems = value[overContainer as keyof typeof value];
    
    const activeIndex = activeItems.indexOf(activeId);
    const overIndex = overId === 'leftColumn' || overId === 'rightColumn' 
      ? overItems.length + 1 
      : overItems.indexOf(overId);

    let newIndex;
    if (overId === 'leftColumn' || overId === 'rightColumn') {
      newIndex = overItems.length + 1;
    } else {
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    onChange({
      ...value,
      [activeContainer]: [
        ...value[activeContainer as keyof typeof value].filter((item) => item !== activeId),
      ],
      [overContainer]: [
        ...value[overContainer as keyof typeof value].slice(0, newIndex),
        activeItems[activeIndex],
        ...value[overContainer as keyof typeof value].slice(newIndex, value[overContainer as keyof typeof value].length),
      ],
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over?.id as string;

    if (!over) {
      setActiveId(null);
      return;
    }

    const findContainer = (id: string) => {
      if (id === 'leftColumn' || id === 'rightColumn') return id;
      if (value.leftColumn.includes(id)) return 'leftColumn';
      if (value.rightColumn.includes(id)) return 'rightColumn';
      return null;
    };

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = value[activeContainer as keyof typeof value].indexOf(activeId);
      const overIndex = value[overContainer as keyof typeof value].indexOf(overId);

      if (activeIndex !== overIndex) {
        onChange({
          ...value,
          [activeContainer]: arrayMove(value[activeContainer as keyof typeof value], activeIndex, overIndex),
        });
      }
    }

    setActiveId(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Left Column
          </h3>
          <SortableContext
            id="leftColumn"
            items={value.leftColumn}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[200px]">
              {value.leftColumn.map((id) => (
                <SortableItem key={id} id={id} />
              ))}
              {value.leftColumn.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Drop items here
                </div>
              )}
            </div>
          </SortableContext>
        </div>

        {/* Right Column */}
        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Right Column
          </h3>
          <SortableContext
            id="rightColumn"
            items={value.rightColumn}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[200px]">
              {value.rightColumn.map((id) => (
                <SortableItem key={id} id={id} />
              ))}
              {value.rightColumn.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Drop items here
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? <SortableItem id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
