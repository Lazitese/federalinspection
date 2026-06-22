'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

export function QRCodeGenerator({ url, size = 256 }: QRCodeGeneratorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-border">
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        includeMargin={true}
        className="rounded-xl"
      />
      <p className="mt-4 text-sm text-text-secondary text-center max-w-[256px]">
        Scan this code to join the assessment team.
      </p>
    </div>
  );
}
