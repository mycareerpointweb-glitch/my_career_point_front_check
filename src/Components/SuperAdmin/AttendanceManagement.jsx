import React, { useState, useMemo, useCallback } from 'react';
import "../../Styles/SuperAdmin/AttendanceManagement.css";
// NOTE: Assuming DynamicTable and CardSlider components are imported
import DynamicTable from "../Reusable/DynamicTable";

// --- STATIC DATA AND CONSTANTS ---
const INSTITUTES_DATA = new Map([
    ['CLG_ID001', 'The Institute of Chartered Accountants of India'],
    ['CLG_ID002', 'The Institute of Cost Accountants of India'],
    ['CLG_ID003', 'The Chartered Institute of Management Accountants'],
    ['CLG_ID004', 'The Institute of Company Secretaries of India'],
    ['CLG_ID005', 'American Institute of Certified Public Accountants']
]);

const COURSES_DATA = new Map([
    ['CS_ID001', 'Chartered Accountant (CA)'],
    ['CS_ID002', 'Cost Management Accountant (CMA)'],
    ['CS_ID003', 'Associate Cost and Management Accountant (ACMA)']
]);
const COURSES_LEVELS_DATA = new Map([
    ['CSL_ID001', 'Foundation'],
    ['CSL_ID002', 'Intermediate'],
    ['CSL_ID003', 'Final']
]);
const Programme_DATA = new Map([
    ['PKG_ID001', 'Junior Pack'],
    ['PKG_ID002', 'Sure Pass'],
    ['PKG_ID003', 'Remastered Pack']
]);
const BATCHES_DATA = new Map([
    ['BCH_ID001', 'CA-Foundation-Surepass-Apr'],
    ['BCH_ID002', 'CMA-Foundation-Surepass-Apr'],
    ['BCH_ID003', 'CA-Intermediate-Surepass-Apr'],
    ['BCH_ID004', 'CMA-Final-Surepass-Apr'],
    ['BCH_ID005', 'CA-Foundation-Remastered pack-Apr'],
]);
const CLASSES_DATA = new Map([
    ['CLS_ID001', 'CLASS A'],
    ['CLS_ID002', 'CLASS B'],
    ['CLS_ID003', 'CLASS C'],
    ['CLS_ID004', 'CLASS D']
]);
const ROLES_DATA = new Map([
    ['ROL_ID001', 'Student'],
    ['ROL_ID002', 'Teacher'],
]);

