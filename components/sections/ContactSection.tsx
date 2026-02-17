import * as React from 'react';
import { BRANCH_DATA } from '../../constants';

export const ContactSection: React.FC = () => {
    return (
        <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Network</span>
                <h2 className="text-7xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] mb-8">Reach Out.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                {Object.values(BRANCH_DATA).map((branch) => (
                    <div key={branch.id} className="bg-neutral-50 dark:bg-neutral-900/40 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-white/5 shadow-xl group hover:scale-[1.02] transition-all duration-500">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-8">{branch.fullName.split('–')[1] || branch.fullName}</h3>
                        <div className="space-y-6">
                            <div><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Hotline</p><a href={`tel:\${branch.contact.phone}`} className="text-lg font-bold hover:text-burgundy transition-colors">{branch.contact.phone}</a></div>
                            <div><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Email</p><a href={`mailto:\${branch.contact.email}`} className="text-sm font-medium text-burgundy">{branch.contact.email}</a></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-900/40 p-12 md:p-24 rounded-[4rem] border border-neutral-100 dark:border-white/5">
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center">Inquiry Form</h3>
                <form className="space-y-12" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <input placeholder="Your Name" className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy text-xl font-light" />
                        <input placeholder="Your Email" className="bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy text-xl font-light" />
                    </div>
                    <textarea placeholder="How can we assist you?" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy text-xl font-light" />
                    <button className="w-full bg-burgundy text-white py-8 rounded-[2rem] text-[11px] font-black tracking-[0.5em] uppercase hover:brightness-125 transition-all">Send Message</button>
                </form>
            </div>
        </section>
    );
};
