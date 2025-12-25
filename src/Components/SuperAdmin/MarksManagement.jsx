import React, { useState, useMemo, useCallback } from 'react';
import "../../Styles/SuperAdmin/AttendanceManagement.css"; 
import DynamicTable from "../Reusable/DynamicTable";

// --- STATIC CONSTANTS ---
const SUBJECTS_LIST = [
    "Financial Accounting",
    "Business Laws",
    "Microeconomics",
    "Business Statistics",
    "Marketing Management"
];

const UNITS_LIST = [
    "Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5",
    "Unit 6", "Unit 7", "Unit 8", "Unit 9", "Unit 10"
];

// --- HELPER TO GENERATE MARKS ---
const generateMarks = () => {
    const marks = [];
    SUBJECTS_LIST.forEach(subject => {
        UNITS_LIST.forEach(unit => {
            marks.push({
                subject: subject,
                unit: unit,
                score: Math.floor(Math.random() * (100 - 40 + 1)) + 40
            });
        });
    });
    return marks;
};

// --- DATA: 5 Students ---
const studentMarksData = [
    {
      name: "Aarav Sharma", rollno: 1001, 
      institute: "The Institute of Chartered Accountants of India", 
      course: "Chartered Accountant (CA)", 
      level: "Intermediate", 
      package: "Sure Pass", 
      batch: "CA-Intermediate-Apr", 
      class: "CLASS B", 
      marks: generateMarks()
    },
    {
      name: "Siya Patel", rollno: 1002, 
      institute: "The Institute of Cost Accountants of India", 
      course: "Cost Management Accountant (CMA)", 
      level: "Foundation", 
      package: "Junior Pack", 
      batch: "CMA-Foundation-Apr", 
      class: "CLASS A", 
      marks: generateMarks()
    },
    {
      name: "Rohan Verma", rollno: 1003, 
      institute: "The Institute of Chartered Accountants of India", 
      course: "Chartered Accountant (CA)", 
      level: "Foundation", 
      package: "Remastered Pack", 
      batch: "CA-Foundation-Apr", 
      class: "CLASS D", 
      marks: generateMarks()
    },
    {
      name: "Meera Singh", rollno: 1004, 
      institute: "The Institute of Company Secretaries of India", 
      course: "Chartered Accountant (CA)", 
      level: "Final", 
      package: "Sure Pass", 
      batch: "CA-Intermediate-Apr", 
      class: "CLASS B", 
      marks: generateMarks()
    },
    {
      name: "Advait Rao", rollno: 1005, 
      institute: "The Institute of Cost Accountants of India", 
      course: "Cost Management Accountant (CMA)", 
      level: "Intermediate", 
      package: "Junior Pack", 
      batch: "CMA-Intermediate-Apr", 
      class: "CLASS C", 
      marks: generateMarks()
    }
];

// Fixed columns
const FIXED_COLUMNS = ['rollno', 'name', 'course', 'batch'];

// Helper for standard options
const generateOptionsForColumn = (data, columnName) => {
    const uniqueValues = Array.from(new Set(data.map(item => item[columnName])));
    const options = uniqueValues.filter(Boolean).sort().map(value => ({ value, label: value }));
    return [{ value: '', label: `All ${columnName.charAt(0).toUpperCase() + columnName.slice(1)}` }, ...options];
};

const MarksManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // --- UNIFIED FILTER STATE ---
    const [activeFilters, setActiveFilters] = useState({
        subject: SUBJECTS_LIST[0], 
        unit: '',                  
        course: '',
        institute: '',
        level: '',
        package: '',
        batch: '',
        class: ''
    });

    // --- COLUMN ORDER LOGIC ---
    // Columns only change if the user EXPLICITLY selects a specific unit.
    const MARKS_COLUMN_ORDER = useMemo(() => {
        if (activeFilters.unit) {
            return [...FIXED_COLUMNS, activeFilters.unit];
        }
        return [...FIXED_COLUMNS, ...UNITS_LIST];
    }, [activeFilters.unit]);

    // --- FILTER CHANGE HANDLER ---
    const handleFilterChange = useCallback((column, value) => {
        if (column === 'subject' && value === '') {
             setActiveFilters(prev => ({ ...prev, [column]: SUBJECTS_LIST[0] }));
             return;
        }
        setActiveFilters(prev => ({ ...prev, [column]: value }));
    }, []);
    
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    // --- IMPORT VISIBILITY LOGIC ---
    // 1. We list the "Mandatory" filters that MUST be selected.
    // 2. We deliberately EXCLUDE 'unit' from this list (so "All Units" is allowed).
    const showImport = useMemo(() => {
        const mandatoryFilters = ['course', 'institute', 'level', 'package', 'batch', 'class'];
        
        // Check: Do ALL of these filters have a specific value (not empty string)?
        const allMandatorySelected = mandatoryFilters.every(key => activeFilters[key] !== '');

        return allMandatorySelected;
    }, [activeFilters]);

    // --- FILTER DEFINITIONS ---
    const marksFilterDefinitions = useMemo(() => {
        return {
            subject: SUBJECTS_LIST.map(s => ({ value: s, label: s })), 
            unit: [{ value: '', label: 'All Units' }, ...UNITS_LIST.map(u => ({ value: u, label: u }))],
            course: generateOptionsForColumn(studentMarksData, 'course'),
            institute: generateOptionsForColumn(studentMarksData, 'institute'),
            level: generateOptionsForColumn(studentMarksData, 'level'),
            package: generateOptionsForColumn(studentMarksData, 'package'),
            batch: generateOptionsForColumn(studentMarksData, 'batch'),
            class: generateOptionsForColumn(studentMarksData, 'class'),
        };
    }, []);
    
    // --- DATA TRANSFORMATION ---
    const getFilteredAndMarksData = useMemo(() => {
        let data = studentMarksData;

        const standardKeys = ['course', 'institute', 'level', 'package', 'batch', 'class'];
        standardKeys.forEach(key => {
            if (activeFilters[key]) {
                data = data.filter(student => student[key] === activeFilters[key]);
            }
        });

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(student => 
                student.name.toLowerCase().includes(query) || String(student.rollno).includes(query)
            );
        }
        
        return data.map(student => {
            const transformedStudent = { ...student };
            const currentSubject = activeFilters.subject;
            const subjectMarks = student.marks.filter(m => m.subject === currentSubject);
            const marksMap = new Map(subjectMarks.map(m => [m.unit, m.score]));

            UNITS_LIST.forEach(unit => {
                transformedStudent[unit] = marksMap.get(unit) || '-';
            });
            
            delete transformedStudent.marks;
            return transformedStudent;
        });

    }, [activeFilters, searchQuery]); 

    return (
        <div className="atm_wrapper"> 
            
            <div className='title-and-export-row' style={{ marginBottom: '10px' }}>
                <h1 className="atm_section-title">Marks Management</h1>
            </div>

            <div className="attendance-table-container"> 
                <DynamicTable
                    data={getFilteredAndMarksData}
                    customDescription="** For uploading marks you have to select all the filters appropriately **"
                    columnOrder={MARKS_COLUMN_ORDER} 
                    title={`${activeFilters.subject} Marks`} 
                    filterDefinitions={marksFilterDefinitions}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    columnVisibilityDefinition={true}
                    onSearch={handleSearchChange}
                    searchQuery={searchQuery}
                    onAddNew={() => alert(`Exporting Marks for ${activeFilters.subject}`)} 
                    add_new_button_label={'Export Marks'} 
                     onExcelFormat="/assets/sample_import.xlsx"
                    
                    // Logic: If 'showImport' is true, we pass the function (showing the button).
                    // If 'showImport' is false, we pass undefined (hiding the button).
                    onDataImported={showImport ? (data) => console.log("Imported:", data) : undefined}
                />
            </div>
        </div>
    );
};

export default MarksManagement;