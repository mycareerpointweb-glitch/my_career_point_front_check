import CardSlider from '../../Components/Reusable/CardSlider';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle, FiBookOpen, FiChevronDown, FiChevronUp, FiLayers, FiBox } from "react-icons/fi";
import "../../Styles/SuperAdmin/CourseAndManagement.css";
import DynamicTable from '../../Components/Reusable/DynamicTable';

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
// --- PACKAGE DATA (Kept but no longer rendered/used for logic) ---
const Programme_DATA = new Map([
    ['PKG_ID001', 'Junior Pack'],
    ['PKG_ID002', 'Sure Pass'],
    ['PKG_ID003', 'Remastered Pack']
]);

// Static list of available teachers for the mock form
const AVAILABLE_TEACHERS = [
    'Mr. Ramesh Krishnan', 
    'Ms. Deepa Srinivasan', 
    'Mr. S. Gopinath', 
    'Ms. Kavitha Raj', 
    'Mr. Aravind Kumar',
    'Ms. Priya Shankar',
];

// Helper to generate a date offset from today
const getDate = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().split('T')[0];
};

// =================================================================
// === MODIFIED DATA STRUCTURE FOR CHAPTERS AND TOPICS (UNCHANGED FROM LAST STEP) ===
// =================================================================
const SUBJECTS_WITH_CHAPTERS_DATA = [
    { 
        code: 'CA101', name: 'Financial Accounting', chapters: 10, periods: 65, teacher: 'Mr. Ramesh Krishnan', 
        chapters_data: [
            { 
                id: 'C01', chapter_name: 'Introduction to Accounting', created_by: 'Admin 1', 
                created_on: getDate(10), total_hours: 15, 
              topics: [
                  { id: 'T01', topic_name: 'GAAP Basics', created_by: 'Tutor A', created_on: getDate(10), total_hours: 3 },
                  { id: 'T02', topic_name: 'Accounting Equation', created_by: 'Tutor A', created_on: getDate(10), total_hours: 4 },
                  { id: 'T03', topic_name: 'Types of Accounts', created_by: 'Tutor B', created_on: getDate(8), total_hours: 2 },
                  { id: 'T04', topic_name: 'Debit/Credit Rules', created_by: 'Tutor B', created_on: getDate(9), total_hours: 3 },
                  { id: 'T05', topic_name: 'Journal Entries', created_by: 'Tutor C', created_on: getDate(11), total_hours: 3 }
              ] 
            },
            { 
                id: 'C02', chapter_name: 'Rectification of Errors', created_by: 'Admin 2', 
                created_on: getDate(5), total_hours: 12, 
              topics: [
                  { id: 'T06', topic_name: 'Errors of Omission', created_by: 'Tutor D', created_on: getDate(5), total_hours: 2 },
                  { id: 'T07', topic_name: 'One-Sided Errors', created_by: 'Tutor D', created_on: getDate(5), total_hours: 3 },
                  { id: 'T08', topic_name: 'Two-Sided Errors', created_by: 'Tutor E', created_on: getDate(4), total_hours: 3 },
                  { id: 'T09', topic_name: 'Suspense Account', created_by: 'Tutor E', created_on: getDate(4), total_hours: 2 },
                  { id: 'T10', topic_name: 'Pre-Audit Errors', created_by: 'Tutor F', created_on: getDate(4), total_hours: 2 }
              ] 
            }
        ]
    },
    { 
        code: 'CA102', name: 'Cost Accounting', chapters: 8, periods: 60, teacher: 'Ms. Deepa Srinivasan', 
        chapters_data: [
            { 
                id: 'C03', chapter_name: 'Material Costing', created_by: 'Admin 1', 
                created_on: getDate(7), total_hours: 20, 
              topics: [
                  { id: 'T11', topic_name: 'FIFO & LIFO', created_by: 'Tutor A', created_on: getDate(7), total_hours: 5 },
                  { id: 'T12', topic_name: 'Economic Order Qty', created_by: 'Tutor B', created_on: getDate(7), total_hours: 5 },
                  { id: 'T13', topic_name: 'Stock Levels', created_by: 'Tutor C', created_on: getDate(5), total_hours: 4 },
                  { id: 'T14', topic_name: 'Voucher System', created_by: 'Tutor D', created_on: getDate(6), total_hours: 3 },
                  { id: 'T15', topic_name: 'Bill of Materials', created_by: 'Tutor E', created_on: getDate(8), total_hours: 3 }
              ] 
            }
        ]
    },
];

