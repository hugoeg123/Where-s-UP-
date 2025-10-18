import React, { useState } from 'react';
import { XCircleIcon, PlusIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CreatePollFormProps {
    onCreate: (question: string, options: string[]) => void;
    onCancel: () => void;
}

const CreatePollForm: React.FC<CreatePollFormProps> = ({ onCreate, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!question.trim()) {
            setError(t('errorPollQuestion', 'Please enter a question for your poll.'));
            return;
        }
        const filledOptions = options.map(o => o.trim()).filter(o => o);
        if (filledOptions.length < 2) {
            setError(t('errorPollOptions', 'Please provide at least two non-empty options.'));
            return;
        }
        onCreate(question.trim(), filledOptions);
    };

    return (
        <div className="bg-brand-tertiary/50 p-4 rounded-lg animate-fadeIn border border-brand-tertiary">
            <h3 className="text-xl font-bold text-white mb-4">{t('createNewPoll', 'Create a New Poll')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="poll-question" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('question', 'Question')}</label>
                    <input
                        id="poll-question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
                        placeholder={t('questionPlaceholder', 'e.g., What should the DJ play next?')}
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-brand-text-secondary mb-1">{t('options', 'Options')}</label>
                     <div className="space-y-2">
                        {options.map((option, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="flex-grow w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
                                    placeholder={t('optionPlaceholder', 'Option {index}').replace('{index}', (index + 1).toString())}
                                />
                                {options.length > 2 && (
                                     <button type="button" onClick={() => removeOption(index)} className="text-brand-text-secondary hover:text-red-400">
                                        <XCircleIcon className="w-6 h-6" />
                                     </button>
                                )}
                             </div>
                        ))}
                     </div>
                </div>
                 <button type="button" onClick={addOption} disabled={options.length >= 10} className="flex items-center gap-2 text-sm text-brand-neon font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                     <PlusIcon className="w-5 h-5"/>
                     {t('addOption', 'Add Option')}
                 </button>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-brand-tertiary text-brand-text font-semibold rounded-md hover:bg-opacity-80">{t('cancel', 'Cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-neon text-brand-primary font-bold rounded-md hover:bg-opacity-90">{t('createPoll', 'Create Poll')}</button>
                </div>
            </form>
        </div>
    );
};

export default CreatePollForm;