import { Branch, BranchData } from './types';

export const BRANCH_DATA: Record<Branch, BranchData> = {
  [Branch.NDERA]: {
    id: Branch.NDERA,
    fullName: 'Glads Apartment – Ndera',
    tagline: 'Main Branch - Ultimate Luxury Experience',
    location: { lat: -1.9441, lng: 30.0619, address: 'Ndera HQ, Gasabo, Kigali', distance: '8km from City Center' },
    rooms: [
      { 
        id: 'n-studio', 
        name: 'Executive Studio', 
        description: 'Modern, efficient living space for the minimalist business traveler.', 
        longDescription: 'Our Executive Studio at Ndera offers a seamless blend of work and rest. Designed with high-end materials including Italian marble bathrooms and German fixtures, it features a smart workspace with ergonomic furniture, a premium kitchenette with Bosch appliances, and a state-of-the-art climate control system. Perfect for short business stays where efficiency and luxury are paramount. The space includes a Murphy bed system that transforms into a work area during the day.',
        price: 85, 
        image: '/DSC_0926-1-scaled.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Smart Kitchenette', 'En-suite Bathroom'],
        amenities: ['55" Smart TV', 'Nespresso Machine', 'Premium Molton Brown Toiletries', 'Dual-Zone Climate Control', 'Digital Safe Box', 'Fiber Internet 1GB', 'Work Desk with Docking Station'],
        view3D: '/models/studio-ndera.glb'
      },
      { 
        id: 'n-1br', 
        name: 'Deluxe One Bedroom', 
        description: 'Spacious luxury suite featuring a separate living area and panoramic city views.', 
        longDescription: 'Experience true privacy in our One Bedroom suite spanning 65 square meters. The separate living and dining areas allow for entertaining or quiet reflection, while the master bedroom remains a secluded sanctuary of peace. Floor-to-ceiling windows offer stunning views of the rising Kigali skyline. The suite features handcrafted furniture from local artisans, a fully equipped kitchen with granite countertops, and a spa-like bathroom with a rainfall shower and separate bathtub.',
        price: 120, 
        image: '/DSC_0996-1-720x470.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Full Kitchen', 'King Size Bed'],
        amenities: ['Private Balcony with City Views', 'In-Suite Washer/Dryer', 'Bose Home Theater Sound System', 'Executive Work Desk', 'Nespresso & Tea Station', 'Mini Bar with Premium Selections', 'Rainfall Shower & Bathtub'],
        view3D: '/models/one-bedroom-ndera.glb'
      },
      { 
        id: 'n-2br', 
        name: 'Grand Two Bedroom Suite', 
        description: 'Expansive luxury suite designed for families or executive teams requiring ultimate space.', 
        longDescription: 'The pinnacle of Ndera living spans 95 square meters. Two full master suites each with en-suite bathrooms are connected by a grand living space with 12-foot ceilings. Ideal for families or business partners who require communal space without sacrificing personal privacy. Includes a fully equipped gourmet kitchen with Sub-Zero refrigerator and Wolf range, a formal dining room for 8 guests, and a private office space. The master suite features a walk-in closet and spa bathroom with jacuzzi.',
        price: 180, 
        image: '/OKK_5837-400x800.jpg.jpeg', 
        features: ['High-Speed WiFi', '2 Full Bathrooms', 'Private Balcony'],
        amenities: ['Two Walk-in Closets', 'Wine Refrigerator', 'Formal Dining Room for 8', 'iPad Concierge System', 'Egyptian Cotton Linens', 'Jacuzzi Bath in Master', 'Private Office Space', 'Butler Service Available'],
        view3D: '/models/two-bedroom-ndera.glb'
      },
    ],
    services: [
      { 
        id: 'pool', 
        name: 'Infinity Swimming Pool', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Rooftop infinity pool with panoramic Kigali views and temperature-controlled water.',
        fullDescription: 'Our stunning 25-meter infinity pool sits atop the 8th floor, offering breathtaking 360-degree views of Kigali. The pool features a shallow lounging area, underwater lighting, and is heated year-round. Adjacent poolside cabanas offer privacy and shade, while our pool bar serves fresh juices and light meals. Open daily from 6 AM to 10 PM with dedicated lifeguard service.',
        highlights: [
          '25-meter rooftop infinity pool with skyline views',
          'Temperature-controlled water for year-round comfort',
          'Poolside cabanas for shade and privacy',
          'Evening ambiance with underwater lighting'
        ],
        inclusions: [
          'Towels (guest use)',
          'Loungers (subject to availability)',
          'Lifeguard coverage during operating hours'
        ],
        goodToKnow: [
          'Children must be supervised by an adult.',
          'Outside food/drinks may be restricted during peak hours.',
          'Best photos: golden hour before sunset.'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80'
        ],
        hours: '6:00 AM - 10:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'sauna', 
        name: 'Luxury Sauna & Steam Room', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Finnish sauna and eucalyptus-infused steam room for ultimate detoxification.',
        fullDescription: 'Indulge in our authentic Finnish sauna crafted from Canadian cedar wood, maintaining optimal temperatures of 80-90°C. The adjoining steam room features eucalyptus and lavender aromatherapy. Both facilities include chromotherapy lighting and are complemented by ice fountains and tropical rain showers. Private relaxation lounges with herbal teas complete the wellness experience.',
        hours: '7:00 AM - 9:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'massage', 
        name: 'Therapeutic Massage Center', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Professional therapeutic and relaxation massages by certified therapists.',
        fullDescription: 'Our spa center offers a full range of massage therapies including Swedish, deep tissue, hot stone, and traditional Rwandan healing massages. Each treatment room features heated tables, ambient lighting, and is soundproofed for maximum relaxation. Our certified therapists are trained in international techniques and use premium organic oils and products.',
        highlights: [
          'Certified therapists and tailored sessions',
          'Swedish, deep tissue, hot stone, and signature treatments',
          'Quiet, soundproof treatment rooms'
        ],
        goodToKnow: [
          'Arrive 10 minutes early for consultation.',
          'Please mention any injuries or allergies when booking.',
          'Late arrivals may shorten treatment duration.'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80'
        ],
        hours: '8:00 AM - 8:00 PM',
        pricing: 'From $45/session'
      },
      { 
        id: 'gym', 
        name: 'Elite Fitness Center', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'State-of-the-art fitness facility with premium Technogym equipment.',
        fullDescription: 'Our 200-square-meter fitness center features the latest Technogym equipment including cardio machines with personal entertainment systems, strength training equipment, and a dedicated free weights area. The gym also includes a yoga/Pilates studio with mirrors and sound system. Personal trainers are available by appointment.',
        hours: '24/7 Access for Guests',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'jacuzzi', 
        name: 'Rooftop Jacuzzi', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Private rooftop jacuzzi with panoramic city views and mood lighting.',
        fullDescription: 'Located on our exclusive rooftop terrace, our 8-person jacuzzi offers stunning city views and ultimate privacy. The facility features chromotherapy lighting, massaging jets, and is surrounded by lush landscaping. Evening sessions are particularly magical with the city lights creating a romantic ambiance.',
        hours: '6:00 AM - 11:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'coffee', 
        name: 'Ndera Artisan Coffee Shop', 
        category: 'Food & Entertainment', 
        icon: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Specialty coffee bar featuring premium Rwandan mountain beans and international selections.',
        fullDescription: 'Our coffee shop celebrates Rwandan coffee heritage with beans sourced directly from local cooperatives in Nyamasheke and Huye. Our skilled baristas craft everything from traditional Rwandan coffee ceremonies to modern specialty drinks. The menu includes fresh pastries, light breakfast items, and healthy smoothies. The space features comfortable seating areas and free WiFi.',
        hours: '6:00 AM - 9:00 PM',
        pricing: 'Coffee from $3, Meals from $8'
      },
      { 
        id: 'restaurant', 
        name: 'The Kigali Dining Room', 
        category: 'Food & Entertainment', 
        icon: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Fine dining restaurant featuring fusion of international cuisine and authentic Rwandan flavors.',
        fullDescription: 'Led by our executive chef trained in European culinary arts, the restaurant offers an exquisite menu blending international techniques with local ingredients. Signature dishes include grilled tilapia with Rwandan spices, premium Angus beef, and traditional ubugari reimagined. The wine cellar features over 200 selections. Private dining rooms available for special occasions.',
        highlights: [
          'Seasonal menus with local ingredients',
          'Chef-led signature dishes and curated pairings',
          'Private dining options for celebrations'
        ],
        inclusions: [
          'Dietary accommodations (on request)',
          'Celebration setup (select packages)',
          'Table reservation support'
        ],
        goodToKnow: [
          'Reservations recommended for evenings and weekends.',
          'Smart-casual dress is encouraged after 6 PM.',
          'Please share allergies or dietary needs in advance.'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80'
        ],
        hours: '6:30 AM - 10:00 PM',
        pricing: 'Dinner from $25, Prix fixe $45'
      },
      { 
        id: 'bars', 
        name: 'Executive Lounge & Pool Bar', 
        category: 'Food & Entertainment', 
        icon: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Sophisticated lounges with premium cocktails, pool tables, and live entertainment.',
        fullDescription: 'Our main lounge features a premium bar with craft cocktails, aged whiskeys, and fine wines. The space includes professional pool tables, dart boards, and hosts live music on weekends. The poolside bar offers tropical cocktails and light dining with stunning views. Both venues feature happy hour specials and private event hosting.',
        hours: '4:00 PM - 1:00 AM',
        pricing: 'Cocktails from $8, Beer from $4'
      },
      { 
        id: 'conference', 
        name: 'Executive Conference Hall', 
        category: 'Business & Events', 
        icon: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Modern conference facilities accommodating up to 150 guests with full AV equipment.',
        fullDescription: 'Our flagship conference hall can be configured for various events from board meetings to large presentations. Features include a built-in projection system, wireless presentation capabilities, professional lighting, and superior acoustics. The space includes breakout areas, a business center, and dedicated catering preparation areas. Full technical support is provided.',
        hours: '24/7 Available',
        pricing: 'From $200/day + services'
      },
      { 
        id: 'theater', 
        name: 'Private Cinema Theater', 
        category: 'Business & Events', 
        icon: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1200&q=80', 
        description: 'Luxury 30-seat private cinema with state-of-the-art audio-visual systems.',
        fullDescription: 'Experience movies like never before in our boutique cinema featuring leather recliners, 4K projection, and Dolby Atmos surround sound. The theater is available for private screenings, business presentations, or family movie nights. Popcorn, beverages, and gourmet snacks are available from our concession service.',
        highlights: [
          '4K projection and premium surround sound',
          'Comfort seating designed for long sessions',
          'Perfect for private screenings or presentations'
        ],
        inclusions: [
          'Basic setup and on-site assistance (subject to scheduling)',
          'Screening room preparation before arrival'
        ],
        goodToKnow: [
          'Content/source (laptop/drive/streaming) should be confirmed when booking.',
          'We recommend arriving 15 minutes before start time for setup.',
          'Food & beverage packages can be arranged on request.'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80'
        ],
        hours: '2:00 PM - 11:00 PM',
        pricing: '$150 for 3-hour private screening'
      },
      { 
        id: 'meeting', 
        name: 'Executive Meeting Rooms', 
        category: 'Business & Events', 
        icon: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Five private meeting rooms with video conferencing and presentation capabilities.',
        fullDescription: 'Our executive meeting rooms accommodate 4-12 people and feature video conferencing capabilities, interactive whiteboards, and high-speed internet. Each room has climate control, sound insulation, and can be catered with our business lunch menu. Ideal for corporate retreats, team meetings, and client presentations.',
        hours: '6:00 AM - 10:00 PM',
        pricing: 'From $50/half day'
      },
      { 
        id: 'salon', 
        name: 'Artisan Beauty Salon', 
        category: 'Beauty & Care', 
        icon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Full-service beauty salon offering hair, nail, and skincare services for men and women.',
        fullDescription: 'Our professional salon provides comprehensive beauty services including precision haircuts, coloring, styling, manicures, pedicures, and facial treatments. Services are provided by internationally trained stylists using premium L\'Oréal and Kérastase products. Special bridal packages and group bookings are available.',
        hours: '8:00 AM - 7:00 PM',
        pricing: 'Haircut from $25, Full service from $80'
      },
      { 
        id: 'supermarket', 
        name: 'Convenience Supermarket', 
        category: 'Convenience', 
        icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'On-site supermarket stocking daily essentials, gourmet foods, and local products.',
        fullDescription: 'Our convenient supermarket operates 24/7 and stocks everything from daily essentials to gourmet ingredients. Features include fresh local produce, international brands, Rwandan crafts and souvenirs, and a selection of wines and spirits. Room delivery service is available.',
        hours: '24/7 Open',
        pricing: 'Competitive local pricing'
      }
    ],
    gallery: [
      '/hero.jpeg',
      '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
      '/OKK_5807-scaled-e1673375197516.jpg.jpeg',
      '/OKK_5838-1-scaled.jpg.jpeg',
      '/OKK_5869-scaled-e1673256152545.jpg.jpeg',
      '/OKK_5888-scaled.jpg.jpeg',
      '/restaurant.jpg.jpeg',
      '/DSC_0926-1-scaled.jpg.jpeg',
      '/DSC_0996-1-720x470.jpg.jpeg',
      '/about1-1.jpg.jpeg',
      '/OKK_5837-400x800.jpg.jpeg',
      '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg',
      // Second set - slightly modified
      '/hero.jpeg',
      '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
      '/OKK_5889-scaled.jpg.jpeg',
      '/R-2-1.jpg.jpeg',
      '/R-5.jpg.jpeg',
      '/R-6-e1673374918433.jpg.jpeg',
      '/blog_post3-150x150.jpg.jpeg',
      '/blog_post5-150x150.jpg.jpeg',
      '/OKK_5888-720x470.jpg.jpeg',
      '/OKK_5908-1-720x520.jpg.jpeg',
      '/PXL_20221227_1735115792-scaled.jpg.jpeg',
      '/restaurant.jpg.jpeg',
      // Third set - mixed
      '/DSC_0926-1-scaled.jpg.jpeg',
      '/about1-1.jpg.jpeg',
      '/OKK_5838-1-scaled.jpg.jpeg',
      '/hero.jpeg',
      '/OKK_5869-scaled-e1673256152545.jpg.jpeg',
      '/DSC_0996-1-720x470.jpg.jpeg',
      '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
      '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg',
      '/OKK_5888-scaled.jpg.jpeg',
      '/restaurant.jpg.jpeg',
      '/R-2-1.jpg.jpeg',
      '/OKK_5807-scaled-e1673375197516.jpg.jpeg'
    ],
    contact: {
      address: 'Ndera HQ, Gasabo, Kigali',
      phone: '+250 788 000 001',
      email: 'ndera@gladsapartment.com'
    }
  },
  [Branch.KANOMBE]: {
    id: Branch.KANOMBE,
    fullName: 'Glads Apartment – Kanombe',
    tagline: 'Lifestyle Branch - Connectivity Meets Comfort',
    location: { lat: -2.0000, lng: 30.1394, address: 'Airport Road, Kanombe, Kigali', distance: '12km from City Center, 2km from Airport' },
    rooms: [
      { 
        id: 'kn-1br', 
        name: 'Airport One Bedroom', 
        description: 'Sleek executive suite optimized for airport travelers and business guests.', 
        longDescription: 'Our Kanombe One Bedroom Suite is strategically designed for travelers seeking comfort near Kigali International Airport. Fast fiber Wi-Fi, triple-glazed noise-canceling windows ensure peaceful rest despite proximity to the airport. The suite includes a fully equipped kitchenette, a separate living area with sofa bed, and premium blackout curtains. Complimentary airport shuttle service available 24/7.',
        price: 95, 
        image: '/OKK_5908-1-720x520.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Airport Transfer', 'Smart TV'],
        amenities: ['24/7 Airport Shuttle', 'Kitchenette with Full Appliances', 'Blackout Curtains', 'Work Desk with Dual Monitors', 'Welcome Breakfast', 'Laundry Service'],
        view3D: '/models/one-bedroom-kanombe.glb'
      },
      { 
        id: 'kn-2br', 
        name: 'Connected Two Bedroom Suite', 
        description: 'Spacious dual-suite perfect for business collaborators or small families.', 
        longDescription: 'Perfect for business collaborators or families, this 80-square-meter suite features two separate bedrooms each with its own en-suite bathroom and a shared living area designed for both productivity and relaxation. The open-plan kitchen and dining area can accommodate up to 6 people. High-speed internet throughout and dedicated work spaces in each bedroom make it ideal for extended business stays.',
        price: 145, 
        image: '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Full Kitchen', 'Separate Living Room'],
        amenities: ['Private Balcony with Garden View', 'Fiber Internet 1GB', 'Full Dining Area for 6', 'Two Work Stations', 'Welcome Grocery Package', 'Weekly Housekeeping'],
        view3D: '/models/two-bedroom-kanombe.glb'
      },
      { 
        id: 'kn-3br', 
        name: 'Sky Penthouse Three Bedroom', 
        description: 'Grand family residence with spectacular views and luxury amenities.', 
        longDescription: 'The crown jewel of Kanombe spanning 120 square meters. A three-bedroom masterpiece offering unmatched views of Kigali International Airport runway and the eastern hills. The penthouse features a master bedroom with walk-in closet, two additional bedrooms, and a spacious living area with floor-to-ceiling windows. The gourmet kitchen includes premium appliances and a breakfast bar. Perfect for extended family stays or corporate housing.',
        price: 220, 
        image: '/PXL_20221227_1735115792-scaled.jpg.jpeg', 
        features: ['High-Speed WiFi', '3 Full Bathrooms', 'Private Terrace'],
        amenities: ['Panoramic Roof Terrace', 'Private Bar and Lounge', 'Concierge Butler Service', 'Home Cinema Setup', 'Airport VIP Transfer', 'Private Chef Available'],
        view3D: '/models/three-bedroom-kanombe.glb'
      },
    ],
    services: [
      { 
        id: 'pool', 
        name: 'Garden Terrace Pool', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Tranquil mid-level pool surrounded by tropical gardens with mountain views.',
        fullDescription: 'Our serene 20-meter pool is situated on the 4th-floor terrace, surrounded by lush tropical gardens and offering stunning views of the Nyungwe hills. The pool area features comfortable loungers, umbrellas, and a dedicated children\'s area. The adjacent poolside pavilion serves light refreshments and healthy snacks throughout the day.',
        hours: '6:00 AM - 9:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'sauna', 
        name: 'Wellness Steam Spa', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Intimate steam spa with aromatherapy treatments for deep relaxation.',
        fullDescription: 'Our boutique steam spa offers traditional steam treatments enhanced with natural Rwandan herbs and essential oils. The facility accommodates up to 6 people and features temperature-controlled steam, chromotherapy lighting, and relaxation area with herbal teas. Perfect for unwinding after long flights or business meetings.',
        hours: '7:00 AM - 8:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'massage', 
        name: 'Therapeutic Wellness Center', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Professional massage therapy specializing in travel fatigue recovery.',
        fullDescription: 'Our massage center specializes in treatments for travel fatigue, jet lag recovery, and business stress relief. Services include Swedish massage, deep tissue therapy, and traditional Rwandan healing techniques. Two private treatment rooms with heated tables and ambient lighting provide the perfect environment for relaxation.',
        hours: '8:00 AM - 7:00 PM',
        pricing: 'From $40/session'
      },
      { 
        id: 'gym', 
        name: 'Active Fitness Center', 
        category: 'Wellness & Fitness', 
        icon: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Compact but fully equipped fitness center with modern cardio and strength equipment.',
        fullDescription: 'Our efficient 120-square-meter fitness center features modern cardio equipment with entertainment systems, strength training machines, and free weights area. The space includes yoga mats, exercise balls, and a stretching area. Perfect for maintaining your fitness routine during travel.',
        hours: '24/7 Access for Guests',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'coffee', 
        name: 'Kanombe Coffee Lounge', 
        category: 'Food & Entertainment', 
        icon: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Cozy coffee lounge serving artisan coffee, light meals, and grab-and-go options.',
        fullDescription: 'Perfect for travelers on the go, our coffee lounge serves premium Rwandan coffee alongside international favorites. The menu includes fresh sandwiches, salads, pastries, and healthy smoothies. Free WiFi and comfortable seating make it ideal for casual meetings or catching up on work between flights.',
        hours: '5:00 AM - 10:00 PM',
        pricing: 'Coffee from $2.50, Meals from $6'
      },
      { 
        id: 'kitchen', 
        name: 'Shared Kitchen Facilities', 
        category: 'Convenience', 
        icon: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Fully equipped shared kitchen spaces for guests who prefer to cook their own meals.',
        fullDescription: 'Our modern shared kitchen facilities are perfect for extended stay guests. Each kitchen includes full-size appliances, cookware, dinnerware, and ample counter space. The facility operates on a reservation system and includes dining areas. Basic groceries and cooking ingredients are available for purchase.',
        hours: '6:00 AM - 11:00 PM',
        pricing: 'Complimentary for guests'
      },
      { 
        id: 'supermarket', 
        name: 'Travel Convenience Store', 
        category: 'Convenience', 
        icon: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Well-stocked convenience store with travel essentials, snacks, and local products.',
        fullDescription: 'Our on-site convenience store caters to travelers\' needs with a selection of travel essentials, international snacks, beverages, and local Rwandan products. The store also stocks basic groceries, personal care items, and souvenirs. Currency exchange and mobile top-up services are also available.',
        hours: '6:00 AM - 11:00 PM',
        pricing: 'Competitive pricing'
      },
      { 
        id: 'milkzone', 
        name: 'Milkzone Family Center', 
        category: 'Family Services', 
        icon: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', 
        description: 'Family-friendly zone with dairy bar, kid-friendly meals, and play area.',
        fullDescription: 'Our unique Milkzone caters to families with children, offering fresh dairy products, healthy smoothies, and kid-friendly meal options. The area includes a safe play zone for children, family seating, and educational activities about Rwandan dairy farming. Perfect for families traveling with young children.',
        hours: '7:00 AM - 8:00 PM',
        pricing: 'Kids meals from $4, Dairy products from $2'
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
      '/PXL_20221227_1735115792-scaled.jpg.jpeg',
      '/restaurant.jpg.jpeg',
      // Second set
      '/hero.jpeg',
      '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
      '/OKK_5838-1-scaled.jpg.jpeg',
      '/DSC_0996-1-720x470.jpg.jpeg',
      '/OKK_5889-scaled.jpg.jpeg',
      '/blog_post3-150x150.jpg.jpeg',
      '/R-5.jpg.jpeg',
      '/OKK_5807-scaled-e1673375197516.jpg.jpeg',
      '/about1-1.jpg.jpeg',
      // Third set
      '/R-6-e1673374918433.jpg.jpeg',
      '/OKK_5837-400x800.jpg.jpeg',
      '/blog_post5-150x150.jpg.jpeg',
      '/hero.jpeg',
      '/PXL_20221227_1730306382-scaled-e1673374628177.jpg.jpeg',
      '/DSC_0926-1-scaled.jpg.jpeg',
      '/OKK_5888-scaled.jpg.jpeg',
      '/restaurant.jpg.jpeg',
      '/R-2-1.jpg.jpeg'
    ],
    contact: {
      address: 'Airport Road, Kanombe, Kigali',
      phone: '+250 788 000 002',
      email: 'kanombe@gladsapartment.com'
    }
  },
  [Branch.KABEZA]: {
    id: Branch.KABEZA,
    fullName: 'Glads Apartment – Kabeza',
    tagline: 'Accommodation Only - Simplicity Redefined',
    location: { lat: -1.9706, lng: 30.1044, address: 'Kabeza Heights, Kicukiro, Kigali', distance: '15km from City Center' },
    rooms: [
      { 
        id: 'kb-1br', 
        name: 'Standard One Bedroom', 
        description: 'Clean, quiet, and perfectly designed for budget-conscious travelers.', 
        longDescription: 'Our Kabeza One Bedroom apartment is designed for the budget-conscious traveler who seeks the Glads standard of cleanliness, security, and comfort without the overhead of expensive amenities. The 45-square-meter space features a separate bedroom with queen bed, a living area with sofa bed, basic kitchenette, and a clean modern bathroom. Perfect for digital nomads, NGO workers, and long-term guests.',
        price: 55, 
        image: '/DSC_0996-1-720x470.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Study Desk', 'Basic Kitchen'],
        amenities: ['Ergonomic Work Station', 'Security Card Access', 'Weekly Housekeeping', 'Shared Laundry Facility', 'Backup Generator', 'Safe Parking'],
        view3D: '/models/one-bedroom-kabeza.glb'
      },
      { 
        id: 'kb-2br', 
        name: 'Standard Two Bedroom', 
        description: 'Essential comfortable living for small families or collaborative teams.', 
        longDescription: 'Functional 65-square-meter two-bedroom apartment ideal for small families or teams. Located in the peaceful Kabeza neighborhood with easy access to local markets, public transport, and the city center. Both bedrooms feature queen beds, and the apartment includes a shared living area, dining space, and fully equipped kitchen. Clean, safe, and reliable.',
        price: 85, 
        image: '/DSC_0996-1-720x470.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Shared Living Area', 'Full Kitchen'],
        amenities: ['Comfortable Living Area', 'Shared Balcony with Garden View', '24h Security', 'Dedicated Parking Space', 'Monthly Deep Cleaning'],
        view3D: '/models/two-bedroom-kabeza.glb'
      },
      { 
        id: 'kb-3br', 
        name: 'Standard Three Bedroom', 
        description: 'Spacious group housing designed for zero distractions and maximum productivity.', 
        longDescription: 'Large 85-square-meter three-bedroom unit ideal for NGO teams, research groups, or extended family stays. Focused on providing a comfortable, safe, and quiet environment for work and rest. Each bedroom accommodates two people comfortably, and the apartment includes a spacious living area, full kitchen, dining room, and two bathrooms. Located in a secure compound with 24/7 security.',
        price: 120, 
        image: '/OKK_5837-400x800.jpg.jpeg', 
        features: ['High-Speed WiFi', 'Full Living Area', 'Two Bathrooms'],
        amenities: ['Spacious Dining Area for 8', 'Full Kitchen with All Appliances', 'Reliable Backup Generator', 'Secure Compound', 'Quiet Study Areas', 'Group Laundry Facility'],
        view3D: '/models/three-bedroom-kabeza.glb'
      },
    ],
    services: [], // Strictly no services for Kabeza - Accommodation Only
    gallery: [
      '/about1-1.jpg.jpeg',
      '/DSC_0996-1-720x470.jpg.jpeg',
      '/OKK_5837-400x800.jpg.jpeg',
      '/R-5.jpg.jpeg',
      '/R-6-e1673374918433.jpg.jpeg',
      '/OKK_5889-scaled.jpg.jpeg',
      '/blog_post3-150x150.jpg.jpeg',
      '/blog_post5-150x150.jpg.jpeg',
      // Second set
      '/hero.jpeg',
      '/restaurant.jpg.jpeg',
      '/OKK_5888-scaled.jpg.jpeg',
      '/DSC_0926-1-scaled.jpg.jpeg',
      '/PXL_20221227_1735115792-scaled.jpg.jpeg',
      '/OKK_5782-scaled-e1673377156193.jpg.jpeg',
      '/about1-1.jpg.jpeg',
      '/R-2-1.jpg.jpeg',
      // Third set
      '/OKK_5869-scaled-e1673256152545.jpg.jpeg',
      '/OKK_5838-1-scaled.jpg.jpeg',
      '/DSC_0996-1-720x470.jpg.jpeg',
      '/hero.jpeg',
      '/OKK_5807-scaled-e1673375197516.jpg.jpeg',
      '/R-5.jpg.jpeg',
      '/blog_post3-150x150.jpg.jpeg',
      '/OKK_5837-400x800.jpg.jpeg'
    ],
    contact: {
      address: 'Kabeza Heights, Kicukiro, Kigali',
      phone: '+250 788 000 003',
      email: 'kabeza@gladsapartment.com'
    }
  }
};