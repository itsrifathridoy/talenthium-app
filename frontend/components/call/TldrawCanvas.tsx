'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiMousePointer, FiEdit2, FiTrash2, FiType, FiMove, FiArrowUpRight, FiSettings, FiX, FiSquare, FiCircle, FiTriangle, FiHexagon, FiStar } from 'react-icons/fi';
import { track, useEditor, DefaultColorStyle, DefaultFillStyle, DefaultDashStyle, DefaultSizeStyle, DefaultFontStyle, DefaultTextAlignStyle, createShapeId } from 'tldraw';
import 'tldraw/tldraw.css';
import '@/app/tldraw-theme.css';

const Tldraw = dynamic(() => import('tldraw').then(m => m.Tldraw), { ssr: false });

export default function TldrawCanvas({ theme }: { theme: "light" | "dark" }) {
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(true);
  const [isGeoPickerOpen, setIsGeoPickerOpen] = useState(false);
  // No geo shape selected by default
  const [selectedGeoType, setSelectedGeoType] = useState<
    | 'rectangle'
    | 'ellipse'
    | 'triangle'
    | 'diamond'
    | 'hexagon'
    | 'octagon'
    | 'star'
    | 'rhombus'
    | 'oval'
    | 'trapezoid'
    | null
  >(null);

  const CustomUi = track(() => {
    const editor = useEditor();

    useEffect(() => {
      if (!editor) return;
      // Enable double-click to edit geo shapes
      const handleDoubleClick = (e: MouseEvent) => {
        const containerEl = editor.getContainer?.() as HTMLElement | undefined;
        if (!containerEl || !e.target || !containerEl.contains(e.target as Node)) return;
        const point = editor.screenToPage({ x: e.clientX, y: e.clientY });
        const shapes = editor.getShapesAtPoint(point);
        if (!shapes || shapes.length === 0) return;
        const geoShape = shapes.find(s => s.type === 'geo');
        if (geoShape) {
          editor.setSelectedShapes([geoShape.id]);
          editor.setCurrentTool('text');
        }
      };

      // Use keydown for deletion so we can prevent browser navigation on Backspace
      const handleKeyDown = (e: KeyboardEvent) => {
        const active = document.activeElement;
        const isTextInput = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable
        );
        if (isTextInput) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const ids = editor.getSelectedShapeIds();
          if (ids.length > 0) {
            e.preventDefault();
            editor.deleteShapes(ids);
          }
        }
      };

      // Use keyup only for tool shortcuts
      const handleKeyUp = (e: KeyboardEvent) => {
        const active = document.activeElement;
        const isTextInput = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable
        );
        const currentTool = editor.getCurrentToolId();
        if (isTextInput || currentTool === 'text') return; // don't switch tools while typing

        switch (e.key) {
          case 'v': editor.setCurrentTool('select'); break;
          case 'h': editor.setCurrentTool('hand'); break;
          case 'e': editor.setCurrentTool('eraser'); break;
          case 'x':
          case 'p':
          case 'b':
          case 'd': editor.setCurrentTool('draw'); break;
          case 'a': editor.setCurrentTool('arrow'); break;
          case 't': editor.setCurrentTool('text'); break;
          case 'n': editor.setCurrentTool('note'); break;
          case 'm': editor.setCurrentTool('media'); break;
          case 'g': editor.setCurrentTool('geo'); break;
        }
      };

      const containerEl = editor.getContainer?.() as HTMLElement | undefined;
      containerEl?.addEventListener('dblclick', handleDoubleClick);
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        containerEl?.removeEventListener('dblclick', handleDoubleClick);
        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [editor]);

    useEffect(() => {
      if (!editor) return;

      // Add mouse event handling for custom shape drawing (drag only)
      let isDrawing = false;
      let didMove = false;
      let startPoint = { x: 0, y: 0 };
      let tempShapeId: string | null = null;
      const DRAG_THRESHOLD = 5; // px

      const isInsideEditor = (target: EventTarget | null) => {
        const container = editor.getContainer?.() as HTMLElement | undefined;
        return !!(container && target && container.contains(target as Node));
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return; // only left click
        // removed custom shape drawing logic
        if (editor.getCurrentToolId() !== 'select') return; // draw only in select mode
        if (!isInsideEditor(e.target)) return; // ignore clicks outside canvas
        if (!selectedGeoType) return; // no geo type selected, do nothing

        isDrawing = true;
        didMove = false;
        const start = editor.screenToPage({ x: e.clientX, y: e.clientY });
        startPoint = { x: start.x, y: start.y };

        // Create a tiny temp shape to visualize immediately
        try {
          const id = createShapeId();
          tempShapeId = id as any;
          editor.createShapes([
            {
              id,
              type: 'geo' as const,
              x: startPoint.x,
              y: startPoint.y,
              props: {
                geo: selectedGeoType as any,
                w: 1,
                h: 1,
                fill: 'none',
                color: 'black',
                size: 'm',
                dash: 'solid',
              },
            },
          ]);
        } catch (err) {
          console.log('Temp shape create error', err);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        // only update when actively drawing with a temp shape
        if (!isDrawing || !tempShapeId) return;
        const cur = editor.screenToPage({ x: e.clientX, y: e.clientY });
        const x = Math.min(startPoint.x, cur.x);
        const y = Math.min(startPoint.y, cur.y);
        const w = Math.abs(cur.x - startPoint.x);
        const h = Math.abs(cur.y - startPoint.y);
        if (!didMove && (w > DRAG_THRESHOLD || h > DRAG_THRESHOLD)) didMove = true;
        try {
          editor.updateShapes([
            {
              id: tempShapeId as any,
              type: 'geo',
              x,
              y,
              props: { w: Math.max(w, 1), h: Math.max(h, 1) },
            } as any,
          ]);
        } catch (err) {
          // ignore
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        // only handle when we were drawing
        if (!isDrawing) return;
        const end = editor.screenToPage({ x: e.clientX, y: e.clientY });
        // Only keep the shape if drag exceeded threshold
        const w = Math.abs(end.x - startPoint.x);
        const h = Math.abs(end.y - startPoint.y);
        const kept = didMove && (w > DRAG_THRESHOLD || h > DRAG_THRESHOLD);
        if (!kept) {
          // delete temp shape on click or tiny drag
          if (tempShapeId) {
            try { editor.deleteShapes([tempShapeId as any]); } catch {}
          }
        } else {
          // auto-select the created shape so Backspace/Delete works immediately
          if (tempShapeId) {
            try { editor.setSelectedShapes([tempShapeId as any]); } catch {}
          }
        }
        // reset state for next draw but keep selectedShapeType for continuous drawing
        isDrawing = false;
        tempShapeId = null;
        didMove = false;
      };

      // Add event listeners
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
  }, [editor, selectedGeoType]);
    
    const createShapeAtPosition = React.useCallback((shapeType: string, start: { x: number, y: number }, end: { x: number, y: number }) => {
      try {
        // Calculate position and dimensions
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);
        
        // Create the shape with the selected type
        const shapeData = {
          type: 'geo' as const,
          x,
          y,
          props: {
            geo: shapeType as any,
            w: Math.max(w, 20), // Minimum size
            h: Math.max(h, 20),
            fill: 'none',
            color: 'black',
            size: 'm',
            dash: 'solid',
          },
        };
        
        editor.createShapes([shapeData]);
        console.log(`Created ${shapeType} at position (${x}, ${y}) with size ${w}x${h}`);
        
      } catch (error) {
        console.log('Shape creation error:', error);
      }
    }, [editor]);

    if (!editor) return null;
    const setStyle = React.useCallback((style: any, value: any) => {
      editor.setStyleForSelectedShapes(style, value);
    }, [editor]);

    const createShape = React.useCallback((shapeType: string) => {
      try {
        // Set the selected shape type for visual feedback
  // removed custom shape drawing logic
        
        // Instead of trying to configure the geo tool, we'll create a custom drawing experience
        // When the user clicks and drags, we'll create the specific shape type
        console.log(`Selected shape type: ${shapeType} - Ready to draw ${shapeType}`);
        
        // For now, we'll switch to a drawing mode that respects the selected shape type
        // The user will need to click and drag to create the shape
        editor.setCurrentTool('select'); // Start with select tool
        
        // We'll implement the actual shape creation in the next step
        // This will involve listening to mouse events and creating shapes on demand
        
      } catch (error) {
        console.log('Shape tool switch error:', error);
        // Fallback to select tool if switching fails
        editor.setCurrentTool('select');
      }
    }, [editor]);

    const setGeoType = React.useCallback((geoType: typeof selectedGeoType) => {
  // Use custom draw-only flow: set selected type and keep select tool
  setSelectedGeoType(geoType);
  editor.setCurrentTool('select');
    }, [editor]);

    const geoTypeOptions = [
      { id: 'rectangle', label: 'Rectangle', icon: <FiSquare /> },
      { id: 'ellipse', label: 'Circle', icon: <FiCircle /> },
      { id: 'triangle', label: 'Triangle', icon: <FiTriangle /> },
      { id: 'diamond', label: 'Diamond', icon: <FiHexagon /> },
      { id: 'hexagon', label: 'Hexagon', icon: <FiHexagon /> },
      { id: 'star', label: 'Star', icon: <FiStar /> },
    ] as const;
    const colorOptions = [
      { id: 'black', hex: '#111827' },
      { id: 'blue', hex: '#60a5fa' },
      { id: 'green', hex: '#34d399' },
      { id: 'red', hex: '#f87171' },
      { id: 'yellow', hex: '#facc15' },
      { id: 'violet', hex: '#a78bfa' },
      { id: 'grey', hex: '#9ca3af' },
      { id: 'white', hex: '#ffffff' },
    ];
    const sizeOptions = ['s','m','l','xl'] as const;
    const dashOptions = ['solid','dashed','dotted','draw'] as const;
    const fillOptions = ['none','semi','solid'] as const;
    const fontOptions = ['draw','sans','serif','mono'] as const;
    const alignOptions = [
      { id: 'start', label: 'Left' },
      { id: 'middle', label: 'Center' },
      { id: 'end', label: 'Right' },
    ] as const;

    const drawingTools = [
      { id: 'select', label: 'Select', icon: <FiMousePointer /> },
      { id: 'hand', label: 'Hand', icon: <FiMove /> },
      { id: 'draw', label: 'Draw', icon: <FiEdit2 /> },
      { id: 'eraser', label: 'Eraser', icon: <FiTrash2 /> },
      { id: 'arrow', label: 'Arrow', icon: <FiArrowUpRight /> },
      { id: 'text', label: 'Text', icon: <FiType /> },
    ];

    const shapeTools = [
      { id: 'rectangle', label: 'Rectangle', icon: <FiSquare />, shapeType: 'rectangle' },
      { id: 'ellipse', label: 'Circle', icon: <FiCircle />, shapeType: 'ellipse' },
      { id: 'triangle', label: 'Triangle', icon: <FiTriangle />, shapeType: 'triangle' },
      { id: 'diamond', label: 'Diamond', icon: <FiHexagon />, shapeType: 'diamond' },
      { id: 'hexagon', label: 'Hexagon', icon: <FiHexagon />, shapeType: 'hexagon' },
      { id: 'star', label: 'Star', icon: <FiStar />, shapeType: 'star' },
    ] as const;

    return (
      <div className="custom-layout">
        <div className="custom-toolbar-vertical">
          {drawingTools.map(tool => (
            <button
              key={tool.id}
              className="custom-button-vertical"
              data-isactive={editor.getCurrentToolId() === tool.id}
              onClick={() => {
                editor.setCurrentTool(tool.id as any);
                if (tool.id === 'select') {
                  // Deselect geo tool type when Select is clicked
                  setSelectedGeoType(null);
                }
              }}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
          
          

          
          <button
            className="custom-button-vertical style-toggle"
            onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
            title={isStylePanelOpen ? 'Hide Style Panel' : 'Show Style Panel'}
          >
            {isStylePanelOpen ? <FiX /> : <FiSettings />}
          </button>

          <button
            className="custom-button-vertical geo-picker"
            onClick={() => setIsGeoPickerOpen(!isGeoPickerOpen)}
            title={selectedGeoType ? `Current Geo: ${selectedGeoType} - Click to change` : 'No geo selected - Click to choose'}
            data-isactive={editor.getCurrentToolId() === 'geo'}
          >
            {selectedGeoType ? geoTypeOptions.find(opt => opt.id === selectedGeoType)?.icon : <FiHexagon />}
          </button>
        </div>

        {isGeoPickerOpen && (
          <div className="geo-picker-panel">
            <div className="panel-header">
              <span className="panel-title">Geo Tool Types</span>
              <button
                className="close-panel-btn"
                onClick={() => setIsGeoPickerOpen(false)}
                title="Close"
              >
                <FiX size={14} />
              </button>
            </div>
            
            <div className="panel-group">
              <div className="panel-title">Select Geo Type</div>
              <div className="panel-row geo-grid">
                {geoTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`geo-type-btn ${selectedGeoType === option.id ? 'selected' : ''}`}
                    onClick={() => {
                      setGeoType(option.id);
                      setIsGeoPickerOpen(false);
                    }}
                    title={option.label}
                  >
                    {option.icon}
                    <span className="geo-type-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-group">
              <div className="panel-title">Quick Create</div>
              <div className="panel-row">
                <button 
                  className="seg-btn create-geo-btn"
                  onClick={() => {
                    if (selectedGeoType) {
                      createShape(selectedGeoType);
                      setIsGeoPickerOpen(false);
                    }
                  }}
                  title={selectedGeoType ? `Create ${selectedGeoType}` : 'Select a geo type first'}
                  disabled={!selectedGeoType}
                >
                  {selectedGeoType ? `Create ${selectedGeoType}` : 'Select a geo type'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isStylePanelOpen && (
          <div className="custom-stylepanel">
            <div className="panel-header">
              <span className="panel-title">Style Panel</span>
              <button
                className="close-panel-btn"
                onClick={() => setIsStylePanelOpen(false)}
                title="Close"
              >
                <FiX size={14} />
              </button>
            </div>
            <div className="panel-group">
              <div className="panel-title">Stroke</div>
              <div className="panel-row">
                {sizeOptions.map((s) => (
                  <button key={s} className="seg-btn" onClick={() => setStyle(DefaultSizeStyle, s)} title={`Size ${s.toUpperCase()}`}>{s.toUpperCase()}</button>
                ))}
              </div>
              <div className="panel-row">
                {dashOptions.map((d) => (
                  <button key={d} className="seg-btn" onClick={() => setStyle(DefaultDashStyle, d)} title={`Dash ${d}`}>{d}</button>
                ))}
              </div>
            </div>

            <div className="panel-group">
              <div className="panel-title">Color</div>
              <div className="panel-row colors">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    className="color-swatch"
                    style={{ backgroundColor: c.hex, borderColor: c.id === 'white' ? '#e5e7eb' : 'transparent' }}
                    onClick={() => setStyle(DefaultColorStyle, c.id)}
                    title={c.id}
                  />
                ))}
              </div>
            </div>

            <div className="panel-group">
              <div className="panel-title">Fill</div>
              <div className="panel-row">
                {fillOptions.map((f) => (
                  <button key={f} className="seg-btn" onClick={() => setStyle(DefaultFillStyle, f)} title={`Fill ${f}`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="panel-group">
              <div className="panel-title">Text</div>
              <div className="panel-row">
                {fontOptions.map((f) => (
                  <button key={f} className="seg-btn" onClick={() => setStyle(DefaultFontStyle, f)} title={`Font ${f}`}>{f}</button>
                ))}
              </div>
              <div className="panel-row">
                {alignOptions.map((a) => (
                  <button key={a.id} className="seg-btn" onClick={() => setStyle(DefaultTextAlignStyle, a.id)} title={`Align ${a.label}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

  {/* removed shape options modal and related UI */}
      </div>
    );
  });

  return (
    <div className="absolute inset-0 p-3">
      <div className={`h-full w-full overflow-hidden rounded-2xl border shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)] ${
        theme === "light"
          ? "border-emerald-300/30 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20"
          : "border-emerald-300/20 bg-[#0b1412]"
      }`} data-theme={theme}>
        <Tldraw hideUi inferDarkMode={theme === "dark"}>
          {CustomUi && <CustomUi />}
        </Tldraw>
      </div>
      <style>{`
        .custom-layout { 
          position: absolute; 
          inset: 0px; 
          z-index: 300; 
          pointer-events: none; 
        }
        .custom-toolbar-vertical { 
          position: absolute; 
          top: 16px; 
          left: 16px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 8px; 
          ${theme === "light" 
            ? `background: rgba(255,255,255,0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(16,185,129,0.08);`
            : `background: rgba(6, 17, 15, 0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(16,185,129,0.08);`
          }
          border-radius: 16px; 
          padding: 12px 8px; 
          backdrop-filter: blur(8px); 
        }
        .custom-button-vertical { 
          pointer-events: all; 
          width: 40px; 
          height: 40px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.8);
               color: #047857;
               border: 1px solid rgba(16,185,129,0.3);`
            : `background: rgba(13, 26, 22, 0.9);
               color: #d1fae5;
               border: 1px solid rgba(16,185,129,0.3);`
          }
          border-radius: 12px; 
          transition: all 0.15s ease; 
          font-size: 16px; 
        }
        .custom-button-vertical:hover { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.95);
               border-color: rgba(16,185,129,0.5);
               color: #065f46;`
            : `background: rgba(16, 78, 63, 0.6);
               border-color: rgba(52,211,153,0.5);`
          }
          transform: translateY(-1px); 
        }
        .custom-button-vertical[data-isactive='true'] { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.9);
               color: white;
               border-color: rgba(16,185,129,0.8);
               box-shadow: 0 0 0 2px rgba(16,185,129,0.4);`
            : `background: rgba(16,185,129,0.8);
               color: #0a1813;
               border-color: rgba(16,185,129,0.6);
               box-shadow: 0 0 0 2px rgba(16,185,129,0.3);`
          }
        }
        .shape-picker { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.15);
               border-color: rgba(16,185,129,0.4);`
            : `background: rgba(16,185,129,0.2);
               border-color: rgba(16,185,129,0.4);`
          }
          position: relative;
        }
        .shape-picker:hover { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.25);`
            : `background: rgba(16,185,129,0.3);`
          }
        }
        .geo-picker { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.2);
               border-color: rgba(16,185,129,0.45);`
            : `background: rgba(16,185,129,0.25);
               border-color: rgba(16,185,129,0.45);`
          }
        }
        .geo-picker:hover { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.3);`
            : `background: rgba(16,185,129,0.35);`
          }
        }
        .toolbar-divider { 
          width: 24px; 
          height: 1px; 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.3);`
            : `background: rgba(16,185,129,0.2);`
          }
          margin: 4px 0; 
        }
        .style-toggle { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.15);
               border-color: rgba(16,185,129,0.4);`
            : `background: rgba(16,185,129,0.2);
               border-color: rgba(16,185,129,0.4);`
          }
        }
        .style-toggle:hover { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.25);`
            : `background: rgba(16,185,129,0.3);`
          }
        }
        .custom-stylepanel { 
          position: absolute; 
          top: 16px; 
          right: 16px; 
          width: 280px; 
          max-width: calc(100% - 32px); 
          display: grid; 
          grid-auto-rows: min-content; 
          gap: 12px; 
          pointer-events: all; 
          ${theme === "light" 
            ? `background: rgba(255,255,255,0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(16,185,129,0.08);`
            : `background: rgba(6, 17, 15, 0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(16,185,129,0.08);`
          }
          border-radius: 16px; 
          padding: 16px; 
          backdrop-filter: blur(8px); 
        }
        .shape-options-panel { 
          position: absolute; 
          top: 80px; 
          left: 16px; 
          width: 320px; 
          max-width: calc(100% - 32px); 
          display: grid; 
          grid-auto-rows: min-content; 
          gap: 12px; 
          pointer-events: all; 
          background: rgba(6, 17, 15, 0.95); 
          border: 1px solid rgba(16,185,129,0.25); 
          border-radius: 16px; 
          padding: 16px; 
          backdrop-filter: blur(8px); 
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(16,185,129,0.08); 
        }
        .panel-header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 8px; 
        }
        .panel-title { 
          font-size: 12px; 
          text-transform: uppercase; 
          letter-spacing: 0.08em; 
          ${theme === "light" 
            ? `color: rgba(6,95,70,0.9);`
            : `color: rgba(110,231,183,0.9);`
          }
          font-weight: 600; 
        }
        .close-panel-btn { 
          width: 20px; 
          height: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.15);
               color: #047857;
               border: 1px solid rgba(16,185,129,0.3);`
            : `background: rgba(16,185,129,0.2);
               color: #d1fae5;
               border: 1px solid rgba(16,185,129,0.3);`
          }
          border-radius: 6px; 
          transition: all 0.15s ease; 
        }
        .close-panel-btn:hover { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.25);
               border-color: rgba(16,185,129,0.5);`
            : `background: rgba(16,185,129,0.3);
               border-color: rgba(16,185,129,0.5);`
          }
        }
        .panel-group { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.6);
               border: 1px solid rgba(16,185,129,0.2);`
            : `background: rgba(13, 26, 22, 0.6);
               border: 1px solid rgba(16,185,129,0.15);`
          }
          border-radius: 12px; 
          padding: 12px; 
        }
        .panel-row { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 6px; 
          margin-bottom: 8px; 
        }
        .panel-row:last-child { 
          margin-bottom: 0; 
        }
        .panel-row.colors { 
          gap: 8px; 
        }
        .panel-row.shapes-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 8px; 
        }
        .seg-btn { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.8);
               color: #047857;
               border: 1px solid rgba(16,185,129,0.3);`
            : `background: rgba(13, 26, 22, 0.9);
               color: #d1fae5;
               border: 1px solid rgba(16,185,129,0.3);`
          }
          border-radius: 8px; 
          padding: 6px 10px; 
          font-size: 11px; 
          line-height: 1; 
          transition: all 0.15s ease; 
          font-weight: 500; 
        }
        .seg-btn:hover { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.95);
               border-color: rgba(16,185,129,0.5);
               color: #065f46;`
            : `background: rgba(16, 78, 63, 0.6);
               border-color: rgba(52,211,153,0.5);`
          }
          transform: translateY(-1px); 
        }
        .shape-option-btn { 
          background: rgba(13, 26, 22, 0.9); 
          color: #d1fae5; 
          border: 1px solid rgba(16,185,129,0.3); 
          border-radius: 8px; 
          padding: 12px 8px; 
          transition: all 0.15s ease; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 4px; 
          min-height: 60px; 
        }
        .shape-option-btn:hover { 
          background: rgba(16, 78, 63, 0.6); 
          border-color: rgba(52,211,153,0.5); 
          transform: translateY(-1px); 
        }
        .shape-option-btn.selected { 
          background: rgba(16,185,129,0.8); 
          color: #0a1813; 
          border-color: rgba(16,185,129,0.6); 
          box-shadow: 0 0 0 2px rgba(16,185,129,0.3); 
        }
        .shape-option-btn svg { 
          font-size: 18px; 
        }
        .shape-label { 
          font-size: 10px; 
          text-align: center; 
          line-height: 1; 
        }
        .color-swatch { 
          width: 24px; 
          height: 24px; 
          border-radius: 999px; 
          border: 1px solid transparent; 
          box-shadow: 0 0 0 1px rgba(0,0,0,0.2) inset; 
          transition: all 0.15s ease; 
        }
        .color-swatch:hover { 
          outline: 2px solid rgba(16,185,129,0.6); 
          outline-offset: 2px; 
          transform: scale(1.1); 
        }
        .tl-watermark_SEE-LICENSE { display: none !important; }
        .geo-picker-panel { 
          position: absolute; 
          top: 80px; 
          left: 16px; 
          width: 280px; 
          max-width: calc(100% - 32px); 
          display: grid; 
          grid-auto-rows: min-content; 
          gap: 12px; 
          pointer-events: all; 
          ${theme === "light" 
            ? `background: rgba(255,255,255,0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(16,185,129,0.08);`
            : `background: rgba(6, 17, 15, 0.95);
               border: 1px solid rgba(16,185,129,0.25);
               box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(16,185,129,0.08);`
          }
          border-radius: 16px; 
          padding: 16px; 
          backdrop-filter: blur(8px); 
        }
        .geo-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 8px; 
        }
        .geo-type-btn { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.8);
               color: #047857;
               border: 1px solid rgba(16,185,129,0.3);`
            : `background: rgba(13, 26, 22, 0.9);
               color: #d1fae5;
               border: 1px solid rgba(16,185,129,0.3);`
          }
          border-radius: 8px; 
          padding: 12px 8px; 
          transition: all 0.15s ease; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 4px; 
          min-height: 60px; 
        }
        .geo-type-btn:hover { 
          ${theme === "light"
            ? `background: rgba(255,255,255,0.95);
               border-color: rgba(16,185,129,0.5);
               color: #065f46;`
            : `background: rgba(16, 78, 63, 0.6);
               border-color: rgba(52,211,153,0.5);`
          }
          transform: translateY(-1px); 
        }
        .geo-type-btn.selected { 
          ${theme === "light"
            ? `background: rgba(16,185,129,0.9);
               color: white;
               border-color: rgba(16,185,129,0.8);
               box-shadow: 0 0 0 2px rgba(16,185,129,0.4);`
            : `background: rgba(16,185,129,0.8);
               color: #0a1813;
               border-color: rgba(16,185,129,0.6);
               box-shadow: 0 0 0 2px rgba(16,185,129,0.3);`
          }
        }
        .geo-type-label { 
          font-size: 10px; 
          text-align: center; 
          line-height: 1; 
        }
        .create-geo-btn {
          ${theme === "light"
            ? `background: rgba(16,185,129,0.15);
               border-color: rgba(16,185,129,0.4);
               color: #047857;`
            : `background: rgba(16,185,129,0.2);
               border-color: rgba(16,185,129,0.4);
               color: #d1fae5;`
          }
          font-weight: 600;
        }
        .create-geo-btn:hover {
          ${theme === "light"
            ? `background: rgba(16,185,129,0.25);
               border-color: rgba(16,185,129,0.5);`
            : `background: rgba(16,185,129,0.3);
               border-color: rgba(16,185,129,0.5);`
          }
        }
        .shape-count-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #f87171;
          color: white;
          border-radius: 999px;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          min-width: 18px;
          text-align: center;
          line-height: 1;
          box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.5);
        }
        .instruction-text {
          font-size: 11px;
          ${theme === "light" 
            ? `color: rgba(6,95,70,0.7);`
            : `color: rgba(110,231,183,0.7);`
          }
          text-align: center;
          line-height: 1.4;
        }
        .active-instruction {
          ${theme === "light" 
            ? `color: #047857;`
            : `color: #d1fae5;`
          }
          font-weight: 600;
          margin-top: 4px;
        }
        .reset-shape-btn {
          ${theme === "light"
            ? `background: rgba(16,185,129,0.15);
               border-color: rgba(16,185,129,0.4);
               color: #047857;`
            : `background: rgba(16,185,129,0.2);
               border-color: rgba(16,185,129,0.4);
               color: #d1fae5;`
          }
          font-weight: 600;
        }
        .reset-shape-btn:hover {
          ${theme === "light"
            ? `background: rgba(16,185,129,0.25);
               border-color: rgba(16,185,129,0.5);`
            : `background: rgba(16,185,129,0.3);
               border-color: rgba(16,185,129,0.5);`
          }
        }
      `}</style>
    </div>
  );
}


