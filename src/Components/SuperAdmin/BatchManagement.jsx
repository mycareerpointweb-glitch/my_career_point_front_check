import '../../Styles/SuperAdmin/BatchManagement.css'; 
import '../../Styles/SuperAdmin/UserManagement.css'; 

import React, { useState, useRef, useEffect } from "react";
// --- Importing consistent React Icons (Fa, Fi, Hi) ---
import { FaPlusCircle, FaTimes, FaChevronLeft, FaChevronRight, FaClock, FaUserAlt, FaBookOpen, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi"; 

// --- CONSTANTS ---
const CA_PROGRAMS = ["CA Foundation", "CA Intermediate", "CA Final (Group 1)", "CA Final (Group 2)"];
const CMA_PROGRAMS = ["CMA Foundation", "CMA Intermediate", "CMA Final"];
const BATCH_YEARS = [2024, 2025, 2026]; 
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
    { time: "9:00 - 10:30", type: "class" },  // Class 1 (90 min)
    { time: "10:45 - 12:15", type: "class" }, // Class 2 (90 min)
    { time: "1:15 - 2:45", type: "class" },   // Class 3 (90 min)
    { time: "3:00 - 4:30", type: "class" },   // Class 4 (90 min)
    { time: "4:30 - 6:00", type: "class" },   // Class 5 (90 min)
];

// Default data structure for an empty/undefined batch schedule
const DEFAULT_TIMETABLE = { 
    "Monday": TIME_SLOTS.map(() => ({ subject: "No Schedule", instructor: "N/A", type: "class" })),
    "Tuesday": TIME_SLOTS.map(() => ({ subject: "No Schedule", instructor: "N/A", type: "class" })),
    "Wednesday": TIME_SLOTS.map(() => ({ subject: "No Schedule", instructor: "N/A", type: "class" })),
    "Thursday": TIME_SLOTS.map(() => ({ subject: "No Schedule", instructor: "N/A", type: "class" })),
    "Friday": TIME_SLOTS.map(() => ({ subject: "No Schedule", instructor: "N/A", type: "class" })),
};

const DEFAULT_PROGRAM_DATA_FOR_BATCH = { 
    classes: [], 
    timetable: DEFAULT_TIMETABLE, 
    instructors: [] 
};

