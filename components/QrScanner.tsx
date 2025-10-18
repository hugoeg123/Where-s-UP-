import React, { useEffect, useRef, useState } from 'react';
import { XCircleIcon } from './Icons';

interface QrScannerProps {
    onScan: (data: string | null) => void;
    onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let stream: MediaStream | null = null;
        let animationFrameId: number;

        const startScan = async () => {
            if (!('BarcodeDetector' in window)) {
                setError('QR code scanning is not supported by this browser.');
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // @ts-ignore
                const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
                
                const detect = async () => {
                    if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                        try {
                            const barcodes = await barcodeDetector.detect(videoRef.current);
                            if (barcodes.length > 0) {
                                onScan(barcodes[0].rawValue);
                            } else {
                                animationFrameId = requestAnimationFrame(detect);
                            }
                        } catch (err) {
                            console.error('Error during QR code detection:', err);
                            setError('An error occurred while scanning.');
                        }
                    }
                };
                detect();

            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Could not access the camera. Please check permissions.');
            }
        };

        startScan();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-brand-primary/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
            <div className="bg-brand-secondary p-4 rounded-lg shadow-2xl border border-brand-tertiary w-full max-w-md relative">
                <button onClick={onClose} className="absolute -top-3 -right-3 text-white bg-red-500 rounded-full">
                    <XCircleIcon className="w-8 h-8"/>
                </button>

                <h3 className="text-xl font-bold text-center text-white mb-2">Scan QR Code</h3>
                <p className="text-sm text-brand-text-secondary text-center mb-4">Position the QR code within the frame.</p>

                <div className="w-full aspect-square bg-brand-tertiary rounded-lg overflow-hidden relative">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                     <div className="absolute inset-0 border-8 border-brand-neon/50 rounded-lg"></div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-md text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrScanner;