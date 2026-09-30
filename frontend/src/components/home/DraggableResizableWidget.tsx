'use strict';
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal, Maximize2, RotateCcw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DraggableResizableWidgetProps {
  id: string;
  title: string;
  initialPosition: Position;
  initialSize: Size;
  minSize?: Size;
  maxSize?: Size;
  children: React.ReactNode | ((size: Size) => React.ReactNode);
  className?: string;
  headerExtra?: React.ReactNode;
  zIndex?: number;
  onFocus?: () => void;
}

export const DraggableResizableWidget: React.FC<DraggableResizableWidgetProps> = ({
  title,
  initialPosition,
  initialSize,
  minSize = { width: 260, height: 160 },
  maxSize = { width: 1400, height: 900 },
  children,
  className = '',
  headerExtra,
  zIndex = 20,
  onFocus,
}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: initialPosition.x,
    startY: initialPosition.y,
  });
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startW: initialSize.width,
    startH: initialSize.height,
  });

  // Clamp position to window boundaries
  const clampPosition = useCallback(
    (pos: Position, currentSize: Size): Position => {
      if (typeof window === 'undefined') return pos;
      const maxX = Math.max(10, window.innerWidth - currentSize.width - 10);
      const maxY = Math.max(10, window.innerHeight - currentSize.height - 10);
      return {
        x: Math.max(10, Math.min(maxX, pos.x)),
        y: Math.max(10, Math.min(maxY, pos.y)),
      };
    },
    []
  );

  // Auto-clamp when window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition((prev) => clampPosition(prev, size));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [clampPosition, size]);

  // Reset to initial position and size
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(clampPosition(initialPosition, initialSize));
    setSize(initialSize);
  };

  // ================= DRAG LOGIC =================
  const handleDragPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (onFocus) onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const newPos = {
      x: dragStartRef.current.startX + deltaX,
      y: dragStartRef.current.startY + deltaY,
    };
    setPosition(clampPosition(newPos, size));
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // ================= RESIZE LOGIC =================
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (onFocus) onFocus();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    const deltaX = e.clientX - resizeStartRef.current.mouseX;
    const deltaY = e.clientY - resizeStartRef.current.mouseY;

    const newW = Math.max(minSize.width, Math.min(maxSize.width, resizeStartRef.current.startW + deltaX));
    const newH = Math.max(minSize.height, Math.min(maxSize.height, resizeStartRef.current.startH + deltaY));

    const newSize = { width: newW, height: newH };
    setSize(newSize);
    setPosition((prev) => clampPosition(prev, newSize));
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    setIsResizing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onFocus) onFocus();
      }}
      className={`bg-white/95 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl flex flex-col select-none overflow-hidden transition-shadow duration-200 ${
        isDragging ? 'shadow-3xl ring-2 ring-[#FF6B35]/40 cursor-grabbing' : 'hover:shadow-2xl'
      } ${className}`}
    >
      {/* ================= DRAG HANDLE HEADER ================= */}
      <div
        className="h-8 px-3 bg-[#F4EFE6]/80 border-b border-stone-200/50 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        onPointerCancel={handleDragPointerUp}
      >
        {/* Left Drag Title & Grip */}
        <div className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 pointer-events-none">
          <GripHorizontal className="w-4 h-4 text-stone-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-700">
            {title}
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          {headerExtra}
          <button
            onClick={handleReset}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Reset position & size"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ================= INNER WIDGET CONTENT ================= */}
      <div className="flex-1 min-h-0 overflow-auto relative p-3">
        {typeof children === 'function' ? children(size) : children}
      </div>

      {/* ================= RESIZE HANDLE CORNER ================= */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-1 text-stone-400 hover:text-[#FF6B35] transition-colors z-30"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        title="Drag to resize widget"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="11" y1="1" x2="1" y2="11" />
          <line x1="11" y1="5" x2="5" y2="11" />
          <line x1="11" y1="9" x2="9" y2="11" />
        </svg>
      </div>
    </div>
  );
};
