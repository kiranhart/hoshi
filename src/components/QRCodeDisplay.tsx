'use client';

import { useQRCode } from 'next-qrcode';

interface QRCodeDisplayProps {
    url: string;
    size?: number;
    className?: string;
}

export function QRCodeDisplay({ url, size = 200, className = '' }: QRCodeDisplayProps) {
    const { SVG } = useQRCode();

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <SVG
                text={url}
                options={{
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                }}
            />
        </div>
    );
}

