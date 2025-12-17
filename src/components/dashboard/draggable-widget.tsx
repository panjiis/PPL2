import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '../ui/button';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  gridClass?: string;
}

export function DraggableWidget({ id, children, gridClass = '' }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative h-full w-full ${gridClass}`}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
         <Button {...attributes} {...listeners} size='icon' variant='ghost' className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab z-10">
            <GripHorizontal size={16} className="opacity-45 hover:opacity-100 transition-opacity" />
        </Button>
      </div>
      <div
        className={`${
          isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
        } rounded-lg transition-all h-full`}
      >
        {children}
      </div>
    </div>
  );
}
