(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Branch",
    ()=>Branch
]);
var Branch = /*#__PURE__*/ function(Branch) {
    Branch["NDERA"] = "Ndera";
    Branch["NYARUGUNGA"] = "Nyarugunga";
    Branch["KANOMBE"] = "Kanombe";
    return Branch;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BRANCH_DATA",
    ()=>BRANCH_DATA,
    "COMPANY_PROFILE",
    ()=>COMPANY_PROFILE,
    "SPORT_PRICES",
    ()=>SPORT_PRICES
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types.ts [app-client] (ecmascript)");
;
const COMPANY_PROFILE = {
    about: "Glads Apartment is a modern multi-service hospitality and lifestyle establishment designed to provide comfort, wellness, and convenience in one place. With a unique blend of luxury accommodation, leisure, retail, and wellness facilities, we are committed to offering exceptional services to both residents and visitors. Our philosophy is built on quality, customer satisfaction, and sustainability, ensuring that every guest enjoys an unforgettable experience.",
    mission: "To provide a holistic living and leisure experience by combining modern accommodation, wellness, dining, shopping, and recreational services under one roof.",
    vision: "To become the leading hospitality and lifestyle destination in Rwanda, known for innovation, excellence, and customer care.",
    values: [
        {
            title: "Excellence",
            description: "Delivering world-class services",
            icon: "award"
        },
        {
            title: "Integrity",
            description: "Building trust through transparency",
            icon: "shield-check"
        },
        {
            title: "Innovation",
            description: "Continuously improving our services",
            icon: "lightbulb"
        },
        {
            title: "Sustainability",
            description: "Promoting environmentally friendly practices",
            icon: "leaf"
        },
        {
            title: "Customer Care",
            description: "Putting our clients at the heart of everything we do",
            icon: "heart"
        }
    ],
    whyChooseUs: [
        "All-in-one hospitality and lifestyle destination",
        "Professional staff with customer-first service approach",
        "Strategic location with easy accessibility",
        "Commitment to health, comfort, and sustainability"
    ]
};
const SPORT_PRICES = [
    {
        product: "SAUNA & STEAM",
        price: "5,000 Frw"
    },
    {
        product: "SWIMMING",
        price: "5,000 Frw"
    },
    {
        product: "GYM",
        price: "5,000 Frw"
    },
    {
        product: "JACUZZI",
        price: "20,000 Frw"
    },
    {
        product: "MASSAGE",
        price: "10,000 and Above"
    }
];
const BRANCH_DATA = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].NDERA]: {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].NDERA,
        fullName: 'Glads Apartment – Ndera',
        tagline: 'Flagship Location - Business & Relaxation',
        location: {
            lat: -1.9441,
            lng: 30.0619,
            address: 'Near 15 Road, Ndera, Gasabo',
            distance: 'Flagship Location'
        },
        rooms: [
            {
                id: 'n-studio',
                name: 'Executive Studio',
                description: 'Modern, efficient living space for the minimalist business traveler.',
                longDescription: 'Our Executive Studio at Ndera offers a seamless blend of work and rest. Designed with high-end materials including Italian marble bathrooms and German fixtures, it features a smart workspace with ergonomic furniture, a premium kitchenette with Bosch appliances, and a state-of-the-art climate control system. Perfect for short business stays where efficiency and luxury are paramount. The space includes a Murphy bed system that transforms into a work area during the day.',
                price: 85,
                image: '/DSC_0926-1-scaled.jpg.jpeg',
                features: [
                    'High-Speed WiFi',
                    'Smart Kitchenette',
                    'En-suite Bathroom'
                ],
                amenities: [
                    '55" Smart TV',
                    'Nespresso Machine',
                    'Premium Molton Brown Toiletries',
                    'Dual-Zone Climate Control',
                    'Digital Safe Box',
                    'Fiber Internet 1GB',
                    'Work Desk with Docking Station'
                ],
                view3D: '/models/studio-ndera.glb'
            },
            {
                id: 'n-1br',
                name: 'Deluxe One Bedroom',
                description: 'Spacious luxury suite featuring a separate living area and panoramic views.',
                longDescription: 'Experience true privacy in our One Bedroom suite spanning 65 square meters. The separate living and dining areas allow for entertaining or quiet reflection, while the master bedroom remains a secluded sanctuary of peace. Floor-to-ceiling windows offer stunning views. The suite features handcrafted furniture from local artisans, a fully equipped kitchen with granite countertops, and a spa-like bathroom with a rainfall shower and separate bathtub.',
                price: 120,
                image: '/DSC_0996-1-720x470.jpg.jpeg',
                features: [
                    'High-Speed WiFi',
                    'Full Kitchen',
                    'King Size Bed'
                ],
                amenities: [
                    'Private Balcony',
                    'In-Suite Washer/Dryer',
                    'Bose Home Theater Sound System',
                    'Executive Work Desk',
                    'Nespresso & Tea Station',
                    'Mini Bar with Premium Selections',
                    'Rainfall Shower & Bathtub'
                ],
                view3D: '/models/one-bedroom-ndera.glb'
            },
            {
                id: 'n-2br',
                name: 'Grand Two Bedroom Suite',
                description: 'Expansive luxury suite designed for families or executive teams requiring ultimate space.',
                longDescription: 'The pinnacle of Ndera living spans 95 square meters. Two full master suites each with en-suite bathrooms are connected by a grand living space with 12-foot ceilings. Ideal for families or business partners who require communal space without sacrificing personal privacy. Includes a fully equipped gourmet kitchen with Sub-Zero refrigerator and Wolf range, a formal dining room for 8 guests, and a private office space. The master suite features a walk-in closet and spa bathroom with jacuzzi.',
                price: 180,
                image: '/OKK_5837-400x800.jpg.jpeg',
                features: [
                    'High-Speed WiFi',
                    '2 Full Bathrooms',
                    'Private Balcony'
                ],
                amenities: [
                    'Two Walk-in Closets',
                    'Wine Refrigerator',
                    'Formal Dining Room for 8',
                    'iPad Concierge System',
                    'Egyptian Cotton Linens',
                    'Jacuzzi Bath in Master',
                    'Private Office Space',
                    'Butler Service Available'
                ],
                view3D: '/models/two-bedroom-ndera.glb'
            }
        ],
        services: [
            {
                id: 'pool',
                name: 'Swimming Pool',
                category: 'Wellness & Fitness',
                icon: 'swim.jpeg',
                description: 'Modern swimming pool for relaxation and exercise.',
                fullDescription: 'Our stunning 25-meter pool offers a refreshing escape. The pool features a shallow lounging area, underwater lighting, and is maintained at a perfect temperature. Adjacent poolside cabanas offer privacy and shade, while our pool bar serves fresh juices and light meals. Open daily with dedicated lifeguard service.',
                highlights: [
                    '25-meter pool',
                    'Poolside cabanas',
                    'Evening ambiance'
                ],
                inclusions: [
                    'Towels',
                    'Loungers'
                ],
                goodToKnow: [
                    'Children must be supervised',
                    'Outside food/drinks restricted'
                ],
                gallery: [
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80'
                ],
                hours: 'Daily',
                pricing: '5,000 Frw'
            },
            {
                id: 'gym',
                name: 'Gym & Fitness Center',
                category: 'Wellness & Fitness',
                icon: 'gym.jpeg',
                description: 'A well-equipped fitness space to support your health and wellness journey.',
                fullDescription: 'Our fitness center features modern cardio machines, strength training equipment, and free weights. Personal trainers are available by appointment.',
                hours: 'Daily',
                pricing: '5,000 Frw'
            },
            {
                id: 'sauna',
                name: 'Sauna & Massage',
                category: 'Wellness & Fitness',
                icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Professional sauna facilities and therapeutic massages.',
                fullDescription: 'Indulge in our sauna for detox and relaxation. We offer therapeutic and wellness massages, and spa treatments to rejuvenate body and mind.',
                hours: 'Daily',
                pricing: 'Sauna: 5,000 Frw | Massage: 10,000 Frw and Above'
            },
            {
                id: 'jacuzzi',
                name: 'Jacuzzi',
                category: 'Wellness & Fitness',
                icon: 'jac.jpeg',
                description: 'Jacuzzi for ultimate wellness and relaxation.',
                fullDescription: 'Our Jacuzzi offers a premium relaxation experience with massaging jets and mood lighting.',
                hours: 'Daily',
                pricing: '20,000 Frw'
            },
            {
                id: 'restaurant',
                name: 'Restaurant',
                category: 'Food & Entertainment',
                icon: 'restaurant.jpeg',
                description: 'Full-service restaurant with local and international cuisine.',
                fullDescription: 'Our restaurant offers an exquisite menu blending international techniques with local ingredients. Enjoy breakfast, lunch, and dinner in a sophisticated setting.',
                hours: 'Daily',
                pricing: 'Menu based'
            },
            {
                id: 'bar_bbq',
                name: 'Bar and Barbecue',
                category: 'Food & Entertainment',
                icon: 'bar.jpeg',
                description: 'Bar offering cocktails, wines, and beverages with barbecue.',
                fullDescription: 'Relax at our bar with a wide selection of drinks and enjoy delicious barbecue options.',
                hours: 'Daily',
                pricing: 'Menu based'
            },
            {
                id: 'coffee',
                name: 'Coffee Shop',
                category: 'Food & Entertainment',
                icon: 'coffee.jpeg',
                description: 'Freshly brewed coffee, pastries, and snacks.',
                fullDescription: 'Our coffee shop provides a relaxing atmosphere for meetings and leisure, serving premium coffee and light meals.',
                hours: 'Daily',
                pricing: 'Menu based'
            },
            {
                id: 'supermarket',
                name: 'Supermarket',
                category: 'Convenience',
                icon: 'sup.png',
                description: 'Wide range of groceries and household essentials.',
                fullDescription: 'Convenient shopping for residents and visitors with fresh produce, dairy, and daily essentials.',
                hours: 'Daily',
                pricing: 'Retail prices'
            },
            {
                id: 'salon',
                name: 'Saloon',
                category: 'Beauty & Care',
                icon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Full-service beauty salon.',
                fullDescription: 'Professional hair and beauty services for men and women.',
                hours: 'Daily',
                pricing: 'Menu based'
            },
            {
                id: 'conference',
                name: 'Big and Small Conference Hall',
                category: 'Business & Events',
                icon: 'meet.jpeg',
                description: 'Modern conference facilities for business and events.',
                fullDescription: 'Our conference halls are equipped for meetings, workshops, and events of various sizes.',
                hours: 'Available for booking',
                pricing: 'Contact for rates'
            }
        ],
        gallery: [
            '/hero.jpeg',
            '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
            '/OKK_5807-scaled-e1673375197516.jpg.jpeg',
            '/OKK_5838-1-scaled.jpg.jpeg',
            '/OKK_5869-scaled-e1673256152545.jpg.jpeg',
            '/OKK_5888-scaled.jpg.jpeg',
            '/food.jpeg',
            '/DSC_0926-1-scaled.jpg.jpeg',
            '/DSC_0996-1-720x470.jpg.jpeg',
            '/about1-1.jpg.jpeg',
            '/OKK_5837-400x800.jpg.jpeg',
            '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg'
        ],
        contact: {
            address: 'Ndera, Gasabo, Rwanda',
            phone: '+250 788 300 269',
            email: 'info@gladsapartment.rw'
        }
    },
    [__TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].NYARUGUNGA]: {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].NYARUGUNGA,
        fullName: 'Glads Company – Nyarugunga (KMH)',
        tagline: 'Vibrant Lifestyle Complex',
        location: {
            lat: -2.0000,
            lng: 30.1394,
            address: 'Nyarugunga (KMH), Kicukiro',
            distance: 'Vibrant Complex'
        },
        rooms: [
            {
                id: 'kn-1br',
                name: 'Furnished Apartment',
                description: 'Comfortable furnished apartments for short and long stays.',
                longDescription: 'Our Nyarugunga furnished apartments offer a perfect blend of comfort and convenience. Ideal for travelers and residents looking for a vibrant community atmosphere.',
                price: 95,
                image: '/OKK_5908-1-720x520.jpg.jpeg',
                features: [
                    'High-Speed WiFi',
                    'Furnished',
                    'Smart TV'
                ],
                amenities: [
                    'Kitchenette',
                    'Work Desk',
                    'Laundry Service'
                ],
                view3D: '/models/one-bedroom-kanombe.glb'
            }
        ],
        services: [
            {
                id: 'pool',
                name: 'Swimming Pool',
                category: 'Wellness & Fitness',
                icon: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Refreshing swimming pool for leisure and fitness.',
                hours: 'Daily',
                pricing: '5,000 Frw'
            },
            {
                id: 'gym',
                name: 'Gym',
                category: 'Wellness & Fitness',
                icon: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Fully equipped gym.',
                hours: 'Daily',
                pricing: '5,000 Frw'
            },
            {
                id: 'sauna',
                name: 'Sauna & Massage',
                category: 'Wellness & Fitness',
                icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Sauna and massage services for relaxation.',
                hours: 'Daily',
                pricing: 'Sauna: 5,000 Frw | Massage: 10,000 Frw+'
            },
            {
                id: 'restaurant',
                name: 'Restaurant and Coffee Shop',
                category: 'Food & Entertainment',
                icon: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Dining options for every taste.',
                hours: 'Daily',
                pricing: 'Menu based'
            },
            {
                id: 'supermarket',
                name: 'Supermarket',
                category: 'Convenience',
                icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Groceries and essentials.',
                hours: 'Daily',
                pricing: 'Retail prices'
            },
            {
                id: 'milkzone',
                name: 'INYANGE MILK ZONE',
                category: 'Family Services',
                icon: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Fresh milk products, yogurt, and cheese.',
                fullDescription: 'Fresh and pasteurized milk products, yogurt, cheese, and other dairy products. Hygienic and quality-controlled services.',
                hours: 'Daily',
                pricing: 'Retail prices'
            },
            {
                id: 'conference',
                name: 'Small Conference Hall',
                category: 'Business & Events',
                icon: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                description: 'Intimate conference space for meetings.',
                hours: 'Available for booking',
                pricing: 'Contact for rates'
            }
        ],
        gallery: [
            '/about1-1.jpg.jpeg',
            '/DSC_0926-1-scaled.jpg.jpeg',
            '/OKK_5869-scaled-e1673256152545.jpg.jpeg',
            '/R-2-1.jpg.jpeg',
            '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg',
            '/OKK_5888-720x470.jpg.jpeg',
            '/OKK_5908-1-720x520.jpg.jpeg',
            '/PXL_20221227_1735115792-scaled.jpg.jpeg'
        ],
        contact: {
            address: 'Nyarugunga, Kicukiro, Rwanda',
            phone: '+250 788 300 269',
            email: 'info@gladsapartment.rw'
        }
    },
    [__TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].KANOMBE]: {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Branch"].KANOMBE,
        fullName: 'Glads Apartment – Kanombe',
        tagline: 'Quiet Residential Living',
        location: {
            lat: -1.9706,
            lng: 30.1044,
            address: 'Kanombe (Rubirizi), Kicukiro',
            distance: 'Quiet Residential Area'
        },
        rooms: [
            {
                id: 'kb-1br',
                name: 'Standard Furnished Apartment',
                description: 'Clean, quiet, and perfectly designed for peaceful living.',
                longDescription: 'Our Kanombe apartments offer fully furnished living spaces ideal for guests seeking simplicity and affordability. Located in a quiet residential area, it provides a peaceful environment for relaxation.',
                price: 55,
                image: '/DSC_0996-1-720x470.jpg.jpeg',
                features: [
                    'High-Speed WiFi',
                    'Furnished',
                    'Quiet Location'
                ],
                amenities: [
                    'Weekly Housekeeping',
                    'Secure Parking',
                    'Water Heater'
                ],
                view3D: '/models/one-bedroom-kabeza.glb'
            }
        ],
        services: [],
        gallery: [
            '/about1-1.jpg.jpeg',
            '/DSC_0996-1-720x470.jpg.jpeg',
            '/OKK_5837-400x800.jpg.jpeg',
            '/R-5.jpg.jpeg',
            '/R-6-e1673374918433.jpg.jpeg',
            '/OKK_5889-scaled.jpg.jpeg',
            '/blog_post3-150x150.jpg.jpeg'
        ],
        contact: {
            address: 'Kanombe (Rubirizi), Kicukiro, Rwanda',
            phone: '+250 788 300 269',
            email: 'info@gladsapartment.rw'
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0feb50e1._.js.map