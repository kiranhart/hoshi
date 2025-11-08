// QR Code utility functions for print and download

export interface QRCodePrintOptions {
    qrUrl: string;
    title?: string;
}

export async function printQRCode(svg: SVGElement, options: QRCodePrintOptions): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('Please allow popups to print the QR code');
    }

    // Clone the SVG and serialize it
    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Convert SVG to image for printing
    const img = new Image();
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Failed to get canvas context'));
                return;
            }
            
            ctx.drawImage(img, 0, 0, 300, 300);
            const imgDataUrl = canvas.toDataURL('image/png');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>QR Code - ${options.title || 'Medical Information'}</title>
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
                            <h1>${options.title || 'Medical Information'} QR Code</h1>
                            <img src="${imgDataUrl}" alt="QR Code" width="300" height="300" />
                            <div class="url">${options.qrUrl}</div>
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(() => {
                                    window.print();
                                    window.onafterprint = () => {
                                        window.close();
                                    };
                                }, 250);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            URL.revokeObjectURL(svgUrl);
            resolve();
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            reject(new Error('Failed to load SVG image'));
        };
        
        img.src = svgUrl;
    });
}

export async function downloadQRCode(svg: SVGElement, filename: string = 'medical-info-qr-code.png'): Promise<void> {
    // Clone the SVG and serialize it
    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Convert SVG to PNG for download
    const img = new Image();
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Failed to get canvas context'));
                return;
            }
            
            ctx.drawImage(img, 0, 0, 300, 300);
            canvas.toBlob((blob) => {
                if (!blob) {
                    URL.revokeObjectURL(svgUrl);
                    reject(new Error('Failed to generate QR code image'));
                    return;
                }
                
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                URL.revokeObjectURL(svgUrl);
                resolve();
            }, 'image/png');
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            reject(new Error('Failed to convert QR code to image'));
        };
        
        img.src = svgUrl;
    });
}

