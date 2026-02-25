import * as React from 'react';
import { LegalDocKey } from '../../types'; // Will need to expose LegalDocKey

export const LEGAL_CONTENT: Record<LegalDocKey, { title: string; sections: { heading: string; body: string }[] }> = {
    privacy: {
        title: 'Privacy Policy',
        sections: [
            {
                heading: 'Data We Collect',
                body: 'Glads Apartment collects booking details, contact information, branch selection, and payment reference data necessary to process reservations and provide hospitality services.',
            },
            {
                heading: 'How We Use Data',
                body: 'Your data is used to confirm reservations, provide branch-specific services, support guest communication, and maintain operational records for Ndera, Kanombe, and Kabeza.',
            },
            {
                heading: 'Branch Data Access',
                body: 'Access is role-based: branch teams can only access data for their own branch, while HQ administrators can access consolidated system-wide data.',
            },
            {
                heading: 'Security and Retention',
                body: 'We apply administrative and technical safeguards to protect data and retain records only as required for booking operations, accounting, and legal compliance.',
            },
        ],
    },
    terms: {
        title: 'Terms of Service',
        sections: [
            {
                heading: 'Service Scope',
                body: 'This website represents one brand with multiple branches. Available rooms, services, prices, and facilities are always branch-specific and may differ between locations.',
            },
            {
                heading: 'Branch Selection',
                body: 'By using the site, you agree that the currently selected branch context controls your visible services, booking availability, and reservation processing.',
            },
            {
                heading: 'Availability and Changes',
                body: 'Room and service availability is subject to operational capacity. Glads Apartment may update rates, offerings, and service details without prior notice.',
            },
            {
                heading: 'Acceptable Use',
                body: 'Users must provide accurate booking details and must not misuse forms, payment flows, or administrative features of the platform.',
            },
        ],
    },
    booking: {
        title: 'Booking Terms',
        sections: [
            {
                heading: 'Branch-Tagged Reservations',
                body: 'Every reservation is tied to the active branch at checkout. Bookings and payments are recorded with branch ID for operational and financial accuracy.',
            },
            {
                heading: 'Payment Processing',
                body: 'Payments are handled through a shared company gateway. Confirmation is valid only after successful payment authorization and internal booking validation.',
            },
            {
                heading: 'Guest Responsibilities',
                body: 'Guests must provide valid contact details and arrival information. Any special requests are subject to branch-level availability.',
            },
            {
                heading: 'Cancellation and Modification',
                body: 'Cancellation or date changes depend on selected service and branch policy. Final terms are confirmed by the concierge team during booking confirmation.',
            },
        ],
    },
};

interface LegalModalProps {
    legalDoc: LegalDocKey | null;
    setLegalDoc: (doc: LegalDocKey | null) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ legalDoc, setLegalDoc }) => {
    if (!legalDoc) return null;

    return (
        <div
            className="fixed inset-0 z-170 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setLegalDoc(null)}
        >
            <div
                className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-4xl border border-white/15 bg-white dark:bg-neutral-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{LEGAL_CONTENT[legalDoc].title}</h3>
                    <button
                        onClick={() => setLegalDoc(null)}
                        aria-label="Close legal document"
                        className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        x
                    </button>
                </div>
                <div className="px-6 md:px-8 py-6 md:py-7 space-y-6">
                    {LEGAL_CONTENT[legalDoc].sections.map((section) => (
                        <section
                            key={section.heading}
                            className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-5"
                        >
                            <h4 className="text-sm md:text-base font-black uppercase tracking-[0.16em] text-burgundy mb-2">
                                {section.heading}
                            </h4>
                            <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};
