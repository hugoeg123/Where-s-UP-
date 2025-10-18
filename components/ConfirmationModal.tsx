import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm' }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand-primary/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-brand-secondary p-6 rounded-lg shadow-2xl border border-brand-tertiary w-full max-w-sm relative transform transition-all"  onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-brand-text-secondary mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-brand-tertiary text-brand-text font-semibold rounded-md hover:bg-opacity-80 transition-colors">
                        {t('cancel', 'Cancel')}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;