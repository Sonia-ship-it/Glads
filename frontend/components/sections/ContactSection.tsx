import * as React from 'react';
import { Branch } from '../../types';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BRANCH_DATA } from '../../constants';

interface ContactSectionProps {
  activeBranch: any;
  data: any;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ activeBranch, data }) => {
  return (
    <section className="reveal max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-24">
        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Network</span>
        <h2 className="text-7xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] mb-8">Reach Out.</h2>
        <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto">From Ndera to Kanombe, our concierge team is ready to assist you across all our locations.</p>
      </div>

      {/* Branch Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        {Object.values(BRANCH_DATA).map((branch) => (
          <div key={branch.id} className="bg-neutral-50 dark:bg-neutral-900/40 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-white/5 shadow-xl group hover:scale-[1.02] transition-all duration-500">
            <div className="mb-8">
              <span className="text-burgundy font-black tracking-[0.4em] uppercase text-[10px] block mb-2">{branch.id}</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">{branch.fullName.split(/[–-]/)[1] || branch.fullName}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Location</p>
                <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">{branch.contact.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Hotline</p>
                <a href={`tel:${branch.contact.phone}`} className="text-lg font-bold hover:text-burgundy transition-colors">{branch.contact.phone}</a>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Email</p>
                <a href={`mailto:${branch.contact.email}`} className="text-sm font-medium text-burgundy underline underline-offset-4">{branch.contact.email}</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
        <div className="lg:col-span-12 bg-neutral-50 dark:bg-neutral-900/40 p-12 md:p-24 rounded-[4rem] h-fit shadow-3xl border border-neutral-100 dark:border-white/5 relative overflow-hidden group">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Inquiry Form</h3>
              <p className="text-neutral-500">Send a direct message to our central concierge desk</p>
            </div>
            <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Identity</label>
                  <input placeholder="Your Name" type="text" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Contact</label>
                  <input placeholder="Your Email" type="email" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Message</label>
                <textarea placeholder="How can we assist you today?" rows={1} className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light resize-none" />
              </div>
              <button type="submit" className="w-full bg-burgundy text-white py-8 rounded-4xl text-[11px] font-black tracking-[0.5em] uppercase hover:brightness-125 transition-all shadow-xl active:scale-[0.98]">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
