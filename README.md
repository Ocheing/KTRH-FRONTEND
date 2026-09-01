# 🏥 Kisii Teaching & Referral Hospital (KTRH) — Official Web Portal

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Strapi CMS](https://img.shields.io/badge/Strapi-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> Modern, responsive, and accessible web portal for **Kisii Teaching & Referral Hospital (KTRH)** — delivering comprehensive healthcare information, dynamic medical staff directories, appointment scheduling, development project tracking, and public health resources.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Modules](#-pages--modules)
- [Headless CMS Integration (Strapi)](#-headless-cms-integration-strapi)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Run](#installation--local-run)
- [Deployment](#-deployment)
- [Performance & PWA](#-performance--pwa)
- [Contributing](#-contributing)
- [License & Contact](#-license--contact)

---

## 🌟 Overview

**Kisii Teaching & Referral Hospital (KTRH)** is a leading tertiary healthcare and medical training institution in Western Kenya. This frontend web platform provides patients, medical professionals, students, and the general public with seamless digital access to hospital services, department guides, doctor directories, career listings, and infrastructure development milestones.

The application is built with vanilla web standards for fast performance and minimal dependencies, paired with a headless **Strapi CMS** backend for dynamic content management.

---

## ✨ Key Features

- 🏥 **Department & Clinical Services Catalog**: Detailed breakdowns of specialized clinics, inpatient/outpatient wards, emergency & trauma center, radiology, and diagnostics.
- 👨‍⚕️ **Interactive Doctor Directory**: Filter by department or specialty, search by name, view qualifications/experience, and open doctor profile modals.
- 📅 **Online Appointment Booking**: Multi-step booking workflow with department/doctor selection, date/time scheduling, and validation.
- 🏗️ **Infrastructure & Project Showcase**: Dynamic project portfolio tracking hospital modernization, capacity expansion, and community health initiatives.
- 💼 **Careers & Recruitment Portal**: Live job vacancy listings with requirement criteria, application guidelines, and closing dates.
- 📸 **Multimedia Gallery**: Categorized media gallery (facilities, medical equipment, outreach events) with responsive modal lightbox previews.
- 📱 **Mobile-First & Responsive UI**: Custom CSS grid and flexbox architecture designed for seamless browsing on phones, tablets, and desktops.
- ⚡ **PWA Ready**: Integrated Service Worker (`sw.js`) providing offline baseline caching and fast asset delivery.
- 🌐 **Headless CMS Powered**: Live data synchronization with Strapi REST API v4 for dynamic updates without redeploying static code.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Structure** | HTML5 | Semantic markup, accessible forms, meta tags & SEO structure |
| **Styling** | Vanilla CSS3 | Custom modular stylesheets per page, responsive grids & animations |
| **Interactivity** | Vanilla JavaScript (ES6+) | Asynchronous data fetching, DOM manipulation, modal controllers |
| **CMS / Backend** | Strapi v4 (Headless) | REST API endpoints for Doctors, Projects, Careers, and Media |
| **Icons & Fonts** | Font Awesome 6 & Google Fonts | Poppins, Open Sans typography and comprehensive UI iconography |
| **Deployment** | Vercel | Production CDN hosting with clean URLs and custom CORS headers |

---

## 📂 Project Structure

```text
KTRH-FRONTEND/
├── about.html            # About KTRH: History, Leadership, Mission & Values
├── appointment.html      # Patient appointment booking portal
├── careers.html          # Job openings, internships, and application guidelines
├── contact.html          # Contact details, emergency numbers, and feedback form
├── departments.html      # Specialized clinical & administrative departments
├── doctors.html          # Medical staff directory with live search & filters
├── gallery.html          # Facility & event photo/video gallery
├── index.html            # Main homepage (Hero, Highlights, Quick Links)
├── projects.html         # Hospital modernization & community projects
├── services.html         # Comprehensive medical & diagnostic services
├── sw.js                 # Service worker script for caching & PWA features
├── vercel.json           # Vercel routing, rewrite rules, and security headers
├── css/                  # Modular stylesheets
│   ├── about.css
│   ├── appointment.css
│   ├── careers.css
│   ├── departments.css
│   ├── doctors.css
│   ├── gallery.css
│   ├── projects.css
│   ├── services.css
│   └── style.css         # Core global stylesheet (Header, Footer, Utilities)
├── js/                   # Client-side JavaScript modules
│   ├── about.js
│   ├── appointment.js
│   ├── careers.js
│   ├── departments.js
│   ├── doctors.js
│   ├── gallery.js
│   ├── gallery-strapi.js # Strapi API media loader & lightbox
│   ├── home.js
│   ├── projects.js       # Strapi-backed project dynamic renderer
│   ├── script.js         # Navigation, animations, and global utilities
│   └── services.js
├── img/                  # Logos, favicons, banners, and static imagery
└── assets/               # Additional static assets and media files
```

---

## 📄 Pages & Modules

| Page | File | Key Capabilities |
|---|---|---|
| **Home** | [`index.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/index.html) | Hero slider, quick statistics, emergency banner, featured services, news |
| **About** | [`about.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/about.html) | Institutional overview, core values, board members, accreditation |
| **Services** | [`services.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/services.html) | Outpatient, Inpatient, Surgical, Maternity, ICU, Oncology, Renal care |
| **Departments** | [`departments.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/departments.html) | Department breakdowns, clinical heads, hours of operation |
| **Doctors** | [`doctors.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/doctors.html) | Search by name/specialty, doctor bio cards, consultation schedule |
| **Appointments** | [`appointment.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/appointment.html) | Interactive booking form with validation and confirmation |
| **Projects** | [`projects.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/projects.html) | Capital development projects, status badges, timelines |
| **Careers** | [`careers.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/careers.html) | Employment vacancies, role criteria, downloadable application forms |
| **Gallery** | [`gallery.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/gallery.html) | Categorized photo/video stream with responsive lightbox viewer |
| **Contact** | [`contact.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/contact.html) | Google Maps integration, direct emergency dialers, inquiry submission |

---

## 🔗 Headless CMS Integration (Strapi)

The frontend dynamically queries a Strapi v4 backend for frequently updated hospital data:

```javascript
// Configured in js/gallery-strapi.js & js/projects.js
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';
```

### Endpoints Consumed
- `GET /api/doctors?populate=*` — Doctor profiles, specialties, contact info, and avatars.
- `GET /api/projects?populate=*` — Infrastructure projects, progress status, and images.
- `GET /api/careers?populate=*` — Open vacancies, department allocations, deadlines.
- `GET /api/galleries?populate=*` — Multimedia items, categories, and descriptions.

---

## 🚀 Getting Started

### Prerequisites

To run the project locally, you only need a modern web browser and a simple local HTTP server (to ensure Service Worker and fetch API operations execute cleanly).

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ocheing/KTRH-FRONTEND.git
   cd KTRH-FRONTEND
   ```

2. **Serve the application locally using your preferred tool:**

   *Using VS Code Live Server extension:*
   - Right-click [`index.html`](file:///c:/Users/SHADOW/KTRH-FRONTEND/index.html) and select **"Open with Live Server"**.

   *Using Python:*
   ```bash
   # Python 3.x
   python -m http.server 3000
   ```

   *Using Node.js (`serve` or `npx`):*
   ```bash
   npx serve . -l 3000
   ```

3. **Open in browser:**
   ```text
   http://localhost:3000
   ```

---

## 🌐 Deployment

The portal is pre-configured for deployment on **[Vercel](https://vercel.com/)** via [`vercel.json`](file:///c:/Users/SHADOW/KTRH-FRONTEND/vercel.json):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Deploying via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## ⚡ Performance & PWA

- **Service Worker**: Registered via [`sw.js`](file:///c:/Users/SHADOW/KTRH-FRONTEND/sw.js) for caching essential static assets.
- **Optimized Images**: Responsive layouts and `object-fit` rendering for doctor profiles and gallery photos.
- **Asynchronous Data**: Graceful fallback UI states (spinners, placeholder cards) while Strapi API payloads load.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 License & Contact

Distributed under the MIT License.

**Kisii Teaching & Referral Hospital (KTRH)**
- 📍 **Location**: Kisii Town, Kenya
- 🌐 **Website**: [KTRH Web Portal](https://ktrh.vercel.app)
- 📧 **General Inquiries**: `info@ktrh.go.ke`
- 🚑 **Emergency Hotline**: `+254 700 000 000`

---
*Developed with ❤️ for Kisii Teaching & Referral Hospital community.*
