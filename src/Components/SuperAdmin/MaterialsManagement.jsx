import "../../Styles/SuperAdmin/MaterialsManagement.css"; 
import CardSlider from "../Reusable/CardSlider";
import DynamicTable from "../Reusable/DynamicTable";
import React, { useState, useEffect, useRef } from "react";
import { 
    FiSearch, FiX, FiPlus, FiChevronLeft, FiChevronRight, 
    FiCheckCircle, FiBookOpen, FiTrash2, 
    FiEdit2, FiFileText, FiFile, FiImage, FiList, FiGrid, 
    FiAlertTriangle, FiBriefcase, FiUpload, FiLink, FiCalendar, FiGlobe,
    FiCheck, FiXOctagon
} from "react-icons/fi"; 


// NOTE: Assuming CardSlider and DynamicTable components are correctly imported and structured

// --- STATIC DATA ---
const MATERIALS_TYPE_DATA = new Map([
    ['MAT_ID001', 'MCP-Materials'],
    ['MAT_ID002', 'MCP-Notes'],
    ['MAT_ID003', 'Class-Notes'], // <-- Target Data Type
    ['MAT_ID004', 'Tasks']        // <-- Target Data Type
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
    ['PKG_ID001', 'surepass'],
    ['PKG_ID002', 'juniore pack'],
    ['PKG_ID003', 'remastered pack']
]);
const BATCHES_DATA = new Map([
    ['BTCH_ID001', 'ca-foundation-surepass-apr'],
    ['BTCH_ID002', 'ca-intermediate-remastered-oct'],
    ['BTCH_ID003', 'ca-final-juniore-jan']
]);
const CLASSES_DATA = new Map([
    ['CLS_ID001', 'a'],
    ['CLS_ID002', 'b'],
    ['CLS_ID003', 'c']
]);

const SUBJECTS_DATA = new Map([
    ['CA101', 'Financial Accounting'],
    ['CA102', 'Cost Accounting'],
    ['CA103', 'Business Law and Ethics'],
    ['CA104', 'Taxation – Direct and Indirect'],
    ['CA105', 'Auditing and Assurance'],
    ['CA106', 'Financial Management'],
    ['CA107', 'Corporate Accounting'],
    ['CA108', 'Management Information Systems'],
    ['CA109', 'Economics for Finance'],
    ['CA110', 'Strategic Management']
]);

const CLASS_NOTES = [
    {
        "material_id": "MAT001",
        "material_type_id": "MAT_ID003", // Added Type ID
        "material_name": "CA101 - Fin Acc Q&A Set 1",
        "size_kb": 512,
        "uploded_date": "2025-10-12",
        "uploaded_by": "Mr. Ramesh Krishnan",
        "subject_code": "CA101",
        "status": "Approved",
        "date_status_change": "2025-10-13", // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'), 
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID001'),
        "course_level_id": 'CSL_ID001',
        "package": "surepass",
        "batch": "ca-foundation-surepass-apr",
        "class": "a"
    },
    {
        "material_id": "MAT002",
        "material_type_id": "MAT_ID003", // Added Type ID
        "material_name": "CA104 - Taxation Chapter 3 Notes",
        "size_kb": 1280,
        "uploded_date": "2025-10-17",
        "uploaded_by": "Ms. Kavitha Raj",
        "subject_code": "CA104",
        "status": "Pending",
        "date_status_change": null, // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'),
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID002'),
        "course_level_id": 'CSL_ID002',
        "package": "remastered pack",
        "batch": "ca-intermediate-remastered-oct",
        "class": "b"
    },
    {
        "material_id": "MAT003",
        "material_type_id": "MAT_ID003", // Added Type ID
        "material_name": "CA105 - Auditing Standards PPT",
        "size_kb": 3072,
        "uploaded_by": "Mr. Aravind Kumar",
        "uploded_date": "2025-09-12",
        "subject_code": "CA105",
        "status": "Approved",
        "date_status_change": "2025-09-12", // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'),
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID003'),
        "course_level_id": 'CSL_ID003',
        "package": "juniore pack",
        "batch": "ca-final-juniore-jan",
        "class": "c"
    },
    {
        "material_id": "MAT004",
        "material_type_id": "MAT_ID003", // Added Type ID
        "material_name": "CA102 - Costing Case Study",
        "size_kb": 850,
        "uploaded_by": "Ms. Deepa Srinivasan",
        "uploded_date": "2025-08-12",
        "subject_code": "CA102",
        "status": "Rejected",
        "date_status_change": "2025-08-13", // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'),
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID001'),
        "course_level_id": 'CSL_ID001',
        "package": "surepass",
        "batch": "ca-foundation-surepass-apr",
        "class": "a"
    }
];

