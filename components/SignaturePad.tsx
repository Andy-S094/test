
import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  initialValue?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ label, onSave, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialValue) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialValue;
    }
  }, [initialValue]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button 
          onClick={clear}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          清除重簽
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={120}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="signature-canvas border border-gray-300 rounded-lg bg-white w-full cursor-crosshair"
      />
    </div>
  );
};