// --- CORE DATA REFACTOR: Grouped by Program and then by Batch Year ---
const ALL_PROGRAM_DATA = {
    // =========================================
    // 1. CA Foundation Data (3 UNIQUE BATCHES)
    // Keys (Class IDs) are now unique across all batches/programs (101-199)
    // =========================================
    "CA Foundation": {
        // --- 2024 Batch Data (Old Syllabus Focus) ---
        2024: {
            classes: [
                { id: 101, name: "Class 1: Accounting Basics", subject: "Financial Accounting", instructor: "Mr. Sharma" },
                { id: 102, name: "Class 2: Corporate Law Intro", subject: "Corporate Laws", instructor: "Ms. Patel" },
                { id: 103, name: "Class 3: Cost Management Funda", subject: "Cost Management", instructor: "Dr. Rao" },
                { id: 104, name: "Class 4: Direct Tax Basics", subject: "Taxation", instructor: "Mr. Sharma" },
                { id: 105, name: "Class 5: Business Economics", subject: "Economics", instructor: "Mr. Iyer" },
            ],
            timetable: {
                "Monday": [
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Corporate Laws", instructor: "Ms. Patel", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                    { subject: "Economics", instructor: "Mr. Iyer", type: "class" }, 
                ],
                "Tuesday": [
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Corporate Laws", instructor: "Ms. Patel", type: "class" },
                    { subject: "Economics", instructor: "Mr. Iyer", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Economics", instructor: "Mr. Iyer", type: "class" },
                    { subject: "Corporate Laws", instructor: "Ms. Patel", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" }, 
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" }, 
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Corporate Laws", instructor: "Ms. Patel", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Economics", instructor: "Mr. Iyer", type: "class" }, 
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Economics", instructor: "Mr. Iyer", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" }, 
                    { subject: "Corporate Laws", instructor: "Ms. Patel", type: "class" }, 
                ],
            },
            instructors: [
                { id: 301, name: "Mr. Sharma", subjects: ["Financial Accounting", "Taxation"], batches: 4, workload: "High" },
                { id: 302, name: "Ms. Patel", subjects: ["Corporate Laws"], batches: 3, workload: "Medium" },
                { id: 303, name: "Dr. Rao", subjects: ["Cost Management"], batches: 2, workload: "Low" },
                { id: 304, name: "Mr. Iyer", subjects: ["Economics"], batches: 1, workload: "Low" },
            ]
        },
        // --- 2025 Batch Data (Minor Schedule Change) ---
        2025: {
            classes: [
                // IDs 106-109
                { id: 106, name: "Class 1: Accounting for Beginners", subject: "Financial Accounting", instructor: "Mr. Sharma" },
                { id: 107, name: "Class 2: Law & Ethics", subject: "Business Law", instructor: "Ms. Desai" }, 
                { id: 108, name: "Class 3: Quant Techniques", subject: "Quant. Aptitude", instructor: "Dr. Singh" }, 
                { id: 109, name: "Class 4: Direct Tax Code", subject: "Taxation", instructor: "Mr. Sharma" },
            ],
            timetable: {
                "Monday": [
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" }, 
                ],
                "Tuesday": [
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" }, 
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" },
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" }, 
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" },
                    { subject: "Quant. Aptitude", instructor: "Dr. Singh", type: "class" },
                    { subject: "Financial Accounting", instructor: "Mr. Sharma", type: "class" },
                    { subject: "Business Law", instructor: "Ms. Desai", type: "class" }, 
                    { subject: "Taxation", instructor: "Mr. Sharma", type: "class" }, 
                ],
            },
            instructors: [
                { id: 301, name: "Mr. Sharma", subjects: ["Financial Accounting", "Taxation"], batches: 5, workload: "Very High" },
                { id: 305, name: "Ms. Desai", subjects: ["Business Law"], batches: 3, workload: "Medium" },
                { id: 306, name: "Dr. Singh", subjects: ["Quant. Aptitude"], batches: 4, workload: "Medium" },
            ]
        },
        // --- 2026 Batch Data (New Teacher & Slot Order) ---
        2026: {
            classes: [
                // IDs 110-112
                { id: 110, name: "Class 1: Advanced Ledgers", subject: "Advanced Accounting", instructor: "Ms. Desai" },
                { id: 111, name: "Class 2: Legal Framework", subject: "Legal Studies", instructor: "Mr. Verma" },
                { id: 112, name: "Class 3: Stat & Calc", subject: "Statistics", instructor: "Dr. Singh" },
            ],
            timetable: {
                "Monday": [
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" },
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Free Slot", instructor: "N/A", type: "class" }, 
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" }, 
                ],
                "Tuesday": [
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" },
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" }, 
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" }, 
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" }, 
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Desai", type: "class" },
                    { subject: "Statistics", instructor: "Dr. Singh", type: "class" },
                    { subject: "Legal Studies", instructor: "Mr. Verma", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" }, 
                ],
            },
            instructors: [
                { id: 305, name: "Ms. Desai", subjects: ["Advanced Accounting"], batches: 4, workload: "Medium" },
                { id: 306, name: "Dr. Singh", subjects: ["Statistics"], batches: 5, workload: "High" },
                { id: 307, name: "Mr. Verma", subjects: ["Legal Studies"], batches: 3, workload: "Medium" },
            ]
        },
    },

    // =========================================
    // 2. CMA Intermediate Data (3 UNIQUE BATCHES)
    // Keys (Class IDs) are now unique across all batches/programs (201-299)
    // =========================================
    "CMA Intermediate": {
        // --- 2024 Batch Data (Focus on Cost) ---
        2024: {
            classes: [
                // IDs 201-204
                { id: 201, name: "Advanced Accounting - IFRS", subject: "Advanced Accounting", instructor: "Ms. Kapoor" }, 
                { id: 202, name: "Company Law - Compliance", subject: "Corporate Laws", instructor: "Mr. Shah" },
                { id: 203, name: "Costing & Budgeting", subject: "Cost Management", instructor: "Dr. Rao" },
                { id: 204, name: "Indirect Tax (GST)", subject: "Indirect Taxation", instructor: "Mr. Kumar" },
            ],
            timetable: {
                "Monday": [
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Corporate Laws", instructor: "Mr. Shah", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" },
                ],
                "Tuesday": [
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Corporate Laws", instructor: "Mr. Shah", type: "class" },
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Corporate Laws", instructor: "Mr. Shah", type: "class" },
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Corporate Laws", instructor: "Mr. Shah", type: "class" }, 
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Corporate Laws", instructor: "Mr. Shah", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Indirect Taxation", instructor: "Mr. Kumar", type: "class" }, 
                    { subject: "Advanced Accounting", instructor: "Ms. Kapoor", type: "class" }, 
                ],
            },
            instructors: [
                { id: 308, name: "Ms. Kapoor", subjects: ["Advanced Accounting"], batches: 5, workload: "High" },
                { id: 309, name: "Mr. Shah", subjects: ["Corporate Laws"], batches: 3, workload: "Medium" },
                { id: 310, name: "Dr. Rao", subjects: ["Cost Management"], batches: 4, workload: "Medium" },
                { id: 311, name: "Mr. Kumar", subjects: ["Indirect Taxation"], batches: 2, workload: "Low" },
            ]
        },
        // --- 2025 Batch Data (Focus on Strategic Finance) ---
        2025: {
            classes: [
                // IDs 205-207
                { id: 205, name: "Strategic Cost Mgt", subject: "Cost Management", instructor: "Dr. Rao" },
                { id: 206, name: "Tax Planning", subject: "Taxation", instructor: "Mr. Singh" }, 
                { id: 207, name: "Financial Management", subject: "Financial Mgmt", instructor: "Ms. Kapoor" },
            ],
            timetable: {
                "Monday": [
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" }, 
                    { subject: "Free Slot", instructor: "N/A", type: "class" },
                ],
                "Tuesday": [
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" }, 
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" }, 
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" },
                    { subject: "Cost Management", instructor: "Dr. Rao", type: "class" },
                    { subject: "Financial Mgmt", instructor: "Ms. Kapoor", type: "class" }, 
                    { subject: "Taxation", instructor: "Mr. Singh", type: "class" }, 
                ],
            },
            instructors: [
                { id: 310, name: "Dr. Rao", subjects: ["Cost Management"], batches: 6, workload: "Very High" },
                { id: 308, name: "Ms. Kapoor", subjects: ["Financial Mgmt"], batches: 5, workload: "High" },
                { id: 312, name: "Mr. Singh", subjects: ["Taxation"], batches: 4, workload: "Medium" },
            ]
        },
        // --- 2026 Batch Data (New Subjects/Teachers) ---
        2026: {
            classes: [
                // IDs 208-210
                { id: 208, name: "Audit & Assurance", subject: "Auditing", instructor: "Mr. Reddy" }, 
                { id: 209, name: "Financial Reporting", subject: "Reporting", instructor: "Ms. Kapoor" },
                { id: 210, name: "Business Strategy", subject: "Strategy", instructor: "Dr. Khan" }, 
            ],
            timetable: {
                "Monday": [
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" }, 
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                ],
                "Tuesday": [
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Free Slot", instructor: "N/A", type: "class" },
                ],
                "Wednesday": [
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" }, 
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" }, 
                ],
                "Thursday": [
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" }, 
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" }, 
                ],
                "Friday": [
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" },
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" },
                    { subject: "Reporting", instructor: "Ms. Kapoor", type: "class" },
                    { subject: "Auditing", instructor: "Mr. Reddy", type: "class" }, 
                    { subject: "Strategy", instructor: "Dr. Khan", type: "class" }, 
                ],
            },
            instructors: [
                { id: 313, name: "Mr. Reddy", subjects: ["Auditing"], batches: 4, workload: "Medium" },
                { id: 308, name: "Ms. Kapoor", subjects: ["Reporting"], batches: 5, workload: "High" },
                { id: 314, name: "Dr. Khan", subjects: ["Strategy"], batches: 3, workload: "Medium" },
            ]
        },
    },

    // --- NON-DATA PROGRAMS ---
    // Instead of { 2024: {}, 2025: {}, 2026: {} }, use this structure to avoid runtime TypeErrors when accessing properties of the inner object.
    "CA Intermediate": BATCH_YEARS.reduce((acc, year) => ({ ...acc, [year]: DEFAULT_PROGRAM_DATA_FOR_BATCH }), {}),
    "CA Final (Group 1)": BATCH_YEARS.reduce((acc, year) => ({ ...acc, [year]: DEFAULT_PROGRAM_DATA_FOR_BATCH }), {}),
    "CA Final (Group 2)": BATCH_YEARS.reduce((acc, year) => ({ ...acc, [year]: DEFAULT_PROGRAM_DATA_FOR_BATCH }), {}),
    "CMA Foundation": BATCH_YEARS.reduce((acc, year) => ({ ...acc, [year]: DEFAULT_PROGRAM_DATA_FOR_BATCH }), {}),
    "CMA Final": BATCH_YEARS.reduce((acc, year) => ({ ...acc, [year]: DEFAULT_PROGRAM_DATA_FOR_BATCH }), {}),
};