// --- NEW: TASKS DATA ---
const TASKS_DATA = [
    {
        "material_id": "TSK001",
        "material_type_id": "MAT_ID004", // Added Type ID
        "material_name": "CA101 - Week 1 Assignment",
        "size_kb": null, // Tasks might not have a size
        "uploded_date": "2025-10-10",
        "uploaded_by": "Mr. Ramesh Krishnan",
        "subject_code": "CA101",
        "status": "Approved",
        "date_status_change": "2025-10-11", // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'), 
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID001'),
        "course_level_id": 'CSL_ID001',
        "package": "surepass",
        "batch": "ca-foundation-surepass-apr",
        "class": "a"
    },
    {
        "material_id": "TSK002",
        "material_type_id": "MAT_ID004", // Added Type ID
        "material_name": "CA104 - Tax Calculation Task",
        "size_kb": null,
        "uploded_date": "2025-10-18",
        "uploaded_by": "Ms. Kavitha Raj",
        "subject_code": "CA104",
        "status": "Pending",
        "date_status_change": null, // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'),
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID002'),
        "course_level_id": 'CSL_ID002',
        "package": "remastered pack",
        "batch": "ca-intermediate-remastered-oct",
        "class": "b"
    },
    {
        "material_id": "TSK003",
        "material_type_id": "MAT_ID004", // Added Type ID
        "material_name": "CA105 - Audit Report Draft",
        "size_kb": null,
        "uploaded_by": "Mr. Aravind Kumar",
        "uploded_date": "2025-09-15",
        "subject_code": "CA105",
        "status": "Rejected",
        "date_status_change": "2025-09-16", // Added Status Date
        "institute_name": "MACP Academy",
        "institute_id": "INST001",
        "course": COURSES_DATA.get('CS_ID001'),
        "course_id": 'CS_ID001',
        "course_level": COURSES_LEVELS_DATA.get('CSL_ID003'),
        "course_level_id": 'CSL_ID003',
        "package": "juniore pack",
        "batch": "ca-final-juniore-jan",
        "class": "c"
    }
];


const INITIAL_MACP_MATERIALS_DATA= [
    { "material_id": "MAT006", "material_name": "MACP M001 - Fin Acc Overview", "size_kb": 4096, "uploded_date":"2025-11-01", "uploaded_by": "MACP Content Team", "subject_code": "CA101", "status": "Approved", "date_status_change": "2025-11-01" },
    { "material_id": "MAT007", "material_name": "MACP M002 - Costing Theory", "size_kb": 2500, "uploded_date":"2025-11-02", "uploaded_by": "MACP Content Team", "subject_code": "CA102", "status": "Pending", "date_status_change": null }
];


