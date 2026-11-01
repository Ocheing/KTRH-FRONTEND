// ==========================================================================
// KISII TEACHING & REFERRAL HOSPITAL (KTRH) — CENTRAL DATA STORE
// Local persistent data engine for Real-time Hospital Administration & Public Pages
// ==========================================================================

const KTRH_STORAGE_KEY = 'ktrh_hospital_database_v1';

// Default Hospital Seed Data
const DEFAULT_KTRH_DATA = {
    stats: {
        specialistDoctors: "45+",
        hospitalBeds: "650+",
        departments: "28+",
        yearsExperience: "100+",
        totalPatients: "250K+",
        successRate: "99.2%",
        staffMembers: "1,200+"
    },
    doctors: [
        {
            id: "doc-1",
            name: "Dr. Ondari",
            title: "Chief Consultant Cardiologist",
            department: "cardiology",
            specialty: "Interventional Cardiology",
            experience: "16+ Years",
            image: "img/drondari.png",
            qualifications: ["MBChB (UoN)", "MMed Internal Medicine", "Fellowship in Interventional Cardiology (UK)"],
            bio: "Leads the cardiac catheterization unit at KTRH with over 16 years of clinical excellence in coronary interventions and cardiovascular medicine.",
            consultationHours: "Mon, Wed, Fri: 8:00 AM - 3:00 PM",
            rating: 4.9,
            is_featured: true,
            email: "dr.ondari@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 101"
        },
        {
            id: "doc-2",
            name: "Dr. Michael Orina",
            title: "Senior Consultant Neurologist",
            department: "neurology",
            specialty: "Clinical Neurology & Stroke Care",
            experience: "14+ Years",
            image: "img/Dr orina.jpg",
            qualifications: ["MBChB (Moi)", "MMed Neurology", "Fellowship in Neuro-Critical Care"],
            bio: "Pioneering acute stroke and neuro-critical care protocols in Western Kenya, specializing in cerebrovascular diagnostics and epilepsy management.",
            consultationHours: "Tue, Thu: 9:00 AM - 4:00 PM",
            rating: 5.0,
            is_featured: true,
            email: "dr.orina@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 102"
        },
        {
            id: "doc-3",
            name: "Dr. Oimeke Mariita",
            title: "Lead Cardiologist & Electrophysiologist",
            department: "cardiology",
            specialty: "Electrophysiology & Arrhythmia",
            experience: "11+ Years",
            image: "img/drondari.png",
            qualifications: ["MBChB", "MMed Cardiology", "Cardiac Electrophysiology Certification"],
            bio: "Specializes in heart rhythm disorders, pacemaker implantation, and pediatric cardiology interventions.",
            consultationHours: "Mon, Thu, Sat: 9:00 AM - 2:00 PM",
            rating: 4.8,
            is_featured: true,
            email: "dr.mariita@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 103"
        },
        {
            id: "doc-4",
            name: "Dr. Sarah Mwangi",
            title: "Consultant Pediatrician",
            department: "pediatrics",
            specialty: "Neonatology & Child Health",
            experience: "12+ Years",
            image: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?auto=format&fit=crop&w=600&q=80",
            qualifications: ["MBChB (UoN)", "MMed Pediatrics", "Neonatal Resuscitation Certified"],
            bio: "Heading the Mother and Child Care Center at KTRH, dedicated to newborn intensive care and developmental pediatrics.",
            consultationHours: "Daily: 8:00 AM - 2:00 PM",
            rating: 4.9,
            is_featured: true,
            email: "dr.mwangi@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 104"
        },
        {
            id: "doc-5",
            name: "Dr. David Kipchumba",
            title: "Chief Orthopedic & Trauma Surgeon",
            department: "orthopedics",
            specialty: "Arthroplasty & Spine Surgery",
            experience: "15+ Years",
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
            qualifications: ["MBChB", "MMed Orthopedic Surgery", "FCS (ECSA) Orthopedics"],
            bio: "Expert in complex joint replacements, pelvic trauma reconstruction, and minimally invasive spinal surgery.",
            consultationHours: "Wed, Fri: 9:00 AM - 4:00 PM",
            rating: 4.7,
            is_featured: false,
            email: "dr.kipchumba@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 105"
        },
        {
            id: "doc-6",
            name: "Dr. Brenda Achieng",
            title: "Consultant General & Laparoscopic Surgeon",
            department: "surgery",
            specialty: "Minimally Invasive Surgery",
            experience: "10+ Years",
            image: "assets/images/doctor3.jpg",
            qualifications: ["MBChB", "MMed General Surgery", "Fellowship in Laparoscopy"],
            bio: "Specializes in advanced laparoscopic abdominal surgeries, surgical oncology, and critical surgical emergency management.",
            consultationHours: "Tue, Fri: 8:30 AM - 3:30 PM",
            rating: 4.8,
            is_featured: true,
            email: "dr.achieng@ktrh.or.ke",
            phone: "+254 758 721 997 Ext. 106"
        }
    ],
    projects: [
        {
            id: "proj-1",
            title: "Modern Mother & Child Hospital Complex",
            shortDescription: "Ultra-modern 250-bed maternal and pediatric wing with state-of-the-art NICU and delivery suites.",
            category: "infrastructure",
            status: "Completed",
            progress: 100,
            startDate: "2023-01-15",
            endDate: "2024-11-20",
            budget: "KES 1.2B",
            contractor: "Kisii County & National Infrastructure Partners",
            location: "KTRH Medical Plaza Wing",
            image: "img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg",
            impact: [
                "Expanded regional maternal bed capacity to 250 beds",
                "Dedicated 40-cot neonatal intensive care unit (NICU)",
                "Reduces regional maternal and infant mortality by over 40%"
            ]
        },
        {
            id: "proj-2",
            title: "Comprehensive Regional Cancer Care Center",
            shortDescription: "Modern oncology radiotherapy and chemotherapy pavilion offering localized cancer diagnostics and treatment.",
            category: "ongoing",
            status: "Ongoing",
            progress: 85,
            startDate: "2023-06-01",
            endDate: "2025-04-30",
            budget: "KES 850M",
            contractor: "MedEquip International & County Government of Kisii",
            location: "KTRH South Campus",
            image: "img/bov541lkxmnc613b9b5831d2ektrhroject.jpg",
            impact: [
                "Eliminates the need for cancer patients to travel to Nairobi for radiotherapy",
                "Advanced Linear Accelerator (LINAC) and brachytherapy suites",
                "Outpatient chemo day-care with 30 infusion bays"
            ]
        },
        {
            id: "proj-3",
            title: "Emergency & Trauma Disaster Response Center",
            shortDescription: "Fully integrated level-5 emergency bay equipped with direct helipad access and automated triage systems.",
            category: "ongoing",
            status: "Ongoing",
            progress: 70,
            startDate: "2024-02-10",
            endDate: "2025-06-15",
            budget: "KES 420M",
            contractor: "Apex Construction Consortium",
            location: "KTRH Main Gate Area",
            image: "img/imagestheatre.jpg",
            impact: [
                "Rapid multi-casualty trauma bay with dedicated CT scanner",
                "Helipad link for emergency aeromedical evacuation",
                "Quadruples immediate disaster response triage capacity"
            ]
        },
        {
            id: "proj-4",
            title: "Digital Health Records & Telemedicine Network",
            shortDescription: "Transition to 100% paperless medical records and remote tele-consultation clinics for sub-county health facilities.",
            category: "research",
            status: "Ongoing",
            progress: 60,
            startDate: "2024-04-01",
            endDate: "2025-08-30",
            budget: "KES 180M",
            contractor: "HealthTech Innovations Kenya",
            location: "Hospital-wide & 9 Sub-Counties",
            image: "img/herosection.webp",
            impact: [
                "Instant cross-departmental access to patient histories and imaging",
                "Virtual specialist clinics for remote community clinics",
                "Automated pharmaceutical inventory and prescription management"
            ]
        },
        {
            id: "proj-5",
            title: "Advanced Medical Training & Doctors Simulation Lab",
            shortDescription: "Partnership with Kisii University School of Health Sciences for high-fidelity clinical simulation training.",
            category: "upcoming",
            status: "Upcoming",
            progress: 25,
            startDate: "2025-01-10",
            endDate: "2026-03-31",
            budget: "KES 310M",
            contractor: "Academic Medical Linkages",
            location: "Academic Annex",
            image: "img/about.jpg",
            impact: [
                "Provides hands-on simulation training for resident doctors and nurses",
                "Accredited center for continuous medical education (CME)",
                "Clinical research incubator for Western Kenya epidemiology"
            ]
        }
    ],
    services: [
        {
            id: "srv-1",
            title: "Emergency & Trauma Center",
            slug: "emergency-trauma",
            category: "emergency",
            icon: "fas fa-ambulance",
            short_description: "24/7 dedicated acute emergency care, resuscitation suites, and trauma surgery.",
            description: "Equipped with state-of-the-art life support systems, dedicated trauma bays, in-suite triage, and direct theatre access for critical medical emergencies.",
            image: "img/imagestheatre.jpg",
            hours: "24 Hours / 7 Days",
            features: ["Rapid Triage Protocol", "Advanced Resuscitation Suites", "Immediate Bedside Diagnostics", "Dedicated Ambulance Fleet"]
        },
        {
            id: "srv-2",
            title: "Cardiology & Catheterization Lab",
            slug: "cardiology",
            category: "clinical",
            icon: "fas fa-heartbeat",
            short_description: "Comprehensive cardiovascular diagnostics, angiography, angioplasty, and pacemaker care.",
            description: "Western Kenya's leading cardiac center providing diagnostic coronary angiograms, stenting, cardiac electrophysiology, and non-invasive echo stress testing.",
            image: "img/drondari.png",
            hours: "Mon - Sat: 8:00 AM - 5:00 PM (Emergency 24/7)",
            features: ["Coronary Angiography & Stenting", "Echocardiography & Doppler", "Holter Monitoring & ECG", "Cardiac Rehabilitation"]
        },
        {
            id: "srv-3",
            title: "Maternal, Newborn & Child Health (MCH)",
            slug: "maternal-child",
            category: "clinical",
            icon: "fas fa-baby",
            short_description: "Safe delivery suites, high-risk obstetrics, prenatal clinics, and advanced neonatal ICU.",
            description: "Comprehensive care for mothers and infants including specialized antenatal clinics, labor and delivery suites, and a Level-3 Neonatal Intensive Care Unit.",
            image: "img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg",
            hours: "24 Hours / 7 Days",
            features: ["Level-3 Neonatal ICU (NICU)", "High-Risk Pregnancy Clinic", "Postnatal Wellness & Immunization", "Lactation & Nutrition Support"]
        },
        {
            id: "srv-4",
            title: "Radiology & Advanced Diagnostic Imaging",
            slug: "radiology",
            category: "diagnostic",
            icon: "fas fa-x-ray",
            short_description: "64-slice CT scanning, 1.5T MRI, digital mammography, high-resolution ultrasound, and X-ray.",
            description: "High-precision diagnostic imaging center staffed by certified consultant radiologists with rapid reporting and digital PACS transmission.",
            image: "img/imagesktrh.jpg",
            hours: "24 Hours / 7 Days",
            features: ["64-Slice CT Scan", "1.5 Tesla MRI", "Digital Fluoroscopy & X-Ray", "4D Doppler Ultrasound"]
        },
        {
            id: "srv-5",
            title: "Oncology & Chemotherapy Center",
            slug: "oncology",
            category: "clinical",
            icon: "fas fa-ribbon",
            short_description: "Specialized cancer screening, medical oncology, outpatient chemo infusion, and palliative support.",
            description: "Multidisciplinary cancer care with specialized oncologists, dedicated infusion bays, tumor board consultations, and comprehensive patient navigation.",
            image: "img/bov541lkxmnc613b9b5831d2ektrhroject.jpg",
            hours: "Mon - Fri: 8:00 AM - 4:30 PM",
            features: ["Chemotherapy Infusion Lounge", "Cancer Screening & Biopsies", "Tumor Board Consultations", "Palliative & Pain Management"]
        },
        {
            id: "srv-6",
            title: "Renal & Hemodialysis Unit",
            slug: "renal-dialysis",
            category: "clinical",
            icon: "fas fa-procedures",
            short_description: "Modern 20-bed dialysis center providing acute and maintenance renal replacement therapy.",
            description: "Safe and comfortable hemodialysis facilities supported by experienced nephrologists and renal nurses, operating multiple daily treatment shifts.",
            image: "img/KTRH.jpg",
            hours: "Mon - Sat: 6:00 AM - 9:00 PM",
            features: ["20 State-of-the-art Dialysis Stations", "Continuous Renal Replacement (CRRT)", "Vascular Access Management", "Peritoneal Dialysis Support"]
        },
        {
            id: "srv-7",
            title: "General & Laparoscopic Surgery",
            slug: "general-surgery",
            category: "surgical",
            icon: "fas fa-scalpel",
            short_description: "Advanced minimally invasive and open surgical procedures across multiple specialties.",
            description: "Comprehensive surgical services including laparoscopic cholecystectomy, hernia repair, appendectomy, trauma surgery, and oncological resections performed in modern fully equipped theatres.",
            image: "img/imagestheatre.jpg",
            hours: "Mon - Fri: 8:00 AM - 5:00 PM (Emergency 24/7)",
            features: ["Laparoscopic & Minimally Invasive Surgery", "Gastrointestinal & Colorectal Surgery", "Trauma & Emergency Surgery", "Surgical Oncology Resections"]
        },
        {
            id: "srv-8",
            title: "Orthopedic & Trauma Surgery",
            slug: "orthopedic-surgery",
            category: "surgical",
            icon: "fas fa-bone",
            short_description: "Expert fracture management, joint replacements, spinal surgery, and sports injury care.",
            description: "Comprehensive musculoskeletal surgery and rehabilitation including total hip and knee arthroplasty, arthroscopic procedures, complex fracture fixation, and post-operative physiotherapy.",
            image: "img/KTRH.jpg",
            hours: "Mon - Fri: 8:00 AM - 5:00 PM (Emergency 24/7)",
            features: ["Total Joint Replacement", "Fracture Fixation & Plating", "Arthroscopic Surgery", "Spinal Decompression & Fusion"]
        },
        {
            id: "srv-9",
            title: "Laboratory & Pathology Services",
            slug: "laboratory",
            category: "diagnostic",
            icon: "fas fa-vial",
            short_description: "Full-spectrum clinical laboratory testing including hematology, biochemistry, microbiology, and histopathology.",
            description: "ISO-accredited laboratory providing rapid turnaround on blood tests, cultures, biopsies, and specialized investigations supporting clinical decision-making across the hospital.",
            image: "img/imagesktrh.jpg",
            hours: "24 Hours / 7 Days",
            features: ["Automated Hematology & Coagulation", "Clinical Chemistry & Immunoassay", "Microbiology Culture & Sensitivity", "Histopathology & Cytology"]
        },
        {
            id: "srv-10",
            title: "Pharmacy & Medication Management",
            slug: "pharmacy",
            category: "support",
            icon: "fas fa-pills",
            short_description: "Centralized inpatient and outpatient pharmaceutical dispensing, drug counseling, and clinical pharmacy services.",
            description: "Hospital pharmacy providing 24-hour medication dispensing, antibiotic stewardship, therapeutic drug monitoring, and patient medication education programs.",
            image: "img/about.jpg",
            hours: "24 Hours / 7 Days",
            features: ["24/7 Medication Dispensing", "Antibiotic Stewardship Program", "IV Admixture & Compounding", "Drug Interaction Screening"]
        },
        {
            id: "srv-11",
            title: "Physiotherapy & Rehabilitation",
            slug: "physiotherapy",
            category: "support",
            icon: "fas fa-walking",
            short_description: "Post-surgical rehabilitation, musculoskeletal therapy, neurological rehabilitation, and occupational therapy.",
            description: "Multidisciplinary rehabilitation center offering physiotherapy, occupational therapy, speech therapy, and specialized programs for stroke, spinal cord, and post-operative recovery.",
            image: "img/herosection.webp",
            hours: "Mon - Fri: 7:30 AM - 5:00 PM, Sat: 8:00 AM - 1:00 PM",
            features: ["Post-Surgical Rehabilitation", "Stroke & Neurological Recovery", "Musculoskeletal Physiotherapy", "Occupational & Speech Therapy"]
        },
        {
            id: "srv-12",
            title: "Nutrition & Dietetics",
            slug: "nutrition",
            category: "support",
            icon: "fas fa-apple-alt",
            short_description: "Clinical nutrition assessment, specialized diet planning, enteral feeding management, and community nutrition education.",
            description: "Certified clinical dietitians providing individualized medical nutrition therapy for diabetes, renal disease, oncology, pediatric malnutrition, and post-bariatric patients.",
            image: "img/about.jpg",
            hours: "Mon - Fri: 8:00 AM - 5:00 PM",
            features: ["Medical Nutrition Therapy", "Enteral & Parenteral Feeding Support", "Diabetes Diet Management", "Community Nutrition Programs"]
        }
    ],
    departments: [
        {
            id: "dept-1",
            name: "Cardiology & Vascular Medicine",
            slug: "cardiology",
            category: "clinical",
            icon: "fas fa-heartbeat",
            title: "Cardiology Department",
            head_of_department: "Dr. Ondari",
            head_qualification: "MBChB, MMed, FESC",
            head_experience: "16+ Years Experience",
            extension: "1010",
            email: "cardiology@ktrh.or.ke",
            location: "Medical Plaza, 2nd Floor",
            image: "img/drondari.png",
            description: "Specialized outpatient and inpatient cardiovascular diagnosis, therapeutic interventions, and cardiac rehabilitation.",
            services: ["Angioplasty & Stenting", "Pacemaker Implantation", "Cardiac Ultrasound & Stress Testing", "Arrhythmia Clinic"]
        },
        {
            id: "dept-2",
            name: "Obstetrics & Gynecology",
            slug: "maternity",
            category: "clinical",
            icon: "fas fa-female",
            title: "Maternity & Reproductive Health",
            head_of_department: "Dr. Judith Bosire",
            head_qualification: "MBChB, MMed Obs/Gyn",
            head_experience: "14+ Years Experience",
            extension: "1020",
            email: "maternity@ktrh.or.ke",
            location: "Mother & Child Hospital Complex",
            image: "img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg",
            description: "Comprehensive prenatal, labor, postnatal, and advanced gynecological surgical interventions.",
            services: ["Normal & Cesarean Deliveries", "High-Risk Pregnancy Management", "Laparoscopic Gynecologic Surgery", "Fertility Counseling"]
        },
        {
            id: "dept-3",
            name: "General & Specialized Surgery",
            slug: "surgery",
            category: "clinical",
            icon: "fas fa-scalpel",
            title: "Department of Surgery",
            head_of_department: "Dr. Brenda Achieng",
            head_qualification: "MBChB, FCS (ECSA)",
            head_experience: "12+ Years Experience",
            extension: "1030",
            email: "surgery@ktrh.or.ke",
            location: "Surgical Pavilion & Main Theatres",
            image: "img/imagestheatre.jpg",
            description: "Providing modern surgical procedures across laparoscopic, gastrointestinal, oncology, and acute trauma disciplines.",
            services: ["Laparoscopic Cholecystectomy", "Oncologic Resection", "Trauma & Reconstructive Surgery", "Hernia Repair"]
        },
        {
            id: "dept-4",
            name: "Radiology & Imaging Sciences",
            slug: "radiology",
            category: "diagnostic",
            icon: "fas fa-x-ray",
            title: "Radiology Department",
            head_of_department: "Dr. Patrick Nyabuto",
            head_qualification: "MBChB, MMed Radiology",
            head_experience: "15+ Years Experience",
            extension: "1040",
            email: "radiology@ktrh.or.ke",
            location: "Ground Floor, Diagnostic Wing",
            image: "img/imagesktrh.jpg",
            description: "24/7 cutting-edge diagnostic and interventional radiology services supporting all clinical departments.",
            services: ["Computed Tomography (CT)", "Magnetic Resonance Imaging (MRI)", "Digital X-Ray & Mammography", "Ultrasound Diagnostics"]
        },
        {
            id: "dept-5",
            name: "Pediatrics & Child Health",
            slug: "pediatrics",
            category: "clinical",
            icon: "fas fa-child",
            title: "Pediatrics Department",
            head_of_department: "Dr. Sarah Mwangi",
            head_qualification: "MBChB, MMed Pediatrics",
            head_experience: "12+ Years Experience",
            extension: "1050",
            email: "pediatrics@ktrh.or.ke",
            location: "Child Wellness Pavilion",
            image: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?auto=format&fit=crop&w=600&q=80",
            description: "Dedicated to holistic healthcare for neonates, infants, children, and adolescents.",
            services: ["Neonatal Intensive Care", "Childhood Immunization", "Pediatric Emergency Resuscitation", "Child Nutrition Clinic"]
        },
        {
            id: "dept-6",
            name: "Orthopedic & Trauma Surgery",
            slug: "orthopedics",
            category: "surgical",
            icon: "fas fa-bone",
            title: "Orthopedic Surgery Department",
            head_of_department: "Dr. David Kipchumba",
            head_qualification: "MBChB, FCS (ECSA) Orthopedics",
            head_experience: "15+ Years Experience",
            extension: "1060",
            email: "orthopedics@ktrh.or.ke",
            location: "Surgical Pavilion, 1st Floor",
            image: "img/imagestheatre.jpg",
            description: "Specialized orthopedic and trauma surgery including fracture fixation, joint replacement, spinal surgery, and sports medicine.",
            services: ["Total Joint Replacement", "Complex Fracture Management", "Spinal Surgery", "Arthroscopic Procedures", "Sports Injury Rehabilitation"]
        },
        {
            id: "dept-7",
            name: "Pharmacy & Clinical Pharmacy",
            slug: "pharmacy",
            category: "support",
            icon: "fas fa-pills",
            title: "Pharmacy Department",
            head_of_department: "Dr. Grace Nyamweya",
            head_qualification: "BPharm, MPharm Clinical Pharmacy",
            head_experience: "10+ Years Experience",
            extension: "1070",
            email: "pharmacy@ktrh.or.ke",
            location: "Ground Floor, Main Hospital",
            image: "img/about.jpg",
            description: "Comprehensive pharmaceutical services including medication dispensing, clinical pharmacy consultations, drug information, and antibiotic stewardship.",
            services: ["24/7 Medication Dispensing", "Antibiotic Stewardship", "Drug Information Services", "IV Admixture & Compounding"]
        },
        {
            id: "dept-8",
            name: "Physiotherapy & Rehabilitation",
            slug: "physiotherapy",
            category: "support",
            icon: "fas fa-walking",
            title: "Physiotherapy Department",
            head_of_department: "Dr. James Otieno",
            head_qualification: "BSc Physiotherapy, MSc Rehabilitation",
            head_experience: "8+ Years Experience",
            extension: "1080",
            email: "physiotherapy@ktrh.or.ke",
            location: "Rehabilitation Wing, Ground Floor",
            image: "img/herosection.webp",
            description: "Post-surgical rehabilitation, stroke recovery, musculoskeletal therapy, and occupational therapy services.",
            services: ["Post-Surgical Rehabilitation", "Stroke Recovery Programs", "Musculoskeletal Therapy", "Occupational Therapy", "Speech & Language Therapy"]
        }
    ],
    jobs: [
        {
            id: "job-1",
            title: "Senior Medical Officer (Emergency Medicine)",
            department: "Emergency & Trauma Center",
            type: "Full-Time",
            location: "Main Hospital - Kisii",
            postedDate: "2026-10-15",
            deadline: "2026-12-15",
            isActive: true,
            description: "We are seeking a dedicated Senior Medical Officer to lead emergency clinical shifts in our modern 24/7 Trauma Center.",
            requirements: [
                "Bachelor of Medicine and Bachelor of Surgery (MBChB) from a recognized university",
                "Registered with the Kenya Medical Practitioners and Dentists Council (KMPDC)",
                "Minimum 3 years of clinical experience in an acute emergency department",
                "Valid ACLS, ATLS, and BLS certifications"
            ],
            responsibilities: [
                "Lead acute patient resuscitation and trauma stabilization",
                "Supervise junior medical officers and intern doctors",
                "Coordinate rapid inter-departmental hospital admissions",
                "Participate in hospital disaster preparedness planning"
            ]
        },
        {
            id: "job-2",
            title: "Critical Care Registered Nurse (ICU)",
            department: "Intensive Care Unit (ICU)",
            type: "Full-Time",
            location: "Main Hospital - Kisii",
            postedDate: "2026-10-20",
            deadline: "2026-11-30",
            isActive: true,
            description: "Seeking compassionate and certified Critical Care Nurses to join our intensive care and high-dependency team.",
            requirements: [
                "BSc in Nursing or Diploma in KRCHN with Higher Diploma in Critical Care Nursing",
                "Registered with the Nursing Council of Kenya (NCK) with valid practice license",
                "Minimum 2 years proven experience in an adult or pediatric ICU",
                "Proficiency in ventilator management and invasive hemodynamic monitoring"
            ],
            responsibilities: [
                "Direct one-on-one intensive care nursing for critically ill patients",
                "Titrate complex cardiovascular medications and infusions",
                "Assist physicians with bedside invasive procedures",
                "Maintain strict infection control and documentation standards"
            ]
        },
        {
            id: "job-3",
            title: "Biomedical Engineering Technologist",
            department: "Biomedical Engineering Unit",
            type: "Full-Time",
            location: "Main Hospital - Kisii",
            postedDate: "2026-10-25",
            deadline: "2026-12-10",
            isActive: true,
            description: "Responsible for preventive maintenance, calibration, and troubleshooting of life-support and imaging medical equipment.",
            requirements: [
                "Degree or Higher Diploma in Medical Engineering / Biomedical Engineering",
                "Registered with the Association of Medical Engineering of Kenya (AMEK)",
                "Experience servicing anesthesia machines, ventilators, dialysis units, and monitors",
                "Strong diagnostic troubleshooting skills and electronic schematics literacy"
            ],
            responsibilities: [
                "Perform scheduled calibration and preventative maintenance across wards",
                "Respond promptly to clinical equipment downtime reports",
                "Train healthcare staff on proper medical equipment operation",
                "Manage biomedical spare parts inventory"
            ]
        }
    ],
    gallery: [
        {
            id: "gal-1",
            title: "Modern Maternal & Child Health Complex",
            category: "facilities",
            mediaType: "image",
            url: "img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg",
            description: "Exterior view of the new specialized 250-bed Mother & Child Health Pavilion at KTRH.",
            date: "2026-09-12",
            views: 420
        },
        {
            id: "gal-2",
            title: "Main Hospital Aerial View",
            category: "facilities",
            mediaType: "image",
            url: "img/about.jpg",
            description: "Panoramic overview of the expanding Kisii Teaching & Referral Hospital medical campus.",
            date: "2026-08-10",
            views: 890
        },
        {
            id: "gal-3",
            title: "Surgical Theatre & Laparoscopic Suite",
            category: "facilities",
            mediaType: "image",
            url: "img/imagestheatre.jpg",
            description: "One of our modern laminar-flow operating rooms equipped for minimally invasive surgeries.",
            date: "2026-07-22",
            views: 310
        },
        {
            id: "gal-4",
            title: "Cardiology Team Consultation",
            category: "team",
            mediaType: "image",
            url: "img/drondari.png",
            description: "Consultant physicians reviewing coronary imaging in the cardiac diagnostics lounge.",
            date: "2026-08-30",
            views: 520
        },
        {
            id: "gal-5",
            title: "Community Outreach & Free Screening Day",
            category: "community",
            mediaType: "image",
            url: "img/imagesktrh.jpg",
            description: "KTRH medical staff conducting free hypertension and diabetes screenings for the community.",
            date: "2026-09-28",
            views: 640
        },
        {
            id: "gal-6",
            title: "Cancer Care Pavilion Construction Progress",
            category: "achievements",
            mediaType: "image",
            url: "img/bov541lkxmnc613b9b5831d2ektrhroject.jpg",
            description: "Milestone progress on the regional radiotherapy and nuclear medicine center.",
            date: "2026-10-04",
            views: 380
        },
        {
            id: "gal-7",
            title: "KTRH Virtual Tour & Facilities Overview",
            category: "videos",
            mediaType: "video",
            url: "https://www.youtube.com/embed/IzZeZbr7Jf0",
            description: "An official video walkthrough of KTRH healthcare facilities, clinical departments, and patient care wards.",
            date: "2026-09-15",
            views: 1250
        }
    ],
    appointments: [
        {
            id: "apt-1",
            refNumber: "KTRH-2026-84920",
            fullName: "James Mogaka",
            phone: "+254 712 345 678",
            email: "j.mogaka@example.com",
            date: "2026-11-05",
            time: "10:00",
            department: "cardiology",
            doctor: "dr_ondari",
            symptoms: "Recurring chest tightness on exertion and elevated blood pressure.",
            insurance: "NHIF / SHA",
            status: "Confirmed",
            createdAt: "2026-10-31T09:15:00Z"
        },
        {
            id: "apt-2",
            refNumber: "KTRH-2026-61845",
            fullName: "Grace Kerubo",
            phone: "+254 722 890 123",
            email: "grace.k@example.com",
            date: "2026-11-06",
            time: "11:30",
            department: "pediatrics",
            doctor: "dr_mwangi",
            symptoms: "Post-vaccination checkup and pediatric wellness evaluation for 6-month infant.",
            insurance: "Private Insurance",
            status: "Pending",
            createdAt: "2026-10-31T14:22:00Z"
        }
    ],
    contactMessages: [
        {
            id: "msg-1",
            name: "Evans Nyandoro",
            email: "evans.nyandoro@example.com",
            phone: "+254 758 111 222",
            subject: "Inquiry on Specialist Consultation Fees",
            department: "Cardiology",
            message: "Hello, I would like to inquire about the consultation schedule and SHA / insurance coverage for outpatient cardiac checkups.",
            status: "Unread",
            createdAt: "2026-10-31T16:40:00Z"
        }
    ],
    newsletterSubscriptions: [
        { id: "sub-1", email: "community.updates@kisii.go.ke", date: "2026-10-28" }
    ],
    jobApplications: []
};

