"use client";

import { type ClassValue, clsx } from "clsx";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
squareSize?: number;
gridGap?: number;
flickerChance?: number;
color?: string;
width?: number;
height?: number;
className?: string;
maxOpacity?: number;
startImmediately?: boolean;
}

const FlickeringGrid = ({
squareSize = 4,
gridGap = 6,
flickerChance = 0.3,
color = "rgb(0, 0, 0)",
width,
height,
className,
maxOpacity = 0.3,
startImmediately = false,
...props
}: FlickeringGridProps) => {
const canvasRef = useRef<HTMLCanvasElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
const [isInView, setIsInView] = useState(startImmediately);

const gridStateRef = useRef<{
squares: Float32Array;
cols: number;
rows: number;
dpr: number;
lastMaxOpacity: number;
}>({
squares: new Float32Array(0),
cols: 0,
rows: 0,
dpr: 1,
lastMaxOpacity: maxOpacity,
});

const memoizedColor = useMemo(() => {
const toRGBA = (colorValue: string) => {
if (typeof window === "undefined") return `rgba(0,0,0,`;
const tempCanvas = document.createElement("canvas");
tempCanvas.width = tempCanvas.height = 1;
const ctx = tempCanvas.getContext("2d");
if (!ctx) return `rgba(0,0,0,`;
ctx.fillStyle = colorValue;
ctx.fillRect(0, 0, 1, 1);
const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
return `rgba(${r},${g},${b},`;
};
return toRGBA(color);
}, [color]);

useEffect(() => {
const canvas = canvasRef.current;
const container = containerRef.current;
if (!canvas || !container) return;

const dpr = window.devicePixelRatio || 1;
gridStateRef.current.dpr = dpr;

const updateGridStructure = () => {
const currentWidth = width || container.clientWidth;
const currentHeight = height || container.clientHeight;

if (
canvas.width !== currentWidth * dpr ||
canvas.height !== currentHeight * dpr
) {
canvas.width = currentWidth * dpr;
canvas.height = currentHeight * dpr;
canvas.style.width = `${currentWidth}px`;
canvas.style.height = `${currentHeight}px`;
}

const newCols = Math.ceil(currentWidth / (squareSize + gridGap));
const newRows = Math.ceil(currentHeight / (squareSize + gridGap));

if (
newCols !== gridStateRef.current.cols ||
newRows !== gridStateRef.current.rows ||
maxOpacity !== gridStateRef.current.lastMaxOpacity
) {
gridStateRef.current.cols = newCols;
gridStateRef.current.rows = newRows;
gridStateRef.current.squares = new Float32Array(newCols * newRows);
for (let i = 0; i < gridStateRef.current.squares.length; i++) {
gridStateRef.current.squares[i] = Math.random() * maxOpacity;
}
gridStateRef.current.lastMaxOpacity = maxOpacity;
}
};

updateGridStructure();
const resizeObserver = new ResizeObserver(updateGridStructure);
resizeObserver.observe(container);
return () => resizeObserver.disconnect();
}, [width, height, squareSize, gridGap, maxOpacity]);

useEffect(() => {
const canvas = canvasRef.current;
if (!canvas || !isInView) return;
const ctx = canvas.getContext("2d");
if (!ctx) return;

let animationFrameId: number;
let lastTime = performance.now();

const animate = (time: number) => {
const deltaTime = (time - lastTime) / 1000;
lastTime = time;
const { squares, cols, rows, dpr } = gridStateRef.current;

for (let i = 0; i < squares.length; i++) {
if (Math.random() < flickerChance * deltaTime) {
squares[i] = Math.random() * maxOpacity;
}
squares[i] = Math.min(squares[i], maxOpacity);
}

ctx.clearRect(0, 0, canvas.width, canvas.height);
for (let i = 0; i < cols; i++) {
for (let j = 0; j < rows; j++) {
const index = i * rows + j; 
if (index < squares.length) {
const currentOpacity = squares[index];
ctx.fillStyle = `${memoizedColor}${currentOpacity})`;
ctx.fillRect(
i * (squareSize + gridGap) * dpr,
j * (squareSize + gridGap) * dpr,
squareSize * dpr,
squareSize * dpr
);
}
}
}
animationFrameId = requestAnimationFrame(animate);
};
animationFrameId = requestAnimationFrame(animate);
return () => cancelAnimationFrame(animationFrameId);
}, [isInView, memoizedColor, flickerChance, maxOpacity, squareSize, gridGap]);

useEffect(() => {
if (startImmediately) {
if (!isInView) setIsInView(true);
return;
}
const canvas = canvasRef.current;
if (!canvas) return;
const observer = new IntersectionObserver(
([entry]) => {
if (entry) setIsInView(entry.isIntersecting);
},
{ threshold: 0.01 }
);
observer.observe(canvas);
return () => {
observer.disconnect();
};
}, [startImmediately, isInView]);

return (
<div
ref={containerRef}
className={cn("h-full w-full", className)}
{...props}
>
<canvas ref={canvasRef} className="pointer-events-none" />
</div>
);
};


interface GeneratedGridSettings {
color: string;
maxOpacity: number;
flickerChance: number;
squareSize: number;
gridGap: number;
}

