'use client';

import { useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Eye, Printer, QrCode, Share2 } from 'lucide-react';
import { useQRCode } from 'next-qrcode';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { downloadQRCode, printQRCode } from '@/lib/qr-code-utils';

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

    const handlePrintQR = async () => {
        setIsPrinting(true);
        try {
            const svg = qrContainerRef.current?.querySelector('svg');
            if (!svg) {
                toast.error('QR code not found');
                return;
            }
            await printQRCode(svg, { qrUrl, title: 'Medical Information' });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to print QR code');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDownloadQR = async () => {
        try {
            const svg = qrContainerRef.current?.querySelector('svg');
            if (!svg) {
                toast.error('QR code not found');
                return;
            }
            await downloadQRCode(svg, 'medical-info-qr-code.png');
            toast.success('QR code downloaded!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to download QR code');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-md"
        >
            <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 shadow-sm">
                    <QrCode className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Share Your Medical Information</h2>
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
                            className="w-full cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:from-rose-600 hover:to-pink-600"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Page
                        </Button>
                        <Button
                            onClick={handleShare}
                            className="w-full cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:from-pink-600 hover:to-rose-600"
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