// Data Store Controller Class
class KTRHDataStore {
    constructor() {
        this.data = this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem(KTRH_STORAGE_KEY);
            if (!raw) {
                this.saveToStorage(DEFAULT_KTRH_DATA);
                return JSON.parse(JSON.stringify(DEFAULT_KTRH_DATA));
            }
            const parsed = JSON.parse(raw);
            // Ensure any missing root collections exist
            for (const key of Object.keys(DEFAULT_KTRH_DATA)) {
                if (parsed[key] === undefined) {
                    parsed[key] = DEFAULT_KTRH_DATA[key];
                }
            }
            return parsed;
        } catch (e) {
            console.error('Error loading KTRH data store, falling back to defaults:', e);
            return JSON.parse(JSON.stringify(DEFAULT_KTRH_DATA));
        }
    }

    saveToStorage(dataToSave) {
        try {
            const payload = dataToSave || this.data;
            localStorage.setItem(KTRH_STORAGE_KEY, JSON.stringify(payload));
            this.broadcastChange();
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    broadcastChange(collectionName = null) {
        window.dispatchEvent(new CustomEvent('ktrh_data_updated', {
            detail: { collection: collectionName }
        }));
    }

    // Generic Collection Operations
    getAll(collection) {
        if (!this.data[collection]) {
            return [];
        }
        return JSON.parse(JSON.stringify(this.data[collection]));
    }

    getById(collection, id) {
        const list = this.data[collection] || [];
        const item = list.find(item => String(item.id) === String(id));
        return item ? JSON.parse(JSON.stringify(item)) : null;
    }

    add(collection, item) {
        if (!this.data[collection]) {
            this.data[collection] = [];
        }
        if (!item.id) {
            item.id = `${collection.slice(0, 3)}-${Date.now()}`;
        }
        this.data[collection].unshift(item);
        this.saveToStorage();
        return item;
    }

    update(collection, id, updatedFields) {
        if (!this.data[collection]) return false;
        const index = this.data[collection].findIndex(item => String(item.id) === String(id));
        if (index === -1) return false;

        this.data[collection][index] = {
            ...this.data[collection][index],
            ...updatedFields,
            id: this.data[collection][index].id // preserve id
        };
        this.saveToStorage();
        return this.data[collection][index];
    }

    delete(collection, id) {
        if (!this.data[collection]) return false;
        const initialLen = this.data[collection].length;
        this.data[collection] = this.data[collection].filter(item => String(item.id) !== String(id));
        if (this.data[collection].length !== initialLen) {
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Specialized Accessors
    getDoctors() { return this.getAll('doctors'); }
    getProjects() { return this.getAll('projects'); }
    getServices() { return this.getAll('services'); }
    getDepartments() { return this.getAll('departments'); }
    getJobs() { return this.getAll('jobs'); }
    getGallery() { return this.getAll('gallery'); }
    getAppointments() { return this.getAll('appointments'); }
    getContactMessages() { return this.getAll('contactMessages'); }
    getStats() { return { ...this.data.stats }; }

    // Backup & Restore
    exportJSON() {
        const jsonStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `ktrh-hospital-data-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importJSON(jsonString) {
        try {
            const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid JSON format');
            }
            this.data = parsed;
            this.saveToStorage();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    resetDefaults() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_KTRH_DATA));
        this.saveToStorage();
        return true;
    }

    // Helper: Convert File to Base64 Data URL (for local image uploads)
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

// Global instance available across all pages
window.KTRHStore = new KTRHDataStore();