// --- STUDENT ATTENDANCE DATA ---
const studentAttendanceData = [
    {
      name: "Aarav Sharma", rollno: 1001, institute: "The Institute of Chartered Accountants of India", institute_id: "CLG_ID001", course: "Chartered Accountant (CA)", course_id: "CS_ID001", level: "Intermediate", level_id: "CSL_ID002", package: "Sure Pass", package_id: "PKG_ID002", batch: "CA-Intermediate-Surepass-Apr", batch_id: "BCH_ID003", class: "CLASS B", class_id: "CLS_ID002", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "A" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "A" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "A" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "A" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "A" }
      ]
    },
    {
      name: "Siya Patel", rollno: 1002, institute: "The Institute of Cost Accountants of India", institute_id: "CLG_ID002", course: "Cost Management Accountant (CMA)", course_id: "CS_ID002", level: "Foundation", level_id: "CSL_ID001", package: "Junior Pack", package_id: "PKG_ID001", batch: "CMA-Foundation-Surepass-Apr", batch_id: "BCH_ID002", class: "CLASS A", class_id: "CLS_ID001", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "A" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "A" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "A" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "A" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Rohan Verma", rollno: 1003, institute: "The Institute of Chartered Accountants of India", institute_id: "CLG_ID001", course: "Chartered Accountant (CA)", course_id: "CS_ID001", level: "Foundation", level_id: "CSL_ID001", package: "Remastered Pack", package_id: "PKG_ID003", batch: "CA-Foundation-Remastered pack-Apr", batch_id: "BCH_ID005", class: "CLASS D", class_id: "CLS_ID004", attendance: [
        { date: "2025-11-02", status: "A" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "A" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "A" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "A" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Meera Singh", rollno: 1004, institute: "The Institute of Company Secretaries of India", institute_id: "CLG_ID004", course: "Chartered Accountant (CA)", course_id: "CS_ID001", level: "Final", level_id: "CSL_ID003", package: "Sure Pass", package_id: "PKG_ID002", batch: "CA-Intermediate-Surepass-Apr", batch_id: "BCH_ID003", class: "CLASS B", class_id: "CLS_ID002", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "A" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "A" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "A" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Advait Rao", rollno: 1005, institute: "The Institute of Cost Accountants of India", institute_id: "CLG_ID002", course: "Associate Cost and Management Accountant (ACMA)", course_id: "CS_ID003", level: "Intermediate", level_id: "CSL_ID002", package: "Junior Pack", package_id: "PKG_ID001", batch: "CMA-Foundation-Surepass-Apr", batch_id: "BCH_ID002", class: "CLASS C", class_id: "CLS_ID003", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "A" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "A" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "A" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Jiya Gupta", rollno: 1006, institute: "The Institute of Chartered Accountants of India", institute_id: "CLG_ID001", course: "Cost Management Accountant (CMA)", course_id: "CS_ID002", level: "Final", level_id: "CSL_ID003", package: "Remastered Pack", package_id: "PKG_ID003", batch: "CMA-Final-Surepass-Apr", batch_id: "BCH_ID004", class: "CLASS D", class_id: "CLS_ID004", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "A" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "A" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Kunal Reddy", rollno: 1007, institute: "The Chartered Institute of Management Accountants", institute_id: "CLG_ID003", course: "Chartered Accountant (CA)", course_id: "CS_ID001", level: "Foundation", level_id: "CSL_ID001", package: "Junior Pack", package_id: "PKG_ID001", batch: "CA-Foundation-Surepass-Apr", batch_id: "BCH_ID001", class: "CLASS A", class_id: "CLS_ID001", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "A" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "A" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Ananya Jain", rollno: 1008, institute: "The Institute of Company Secretaries of India", institute_id: "CLG_ID004", course: "Cost Management Accountant (CMA)", course_id: "CS_ID002", level: "Intermediate", level_id: "CSL_ID002", package: "Sure Pass", package_id: "PKG_ID002", batch: "CMA-Foundation-Surepass-Apr", batch_id: "BCH_ID002", class: "CLASS C", class_id: "CLS_ID003", attendance: [
        { date: "2025-11-02", status: "A" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "A" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "A" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "A" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    },
    {
      name: "Vihaan Shah", rollno: 1009, institute: "The Institute of Cost Accountants of India", institute_id: "CLG_ID002", course: "Associate Cost and Management Accountant (ACMA)", course_id: "CS_ID003", level: "Final", level_id: "CSL_ID003", package: "Remastered Pack", package_id: "PKG_ID003", batch: "CMA-Final-Surepass-Apr", batch_id: "BCH_ID004", class: "CLASS D", class_id: "CLS_ID004", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "A" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "A" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "P" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "A" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "P" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "A" }
      ]
    },
    {
      name: "Isha Khanna", rollno: 1010, institute: "The Institute of Chartered Accountants of India", institute_id: "CLG_ID001", course: "Chartered Accountant (CA)", course_id: "CS_ID001", level: "Foundation", level_id: "CSL_ID001", package: "Sure Pass", package_id: "PKG_ID002", batch: "CA-Foundation-Surepass-Apr", batch_id: "BCH_ID001", class: "CLASS A", class_id: "CLS_ID001", attendance: [
        { date: "2025-11-02", status: "P" }, { date: "2025-10-19", status: "P" }, { date: "2025-10-18", status: "P" }, { date: "2025-10-17", status: "P" }, { date: "2025-10-16", status: "P" }, { date: "2025-10-15", status: "P" }, { date: "2025-10-14", status: "P" }, { date: "2025-10-13", status: "P" }, { date: "2025-10-12", status: "P" }, { date: "2025-10-11", status: "A" }, { date: "2025-10-10", status: "P" }, { date: "2025-10-09", status: "P" }, { date: "2025-10-08", status: "P" }, { date: "2025-10-07", status: "P" }, { date: "2025-10-06", status: "P" }, { date: "2025-10-05", status: "P" }, { date: "2025-10-04", status: "P" }, { date: "2025-10-03", status: "A" }, { date: "2025-10-02", status: "P" }, { date: "2025-10-01", status: "P" }
      ]
    }
];

