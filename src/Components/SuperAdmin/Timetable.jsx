import React, { useState, useMemo } from "react";
import '../../Styles/SuperAdmin/Batches.css'; // Reusing existing CSS
import institutionsData from '../dummy.json'; // Acting as local file
import DynamicTable from "../Reusable/DynamicTable"; 
import { FiUploadCloud, FiX, FiDownload } from "react-icons/fi";

// =======================================================
// === 1. DATA FLATTENING LOGIC ===
// =======================================================
const flattenData = (rawData) => {
    const flatRows = [];
    
    // Helper maps
    const coursesRef = (rawData.courses_reference || []).reduce((acc, c) => ({...acc, [c.course_id]: c.course_name}), {});
    const batchesRef = (rawData.batches_reference || []).reduce((acc, b) => ({...acc, [b.batch_id]: b.batch_name}), {});

    (rawData.data || []).forEach(inst => {
        const instName = (rawData.institutions_reference || []).find(i => i.institution_id === inst.institution_id)?.name || inst.institution_id;

        (inst.courses || []).forEach(course => {
            const courseName = coursesRef[course.course_id] || course.course_id;

            (course.levels || []).forEach(level => {
                const levelName = level.level_name;
                const programmeName = "Default Package"; // Mocking Programme

                (level.batches || []).forEach(batch => {
                    const batchName = batchesRef[batch.batch_id] || batch.batch_id;

                    (batch.classes || []).forEach(cls => {
                        flatRows.push({
                            id: cls.class_id, 
                            institution: instName,
                            course: courseName,
                            level: levelName,
                            programme: programmeName,
                            batch: batchName,
                            class_name: cls.class_name,
                            timetable_status: Math.random() > 0.3 ? 'Available' : 'Pending',
                            file_link: `timetable_${cls.class_id}.pdf` 
                        });
                    });
                });
            });
        });
    });

    return flatRows;
};

// =======================================================
// === 2. UPLOAD MODAL ===
// =======================================================
const UploadTimetableModal = ({ onClose, onSubmit }) => {
    return (
        <div className="batch_modal">
            <div className="batch_modal-content">
                <div className="batch_modal-header">
                    <h3><FiUploadCloud /> Upload New Timetable</h3>
                    <FiX onClick={onClose} className="batch_close-modal" />
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                    <div className="batch_form-group">
                        <label>Select File (PDF)</label>
                        <div style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }}>
                            <input type="file" accept="application/pdf" required />
                        </div>
                    </div>
                    <div className="batch_modal-actions">
                        <button type="button" className="batch_btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="batch_btn-primary">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =======================================================
// === 3. MAIN COMPONENT ===
// =======================================================
const Timetable = ({userRole}) => {
    // 1. Init Data
    const [allData] = useState(() => flattenData(institutionsData));
    
    // 2. Filter State
    const [activeFilters, setActiveFilters] = useState({});

    // 3. Modal State
    const [isUploadOpen, setUploadOpen] = useState(false);

    // 4. Generate Filter Definitions dynamically
    const filterDefinitions = useMemo(() => {
        const getOptions = (key) => {
            const unique = [...new Set(allData.map(item => item[key]))].filter(Boolean).sort();
            return unique.map(val => ({ label: val, value: val }));
        };

        return {
            institution: getOptions('institution'),
            course: getOptions('course'),
            level: getOptions('level'),
            programme: getOptions('programme'),
            batch: getOptions('batch'),
            class_name: getOptions('class_name'), // Class Filter Included
        };
    }, [allData]);

    // 5. Filter the Data
    const filteredData = useMemo(() => {
        return allData.filter(row => {
            return Object.keys(activeFilters).every(key => {
                if (!activeFilters[key]) return true;
                return row[key] === activeFilters[key];
            });
        });
    }, [allData, activeFilters]);

    // 6. Handle Filter Change
    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // 7. Check if ALL filters are selected
    // We get the keys from our definitions and check if activeFilters has a value for each
    const areAllFiltersSelected = useMemo(() => {
        const requiredKeys = ['institution', 'course', 'level', 'programme', 'batch', 'class_name'];
        return requiredKeys.every(key => activeFilters[key] && activeFilters[key] !== '');
    }, [activeFilters]);

    // 8. Render Custom "Download" Column content
    const dataWithActions = filteredData.map(row => ({
        ...row,
        download_action: row.timetable_status === 'Available' ? (
            <button 
                className="batch_btn-secondary" 
                style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                onClick={(e) => {
                    e.stopPropagation();
                    alert(`Downloading ${row.file_link}...`);
                }}
            >
                <FiDownload /> Download
            </button>
        ) : (
            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>Pending Upload</span>
        )
    }));

    // 9. Column Configuration
    const columnOrder = [
        'institution', 
        'course', 
        'level', 
        'programme', 
        'batch', 
        'class_name', 
        'download_action'
    ];

    const columnDisplayNames = {
        institution: 'Institute',
        course: 'Course',
        level: 'Level',
        programme: 'Programme',
        batch: 'Batch',
        class_name: 'Class Name',
        download_action: 'Action'
    };

    return (
        <div className="batch_wrapper">
            <h1 className="batch_title">Timetable Management</h1>

            <DynamicTable
                title="Class Timetables"
                data={dataWithActions}
                columnOrder={columnOrder}
                columnDisplayNameMap={columnDisplayNames}
                
                // --- FILTERS ---
                filterDefinitions={filterDefinitions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                customDescription="** You can upload timetables for classes. Please ensure all filters are selected before uploading **"

                // --- CONDITIONAL ADD NEW ---
                // Only pass the function if all filters are selected. 
                // If null/undefined is passed, DynamicTable hides the button.
                onAddNew={areAllFiltersSelected && userRole.toLowerCase() !== "teacher" ? () => setUploadOpen(true) : null}
                
                // --- EXPORT & SAMPLE FORMAT ---
                unfilteredData={allData} // Enables Export button
                userRole="teacher" 
                onExcelFormat="/files/sample_timetable_format.xlsx" // Dummy Sample File Path

                onSearch={(query) => console.log("Searching:", query)}
            />

            {/* Upload Modal */}
            {isUploadOpen && (
                <UploadTimetableModal 
                    onClose={() => setUploadOpen(false)}
                    onSubmit={() => {
                        alert("Mock Upload Successful");
                        setUploadOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Timetable;