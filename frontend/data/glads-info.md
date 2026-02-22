# GLADS Assistant Knowledge Base
Updated: 2026-02-20
Purpose: Canonical data source for branch-aware assistant answers.

## Branch Naming and Legal Mapping (Authoritative)
- Public branch name: Ndera
  - Legal name and location reference: GLADS APARTMENT - GASABO, Ndera (Near 15 Road)
  - District reference: Gasabo
- Public branch name: Kanombe
  - Legal name and location reference: GLADS COMPANY - Nyarugunga (KMH)
  - Important rule: customer-facing name remains Kanombe; legal reference uses Nyarugunga
- Public branch name: Kabeza
  - Legal name and location reference: GLADS APARTMENT - Kanombe (Kicukiro District, Rubirizi)
  - Important rule: customer-facing name remains Kabeza; legal location reference uses Kanombe (Rubirizi)
- Assistant response rule:
  - Default to public branch name in normal customer responses.
  - If legal identity or legal location is requested, include the mapped legal name above.

## Company Profile
- Name: Glads Apartment
- Overview: Modern multi-service hospitality and lifestyle establishment combining accommodation, wellness, dining, shopping, and recreation.
- Mission: Provide a holistic living and leisure experience by combining modern accommodation, wellness, dining, shopping, and recreational services.
- Vision: Become a leading hospitality and lifestyle destination in Rwanda, known for innovation, excellence, and customer care.
- Core values:
  - Excellence: Delivering world-class services
  - Integrity: Building trust through transparency
  - Innovation: Continuously improving services
  - Sustainability: Promoting environmentally friendly practices
  - Customer Care: Putting clients at the center
- Why choose Glads:
  - All-in-one hospitality and lifestyle destination
  - Professional customer-first service
  - Strategic locations with accessibility
  - Commitment to health, comfort, and sustainability

## Company-Wide Service Catalog
- Accommodation
- Supermarket
- Milk Zone
- Coffee Shop
- Bar and Restaurant
- Swimming Pool
- Jacuzzi
- Sauna and Massage
- Gym and Fitness Center

## Sports and Wellness Prices (per person)
- Sauna and Steam: 5,000 RWF
- Swimming: 5,000 RWF
- Gym: 5,000 RWF
- Jacuzzi: 20,000 RWF
- Massage: 10,000 RWF and above

## Hall Rental Prices (RWF)
- Scope rule: These hall/event rental prices apply to Ndera branch only.
- Not applicable to Kanombe and Kabeza unless a branch-specific pricing sheet is provided.
- Hall only: 6,000,000
- Live recording with sound and light:
  - 2 days: 15,000,000
  - 1 day: 12,000,000
- Concert:
  - With sound and lighting: 10,000,000
  - Without lighting: 7,500,000
- Wedding:
  - With sound and lighting: 9,000,000
  - Without lighting: 6,000,000
- Screen only: 1,000,000
- Meetings and small events:
  - Meeting: 6,000,000
  - Small event: 2,000,000

## Branch Contacts
- Ndera
  - Manager role: GM
  - Manager name: James Ngirowonsanga
  - Phone: +250 788 300 269
  - Email: gladsapartments@gmail.com
- Kanombe
  - Manager role: Branch Manager
  - Manager name: Jeanine
  - Phone: +250 788 354 475
  - Email: gladsapartment@gmail.com
- Kabeza
  - Manager role: Branch Manager
  - Manager name: Aline
  - Phone: +250 788 550 390
  - Email: gladsapartment19@gmail.com
- Shared payment code
  - MoMo code: 000488

## Branch: Ndera (Main Branch)
- Public branch label: Ndera
- Legal reference: GLADS APARTMENT - GASABO, Ndera (Near 15 Road)
- Positioning: Flagship branch with full amenities for business and relaxation
- Available services:
  - Swimming Pool
  - Sauna
  - Massage
  - Gym
  - Jacuzzi
  - Coffee Shop
  - Restaurant
  - Bars (with pool game)
  - Conference Hall
  - Hall
  - Meeting Rooms
  - Salon (Men and Women)
  - Supermarket
- Not available in Ndera:
  - Milkzone
  - Kitchen as a separate service

## Branch: Kanombe (Lifestyle Branch)
- Public branch label: Kanombe
- Legal reference: GLADS COMPANY - Nyarugunga (KMH)
- Positioning: Lifestyle branch with wellness, shopping, and accommodation services
- Available services:
  - Swimming Pool
  - Sauna
  - Massage
  - Gym
  - Coffee Shop
  - Kitchen
  - Supermarket
  - Milkzone

## Branch: Kabeza (Accommodation Only)
- Public branch label: Kabeza
- Legal reference: GLADS APARTMENT - Kanombe (Kicukiro District, Rubirizi)
- Positioning: Quiet residential and accommodation-focused location
- Available services:
  - Rooms only
- Not available:
  - No extra facilities

## Official Main Contact
- Primary location reference: Ndera, Gasabo, Rwanda
- Phone: +250 788 300 269
- Email: info@gladsapartment.rw
- Website: www.gladsapartment.com

## Assistant Guardrails
- Never invent branch services that are not listed in this file.
- If user requests a service not offered in selected branch, clearly say it is unavailable and suggest a branch where it is available.
- If user asks legal names or legal branch references, use the authoritative mapping in this file.
