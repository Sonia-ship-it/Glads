import * as React from 'react';

interface AuthModalProps {
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    authEmail: string;
    setAuthEmail: (email: string) => void;
    authPassword: string;
    setAuthPassword: (password: string) => void;
    authLoading: boolean;
    authError: string | null;
    submitPasswordLogin: (e: React.FormEvent) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    showAuthModal,
    setShowAuthModal,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authLoading,
    authError,
    submitPasswordLogin,
}) => {
    if (!showAuthModal) return null;

    return (
        <div
            className="fixed inset-0 z-175 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
            onClick={() => setShowAuthModal(false)}
        >
            <div
                className="relative w-full max-w-5xl rounded-4xl border border-white/20 bg-white dark:bg-neutral-900 shadow-[0_40px_120px_rgba(0,0,0,0.55)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setShowAuthModal(false)}
                    aria-label="Close login modal"
                    className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full border border-white/20 text-white bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center"
                >
                    X
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="relative min-h-[280px] lg:min-h-[540px] p-8 md:p-10 lg:p-12 text-white">
                        <img src="/hero.jpeg" alt="GLADS Admin Access" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/65 to-burgundy/70" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <span className="inline-block text-[10px] font-black uppercase tracking-[0.28em] bg-white/15 border border-white/25 rounded-full px-4 py-2">
                                    Staff Portal
                                </span>
                                <h3 className="mt-6 text-3xl md:text-4xl font-black leading-tight uppercase">Admin Access</h3>
                                <p className="mt-4 text-sm md:text-base text-white/85 max-w-md">
                                    Secure sign-in for Super Admin, Branch Manager, and Receptionist accounts.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                                    <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Ndera</span>
                                    <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Kanombe</span>
                                    <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Kabeza</span>
                                </div>
                                <p className="text-xs text-white/75">One brand. One platform. Branch-aware operations.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 lg:p-12 bg-white dark:bg-neutral-900">
                        <div className="max-w-md">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-burgundy">Sign In</p>
                            <h4 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Welcome Back</h4>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Use your staff credentials to continue.</p>

                            <form onSubmit={submitPasswordLogin} className="mt-7 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={authEmail}
                                        onChange={(e) => setAuthEmail(e.target.value)}
                                        placeholder="staff@gladsapartment.rw"
                                        className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3.5 text-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3.5 text-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full bg-burgundy text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {authLoading ? 'Signing In...' : 'Access Dashboard'}
                                </button>
                            </form>

                            {authError && (
                                <p className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
                                    {authError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