const svgDataUrlForEffect: string | null = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjxzdmcgZmlsbD0iIzAwMDAwMCIgaGVpZ2h0PSI4MDBweCIgd2lkdGg9IjgwMHB4IiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIA0KCSB2aWV3Qm94PSIwIDAgMjIuNzczIDIyLjc3MyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPHBhdGggZD0iTTE1Ljc2OSwwYzAuMDUzLDAsMC4xMDYsMCwwLjE2MiwwYzAuMTMsMS42MDYtMC40ODMsMi44MDYtMS4yMjgsMy42NzVjLTAuNzMxLDAuODYzLTEuNzMyLDEuNy0zLjM1MSwxLjU3Mw0KCQkJYy0wLjEwOC0xLjU4MywwLjUwNi0yLjY5NCwxLjI1LTMuNTYxQzEzLjI5MiwwLjg3OSwxNC41NTcsMC4xNiwxNS43NjksMHoiLz4NCgkJPHBhdGggZD0iTTIwLjY3LDE2LjcxNmMwLDAuMDE2LDAsMC4wMywwLDAuMDQ1Yy0wLjQ1NSwxLjM3OC0xLjEwNCwyLjU1OS0xLjg5NiwzLjY1NWMtMC43MjMsMC45OTUtMS42MDksMi4zMzQtMy4xOTEsMi4zMzQNCgkJCWMtMS4zNjcsMC0yLjI3NS0wLjg3OS0zLjY3Ni0wLjkwM2MtMS40ODItMC4wMjQtMi4yOTcsMC43MzUtMy42NTIsMC45MjZjLTAuMTU1LDAtMC4zMSwwLTAuNDYyLDANCgkJCWMtMC45OTUtMC4xNDQtMS43OTgtMC45MzItMi4zODMtMS42NDJjLTEuNzI1LTIuMDk4LTMuMDU4LTQuODA4LTMuMzA2LTguMjc2YzAtMC4zNCwwLTAuNjc5LDAtMS4wMTkNCgkJCWMwLjEwNS0yLjQ4MiwxLjMxMS00LjUsMi45MTQtNS40NzhjMC44NDYtMC41MiwyLjAwOS0wLjk2MywzLjMwNC0wLjc2NWMwLjU1NSwwLjA4NiwxLjEyMiwwLjI3NiwxLjYxOSwwLjQ2NA0KCQkJYzAuNDcxLDAuMTgxLDEuMDYsMC41MDIsMS42MTgsMC40ODVjMC4zNzgtMC4wMTEsMC43NTQtMC4yMDgsMS4xMzUtMC4zNDdjMS4xMTYtMC40MDMsMi4yMS0wLjg2NSwzLjY1Mi0wLjY0OA0KCQkJYzEuNzMzLDAuMjYyLDIuOTYzLDEuMDMyLDMuNzIzLDIuMjJjLTEuNDY2LDAuOTMzLTIuNjI1LDIuMzM5LTIuNDI3LDQuNzRDMTcuODE4LDE0LjY4OCwxOS4wODYsMTUuOTY0LDIwLjY3LDE2LjcxNnoiLz4NCgk8L2c+DQoJPGc+DQoJPC9nPg0KCTxnPg0KCTwvZz4NCgk8Zz4NCgk8L2c+DQoJPGc+DQoJPC9nPg0KCTxnPg0KCTwvZz4NCgk8Zz4NCgk8L2c+DQoJPGc+DQoJPC9nPg0KCTxnPg0KCTwvZz4NCgk8Zz4NCgk8L2c+DQoJPGc+DQoJPC9nPg0KCTxnPg0KCTwvZz4NCgk8Zz4NCgk8L2c+DQoJPGc+DQoJPC9nPg0KCTxnPg0KCTwvZz4NCgk8Zz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=`;
const svgMaskGridSettingsForEffect: GeneratedGridSettings = {
  "color": "#ffffff",
  "maxOpacity": 1,
  "flickerChance": 0.53,
  "squareSize": 3,
  "gridGap": 4
};
const backgroundGridSettingsForEffect: GeneratedGridSettings = {
  "color": "#ffffff",
  "maxOpacity": 0.1,
  "flickerChance": 0.06,
  "squareSize": 3,
  "gridGap": 4
};

const GeneratedFlickerEffect = () => {
const maskStyle: React.CSSProperties | undefined = svgDataUrlForEffect
? {
WebkitMaskImage: `url('${svgDataUrlForEffect}')`,
WebkitMaskSize: "contain",
WebkitMaskPosition: "center",
WebkitMaskRepeat: "no-repeat",
maskImage: `url('${svgDataUrlForEffect}')`,
maskSize: "contain",
maskPosition: "center",
maskRepeat: "no-repeat",
}
: undefined;

return (
<div className="relative w-full h-screen bg-black overflow-hidden px-8">
<FlickeringGrid
className="absolute inset-0 z-0"
{...backgroundGridSettingsForEffect}
startImmediately={true}
/>
{maskStyle && (
<div className="absolute inset-0 z-10" style={maskStyle}>
<FlickeringGrid {...svgMaskGridSettingsForEffect} startImmediately={true} />
</div>
)}
</div>
);
};

export default GeneratedFlickerEffect;