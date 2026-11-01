# Kisii Teaching & Referral Hospital (KTRH) — Official Web Portal

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Strapi CMS](https://img.shields.io/badge/Strapi-4945FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> Modern, responsive, and accessible web portal for **Kisii Teaching & Referral Hospital (KTRH)** — delivering comprehensive healthcare information, dynamic medical staff directories, appointment scheduling, development project tracking, career applications, and public health resources.

---

##  Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Modules](#-pages--modules)
- [Headless CMS Integration (Strapi)](#-headless-cms-integration-strapi)
  - [API Configuration](#api-configuration)
  - [Endpoints Consumed](#endpoints-consumed)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Run](#installation--local-run)
- [Deployment](#-deployment)
- [Performance & PWA](#-performance--pwa)
- [Contributing](#-contributing)
- [License & Contact](#-license--contact)

---

##  Overview

**Kisii Teaching & Referral Hospital (KTRH)** is a leading tertiary healthcare and medical training institution located in Kisii, Western Kenya. This web platform provides patients, healthcare professionals, students, and the community with digital access to hospital services, clinical department guides, medical staff directories, appointment booking, career openings, and capital modernization milestones.

The application is built with vanilla web standards for speed, security, and low latency, coupled with a headless **Strapi v4 CMS** backend for dynamic content administration and form data collection.

---

##  Key Features

- **Department & Clinical Services Catalog**: Detailed breakdowns of specialized clinics, inpatient/outpatient wards, emergency & trauma center, radiology, and diagnostics with live Strapi fallback integration.
- **Interactive Doctor Directory**: Dynamic medical staff listings with search by doctor name or specialty, departmental filtering, qualification cards, and modal bio previews.
- **Online Appointment Booking**: Interactive appointment scheduling with dynamic department-to-doctor assignment, automated future date/time slot validation, Kenyan phone formatting (`+254`), and modal confirmation with auto-generated tracking reference codes.
- **Infrastructure & Project Showcase**: Dynamic project portfolio tracking hospital modernization, capacity expansion, and community healthcare initiatives with categorization (Ongoing, Completed, Upcoming, Research, Infrastructure).
- **Careers & Recruitment Portal**: Live vacancy listings synchronized via Strapi (`/api/jobs`), deadline tracking, role criteria, and an interactive application modal with document upload (CV/Resume & certificates) plus general talent submissions.
- **Multimedia Gallery**: Categorized media stream (Events, Facilities, Team, Achievements, Community, Videos) with modal lightbox previews and video playback integration.
- **Mobile-First & Responsive UI**: Custom CSS grid and flexbox architecture designed for seamless browsing on phones, tablets, and desktop displays.
- **PWA Baseline**: Integrated Service Worker (`sw.js`) and Web App Manifest (`site.webmanifest`) for progressive web app baseline capabilities.
- **Headless CMS Powered**: Live data synchronization with Strapi REST API v4 across 7 different content types with resilient offline/fallback states.

---

##  Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Structure** | HTML5 | Semantic markup, accessible forms, meta tags & SEO structure |
| **Styling** | Vanilla CSS3 | Custom modular stylesheets per page, responsive grids, flexbox & animations |
| **Interactivity** | Vanilla JavaScript (ES6+) | Asynchronous data fetching, DOM manipulation, modal controllers, form validation |
| **CMS / Backend** | Strapi v4 (Headless) | REST API endpoints for Doctors, Projects, Jobs, Services, Departments, Media Gallery, and Form Submissions |
| **Icons & Fonts** | Font Awesome 6 & Google Fonts | Poppins, Open Sans typography and comprehensive UI iconography |
| **Deployment** | Vercel | Production CDN hosting with clean URLs, asset rewrites, and CORS headers |

---

##  Project Structure

```text
KTRH-FRONTEND/
├── about.html            # About KTRH: History, Leadership, Mission & Values
├── appointment.html      # Patient appointment booking portal
├── careers.html          # Job openings, criteria, and online application modal
├── contact.html          # Contact details, emergency lines, inquiry form & map
├── departments.html      # Specialized clinical & administrative departments
├── doctors.html          # Medical staff directory with live search & filters
├── gallery.html          # Facility & event photo/video gallery with lightbox
├── index.html            # Main homepage (Hero, Stats, Services, Featured Doctors)
├── projects.html         # Hospital modernization & community projects
├── services.html         # Comprehensive medical & diagnostic services catalog
├── sw.js                 # Service worker script (PWA baseline pass-through)
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
│   └── style.css         # Global core stylesheet (Header, Footer, Utilities)
├── js/                   # Client-side JavaScript modules
│   ├── about.js          # About page initializers and timeline hooks
│   ├── appointment.js    # Appointment scheduling, validation & confirmation
│   ├── careers.js        # Strapi jobs loader, filters & application forms
│   ├── departments.js    # Strapi departments loader & detail modals
│   ├── doctors.js        # Strapi medical team loader, search & filters
│   ├── gallery.js        # Gallery logic & category management
│   ├── gallery-strapi.js # Strapi media loader, lightbox viewer & view counter
│   ├── home.js           # Homepage dynamic stats, featured doctors & forms
│   ├── projects.js       # Strapi projects renderer, statistics & modals
│   ├── script.js         # Global navigation, animations, preloader & chat widget
│   ├── services.js       # Strapi medical services loader & search
│   └── sw.js             # Standalone service worker module
├── img/                  # Logos, banners, medical imagery, and static assets
│   └── favicon_io3/      # App icons, favicon bundle & site.webmanifest
└── assets/               # Additional media files and doctor imagery
```

---

##  Pages & Modules

| Page | File | Key Capabilities |
|---|---|---|
| **Home** | [`index.html`](./index.html) | Hero slider with YouTube video embed, live statistics counter, emergency banner, featured services, dynamic doctors showcase, newsletter subscription |
| **About** | [`about.html`](./about.html) | Institutional history, core values, board & leadership profiles, accreditation, mission & vision |
| **Services** | [`services.html`](./services.html) | Strapi-backed medical & diagnostic services catalog, categorized filters, search, service details modal |
| **Departments** | [`departments.html`](./departments.html) | Strapi-backed clinical departments, department heads, service breakdown, phone extensions, appointment links |
| **Doctors** | [`doctors.html`](./doctors.html) | Medical staff directory powered by Strapi, specialty & name search, department filters, doctor profile modals |
| **Appointments** | [`appointment.html`](./appointment.html) | Interactive appointment booking, dynamic department-to-doctor assignment, date/time validation, booking confirmation modal |
| **Projects** | [`projects.html`](./projects.html) | Strapi-backed capital development projects, status badges (Ongoing, Completed, Upcoming), statistics counter, project details modal |
| **Careers** | [`careers.html`](./careers.html) | Live job vacancies from Strapi, application deadline calculator, job details modal, online application form with document upload (CV/Certificates) |
| **Gallery** | [`gallery.html`](./gallery.html) | Categorized photo & video stream from Strapi, search, responsive modal lightbox, video player modal, view counter |
| **Contact** | [`contact.html`](./contact.html) | Google Maps embed, direct emergency dialers, departmental contacts, interactive inquiry submission form |

---

##  Headless CMS Integration (Strapi)

The frontend dynamically queries and submits to a Strapi v4 backend across multiple pages for real-time hospital administration:

### API Configuration

Configured across `js/home.js`, `js/services.js`, `js/departments.js`, `js/doctors.js`, `js/projects.js`, `js/careers.js`, `js/gallery-strapi.js`, and `js/gallery.js`:

```javascript
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';
```

### Endpoints Consumed

#### Content Fetching (GET)
- `GET /api/doctors?populate=*` — Medical staff profiles, specialties, contact info, qualifications, and photos (`js/doctors.js`, `js/home.js`).
- `GET /api/projects?populate=*` — Infrastructure modernization projects, progress status, completion dates, and project photos (`js/projects.js`).
- `GET /api/jobs?populate=*&filters[isActive][$eq]=true&sort[0]=postedDate:desc` — Active job vacancies, requirements, deadline countdown, and departments (`js/careers.js`).
- `GET /api/gallery-items?populate=*` — Categorized multimedia items (images/videos), descriptions, and tags (`js/gallery-strapi.js`, `js/gallery.js`).
- `GET /api/services?populate=*` — Clinical and diagnostic services catalog, descriptions, and feature lists (`js/services.js`).
- `GET /api/departments?populate=*` — Hospital clinical and administrative departments, heads of department, and extensions (`js/departments.js`).
- `GET /api/home-page?populate=*` — Dynamic homepage statistics and featured content (`js/home.js`).

#### Form Submissions & Analytics (POST)
- `POST /api/applications` — Specific job application submissions with applicant data (`js/careers.js`).
- `POST /api/general-applications` — Open talent pool / general career submissions (`js/careers.js`).
- `POST /api/contact-submissions` — Contact form inquiries (`js/home.js`).
- `POST /api/newsletter-subscriptions` — Newsletter email subscriptions (`js/home.js`).
- `POST /api/gallery-items/:id/increment-views` — View count increments for gallery items (`js/gallery-strapi.js`).

*Note: All data-fetching modules implement fallback data structures and graceful error handling if the Strapi API is unreachable.*

---

##  Getting Started

### Prerequisites

To run the project locally, you only need a modern web browser and a simple local HTTP server (to ensure Service Worker and fetch API operations execute cleanly without browser CORS restrictions on the `file://` protocol).

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ocheing/KTRH-FRONTEND.git
   cd KTRH-FRONTEND
   ```

2. **Serve the application locally using your preferred tool:**

   *Using VS Code Live Server extension:*
   - Right-click [`index.html`](./index.html) and select **"Open with Live Server"**.

   *Using Python 3:*
   ```bash
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

##  Deployment

The portal is pre-configured for deployment on **[Vercel](https://vercel.com/)** via [`vercel.json`](./vercel.json):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/js/(.*)",
      "destination": "/js/$1"
    },
    {
      "source": "/images/(.*)",
      "destination": "/images/$1"
    },
    {
      "source": "/css/(.*)",
      "destination": "/css/$1"
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

##  Performance & PWA

- **Service Worker**: Registered via [`sw.js`](./sw.js) with fetch event handling for baseline PWA support.
- **Web App Manifest**: Configured in `img/favicon_io3/site.webmanifest` with responsive Android/Chrome app icons.
- **Optimized Media**: Responsive layouts and `object-fit` rendering for doctor profiles, department imagery, and gallery media.
- **Resilient UI States**: Loading indicators, spinners, and fallback data structures while Strapi API payloads load.

---

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License & Contact

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

**Kisii Teaching & Referral Hospital (KTRH)**
-  **Location**: Kisii Town, Kenya
-  **Website**: [KTRH Web Portal](https://ktrh.vercel.app)
-  **General Inquiries**: `info@ktrh.or.ke`
-  **Career Inquiries**: `careers@ktrh.or.ke`
-  **Main Telephone**: `+254 758 721 997`
-  **Emergency Line**: `+254 758 721 997` / `+254 711 234 567`

---
*Developed with ❤️ for Kisii Teaching & Referral Hospital community.*
