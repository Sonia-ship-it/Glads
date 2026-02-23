import * as React from 'react';
import { useState } from 'react';

export const FeedbackSection: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call for feedback submission
        setTimeout(() => {
            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
            <div className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-[#2A2A2A] dark:text-white mb-6">
                    Guest Feedback
                </h1>
                <div className="w-24 h-1 bg-red-900 mx-auto mb-8"></div>
                <p className="text-sm tracking-widest uppercase text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                    We value your experience. Please share your thoughts, suggestions, or concerns.
                </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-sm p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-900"></div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Your Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors resize-none"
                            required
                        ></textarea>
                    </div>

                    {status === 'success' && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm tracking-wider uppercase font-bold text-center rounded-sm">
                            Thank you for your feedback!
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm tracking-wider uppercase font-bold text-center rounded-sm">
                            Failed to submit feedback. Please try again.
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="bg-red-900 hover:bg-black text-white px-12 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                        >
                            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