// --- Confirmation Modal (UNMODIFIED) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    
    return (
        <div className="mm_model-overlay active">
            <div className="mm_confirm-modal-content">
                <div className="mm_confirm-modal-header">
                    <h2>{title}</h2>
                    <button className="mm_model-close-btn" onClick={onCancel}>
                        <FiX />
                    </button>
                </div>
                <div className="mm_confirm-modal-body">
                    <FiAlertTriangle size={36} className="mm_confirm-icon" />
                    <p>{message}</p>
                </div>
                <div className="mm_modal-actions">
                    <button type="button" className="mm_btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="mm_btn-danger" onClick={onConfirm}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Material Form Modal (Used for both Add and Edit) (UNMODIFIED) ---
const MaterialFormModal = ({ isOpen, onClose, context, onSubmit, materialData, onEdit }) => {
    
    const getInitialUploadDetails = () => ({ uploadType: 'file', file: null, driveLink: '' });
    
    const initialDetails = getInitialUploadDetails();
    
    const [materialName, setMaterialName] = useState(materialData ? materialData.material_name : '');
    const [description, setDescription] = useState(''); 
    const [uploadType, setUploadType] = useState(initialDetails.uploadType); 
    const [file, setFile] = useState(initialDetails.file); 
    const [driveLink, setDriveLink] = useState(initialDetails.driveLink);
    const [startDate, setStartDate] = useState(materialData ? '2024-01-01' : ''); 
    const [endDate, setEndDate] = useState(materialData ? '2024-12-31' : '');
    const [isDownloadable, setIsDownloadable] = useState(true); 

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 104857600) {
                 alert("File size exceeds 100 MB limit.");
                 setFile(null);
                 e.target.value = null;
            } else {
                setFile(selectedFile);
            }
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const isFileOrLinkMissing = (uploadType === 'file' && !file) || (uploadType === 'link' && !driveLink);
        
        if (!materialName || !startDate || !endDate || isFileOrLinkMissing) {
            alert("Please fill all required fields and ensure a file or link is provided.");
            return;
        }

        const dataToSubmit = {
            material_id: materialData ? materialData.material_id : `TEMP${Date.now()}`,
            material_name: materialName,
            size_kb: file ? Math.round(file.size / 1024) : 'N/A', 
        };
        
        if (materialData) {
            onEdit(dataToSubmit);
        } else {
            onSubmit(dataToSubmit);
        }

        onClose();
    };

    const modalTitle = materialData ? 'Edit Material' : 'Add New Material';

    return (
        <div className="mm_model-overlay active">
            <div className="mm_add-material-modal-content">
                <div className="mm_modal-header">
                    <h2>{materialData ? <FiEdit2/> : <FiPlus/>} {modalTitle}</h2>
                    <button className="mm_model-close-btn" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit} className="mm_modal-form">
                    
                    {/* Non-Editable Context (Simplified) */}
                    <div className="mm_non-editable-context">
                        <div className="mm_context-item"><FiList/> <strong>Material Type:</strong> {context.selectedMaterialType?.name || 'N/A'}</div>
                        <div className="mm_context-item"><FiBookOpen/> <strong>Course:</strong> {context.selectedCourse?.name || 'N/A'}</div>
                        <div className="mm_context-item"><FiGrid/> <strong>Level:</strong> {context.selectedLevel?.name || 'N/A'}</div>
                        <div className="mm_context-item"><FiFileText/> <strong>Subject:</strong> {context.selectedSubject?.name || 'All Subjects'}</div> 
                    </div>

                    <div className="mm_form-group">
                        <label>Material Name *</label>
                        <input 
                            type="text" 
                            value={materialName} 
                            onChange={(e) => setMaterialName(e.target.value)} 
                            required 
                            placeholder="e.g., Chapter 1 Notes (PDF)"
                        />
                    </div>
                    
                    <div className="mm_form-group">
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Brief summary of the material content."
                        />
                    </div>

                    <div className="mm_upload-section">
                        <h4>Upload Content *</h4>
                        <div className="mm_toggle-switch-group">
                             <button type="button" 
                                  className={`mm_btn-toggle ${uploadType === 'file' ? 'mm_active' : ''}`}
                                  onClick={() => setUploadType('file')}>
                                  <FiUpload/> Upload File
                             </button>
                             <button type="button" 
                                  className={`mm_btn-toggle ${uploadType === 'link' ? 'mm_active' : ''}`}
                                  onClick={() => setUploadType('link')}>
                                  <FiLink/> Drive Link
                             </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div className="mm_upload-file-container">
                                <label className="mm_upload-file-btn">
                                    <FiUpload size={18} /> Choose File (Max 100 MB)
                                    <input type="file" onChange={handleFileChange} style={{display: 'none'}} /> 
                                </label>
                                <div className="mm_file-status">
                                    {file ? `Selected: ${file.name}` : 'No file selected.'}
                                </div>
                            </div>
                        ) : (
                            <div className="mm_form-group">
                                <input 
                                    type="url" 
                                    value={driveLink} 
                                    onChange={(e) => setDriveLink(e.target.value)} 
                                    required={uploadType === 'link'}
                                    placeholder="Paste Google Drive/Cloud Link here"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="mm_date-section">
                            <div className="mm_form-group mm_date-group">
                                <label><FiCalendar/> Starting Date *</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="mm_form-group mm_date-group">
                                <label><FiCalendar/> Ending Date *</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                    </div>
                    
                    <div className="mm_form-group mm_download-toggle-group">
                        <label><FiGlobe/> Download Visibility</label>
                        <div className="mm_toggle-container">
                            <span className="mm_toggle-label">Allow Download</span>
                            <label className="mm_switch">
                                <input 
                                    type="checkbox" 
                                    checked={isDownloadable} 
                                    onChange={(e) => setIsDownloadable(e.target.checked)} 
                                />
                                <span className="mm_slider mm_round"></span>
                            </label>
                            <span className="mm_toggle-state">{isDownloadable ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                    
                    <div className="mm_modal-actions">
                        <button type="button" className="mm_btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="mm_btn-primary">
                            {materialData ? <FiEdit2/> : <FiPlus/>} {materialData ? 'Save Changes' : 'Add Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component: MaterialManagement ---
const MaterialManagement = ({ userRole = 'SuperAdmin' }) => {
    
    // --- State Hooks for Hierarchical Selection ---
    const [selectedMaterialType, setSelectedMaterialType] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState({ id: 'ALL', name: 'All Subjects in Level' }); // Dummy selection

    // --- State Hook for Search Query ---
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- State Hooks for Material Management ---
    const [materialsData, setMaterialsData] = useState(INITIAL_MACP_MATERIALS_DATA);
    // MODIFIED: Combined CLASS_NOTES and TASKS_DATA
    const [classNotesData, setClassNotesData] = useState([...CLASS_NOTES, ...TASKS_DATA]); 
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [materialToEdit, setMaterialToEdit] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteCandidateId, setDeleteCandidateId] = useState(null);
    const [deleteSource, setDeleteSource] = useState(null); 
    
    // ACTIVE FILTERS for CLASS NOTES table (now comprehensive)
    const [activeFilters, setActiveFilters] = useState({
        status: '',
        subject_code: '',
        institute_name: '',
        course: '',
        course_level: '',
        package: '',
        batch: '',
        'class': ''
    }); 
    
    // 1. REF for the final content section
    const materialListRef = useRef(null); 

    const getMaterialById = (id) => 
        materialsData.find(m => m.material_id === id) || 
        classNotesData.find(m => m.material_id === id);

    // --- NEW CONSTANTS FOR HIERARCHY LOGIC ---
    const HIERARCHY_REQUIRED_TYPES = ['MAT_ID001', 'MAT_ID002'];
    const NON_HIERARCHY_TYPES = ['MAT_ID003', 'MAT_ID004']; // Class Notes, Tasks
    const isHierarchyType = selectedMaterialType && HIERARCHY_REQUIRED_TYPES.includes(selectedMaterialType.id);
    const isClassNotesOrTasksType = selectedMaterialType?.id === 'MAT_ID003' || selectedMaterialType?.id === 'MAT_ID004';
    
    // Logic for showing the MACP Materials/Notes table:
    const showMACPTableSection = selectedLevel && (selectedMaterialType?.id === 'MAT_ID001' || selectedMaterialType?.id === 'MAT_ID002');
    
    // Logic for showing the Class Notes/Tasks table: 
    const showClassNotesTableSection = isClassNotesOrTasksType;

    // Scroll to Top on Page Load
    useEffect(() => {
        // Scroll to the top when the component mounts
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    // **SCROLL HELPER: Using requestAnimationFrame for robustness**
    const scrollToListSection = () => {
        
        const executeScroll = () => {
            if (materialListRef.current) {
                materialListRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        };

        requestAnimationFrame(() => {
            // A final small delay (100ms) after RAF can often fix remaining issues
            setTimeout(executeScroll, 100); 
        });
    };
    // **END SCROLL HELPER**
    
    
    // **EFFECT HOOK FOR MACP/HIERARCHY SCROLL**
    // This hook watches the visibility state (showMACPTableSection) and scrolls AFTER the table is rendered.
    useEffect(() => {
        if (showMACPTableSection) {
            scrollToListSection();
        }
    }, [showMACPTableSection]);
    

    // --- Handlers for Hierarchical Card Selection ---

    const handleMaterialTypeSelect = (typeOrId) => {
        let type = typeOrId;

        if (typeof typeOrId === 'string') {
            const name = MATERIALS_TYPE_DATA.get(typeOrId);
            if (!name) return;
            type = { id: typeOrId, name };
        } else if (!typeOrId || !typeOrId.id) {
            type = null;
        }

        if (!type) {
            setSelectedMaterialType(null);
        } else if (selectedMaterialType && selectedMaterialType.id === type.id) {
            setSelectedMaterialType(null); 
        } else {
            setSelectedMaterialType(type); 
            
            // --- Auto-scroll and center if this selection immediately displays the table (NON-HIERARCHY types) ---
            if (type && NON_HIERARCHY_TYPES.includes(type.id)) {
                // Scroll immediately for direct types (MAT_ID003, MAT_ID004)
                scrollToListSection(); 
            }
        }
        
        setSelectedCourse(null);
        setSelectedLevel(null);
        setSearchQuery(''); 
        setActiveFilters({ status: '', subject_code: '', institute_name: '', course: '', course_level: '', package: '', batch: '', 'class': '' });
    };
    
    const handleCourseSelect = (courseOrId) => {
        let course = courseOrId;
        
        if (typeof courseOrId === 'string') {
            const name = COURSES_DATA.get(courseOrId);
            if (!name) return;
            course = { id: courseOrId, name };
        } else if (!courseOrId || !courseOrId.id) {
            course = null;
        }

        if (!course) {
            setSelectedCourse(null);
        } else if (selectedCourse && selectedCourse.id === course.id) {
            setSelectedCourse(null);
        } else {
            setSelectedCourse(course);
        }
        
        setSelectedLevel(null);
        setSearchQuery(''); 
        setActiveFilters({ status: '', subject_code: '', institute_name: '', course: '', course_level: '', package: '', batch: '', 'class': '' });
    };

    const handleLevelSelect = (levelOrId) => {
        let level = levelOrId;
        
        if (typeof levelOrId === 'string') {
            const name = COURSES_LEVELS_DATA.get(levelOrId);
            if (!name) return;
            level = { id: levelOrId, name };
        } else if (!levelOrId || !levelOrId.id) {
            level = null;
        }
        
        if (!level) {
            setSelectedLevel(null);
        } else if (selectedLevel && selectedLevel.id === level.id) {
            setSelectedLevel(null);
        } else {
            setSelectedLevel(level);
            // Scroll is now handled by the useEffect hook watching 'showMACPTableSection'
        }
        
        setSearchQuery(''); 
        setActiveFilters({ status: '', subject_code: '', institute_name: '', course: '', course_level: '', package: '', batch: '', 'class': '' });
    };
    
    const handleFilterChange = (column, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [column]: value
        }));
    };

    // Helper to generate options for an arbitrary column (UNMODIFIED)
    const generateOptionsForColumn = (data, columnKey, allLabel) => {
        const uniqueValues = new Set(data.map(item => item[columnKey]).filter(Boolean));
        
        const options = Array.from(uniqueValues)
            .sort() 
            .map(value => ({
                label: value,
                value: value
            }));
            
        options.unshift({ label: allLabel, value: '' }); // 'All' option first

        return options;
    };

    // --- Dynamic Filter Options for CLASS NOTES ---
    const classNotesStatusOptions = generateOptionsForColumn(classNotesData, 'status', 'All Statuses');
    const classNotesSubjectOptions = Array.from(SUBJECTS_DATA.entries())
        .map(([id, name]) => ({ label: `${id} - ${name}`, value: id }));
    classNotesSubjectOptions.unshift({ label: 'All Subjects', value: '' });

    const classNotesInstituteOptions = generateOptionsForColumn(classNotesData, 'institute_name', 'All Institutes');
    const classNotesCourseOptions = generateOptionsForColumn(classNotesData, 'course', 'All Courses');
    const classNotesLevelOptions = generateOptionsForColumn(classNotesData, 'course_level', 'All Levels');
    const classNotesPackageOptions = generateOptionsForColumn(classNotesData, 'package', 'All Programme');
    const classNotesBatchOptions = generateOptionsForColumn(classNotesData, 'batch', 'All Batches');
    const classNotesClassOptions = generateOptionsForColumn(classNotesData, 'class', 'All Classes');


    // The final filter configuration object for CLASS NOTES:
    const classNotesFilterDefinitions = {
        status: classNotesStatusOptions, 
        subject_code: classNotesSubjectOptions, 
        institute_name: classNotesInstituteOptions,
        course: classNotesCourseOptions,
        course_level: classNotesLevelOptions,
        package: classNotesPackageOptions,
        batch: classNotesBatchOptions,
        'class': classNotesClassOptions,
    };

    // --- NEW: Search Handler (UNMODIFIED) ---
    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    // --- Data Filtering Logic for CLASS NOTES (MODIFIED) ---
    const getFilteredClassNotesData = () => {
        // Only proceed if the selected type is Class Notes or Tasks
        if (!isClassNotesOrTasksType) return []; 

        let data = classNotesData;

        // 1. Filter by the specific Material Type (Class Notes vs. Tasks)
        if (selectedMaterialType && selectedMaterialType.id) {
             data = data.filter(material => material.material_type_id === selectedMaterialType.id);
        }

        // 2. Filter by Hierarchical Selection (This is optional for this view, but good for consistency)
        data = data.filter(material => 
            (!selectedCourse || material.course_id === selectedCourse.id) &&
            (!selectedLevel || material.course_level_id === selectedLevel.id)
        );

        // 3. Filter by Dynamic Table Filters (Status, Subject, Institute, etc.)
        Object.keys(activeFilters).forEach(key => {
            const filterValue = activeFilters[key];
            if (filterValue) {
                data = data.filter(material => material[key] === filterValue);
            }
        });

        // 4. Filter by search query
        if (!searchQuery) {
            return data;
        }

        const query = searchQuery.toLowerCase();
        
        return data.filter(material => {
            return (
                material.material_name.toLowerCase().includes(query) ||
                material.material_id.toLowerCase().includes(query) ||
                material.uploaded_by.toLowerCase().includes(query)
            );
        });
    };
    
    // --- Data Filtering Logic for MACP Materials (MODIFIED) ---
    const getFilteredMACPData = () => {
         // MODIFIED: Include MAT_ID002 as a hierarchical type
         if (!selectedLevel || (selectedMaterialType?.id !== 'MAT_ID001' && selectedMaterialType?.id !== 'MAT_ID002')) return []; 

        // Simplified filtering for MACP materials as per original logic (using status and subject_code)
        let data = materialsData;
        const subjectCodeFilter = activeFilters.subject_code; 
        const statusFilter = activeFilters.status;

        if (subjectCodeFilter) {
             data = data.filter(material => material.subject_code === subjectCodeFilter);
        }
        
        if (statusFilter) {
             data = data.filter(material => material.status === statusFilter);
        }

        if (!searchQuery) {
             return data;
        }

        const query = searchQuery.toLowerCase();
        
        return data.filter(material => {
            return (
                material.material_name.toLowerCase().includes(query) ||
                material.material_id.toLowerCase().includes(query) ||
                material.uploaded_by.toLowerCase().includes(query)
            );
        });
    }
    
    // --- Data Filtering/Rendering ---
    // Moved declarations here, outside the component body (or at the start of the component body)
    // The previous error was caused by redeclaring these after the component body.
    const finalMACPData = getFilteredMACPData();
    const finalClassNotesData = getFilteredClassNotesData();

    // The filter configuration object for MACP Materials (reusing status and subject from above)
    const macpFilterDefinitions = {
         status: generateOptionsForColumn(materialsData, 'status', 'All Statuses'),
         subject_code: classNotesSubjectOptions, // Subject list is the same
    };

    // --- NEW: Handler for Material Status Change ---
    const handleMaterialStatusChange = (materialId, newStatus) => {
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Find the material to get its ID (materialId could be the full row object)
        const idToUpdate = (typeof materialId === 'object' && materialId !== null) ? materialId.material_id : materialId;

        // Only update status for Class Notes and Tasks (as requested by the user's context)
        if (isClassNotesOrTasksType) {
            setClassNotesData(prev => prev.map(m => 
                m.material_id === idToUpdate 
                ? { 
                    ...m, 
                    status: newStatus,
                    date_status_change: currentDate
                }
                : m
            ));
        } else if (isHierarchyType) {
             setMaterialsData(prev => prev.map(m => 
                m.material_id === idToUpdate 
                ? { 
                    ...m, 
                    status: newStatus,
                    date_status_change: currentDate
                }
                : m
            ));
        }
    };

    // --- *** NEW: Handler for Imported Excel Data *** ---
    const handleImportedData = (importedJson) => {
        if (!selectedMaterialType) {
            alert("Please select a Material Type before importing data.");
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        // Format the imported data into the material structure
        const formattedData = importedJson.map((row, index) => {
            
            // Basic validation or default values from Excel columns
            // Assumes Excel headers are like "Material Name", "Subject Code", etc.
            const materialName = row["Material Name"] || row["material_name"] || `Imported Item ${index + 1}`;
            const subjectCode = row["Subject Code"] || row["subject_code"] || 'CA101'; // Default
            
            return {
                // Create a unique-ish ID
                "material_id": `IMP_${Date.now() + index}`,
                "material_name": materialName,
                "size_kb": row["Size (KB)"] || row["size_kb"] || 0,
                "uploded_date": currentDate,
                "uploaded_by": "Super Admin (Import)",
                "subject_code": subjectCode,
                "status": row["Status"] || row["status"] || "Pending",
                "date_status_change": null,
                
                // Add full context data for Class Notes/Tasks
                "material_type_id": selectedMaterialType.id, 
                "institute_name": "MACP Academy (Import)",
                "institute_id": "INST001",
                "course": row["Course"] || row["course"] || selectedCourse?.name || 'N/A',
                "course_id": selectedCourse?.id || 'N/A',
                "course_level": row["Level"] || row["course_level"] || selectedLevel?.name || 'N/A',
                "course_level_id": selectedLevel?.id || 'N/A',
                "package": row["Package"] || row["package"] || 'N/A',
                "batch": row["Batch"] || row["batch"] || 'N/A',
                "class": row["Class"] || row["class"] || 'N/A'
            };
        });

        // Add to the correct state based on selected material type
        if (isClassNotesOrTasksType) {
             setClassNotesData(prev => [...prev, ...formattedData]);
        } else if (isHierarchyType) {
             setMaterialsData(prev => [...prev, ...formattedData]);
        }
        
        alert(`Successfully imported ${formattedData.length} items.`);
    };

    
    // --- Handlers for Material CRUD Operations (MODIFIED) ---
    const handleAddNewMaterial = () => {
        if (isHierarchyType) {
            if (selectedCourse && selectedLevel) {
                setIsUploadModalOpen(true);
            } else {
                 alert("Please complete the selection: Course → Level before adding a new material for this Material Type.");
            }
        } else if (isClassNotesOrTasksType) {
            // Direct Display Types - only need the type selected
            setIsUploadModalOpen(true);
        } else {
            alert("Please select a Material Type before adding a new material.");
        }
    };

    const handleMaterialUpload = (newMaterialData) => {
        const newMaterial = {
            ...newMaterialData,
            material_type_id: selectedMaterialType.id, // Assign the correct type
            subject_code: 'CA101', 
            uploded_date: new Date().toISOString().split('T')[0],
            uploaded_by: 'Super Admin',
            status: 'Pending',
            date_status_change: null,
            // Add full context data for Class Notes
            institute_name: 'MACP Academy',
            institute_id: 'INST001',
            course: selectedCourse?.name || 'N/A', // Null-safe
            course_id: selectedCourse?.id || 'N/A', // Null-safe
            course_level: selectedLevel?.name || 'N/A', // Null-safe
            course_level_id: selectedLevel?.id || 'N/A', // Null-safe
            package: Programme_DATA.get('PKG_ID001'), 
            batch: BATCHES_DATA.get('BTCH_ID001'), 
            'class': CLASSES_DATA.get('CLS_ID001')
        };
        
        if (selectedMaterialType.id === 'MAT_ID003' || selectedMaterialType.id === 'MAT_ID004') {
             setClassNotesData(prev => [newMaterial, ...prev]);
        } else {
            // Default to MACP for other types/placeholders (MAT_ID001, MAT_ID002)
             setMaterialsData(prev => [newMaterial, ...prev]);
        }
    };

    const handleEditMaterial = (material) => {
        setMaterialToEdit(material);
        setIsEditModalOpen(true);
    };
    
    const handleMaterialEdit = (updatedMaterialData) => {
        const materialSource = materialsData.find(m => m.material_id === updatedMaterialData.material_id) ? 'macp' : 'class_notes';
        const currentDate = new Date().toISOString().split('T')[0];

        const updateFn = (prev) => prev.map(m => 
            m.material_id === updatedMaterialData.material_id 
            ? { 
                ...m, 
                ...updatedMaterialData,
                date_status_change: currentDate // Update date on edit
            }
            : m
        );
        
        if (materialSource === 'class_notes') {
             setClassNotesData(updateFn);
        } else {
             setMaterialsData(updateFn);
        }

        closeEditModal();
    };

    const handleDeleteMaterial = (material) => {
        setDeleteCandidateId(material.material_id);
        setDeleteSource(materialsData.find(m => m.material_id === material.material_id) ? 'macp' : 'class_notes');
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (deleteSource === 'class_notes') {
            setClassNotesData(prev => prev.filter(m => m.material_id !== deleteCandidateId));
        } else {
            setMaterialsData(prev => prev.filter(m => m.material_id !== deleteCandidateId));
        }
        setDeleteCandidateId(null);
        setDeleteSource(null);
        setIsConfirmModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setMaterialToEdit(null);
    }
    
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setDeleteCandidateId(null);
        setDeleteSource(null);
    }
    
    const context = { 
        selectedMaterialType, 
        selectedCourse, 
        selectedLevel, 
        selectedSubject 
    }; 

    // --- Dynamic Table Column Definitions for Class Notes ---
    const classNotesColumnOrder = [
        'material_id', 
        'material_name', 
        'course',
        'course_level',
        'package',
        'batch',
        'class',
        'subject_code', 
        'size_kb', 
        'uploaded_by', 
        'uploded_date', 
        'status',
        'date_status_change' // Added
    ];
    
    // --- Dynamic Table Column Definitions for MACP Materials ---
    const macpColumnOrder = [
        'material_id', 
        'material_name', 
        'subject_code', 
        'size_kb', 
        'uploaded_by', 
        'uploded_date', 
        'status',
        'date_status_change' // Added
    ];


    return (
        <div className="mm_wrapper">
            <div className="mm_header">
                <h1 className="mm_page-title">Materials Management</h1>
                {/* Displaying Current Selection Path */}
                <div className="mm_selection-path">
                    {selectedMaterialType && (
                        <span><FiList/> <strong>{selectedMaterialType.name}</strong> <FiChevronRight/></span>
                    )}
                    {selectedCourse && (
                        <span><FiBookOpen/> <strong>{selectedCourse.name}</strong> <FiChevronRight/></span>
                    )}
                    {selectedLevel && (
                        <span><FiGrid/> <strong>{selectedLevel.name}</strong></span>
                    )}
                </div>
            </div>
            
            {/* 1. Materials Type Selection */}
            <CardSlider
                institutes={MATERIALS_TYPE_DATA}
                title='Materials Type'
                icon_title="Materials Type"
                selectedCard={selectedMaterialType}
                onSelectInstitute={handleMaterialTypeSelect}
            />
            
            {/* 2. Course Selection (Conditional on Material Type - ONLY shows for HIERARCHY types MAT_ID001, MAT_ID002) */}
            {isHierarchyType && (
                <CardSlider
                    institutes={COURSES_DATA}
                    title={`Courses for ${selectedMaterialType.name}`}
                    icon_title="Courses"
                    selectedCard={selectedCourse}
                    onSelectInstitute={handleCourseSelect}
                />
            )}
            
            {/* 3. Level Selection (Conditional on Course - ONLY shows for HIERARCHY types MAT_ID001, MAT_ID002) */}
            {selectedCourse && isHierarchyType && (
                <CardSlider
                    institutes={COURSES_LEVELS_DATA}
                    title={`Levels for ${selectedCourse.name}`}
                    icon_title="Levels"
                    selectedCard={selectedLevel}
                    onSelectInstitute={handleLevelSelect}
                />
            )}

            {/* 5. Material List (Dynamic Table) - Class Notes/Tasks (MAT_ID003, MAT_ID004) */}
            {showClassNotesTableSection && (
                <div ref={materialListRef} className="mm_material-list-section">
                  <DynamicTable
                        data={finalClassNotesData} 
                        unfilteredData={classNotesData} 
                        onDataImported={handleImportedData} 
                        columnOrder={classNotesColumnOrder} 
                        // onAddNew={handleAddNewMaterial} 
                        onStatusChange={handleMaterialStatusChange} 
                        title={selectedMaterialType.name}
                        onSearch={handleSearchChange}
                        filterDefinitions={classNotesFilterDefinitions} 
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        pillColumns={['status']}
                        // Edit/Delete is off for this table as per your original file
                        // onEdit={handleEditMaterial} 
                        // onDelete={handleDeleteMaterial}
                    />
                </div>
            )}
            
            {/* 6. Material List (Dynamic Table) - MACP Materials/Notes (MAT_ID001, MAT_ID002) */}
            {showMACPTableSection && (
                <div ref={materialListRef} className="mm_material-list-section">
                    <DynamicTable
                        data={finalMACPData} 
                        unfilteredData={materialsData} 
                        onDataImported={handleImportedData} 
                        columnOrder={macpColumnOrder} 
                        onEdit={handleEditMaterial}
                        onDelete={handleDeleteMaterial}
                        userRole={'teacher'}
                        onAddNew={handleAddNewMaterial} 
                        onStatusChange={handleMaterialStatusChange} 
                        title={selectedMaterialType.name}
                        onSearch={handleSearchChange}
                        filterDefinitions={macpFilterDefinitions} 
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        pillColumns={['status']}
                    />
                </div>
            )}

            
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                title={`Confirm Delete: ${deleteCandidateId ? getMaterialById(deleteCandidateId)?.material_name : ''}`}
                message={`Are you sure you want to permanently delete the file "${deleteCandidateId ? getMaterialById(deleteCandidateId)?.material_name : ''}"?`}
                onConfirm={confirmDelete}
                onCancel={closeConfirmModal}
            />

            <MaterialFormModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                context={context}
                onSubmit={handleMaterialUpload}
                materialData={null} 
                onEdit={() => {}} 
            />
            
            <MaterialFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                context={context}
                onSubmit={() => {}} 
                materialData={materialToEdit}
                onEdit={handleMaterialEdit} 
            />
        </div>
    ); 
};

export default MaterialManagement;