// --- DYNAMIC COLUMN GENERATION LOGIC ---

// 1. Get all unique dates from the entire dataset
const getAllAttendanceDates = () => {
    const dates = new Set();
    studentAttendanceData.forEach(student => {
        student.attendance.forEach(record => {
            dates.add(record.date);
        });
    });
    // Sort dates in descending order (Newest first)
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
};

const allDates = getAllAttendanceDates();

// 2. Define the fixed columns
const FIXED_COLUMNS = [
    'rollno', 'name', 'batch'
];

// --- Filter Option Generator (for standard filters) ---
const generateOptionsForColumn = (data, columnName, mapData) => {
    // Collect all unique values for the column
    const uniqueValues = Array.from(new Set(data.map(item => item[columnName])));
    
    // Sort and map them into the required { value, label } format
    const options = uniqueValues
        .filter(Boolean) 
        .sort((a, b) => a.localeCompare(b))
        .map(value => ({
            value: value,
            label: value 
        }));

    return [{ value: '', label: `All ${columnName.charAt(0).toUpperCase() + columnName.slice(1)}` }, ...options];
};

// --- HELPER FUNCTIONS FOR DATE RANGE LOGIC ---

// Helper function to get a date X days ago from a start date
const getDateNDaysAgo = (dateStr, days) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - (days - 1)); // -1 because we include the start date
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
};