// --- END CORE DATA REFACTOR ---


const BatchManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMasterCourse, setSelectedMasterCourse] = useState("CA");
    // Initial state set to CA Foundation as it's the first in CA_PROGRAMS
    const [selectedProgram, setSelectedProgram] = useState("CA Foundation"); 
    
    // Default the selected batch index to the first year (2024)
    const initialBatchIndex = BATCH_YEARS.indexOf(2024);
    const [selectedBatchIndex, setSelectedBatchIndex] = useState(initialBatchIndex); 
    const selectedBatchYear = BATCH_YEARS[selectedBatchIndex]; // Derive the year from the index
    
    // Holds the currently selected subject object or null if none is selected.
    const [selectedSubject, setSelectedSubject] = useState(null); 
    
    // --- DYNAMIC DATA SELECTION LOGIC (UPDATED for better error handling) ---
    // 1. Get the data for the selected Program. Default to an empty object if program is missing.
    const programDataByYear = ALL_PROGRAM_DATA[selectedProgram] || {};
    
    // 2. Get the data for the selected Batch Year. **Crucially, default to the safe, full structure**
    //    if the specific batch year data is missing or undefined (this fixes the TypeError).
    const currentProgramData = programDataByYear[selectedBatchYear] || DEFAULT_PROGRAM_DATA_FOR_BATCH;
    
    const currentClasses = currentProgramData.classes;
    const currentTimetable = currentProgramData.timetable;
    const currentInstructors = currentProgramData.instructors;


    // --- BATCH SLIDER UPDATE: Only 3 fixed years, so we show all 3. ---
    const visibleBatches = BATCH_YEARS.map((year, index) => ({
        year,
        index
    }));

    // Scroll Handler for the fixed 3 years is simplified: just move index one step.
    const handleBatchSliderScroll = (direction) => {
        const totalYears = BATCH_YEARS.length;
        let newIndex = selectedBatchIndex;
        
        if (direction === 'left') {
            newIndex = Math.max(0, newIndex - 1);
        } else { // direction === 'right'
            newIndex = Math.min(totalYears - 1, newIndex + 1);
        }
        
        if (newIndex !== selectedBatchIndex) {
            setSelectedBatchIndex(newIndex);
        }
    };
    
    // Disable logic for slider arrows (only 3 years, so they disable easily)
    const isLeftDisabled = selectedBatchIndex === 0;
    const isRightDisabled = selectedBatchIndex === BATCH_YEARS.length - 1;


    // --- State Handlers (modified for single subject selection) ---
    const handleMasterCourseChange = (course) => {
        setSelectedMasterCourse(course);
        const newPrograms = course === "CA" ? CA_PROGRAMS : CMA_PROGRAMS;
        setSelectedProgram(newPrograms[0]);
        setSelectedSubject(null); // Clear subject selection on program change
        // Ensure batch year selection stays valid (only 2024, 2025, 2026 exist)
    };
    
    const handleProgramSelect = (program) => {
        setSelectedProgram(program);
        setSelectedSubject(null); // Clear subject selection on program change
    }

    // NEW HANDLER: Selects only one subject or deselects the current one
    const handleSubjectSelect = (classItem) => {
        // If the same class is clicked, deselect it (set to null). 
        // Otherwise, select the new class (set to classItem).
        setSelectedSubject(prev => 
            prev && prev.id === classItem.id
            ? null // Deselect
            : classItem // Select new one
        );
    };

    // --- Data for Rendering ---
    const currentPrograms = selectedMasterCourse === "CA" ? CA_PROGRAMS : CMA_PROGRAMS;
    
    // The subject name being used as the filter
    const selectedSubjectName = selectedSubject ? selectedSubject.subject : null;
    const isFilteringEnabled = selectedSubject !== null;


    // --- Render Functions (Unchanged UI/Components) ---
    const BatchForm = () => (
        <div className="batch_card-section fade-in" style={{marginBottom: 'var(--space-6)'}}>
            <div className="batch_form-header flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Create New Batch</h3>
                <button type="button" className="btn-icon text-gray-500 hover:text-red-500" onClick={() => setShowForm(false)}>
                    <FaTimes size={20} />
                </button>
            </div>
            {/* Form Fields - Reusing utility classes */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 sm:flex-row flex-col">
                    <div className="flex-1">
                        <label htmlFor="batchName" className="input-label">Batch Name</label>
                        <input type="text" id="batchName" placeholder={`e.g., ${selectedProgram} ${selectedBatchYear}`} className="input-text" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="batchCenter" className="input-label">Center/Location</label>
                        <select id="batchCenter" className="input-select">
                            <option>Main Campus - Pune</option>
                            <option>Virtual/Online</option>
                            <option>Satellite Center - Mumbai</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-4 items-end sm:flex-row flex-col">
                    <div className="flex-1">
                        <label htmlFor="batchCapacity" className="input-label">Max Capacity</label>
                        <input type="number" id="batchCapacity" placeholder="e.g., 100" defaultValue="100" className="input-text" />
                    </div>
                    <button className="btn btn-primary btn-lg flex-1">
                        <FaPlusCircle size={18} /> Create Batch
                    </button>
                </div>
            </div>
        </div>
    );
    
    const BatchCard = ({ year, index, isSelected, onClick }) => (
        <div 
            className={`batch_batch-card ${isSelected ? 'selected' : ''} flex-center`} 
            onClick={onClick}
        >
            <FaCalendarAlt size={20} />
            <span className="batch_batch-year-text">{year}</span>
        </div>
    );
    
    const ClassCard = ({ classItem, isSelected, onClick }) => (
        <div 
            className={`batch_class-card ${isSelected ? 'selected' : ''} fade-in`} 
            onClick={onClick}
        >
            <div className="batch_class-header">
                <FaBookOpen size={18} />
                <span className="batch_class-subject">{classItem.subject}</span>
            </div>
            <p className="batch_class-name font-medium text-gray-900">{classItem.name}</p>
            <div className="batch_class-footer flex items-center gap-2 text-sm text-gray-600">
                <FaUserAlt size={14} />
                <span className="batch_class-instructor">{classItem.instructor}</span>
            </div>
        </div>
    );
    
    const InstructorMappingCard = ({ instructor }) => (
        <div className="batch_instructor-map-card fade-in">
            <div className="batch_instructor-header">
                <HiUserCircle size={40} className="batch_instructor-icon" />
                <div className="batch_instructor-info">
                    <h4 className="batch_instructor-name">{instructor.name}</h4>
                    <p className="batch_instructor-role">Expert in: {instructor.subjects.join(', ')}</p>
                </div>
            </div>
            <div className="batch_instructor-stats flex justify-between items-center pt-2">
                <p className="text-sm text-gray-600">
                    <span className="batch_stat-label font-semibold">Batches Assigned:</span>
                    <span className="batch_stat-value ml-2 text-gray-900">{instructor.batches}</span>
                </p>
                <button className="btn btn-secondary btn-sm">
                    Map Students
                </button>
            </div>
        </div>
    );

    // TIMETABLE UPDATE: Apply highlighting/dulling based on the single selected subject
    const TimetableCell = ({ data, timeSlot }) => {
        let extraClasses = '';

        if (data.type === 'class') {
            // Check if this cell's subject matches the single selected subject name
            const isSubjectSelected = data.subject === selectedSubjectName;
            
            if (isFilteringEnabled) {
                // If filtering is active: highlight selected, dull others
                extraClasses = isSubjectSelected ? 'highlight' : 'dull';
            } else {
                // If filtering is NOT active (no subject selected): apply no extra class
                extraClasses = '';
            }
        }
        
        // This line generates the color class name based on the subject (e.g., batch_tt-cell--financial-accounting)
        const baseClasses = data.type === 'class' 
            ? `batch_tt-cell batch_tt-cell--${data.subject.toLowerCase().replace(/[\s\.]/g, '-')}`
            : `batch_tt-cell ${data.type}`;

        // Cells for class
        if (data.type === 'class') {
            return (
                <div className={`${baseClasses} ${extraClasses}`}>
                    <p className="batch_tt-cell-subject">{data.subject}</p>
                    <p className="batch_tt-cell-instructor">
                        <HiUserCircle size={18} className="text-brand-orange" /> 
                        <span className="font-semibold text-sm">{data.instructor}</span>
                    </p>
                </div>
            );
        }
        
        // Cells for break/lunch (always show normally, even if filtering is enabled)
        return (
            <div className={`${baseClasses} ${extraClasses}`}>
                <p className="font-bold">{data.subject}</p>
                <p className="font-light text-xs">{timeSlot.time}</p>
            </div>
        );
    };


    return (
        <div className="batch_management slide-down">
            {/* Header Section */}
            <div className="batch_um-header">
                <h2 className="page-title text-3xl font-bold">Batch Management</h2>
                <div className="batch_um-actions">
                    {/* Search Bar */}
                    <div className="batch_search-wrapper">
                        <FiSearch className="batch_search-icon" />
                        <input
                            type="text"
                            placeholder="Search batches or programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="batch_search-input" 
                        />
                    </div>
                    {/* End Search Bar */}
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <FaPlusCircle size={18} />
                        <span>{showForm ? "Close Form" : "Create Batch"}</span>
                    </button>
                </div>
            </div>

            {showForm && <BatchForm />}
            
            {/* 1. Course and Program Selection (Card Clickables) */}
            <div className="batch_card-section">
                <h3 className="batch_section-title text-xl font-semibold">Courses</h3>
                
                {/* CA/CMA Master Course Cards */}
                <div className="batch_master-course-selection">
                    {["CA", "CMA"].map(course => (
                        <div 
                            key={course}
                            className={`batch_course-card ${selectedMasterCourse === course ? 'selected' : ''}`}
                            onClick={() => handleMasterCourseChange(course)}
                        >
                            <FaMapMarkerAlt size={24} className="mb-2" />
                            {course}
                        </div>
                    ))}
                </div>
                
                {/* Program Selection Cards */}
                <p className="batch_filter-label text-sm text-gray-600" style={{marginTop: 'var(--space-4)'}}>Programs in {selectedMasterCourse}:</p>
                <div className="batch_program-selection-grid">
                    {currentPrograms.map(prog => (
                        <div 
                            key={prog}
                            className={`batch_program-card ${selectedProgram === prog ? 'selected' : ''}`}
                            onClick={() => handleProgramSelect(prog)}
                        >
                            <FaBookOpen size={24} className="text-brand-orange-dark" />
                            <span className="font-semibold">{prog}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 2. Batch Year Slidable Cards (3 Years visible, step 1 navigation) */}
            <div className="batch_card-section">
                <h3 className="batch_section-title text-xl font-semibold">Batches</h3>
                <div className="batch_batch-slider-container">
                    
                    {/* Left Arrow: Move 1 year back */}
                    <button 
                        className="btn-icon batch_slider-arrow left" 
                        onClick={() => handleBatchSliderScroll('left')}
                        disabled={isLeftDisabled}
                        style={{ opacity: isLeftDisabled ? 0.5 : 1, cursor: isLeftDisabled ? 'not-allowed' : 'pointer' }}
                    >
                        <FaChevronLeft size={24} />
                    </button>
                    
                    {/* The Visible Batch Cards (All 3 rendered) */}
                    <div className="batch_batch-slider-wrapper">
                        <div className="flex justify-center gap-4"> 
                            {visibleBatches.map(({ year, index }) => (
                                <BatchCard 
                                    key={year}
                                    year={year}
                                    index={index}
                                    isSelected={selectedBatchIndex === index}
                                    onClick={() => setSelectedBatchIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Arrow: Move 1 year forward */}
                    <button 
                        className="btn-icon batch_slider-arrow right" 
                        onClick={() => handleBatchSliderScroll('right')}
                        disabled={isRightDisabled}
                        style={{ opacity: isRightDisabled ? 0.5 : 1, cursor: isRightDisabled ? 'not-allowed' : 'pointer' }}
                    >
                        <FaChevronRight size={24} />
                    </button>
                </div>
            </div>
            
            {/* 3. Classes Choosable Cards (Subject Selection - Now a single-choice filter) */}
            <div className="batch_card-section">
                <h3 className="batch_section-title text-xl font-semibold">Classes/Subjects for Batch of  {selectedBatchYear} / {selectedProgram}</h3>
                <div className="batch_classes-selection-grid">
                    {/* Line where currentClasses.length was previously accessed and caused the TypeError */}
                    {currentClasses.length > 0 ? (
                        currentClasses.map(classItem => (
                            <ClassCard
                                key={classItem.id} // Fixed to use unique IDs (100s and 200s)
                                // Check if this class is the currently selected one
                                isSelected={selectedSubject && selectedSubject.id === classItem.id}
                                classItem={classItem}
                                onClick={() => handleSubjectSelect(classItem)} // Use new single-select handler
                            />
                        ))
                    ) : (
                        <p className="batch_empty-state">
                            ⚠️ No classes/subjects defined for **{selectedProgram} {selectedBatchYear}** batch.
                            Please select a different program or batch year.
                        </p>
                    )}
                </div>
            </div>
            
            {/* 4. Timetable Display (5 Days x 5 Sessions) */}
            <div className="batch_card-section">
                <h3 className="batch_section-title text-xl font-semibold">Live Timetable Preview ({selectedProgram} - {selectedBatchYear})</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {isFilteringEnabled ? 
                        `Focusing on: "${selectedSubjectName}". Click the subject card above to view the full timetable.` :
                        `Click on a subject card above to instantly filter and highlight its schedule slots across the week.`
                    }
                </p>
                <div className="batch_timetable-grid">
                    {/* Header Row: Empty Cell + Days (Columns) */}
                    <div className="batch_tt-header">Session</div>
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="batch_tt-header">{day}</div>
                    ))}

                    {/* Content Rows: Time Slot (Row Header) + 5 Sessions (Cells) */}
                    {TIME_SLOTS.map((slot, slotIndex) => (
                        <React.Fragment key={slot.time}>
                            {/* Time Slot Header (First Column - Row Wise Timing) */}
                            <div className={`batch_tt-header batch_tt-time-slot`}>
                                <FaClock size={16} className="text-brand-orange-dark" style={{marginBottom: 'var(--space-1)'}} />
                                {slot.time}
                            </div>
                            
                            {/* Day Cells (The actual schedule, Column Wise Days) */}
                            {DAYS_OF_WEEK.map(day => {
                                // Dynamic data lookup: Safely access timetable data based on day and slot index
                                const dailySchedule = currentTimetable[day];
                                const data = dailySchedule && dailySchedule[slotIndex] 
                                    ? dailySchedule[slotIndex] 
                                    : { subject: "N/A", instructor: "N/A", type: "class" };
                                return (
                                    <TimetableCell key={`${day}-${slot.time}`} data={data} timeSlot={slot} />
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            {/* 5. Instructor Mapping */}
            <div className="batch_card-section">
                <h3 className="batch_section-title ">Instructor Mapping Overview for {selectedBatchYear}</h3>
                <p className="batch_filter-label text-sm text-gray-600" style={{marginBottom: 'var(--space-4)'}}>
                    View current instructor workload and map them to new batches/subjects.
                </p>
                <div className="batch_instructor-mapping-grid">
                    {currentInstructors.length > 0 ? (
                        currentInstructors.map(instructor => (
                            <InstructorMappingCard key={instructor.id} instructor={instructor} />
                        ))
                    ) : (
                        <p className="batch_empty-state">
                            No instructor data available for this program/batch combination.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchManagement;