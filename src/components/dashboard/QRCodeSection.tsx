'use client';

import { useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Eye, Printer, QrCode, Share2 } from 'lucide-react';
import { useQRCode } from 'next-qrcode';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface QRCodeSectionProps {
    uniqueKey: string;
    pageUrl: string;
}

export function QRCodeSection({ uniqueKey, pageUrl }: QRCodeSectionProps) {
    const { SVG } = useQRCode();
    const [isPrinting, setIsPrinting] = useState(false);
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${uniqueKey}`;

    const handlePreview = () => {
        window.open(pageUrl, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Medical Information',
                    text: 'Check out my medical information page',
                    url: pageUrl,
                });
                toast.success('Link shared successfully!');
            } catch (error) {
                // User cancelled or error occurred
                if ((error as Error).name !== 'AbortError') {
                    toast.error('Failed to share link');
                }
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(pageUrl);
                toast.success('Link copied to clipboard!');
            } catch (error) {
                toast.error('Failed to copy link');
            }
        }
    };

    const handlePrintQR = () => {
        setIsPrinting(true);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the QR code');
            setIsPrinting(false);
            return;
        }

        // Get the SVG element from the QR code container
        const svg = qrContainerRef.current?.querySelector('svg');
        if (!svg) {
            toast.error('QR code not found');
            setIsPrinting(false);
            return;
        }

        // Clone the SVG and serialize it
        const svgClone = svg.cloneNode(true) as SVGElement;
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Convert SVG to image for printing
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, 300, 300);
                const imgDataUrl = canvas.toDataURL('image/png');

                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>QR Code - Medical Information</title>
                            <style>
                                @media print {
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                    }
                                }
                                body {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    margin: 0;
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                }
                                h1 {
                                    margin-bottom: 20px;
                                    color: #333;
                                }
                                .qr-container {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    gap: 20px;
                                }
                                img {
                                    border: 2px solid #000;
                                    padding: 10px;
                                    background: white;
                                }
                                .url {
                                    font-size: 14px;
                                    color: #666;
                                    word-break: break-all;
                                    text-align: center;
                                    max-width: 400px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="qr-container">
                                <h1>Medical Information QR Code</h1>
                                <img src="${imgDataUrl}" alt="QR Code" width="300" height="300" />
                                <div class="url">${qrUrl}</div>
                            </div>
                            <script>
                                window.onload = function() {
                                    setTimeout(() => {
                                        window.print();
                                        window.onafterprint = () => window.close();
                                    }, 250);
                                };
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                URL.revokeObjectURL(svgUrl);
                setIsPrinting(false);
            }
        };
        img.src = svgUrl;
    };

    const handleDownloadQR = async () => {
        try {
            // Get the SVG element from the QR code container
            const svg = qrContainerRef.current?.querySelector('svg');
            if (!svg) {
                toast.error('QR code not found');
                return;
            }

            // Clone the SVG and serialize it
            const svgClone = svg.cloneNode(true) as SVGElement;
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            // Convert SVG to PNG for download
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 300, 300);
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            toast.error('Failed to generate QR code image');
                            URL.revokeObjectURL(svgUrl);
                            return;
                        }
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'medical-info-qr-code.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        URL.revokeObjectURL(svgUrl);
                        toast.success('QR code downloaded!');
                    }, 'image/png');
                }
            };
            img.onerror = () => {
                toast.error('Failed to convert QR code to image');
                URL.revokeObjectURL(svgUrl);
            };
            img.src = svgUrl;
        } catch (error) {
            console.error('Error downloading QR code:', error);
            toast.error('Failed to download QR code');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 p-3 shadow-md">
                    <QrCode className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Share Your Medical Information</h2>
            </div>

            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* QR Code Display */}
                <div className="flex-shrink-0">
                    <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                        <div ref={qrContainerRef}>
                            <SVG
                                text={qrUrl}
                                options={{
                                    width: 200,
                                    margin: 2,
                                    color: {
                                        dark: '#000000',
                                        light: '#FFFFFF',
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-1 space-y-4">
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Your Public Link:</p>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <code className="flex-1 text-sm break-all text-gray-900">{qrUrl}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(qrUrl);
                                    toast.success('Link copied to clipboard!');
                                }}
                                className="flex-shrink-0 rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                            onClick={handlePreview}
                            className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md hover:from-cyan-600 hover:to-blue-600"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Page
                        </Button>
                        <Button
                            onClick={handleShare}
                            className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:from-purple-600 hover:to-pink-600"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Link
                        </Button>
                        <Button
                            onClick={handleDownloadQR}
                            className="w-full cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:from-green-600 hover:to-emerald-600"
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Download QR
                        </Button>
                        <Button
                            onClick={handlePrintQR}
                            disabled={isPrinting}
                            className="w-full cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            {isPrinting ? 'Printing...' : 'Print QR'}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