// --- SearchableDropdown Component (Unchanged) ---
const SearchableDropdown = ({ options, selectedValues, onToggle, label }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(""); // Clear search when closing
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to calculate the label based on selected values
    const getDropdownLabel = () => {
        if (selectedValues.length === 0) return `Select ${label}`;
        if (selectedValues.length === 1) return selectedValues[0];
        return `${selectedValues.length} ${label} selected`;
    };

    return (
        <div className="cm_dropdown-wrapper" ref={dropdownRef}>
            <label className="cm_dropdown-label">{label}</label>
            <div
                className={`cm_dropdown-header ${isOpen ? 'cm_open' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                role="button"
            >
                <span>{getDropdownLabel()}</span>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {isOpen && (
                <div className="cm_dropdown-list">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="cm_dropdown-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className="cm_dropdown-item"
                                onClick={() => onToggle(option.value)}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={selectedValues.includes(option.value)}
                                />
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="cm_dropdown-no-results">No results found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- NEW: AddSubjectModal Component (Unchanged) ---
const AddSubjectModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
        name: '',
        code: '',
        chapters: 5,
        periods: 50,
        teacher: AVAILABLE_TEACHERS[0]
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    // Corrected class usage: cm_model-overlay is the fixed container
    return (
        <div className="cm_model-overlay active cm_add-subject-modal-overlay"> 
            <div className="cm_model-content">
                <div className="cm_modal-header">
                    <h3><FiBookOpen /> Add New Subject</h3>
                    <FiX onClick={onClose} className="cm_close-modal" />
                </div>
                <form onSubmit={handleSubmit}>
                    
                    {/* Subject Name */}
                    <div className="cm_form-group">
                        <label htmlFor="subjectName">Subject Name <span className="required">*</span></label>
                        <input
                            id="subjectName"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., Advanced Auditing"
                            required
                        />
                    </div>

                    {/* Subject Code */}
                    <div className="cm_form-group">
                        <label htmlFor="subjectCode">Subject Code <span className="required">*</span></label>
                        <input
                            id="subjectCode"
                            name="code"
                            type="text"
                            value={form.code}
                            onChange={handleChange}
                            placeholder="e.g., ADT501"
                            required
                        />
                    </div>

                    {/* Chapters and Periods Row (Uses cm_form-row for horizontal layout defined in CSS) */}
                    <div className="cm_form-row">
                        <div className="cm_form-group">
                            <label htmlFor="chapters">Total Chapters</label>
                            <input
                                id="chapters"
                                name="chapters"
                                type="number"
                                min="1"
                                value={form.chapters}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="cm_form-group">
                            <label htmlFor="periods">Estimated Periods</label>
                            <input
                                id="periods"
                                name="periods"
                                type="number"
                                min="10"
                                value={form.periods}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Teacher Dropdown */}
                    <div className="cm_form-group">
                        <label htmlFor="teacher">Default Teacher</label>
                        <select
                            id="teacher"
                            name="teacher"
                            value={form.teacher}
                            onChange={handleChange}
                            required
                        >
                            {AVAILABLE_TEACHERS.map(teacher => (
                                <option key={teacher} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cm_modal-actions">
                        <button type="button" className="cm_btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cm_btn-primary"><FiPlus/> Add Subject</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component ---
const CourseManagement = () => {
    // Column orders
    const subjectColumnOrder = ['code', 'name', 'chapters', 'periods', 'teacher'];
    
    // =================================================================
    // === MODIFIED COLUMN ORDERS: Added 'sno' ===
    // =================================================================
    // New fields: sno, chapter_name, created_by, created_on, total_hours
    const chapterColumnOrder = ['sno', 'chapter_name', 'created_by', 'created_on', 'total_hours'];
    // New fields: sno, topic_name, created_by, created_on, total_hours
    const topicColumnOrder = ['sno', 'topic_name', 'created_by', 'created_on', 'total_hours'];


    // =====================================
    // === NEW: SCROLL REFS ===
    // =====================================
    const coursesRef = useRef(null);
    const levelsRef = useRef(null);
    const subjectsTableRef = useRef(null);
    const chapterDetailsRef = useRef(null);


    const [activeCourseId, setActiveCourseId] = useState(null);
    const [activeLevelId, setActiveLevelId] = useState(null);
    const [activeMaterialId, setActiveMaterialId] = useState(null);
    
    // --- NEW: Subject data moved to state to allow imports ---
    const [subjectsData, setSubjectsData] = useState(SUBJECTS_WITH_CHAPTERS_DATA);
    
    // State for selected subject row data (full object)
    const [selectedSubject, setSelectedSubject] = useState(null);
    // State for selected chapter row data (full object)
    const [selectedChapter, setSelectedChapter] = useState(null);
    
    // NEW STATE: State holding the ID of the currently selected row (used exclusively for CSS highlighting)
    const [selectedRowId, setSelectedRowId] = useState(null); 


    // Modals
    const [addCourseOpen, setAddCourseOpen] = useState(false);
    const [addLevelOpen, setAddLevelOpen] = useState(false);
    const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false); 
    
    const [newCourseForm, setNewCourseForm] = useState({ id: null, name: '', stream: null, notes: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Search Terms (Kept for consistency)
    const [courseSearchTerm, setCourseSearchTerm] = useState("");
    // State for DynamicTable search
    const [tableSearchTerm, setTableSearchTerm] = useState(""); 
    
    // Filtered Subjects Data for DynamicTable 
    const filteredSubjects = useMemo(() => {
        if (!activeLevelId) return [];
        // Use subjectsData (from state) instead of const
        if (!tableSearchTerm) return subjectsData; 
        
        const lowerCaseSearch = tableSearchTerm.toLowerCase();
        
        // Use subjectsData (from state) instead of const
        return subjectsData.filter(subject => 
            subject.name.toLowerCase().includes(lowerCaseSearch) ||
            subject.code.toLowerCase().includes(lowerCaseSearch) ||
            subject.teacher.toLowerCase().includes(lowerCaseSearch)
        );
    }, [activeLevelId, tableSearchTerm, subjectsData]); // <-- Added subjectsData dependency
    
    // =================================================================
    // === HANDLERS ===
    // =================================================================
    
    // --- *** NEW: Handler for Imported Excel Data *** ---
    const handleDataImported = (importedJson) => {
        if (!activeLevelId) {
            alert("Please select a Course and Level before importing subjects.");
            return;
        }

        const newSubjects = importedJson.map((row, index) => {
            // Basic validation/formatting from Excel
            // Assumes Excel headers like: code, name, chapters, periods, teacher
            return {
                code: row.code || `IMP${Date.now() + index}`,
                name: row.name || "Imported Subject",
                chapters: parseInt(row.chapters, 10) || 0,
                periods: parseInt(row.periods, 10) || 0,
                teacher: row.teacher || AVAILABLE_TEACHERS[0], // Default teacher
                chapters_data: [] // Imported subjects start with no chapters
            };
        });

        // Add new subjects to the state
        setSubjectsData(prev => [...newSubjects, ...prev]);

        alert(`Successfully imported ${newSubjects.length} subjects.`);
    };

    // UPDATED HANDLER: To handle the row click action on the Subjects table
    const handleSubjectRowClick = (subjectCode) => {
        // Find the full subject object based on the returned code/ID
        // Use subjectsData (from state) instead of const
        const subject = subjectsData.find(s => s.code === subjectCode);

        if (selectedSubject?.code === subjectCode) {
            // Collapse: Clear both selection states
            setSelectedSubject(null);
            setSelectedChapter(null); 
            setSelectedRowId(null);
        } else {
            // Select: Set both selection states
            setSelectedSubject(subject);
            setSelectedChapter(null); 
            setSelectedRowId(subjectCode);
        }
    };
    
    // NEW HANDLER: To handle row click on the Chapters table
    const handleChapterRowClick = (chapterId) => {
        // Find chapter by ID (assuming ID is unique within selectedSubject's chapters_data)
        const chapter = selectedSubject.chapters_data.find(c => c.id === chapterId);
        
        // This table uses 'id' for the unique identifier
        const chapterUniqueId = chapterId;

        if (selectedChapter?.id === chapterId) {
            // Collapse: Clear both selection states
            setSelectedChapter(null);
            // Ensure the main selection remains the subject ID
            setSelectedRowId(selectedSubject.code); 
        } else {
            // Select: Set the selected chapter, update the main row ID for highlighting
            setSelectedChapter(chapter);
            setSelectedRowId(chapterUniqueId);
        }
    }
    
    // NEW HANDLER: To handle Approve/Reject status change for a Chapter
    const handleChapterStatusChange = (chapterId, newStatus) => {
        alert(`Mock: Changing Chapter ID ${chapterId} status to ${newStatus}. This action would typically trigger a data update.`);
        // Note: In a real app, you would dispatch an action or make an API call here.
        // For the mock, we just confirm the action was triggered.
    }
    
    // NEW HANDLER: To handle Approve/Reject status change for a Topic
    const handleTopicStatusChange = (topicId, newStatus) => {
        alert(`Mock: Changing Topic ID ${topicId} status to ${newStatus}.`);
    }


    const handleCourseSelect = (courseId) => {
        setActiveCourseId(courseId);
        setActiveLevelId(null);
        setActiveMaterialId(null);
        setSelectedSubject(null); 
        setSelectedChapter(null);
        setSelectedRowId(null);
        setNewCourseForm(prev => ({ ...prev, stream: COURSES_DATA.get(courseId) || null }));
    };

    const handleLevelSelect = (levelId) => {
        setActiveLevelId(levelId);
        setActiveMaterialId(null);
        setSelectedSubject(null); 
        setSelectedChapter(null);
        setSelectedRowId(null);
        setTableSearchTerm(''); 
    };
    
    const handleAddCourseClick = (isLevel = false) => {
        if (isLevel && !activeCourseId) {
            alert("Please select a Stream/Course before adding a Level.");
            return;
        }

        const streamName = activeCourseId ? COURSES_DATA.get(activeCourseId) : null;

        setNewCourseForm({
            id: null,
            name: '',
            stream: streamName,
            notes: ''
        });
        if (isLevel) {
            setAddLevelOpen(true);
        } else {
            setAddCourseOpen(true);
        }
    };

    const handleAddCourseSubmit = (e) => {
        e.preventDefault();

        if (!newCourseForm.name.trim()) {
            alert("Name is required.");
            return;
        }

        const isLevel = !!newCourseForm.stream;
        alert(`Mock: Saved new ${isLevel ? 'Level' : 'Stream'}: ${newCourseForm.name}`);

        if (isLevel) {
            setAddLevelOpen(false);
        } else {
            setAddCourseOpen(false);
        }

        setNewCourseForm({ id: null, name: '', stream: null, notes: '' });
    };

    const handleDeleteClick = (type, id) => {
        setConfirmDelete({ type, id });
    };

    const handleConfirmDelete = () => {
        if (!confirmDelete) return;

        alert(`Mock: Deleted ${confirmDelete.type} with ID: ${confirmDelete.id}`);

        setConfirmDelete(null);
        if (confirmDelete.type === 'course') {
            setActiveCourseId(null);
            setActiveLevelId(null);
        } else if (confirmDelete.type === 'level') {
            setActiveLevelId(null);
        }
    };

    // Mock handlers for the DynamicTable actions (Edit/Delete)
    const handleEditMaterial = (item) => {
        alert(`Mock: Editing Subject: ${item.name} (${item.code})`);
    };

    const handleDeleteMaterial = (item) => {
        alert(`Mock: Deleting Subject: ${item.name} (${item.code})`);
        // You'd typically open the confirmDelete modal here:
        // handleDeleteClick('material', item.code);
    };
    
    // Handler for the Add New Subject button in DynamicTable
    const handleAddSubject = () => {
        setAddSubjectModalOpen(true);
    };
    
    const handleSubjectFormSubmit = (formData) => {
        // Create a new subject object
        const newSubject = {
            ...formData,
            chapters_data: [] // New subjects start with no chapters
        };
        // Add the new subject to the state
        setSubjectsData(prev => [newSubject, ...prev]);
        
        alert(`Mock: Successfully added new subject: ${formData.name} (${formData.code})`);
        setAddSubjectModalOpen(false);
    }
    
    // Handler for the Search input in DynamicTable
    const handleTableSearch = (query) => {
        setTableSearchTerm(query);
    };
    
    
    // =====================================
    // === SCROLL EFFECTS ===
    // =====================================
    const scrollToRef = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // EFFECT 1: Scroll to Top on Mount
    useEffect(() => {
        // Scroll to top when the component mounts/is visited
        window.scrollTo(0, 0);
    }, []);

    // Scroll to Levels when Course is selected
    useEffect(() => {
        if (activeCourseId) {
            scrollToRef(levelsRef);
        }
    }, [activeCourseId]);

    // Scroll to Subjects Table when Level is selected
    useEffect(() => {
        if (activeLevelId) {
            // Give a short delay to allow the table to render completely
            const timer = setTimeout(() => {
                scrollToRef(subjectsTableRef);
            }, 100); 
            return () => clearTimeout(timer);
        }
    }, [activeLevelId]);

    // Scroll to Chapter Details when a Subject is selected
    useEffect(() => {
        if (selectedSubject) {
            // Use a short delay for the chapter details section to render
            const timer = setTimeout(() => {
                scrollToRef(chapterDetailsRef);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedSubject]);
    
    // Scroll to Chapter Details when a Chapter is selected (if needed, but usually handled by the one above)
    // We can rely on the selectedSubject effect to scroll to the area, then handle internal focus if necessary.
    // However, since selecting a chapter expands content (Topics), we can scroll again to center the new content.
    useEffect(() => {
        if (selectedChapter) {
            const timer = setTimeout(() => {
                scrollToRef(chapterDetailsRef); // Scroll to the container
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [selectedChapter]);
    // =====================================
    // === END SCROLL EFFECTS ===
    // =====================================


    // =================================================================
    // 4. RENDER FUNCTIONS
    // =================================================================

    const renderCourseSelection = () => (
        // No ref needed here as this is the starting point
        <div className="cm_step-card cm_step-1">
            <CardSlider
                institutes={COURSES_DATA}
                title='Courses'
                icon_title="Courses"
                fromTabOf="Courses"
                onSelectInstitute={handleCourseSelect}
            />
        </div>
    );

    const renderLevelSelection = () => activeCourseId && (
        // Attach ref for auto-scrolling when Course is selected
        <div ref={levelsRef} className="cm_step-card cm_step-2">
            <CardSlider
                institutes={COURSES_LEVELS_DATA}
                title='Levels'
                icon_title="Levels"
                fromTabOf="Levels"
                onSelectInstitute={handleLevelSelect}
            />
        </div>
    );


    const renderMaterialsTable = () => activeLevelId && (
            // Attach ref for auto-scrolling when Level is selected
            <div ref={subjectsTableRef} className="cm_step-card cm_step-3">
                <DynamicTable
                    data={filteredSubjects} 
                    unfilteredData={subjectsData} // <-- ADDED for "Export Without Filters"
                    onDataImported={handleDataImported} // <-- ADDED for Import
                    
                    // Using 'code' as the unique ID for the subjects table
                    columnOrder={subjectColumnOrder} 
                    onEdit={handleEditMaterial}
                    onDelete={handleDeleteMaterial}
                    title={`Subjects`}
                    onSearch={handleTableSearch}
                    onAddNew={handleAddSubject}
                    customDescription="** Select rows to view Chapters approve **"
                    userRole={'teacher'}
                    // ROW CLICK PROPS
                    onRowClickable={true}
                    onRowClick={handleSubjectRowClick} 
                    selectedRowId={selectedSubject ? selectedSubject.code : null}
                />
            </div>
    );
    
    const renderChapterDetails = () => selectedSubject && (
        // Attach ref for auto-scrolling when Subject is selected
        <div ref={chapterDetailsRef} className="cm_step-card cm_chapter-separate-section">
            
            <DynamicTable
                data={selectedSubject.chapters_data}
                columnOrder={chapterColumnOrder}
                title="Chapters"
                customDescription="** Select rows to view Topics **"

                // Removed status/pill/onStatusChange props as the data structure changed
                // onStatusChange={handleChapterStatusChange}
                // pillColumns={['approved_status']}
                
                // ROW CLICK PROPS for expanding/collapsing topics
                onRowClickable={true}
                onRowClick={handleChapterRowClick}
                selectedRowId={selectedChapter ? selectedChapter.id : null}
            />
            
            {/* Show Topics Table when a chapter is selected */}
            {selectedChapter && (
                <div className="cm_chapter-details-topics">
                    <DynamicTable
                        data={selectedChapter.topics}
                        columnOrder={topicColumnOrder}
                        title="Topics"
                        // Removed status/pill/onStatusChange props as the data structure changed
                        // pillColumns={['status']}
                        // onStatusChange={handleTopicStatusChange} 
                    />
                </div>
            )}
        </div>
    );


    return (
        <div className="cm_wrapper">
            <h1 className="cm_title">Course and Material Management</h1>

            {renderCourseSelection()}
            {renderLevelSelection()}
            {renderMaterialsTable()}

            {/* NEW: Render Chapter Details below the main table */}
            {renderChapterDetails()}


            {/* --- Modals --- */}

            {/* ADD STREAM/COURSE MODAL */}
            {addCourseOpen && (
                 <div className={`cm_model-overlay ${addCourseOpen ? 'active' : ''}`}> 
                    <div className="cm_model-content">
                        <div className="cm_modal-header">
                            <h3><FiBookOpen /> Add New Stream / Course</h3>
                            <FiX onClick={() => setAddCourseOpen(false)} className="cm_close-modal" />
                        </div>
                        <form onSubmit={handleAddCourseSubmit}>
                            <div className="cm_form-group">
                                <label htmlFor="courseName">Stream / Course Name <span className="required">*</span></label>
                                <input
                                    id="courseName"
                                    name="name"
                                    type="text"
                                    value={newCourseForm.name}
                                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Chartered Accountant"
                                    required
                                />
                            </div>

                            <div className="cm_form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={newCourseForm.notes || ''}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setNewCourseForm(prev => ({ ...prev, notes: value })); // Changed to 'notes'
                                    }}
                                    placeholder="Add a brief note or description (optional)."
                                />
                            </div>

                            <div className="cm_modal-actions">
                                <button type="button" className="cm_btn-outline" onClick={() => setAddCourseOpen(false)}>Cancel</button>
                                <button type="submit" className="cm_btn-primary"><FiPlus/> Save Stream</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD LEVEL MODAL (Conditional on activeCourseId) */}
            {addLevelOpen && activeCourseId && (
                <div className={`cm_model-overlay ${addLevelOpen ? 'active' : ''}`}>
                    <div className="cm_model-content">
                        <div className="cm_modal-header">
                            <h3><FiLayers /> Add New Level to {newCourseForm.stream}</h3>
                            <FiX onClick={() => setAddLevelOpen(false)} className="cm_close-modal" />
                        </div>
                        <form onSubmit={handleAddCourseSubmit}>
                            <div className="cm_form-group">
                                <label htmlFor="levelName">Level Name <span className="required">*</span></label>
                                <input
                                    id="levelName"
                                    name="name"
                                    type="text"
                                    value={newCourseForm.name}
                                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Foundation, Final"
                                    required
                                />
                            </div>

                            <div className="cm_form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={newCourseForm.notes || ''}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setNewCourseForm(prev => ({ ...prev, notes: value })); // Changed to 'notes'
                                    }}
                                    placeholder="Add a brief note or description (optional). "
                                />
                            </div>


                            <div className="cm_modal-actions">
                                <button type="button"
                                    className="cm_btn-outline"
                                    onClick={() => setAddLevelOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="cm_btn-primary">
                                    <FiPlus/> Save Level
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* NEW: ADD SUBJECT MODAL (Corrected overlay class and explicitly adding 'active') */}
            {addSubjectModalOpen && (
                <div className={`cm_model-overlay ${addSubjectModalOpen ? 'active' : ''}`}>
                    <AddSubjectModal 
                        onClose={() => setAddSubjectModalOpen(false)}
                        onSubmit={handleSubjectFormSubmit}
                    />
                </div>
            )}


            {/* DELETE CONFIRMATION POPUP (Corrected overlay class and explicitly adding 'active') */}
            {confirmDelete && (
                <div className={`cm_model-overlay ${confirmDelete ? 'active' : ''}`}>
                    <div className="cm_model-content cm_confirm-popup">
                        <FiAlertTriangle size={32} className="cm_confirm-icon" />
                        <h4>Confirm Deletion</h4>
                        <p>Are you sure you want to **delete** the selected {confirmDelete.type}? This action is irreversible.</p>
                        <div className="cm_modal-actions">
                            <button
                                className="cm_btn-secondary"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="cm_btn-delete"
                                onClick={handleConfirmDelete}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CourseManagement;