import * as React from 'react';
import { Branch, RoomType } from '../../types';

interface BookingModalProps {
    isOpen: boolean;
    type: 'service' | 'room';
    item: any;
    activeBranch: Branch;
    checkoutStep: 'details' | 'payment' | 'confirmation';
    paymentMethod: 'card' | 'momo' | null;
    onClose: () => void;
    setCheckoutStep: (step: any) => void;
    setPaymentMethod: (method: any) => void;
    onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    type,
    item,
    activeBranch,
    checkoutStep,
    paymentMethod,
    onClose,
    setCheckoutStep,
    setPaymentMethod,
    onSuccess
}) => {
    if (!isOpen || !item) return null;

    const isRoom = type === 'room';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-500">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-[3rem] p-12 shadow-3xl border border-white/5 relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 \${checkoutStep === 'details' ? 'text-burgundy' : 'text-neutral-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${checkoutStep === 'details' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>1</div>
                        <span className="text-xs font-bold hidden md:inline">Details</span>
                    </div>
                    <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className={`flex items-center gap-2 \${checkoutStep === 'payment' ? 'text-burgundy' : 'text-neutral-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${checkoutStep === 'payment' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>2</div>
                        <span className="text-xs font-bold hidden md:inline">Payment</span>
                    </div>
                    <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className={`flex items-center gap-2 \${checkoutStep === 'confirmation' ? 'text-burgundy' : 'text-neutral-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${checkoutStep === 'confirmation' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>3</div>
                        <span className="text-xs font-bold hidden md:inline">Confirm</span>
                    </div>
                </div>

                {checkoutStep === 'details' && (
                    <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep('payment'); }} className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-sans italic mb-2">Reserve {item.name}</h3>
                            <p className="text-neutral-500 text-sm">{activeBranch}</p>
                        </div>
                        {/* Form fields here - truncated for brevity but should be full in actual implementation */}
                        <div className="space-y-4">
                            <input required placeholder="Full Name" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none" />
                            <input required type="tel" placeholder="+250 xxx xxx xxx" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="date" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none" />
                                <input required type="time" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-burgundy text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all">Continue to Payment</button>
                    </form>
                )}

                {checkoutStep === 'payment' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setPaymentMethod('card')} className={`p-6 rounded-2xl border-2 \${paymentMethod === 'card' ? 'border-burgundy bg-burgundy/5' : 'border-neutral-200 dark:border-neutral-700'}`}>Card</button>
                            <button onClick={() => setPaymentMethod('momo')} className={`p-6 rounded-2xl border-2 \${paymentMethod === 'momo' ? 'border-burgundy bg-burgundy/5' : 'border-neutral-200 dark:border-neutral-700'}`}>MoMo</button>
                        </div>
                        {paymentMethod && (
                            <button onClick={() => setCheckoutStep('confirmation')} className="w-full bg-burgundy text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Complete Payment</button>
                        )}
                    </div>
                )}

                {checkoutStep === 'confirmation' && (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-3xl font-sans italic mb-2">Confirmed!</h3>
                        <button onClick={onSuccess} className="bg-burgundy text-white py-4 px-8 rounded-full font-bold">Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};
