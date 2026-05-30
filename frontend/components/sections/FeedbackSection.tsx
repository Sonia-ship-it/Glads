import * as React from 'react';
import { useState } from 'react';

interface FeedbackProps {
    branchId?: string;
}

export const FeedbackSection: React.FC<FeedbackProps> = ({ branchId }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState<'stay' | 'service' | 'facility' | 'staff' | 'other'>('service');
    const [rating, setRating] = useState(5);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('http://localhost:3001/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    branchId: branchId || undefined,
                    fullName: name,
                    email,
                    phone,
                    category,
                    rating,
                    subject,
                    message,
                    metadata: { source: 'website' }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            setStatus('success');
            setName('');
            setEmail('');
            setPhone('');
            setSubject('');
            setMessage('');
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Feedback submission error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
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
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Phone (Optional)</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors appearance-none"
                            >
                                <option value="stay">Stay Experience</option>
                                <option value="service">Service Quality</option>
                                <option value="facility">Facilities</option>
                                <option value="staff">Staff Conduct</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Rating</label>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRating(num)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${rating >= num
                                            ? 'bg-red-900 border-red-900 text-white'
                                            : 'border-neutral-200 text-neutral-400 hover:border-red-900'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-neutral-400">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
                                placeholder="Summary of your feedback"
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
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm tracking-wider uppercase font-bold text-center rounded-sm border border-green-200 dark:border-green-900/50">
                            Thank you for your feedback! It has been submitted successfully.
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm tracking-wider uppercase font-bold text-center rounded-sm border border-red-200 dark:border-red-900/50">
                            Failed to submit feedback. Please check your connection and try again.
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
