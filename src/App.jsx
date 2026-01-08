import React, { useMemo, useState } from "react";
import { Stage, Layer, Circle } from "react-konva";

const CANVAS_W = 900;
const CANVAS_H = 600;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function App() {
  const initial = useMemo(
    () => [
      { id: "a", x: 150, y: 150, r: 25 },
      { id: "b", x: 300, y: 220, r: 40 },
      { id: "c", x: 500, y: 320, r: 18 },
    ],
    []
  );

  const [points, setPoints] = useState(initial);
  const [selectedId, setSelectedId] = useState(points[0]?.id ?? null);

  const selected = points.find((p) => p.id === selectedId) ?? null;

  function updatePoint(id, patch) {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, padding: 16 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <Stage width={CANVAS_W} height={CANVAS_H}>
          <Layer>
            {points.map((p) => (
              <Circle
                key={p.id}
                x={p.x}
                y={p.y}
                radius={p.r}
                draggable
                // Keep it easy to see which one is selected:
                fill='#a90909'              // ✅ makes every circle visible
                stroke={p.id === selectedId ? "black" : undefined}
                strokeWidth={p.id === selectedId ? 2 : 0}
                // Click selects
                onMouseDown={() => setSelectedId(p.id)}
                onTouchStart={() => setSelectedId(p.id)}
                // Drag updates position
                onDragMove={(e) => {
                  const x = clamp(e.target.x(), p.r, CANVAS_W - p.r);
                  const y = clamp(e.target.y(), p.r, CANVAS_H - p.r);
                  updatePoint(p.id, { x, y });
                }}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Controls</h3>

        <label style={{ display: "block", marginBottom: 8 }}>
          Select point:
          <select
            style={{ width: "100%", marginTop: 6 }}
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {points.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
              Position: ({Math.round(selected.x)}, {Math.round(selected.y)})
            </div>

            <label style={{ display: "block", marginBottom: 8 }}>
              Radius: <b>{selected.r}</b>
              <input
                style={{ width: "100%", marginTop: 6 }}
                type="range"
                min={5}
                max={120}
                step={1}
                value={selected.r}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  // also ensure circle stays inside the canvas after resize
                  const x = clamp(selected.x, r, CANVAS_W - r);
                  const y = clamp(selected.y, r, CANVAS_H - r);
                  updatePoint(selected.id, { r, x, y });
                }}
              />
            </label>

            <button
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              onClick={() => {
                // quick add another circle
                const id = String.fromCharCode(97 + points.length);
                setPoints((prev) => [
                  ...prev,
                  { id, x: 100 + prev.length * 50, y: 100 + prev.length * 30, r: 25 },
                ]);
                setSelectedId(id);
              }}
            >
              + Add circle
            </button>

            <hr style={{ margin: "14px 0" }} />

            <details>
              <summary>Debug JSON</summary>
              <pre style={{ fontSize: 12, overflow: "auto" }}>
                {JSON.stringify(points, null, 2)}
              </pre>
            </details>
          </>
        ) : (
          <div>Select a circle</div>
        )}
      </div>
    </div>
  );
}