// --- Main Component ---
const AttendanceManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    // COLUMN VISIBILITY STATE: For dynamic date column visibility (Today, Week, Month)
    const [dateViewMode, setDateViewMode] = useState('LAST_30_DAYS'); 

    // STANDARD ROW FILTERING STATE: For filtering student rows (course, batch, etc.)
    const [activeFilters, setActiveFilters] = useState({
        course: '',
        institute: '',
        level: '',
        package: '',
        batch: '',
        class: '',
    });

    // --- Dynamic Column Calculation based on Date View Mode ---
    const displayedDates = useMemo(() => {
        if (allDates.length === 0) return [];
        
        const newestDate = allDates[0]; 
        let daysToInclude = 0;

        switch (dateViewMode) {
            case 'TODAY':
                daysToInclude = 1;
                break;
            case 'LAST_7_DAYS':
                daysToInclude = 7;
                break;
            case 'LAST_30_DAYS':
                daysToInclude = 30;
                break;
            default:
                daysToInclude = 30; 
        }

        const startDate = getDateNDaysAgo(newestDate, daysToInclude);
        
        const filteredDates = allDates.filter(date => date >= startDate && date <= newestDate);
        
        return filteredDates;
    }, [dateViewMode]); 


    // The final column order: Fixed columns first, then the *filtered* date columns
    const ATTENDANCE_COLUMN_ORDER = useMemo(() => {
        return [...FIXED_COLUMNS, ...displayedDates];
    }, [displayedDates]);

    // Dynamic Column Display Name Generator
    const columnDisplayNameMap = useMemo(() => {
        const fixedDisplayNames = {
            rollno: 'Roll No',
            name: 'Student Name',
            batch: 'Batch',
        };

        const dateDisplayNames = displayedDates.reduce((acc, dateKey) => {
            // Use just the day number (e.g., '01', '20')
            const day = dateKey.slice(-2); 
            acc[dateKey] = day; 
            return acc;
        }, {});

        return { ...fixedDisplayNames, ...dateDisplayNames };
    }, [displayedDates]);


    // Handlers
    const handleDateViewModeChange = useCallback((mode) => {
        setDateViewMode(mode);
    }, []);


    // Handler to update the STANDARD row filter state (course, batch, etc.)
    const handleFilterChange = useCallback((column, value) => {
        setActiveFilters(prev => ({ ...prev, [column]: value }));
    }, []);
    
    // Handler for the global search bar
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    // Memoized Standard Filter Definitions for DynamicTable (for fixed columns)
    const attendanceFilterDefinitions = useMemo(() => {
        return {
            course: generateOptionsForColumn(studentAttendanceData, 'course', COURSES_DATA),
            institute: generateOptionsForColumn(studentAttendanceData, 'institute', INSTITUTES_DATA),
            level: generateOptionsForColumn(studentAttendanceData, 'level', COURSES_LEVELS_DATA),
            package: generateOptionsForColumn(studentAttendanceData, 'package', Programme_DATA),
            batch: generateOptionsForColumn(studentAttendanceData, 'batch', BATCHES_DATA),
            class: generateOptionsForColumn(studentAttendanceData, 'class', CLASSES_DATA),
        };
    }, []);
    
    // Memoized Filtered and Transformed Data Calculation
    const getFilteredAndDailyAttendanceData = useMemo(() => {
        

        let data = studentAttendanceData;

        // 1. APPLY STANDARD COLUMNAR FILTERS (course, batch, etc.)
        const standardFilterKeys = ['course', 'institute', 'level', 'package', 'batch', 'class'];
        
        standardFilterKeys.forEach(key => {
            const filterValue = activeFilters[key];
            if (filterValue) {
                data = data.filter(student => student[key] === filterValue);
            }
        });

        // 2. Filter by search query (name or roll number)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(student => {
                return (
                    student.name.toLowerCase().includes(query) ||
                    String(student.rollno).includes(query)
                );
            });
        }
        
        // 3. Transform data for the table display
        return data.map(student => {
            const transformedStudent = { ...student };
            const attendanceMap = new Map(student.attendance.map(a => [a.date, a.status]));

            // Add ONLY the columns for the currently *displayed* date range
            displayedDates.forEach(date => {
                transformedStudent[date] = attendanceMap.get(date) || 'N/A';
            });
            
            // Remove the original 'attendance' array and redundant filter columns
            delete transformedStudent.attendance;
            delete transformedStudent.institute;
            delete transformedStudent.course;
            delete transformedStudent.level;
            delete transformedStudent.package;
            delete transformedStudent.class;
            
            return transformedStudent;
        });

    }, [activeFilters, searchQuery, displayedDates]); 

    // Helper functions for title and buttons
    const tableTitle = `Student Daily Attendance Records`;
    // const addNewButtonLabel = 'Export Attendance'; // This is for the table's internal export/add button
    const pageTitle = 'Student Attendance Management';
    
    // Handler for the new Export button next to the page title
    const handleExport = useCallback(() => {
        alert("Simulating global export of all visible data!");
    }, []);

    // --- NEW: Handle Imported Data ---
    // This callback is passed to DynamicTable. When the user imports a file, 
    // DynamicTable parses it and calls this function with the JSON data.
    const handleDataImported = useCallback((importedData) => {
        console.log("Imported Data:", importedData);
        alert(`Successfully imported ${importedData.length} records! Check the console for data.`);
        // Here you would typically merge 'importedData' with your 'studentAttendanceData' state
    }, []);

    return (
        // Corrected main wrapper class
        <div className="atm_wrapper"> 
            
            <div className='title-and-export-row'>
                <h1 className="atm_section-title">{pageTitle}</h1>
                
            </div>

            {/* The DynamicTable component is likely intended to be the main table display */}
            <div className="attendance-table-container"> 
                <DynamicTable
                    data={getFilteredAndDailyAttendanceData}
                    columnOrder={ATTENDANCE_COLUMN_ORDER} 
                    columnDisplayNameMap={columnDisplayNameMap} 
                    title='Attendance' 
                    // Standard Row Filter Props (for Course, Batch, etc.)                                             
                    filterDefinitions={attendanceFilterDefinitions}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    
                    // Other Props
                    columnVisibilityDefinition={true}
                    onSearch={handleSearchChange}
                    searchQuery={searchQuery}
                    // The DynamicTable already has an export-style button which we will keep
                    onAddNew={() => alert(`Simulating table-level action: Export Attendance`)} 
                    add_new_button_label={'Export Filtered Attendance'} 

                    // --- ENABLE IMPORT FUNCTIONALITY ---
                    // By passing this prop, DynamicTable enables its internal Import button 
                    // and handles the file selection logic.
                    onDataImported={handleDataImported}
                />
            </div>
        </div>
    );
};

export default AttendanceManagement;