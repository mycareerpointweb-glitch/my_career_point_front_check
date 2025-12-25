import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import '../../Styles/SuperAdmin/Batches.css'; 
import institutionsData from '../dummy.json'; 

// *** Importing DynamicTable component ***
import DynamicTable from '../../Components/Reusable/DynamicTable'; 

import {
    FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle,
    FiList, FiTarget, FiUser, FiSend, FiBookOpen 
} from "react-icons/fi";

// =======================================================
// === 1. MOCK DATA CONSTANTS & STATUS LOGIC ===
// =======================================================
const MOCK_Programme = [
    { name: "Default Package", key: "Default_Package_id" }, 
    { name: "Sure pass", key: "Sure_pass_id" },
    { name: "Junior level", key: "Junior_level_id" },
    { name: "remastered pack", key: "remastered_pack_id" },
];

const getStatus = (completed, total) => {
    if (completed === 0) return "Not Started";
    if (completed >= total) return "Completed";
    return "Ongoing";
};

// --- MOCK SUBJECT COMPLETION DATA ---
const MOCK_SUBJECT_COMPLETION = [
    { 
        subjectId: "sub_id_1", 
        subjectCode: "ACC101", 
        totalHours: 120, 
        completedHours: 90, 
        status: getStatus(90, 120) 
    },
    { 
        subjectId: "sub_id_2", 
        subjectCode: "TAX205", 
        totalHours: 90, 
        completedHours: 90, 
        status: getStatus(90, 90) 
    },
    { 
        subjectId: "sub_id_3", 
        subjectCode: "LAW301", 
        totalHours: 75, 
        completedHours: 45, 
        status: getStatus(45, 75) 
    },
    { 
        subjectId: "sub_id_4", 
        subjectCode: "ECO402", 
        totalHours: 60, 
        completedHours: 0, 
        status: getStatus(0, 60) 
    },
    { 
        subjectId: "sub_id_5", 
        subjectCode: "STATS503", 
        totalHours: 50, 
        completedHours: 15, 
        status: getStatus(15, 50) 
    },
];

// --- MOCK CHAPTER DETAILS DATA ---
const MOCK_CHAPTER_DETAILS = {
    "sub_id_1": [
        { chapterId: "chp_1_1", chapterName: "Basic Accounting Principles", chapterNo: 1, actualHours: 15, takenHours: 15, status: "Completed" },
        { chapterId: "chp_1_2", chapterName: "Depreciation Methods", chapterNo: 2, actualHours: 20, takenHours: 20, status: "Completed" },
        { chapterId: "chp_1_3", chapterName: "Partnership Accounts", chapterNo: 3, actualHours: 30, takenHours: 25, status: "Ongoing" },
        { chapterId: "chp_1_4", chapterName: "Company Final Accounts", chapterNo: 4, actualHours: 55, takenHours: 0, status: "Not Started" },
    ],
    "sub_id_2": [
        { chapterId: "chp_2_1", chapterName: "Income Tax Basics", chapterNo: 1, actualHours: 25, takenHours: 25, status: "Completed" },
        { chapterId: "chp_2_2", chapterName: "Heads of Income", chapterNo: 2, actualHours: 40, takenHours: 40, status: "Completed" },
        { chapterId: "chp_2_3", chapterName: "TDS & TCS", chapterNo: 3, actualHours: 25, takenHours: 25, status: "Completed" },
    ],
};

// --- MOCK TOPIC DETAILS DATA (Nested under Chapter ID) ---
const MOCK_TOPIC_DETAILS = {
    "chp_1_1": [
        { topicId: 'top_1_1_1', topicName: 'The Double Entry System', actualHours: 5, takenHours: 5, status: 'Completed' },
        { topicId: 'top_1_1_2', topicName: 'Ledger Posting', actualHours: 5, takenHours: 5, status: 'Completed' },
        { topicId: 'top_1_1_3', topicName: 'Trial Balance Prep', actualHours: 5, takenHours: 5, status: 'Completed' },
    ],
    "chp_1_3": [
        { topicId: 'top_1_3_1', topicName: 'Partnership Fundamentals', actualHours: 10, takenHours: 10, status: 'Completed' },
        { topicId: 'top_1_3_2', topicName: 'Admission of Partner', actualHours: 10, takenHours: 8, status: 'Ongoing' },
        { topicId: 'top_1_3_3', topicName: 'Retirement/Death', actualHours: 10, takenHours: 7, status: 'Ongoing' },
    ],
};

// --- DEPENDENT CONSTANTS DEFINED HERE ---
const MOCK_SUBJECT_IDS = MOCK_SUBJECT_COMPLETION.map(s => s.subjectId);

// --- MOCK APPROVAL REQUESTS DATA ---
const MOCK_APPROVAL_REQUESTS = [
    { 
        id: 'REQ001', request_no: 1, institution: 'Default Institute', batch_name: 'CA-Foundation', class_name: 'Class A', subject: 'CA/CMA Accounts', 
        chapter_no: 3, date: '2025-11-10', started_time: '10:00 AM', ended_time: '12:00 PM', 
        request_action: 'Fresh Entry', total_hours: 2, approval_status: 'Pending'
    },
    { 
        id: 'REQ002', request_no: 2, institution: 'Default Institute', batch_name: 'CA-Foundation', class_name: 'Class A', subject: 'CA/CMA Accounts', 
        chapter_no: 4, date: '2025-11-11', started_time: '09:00 AM', ended_time: '01:00 PM', 
        request_action: 'Edited', total_hours: 4, approval_status: 'Approved'
    },
    { 
        id: 'REQ003', request_no: 3, institution: 'The Institute of Chartered Accountants of India', batch_name: 'CA-Intermediate', class_name: 'Class B', subject: 'CA/CMA Taxation', 
        chapter_no: 1, date: '2025-11-09', started_time: '02:00 PM', ended_time: '04:30 PM', 
        request_action: 'Fresh Entry', total_hours: 2.5, approval_status: 'Rejected'
    },
];


// =======================================================
// === 2. DATA TRANSFORMATION LOGIC (Normalized Data) ===
// =======================================================
const getTeacherName = (id, teachersMap) => teachersMap[id]?.name || id;

const getSubjectName = (id, subjectsMap) => {
    switch (id) {
        case "sub_id_1": return "CA/CMA Accounts";
        case "sub_id_2": return "CA/CMA Taxation";
        case "sub_id_3": return "CA/CMA Corporate Law";
        case "sub_id_4": return "CA/CMA Economics";
        case "sub_id_5": return "CA/CMA Statistics";
        default: return subjectsMap[id] || id;
    }
};

let allBatchesFlat = []; 

const calculateOverallClassStatus = (subjectIds) => {
    if (subjectIds.length === 0) return 'Not Started';

    const relevantSubjects = MOCK_SUBJECT_COMPLETION.filter(sub => subjectIds.includes(sub.subjectId));
    
    const statuses = relevantSubjects.map(s => s.status);
    
    if (statuses.every(s => s === 'Completed')) {
        return 'Completed';
    }
    if (statuses.some(s => s === 'Ongoing') || statuses.some(s => s === 'Completed' && s !== 'Not Started')) {
        return 'Ongoing';
    }
    return 'Not Started';
};

const calculateTotalCompletedHours = (subjectIds) => {
    const relevantSubjects = MOCK_SUBJECT_COMPLETION.filter(sub => subjectIds.includes(sub.subjectId));
    return relevantSubjects.reduce((total, s) => total + s.completedHours, 0);
};


const transformJSONData = (rawData) => {
    
    const mockInstitutions = (rawData.institutions_reference || []).map(inst => ({
        name: inst.name,
        id: inst.institution_id
    }));
    const teachersMap = (rawData.teachers_reference || []).reduce((acc, curr) => {
        acc['teacher_id_1'] = { name: "Mr. Sharma", subjects: [] };
        acc['teacher_id_2'] = { name: "Ms. Khan", subjects: [] };
        acc[curr.teacher_id] = { name: curr.name, subjects: curr.subjects_taught_ids || [] };
        return acc;
    }, {});
    const subjectsMap = (rawData.subjects_reference || []).reduce((acc, curr) => {
        acc[curr.subject_id] = curr.subject_name;
        return acc;
    }, {});
    const coursesReference = rawData.courses_reference.reduce((acc, curr) => {
        acc[curr.course_id] = curr.course_name;
        return acc;
    }, {});

    const getTeachersForSubjects = (subjectIds) => {
        const teacherIds = new Set();
        if (subjectIds.includes("sub_id_1") || subjectIds.includes("sub_id_2")) teacherIds.add('teacher_id_1');
        if (subjectIds.includes("sub_id_3") || subjectIds.includes("sub_id_4")) teacherIds.add('teacher_id_2');

        for (const teacherId in teachersMap) {
            const teacher = teachersMap[teacherId];
            if (subjectIds.some(subId => teacher.subjects.includes(subId))) {
                teacherIds.add(teacherId);
            }
        }
        return Array.from(teacherIds);
    };

    let detailedInstRecords = rawData.data || [];
    const initialAllData = {};
    const flatBatchList = []; 

    detailedInstRecords.forEach(inst_data => {
        const inst_id = inst_data.institution_id;
        const inst_name = mockInstitutions.find(i => i.id === inst_id)?.name || inst_id;

        initialAllData[inst_id] = { streams: [], courses: [], levels: {} };
        const processed_stream_ids = new Set();

        (inst_data.courses || []).forEach(course => {
            const stream_id = course.course_id;
            const stream_name = coursesReference[stream_id] || stream_id;

            if ((course.levels || []).length === 0) return;

            if (!processed_stream_ids.has(stream_id)) {
                initialAllData[inst_id].streams.push({ name: stream_name, id: stream_id });
                processed_stream_ids.add(stream_id);
            }

            (course.levels || []).forEach(level => {
                const level_name = level.level_name;
                const level_id = level.level_id;

                initialAllData[inst_id].courses.push({ stream: stream_name, name: level_name, id: level_id });

                const level_key = `${stream_name}_${level_name}`;

                if (!initialAllData[inst_id].levels[level_key]) {
                     const ProgrammeStructure = MOCK_Programme.reduce((acc, pkg) => {
                         acc[pkg.name] = [];
                         return acc;
                     }, {});
                     initialAllData[inst_id].levels[level_key] = ProgrammeStructure;
                }

                (level.batches || []).forEach(batch => {
                    const batch_name = rawData.batches_reference.find(b => b.batch_id === batch.batch_id)?.batch_name || batch.batch_id;
                    const classes = batch.classes || [];
                    const totalClasses = classes.length;
                    const is_active = totalClasses > 0;

                    const commonSubjects = batch.common_subjects_ids || [];
                    const specificSubjectsGroups = batch.specific_subjects_ids || {};
                    const specificSubjectsFlat = Object.values(specificSubjectsGroups).flat();

                    const allSubjectIds = Array.from(new Set([...commonSubjects, ...specificSubjectsFlat, ...MOCK_SUBJECT_IDS]));
                    const totalSubjects = allSubjectIds.length;
                    const assignedTeachers = getTeachersForSubjects(allSubjectIds);

                    const classObjects = classes.map(c => {
                        const groupKey = c.class_name.split(' ').pop();
                        const classSpecificSubjects = specificSubjectsGroups[groupKey] || [];

                        const classSubjectsIds = Array.from(new Set([...commonSubjects, ...classSpecificSubjects, ...MOCK_SUBJECT_IDS]));
                        const classTeachersIds = getTeachersForSubjects(classSubjectsIds);
                        
                        const completedHours = calculateTotalCompletedHours(classSubjectsIds);
                        const overallStatus = calculateOverallClassStatus(classSubjectsIds);
                        
                        return { 
                            ...c,
                            totalStudents: c.students_ids ? c.students_ids.length : 0,
                            subjectsIds: classSubjectsIds, 
                            teachersIds: classTeachersIds,
                            class_name: c.class_name,
                            class_id: c.class_id,
                            allSubjects: subjectsMap,
                            allTeachers: teachersMap,
                            completed_hours: completedHours,
                            overall_status: overallStatus,
                        };
                    });
                    
                    const batchData = {
                        name: batch_name,
                        id: batch.batch_id,
                        active: is_active,
                        totalClasses: totalClasses,
                        totalSubjects: totalSubjects,
                        assignedTeachers: assignedTeachers,
                        classes: classObjects, 
                        startTime: "09:00 AM", 
                        endTime: "01:00 PM", 
                        location: "Main Campus, Room 101", 
                        mode: "Hybrid", 
                        notes: "This batch focuses on advanced topics.", 
                        institution_name: inst_name, 
                        course_category: stream_name, 
                        level_category: level_name, 
                        package_name: "Default Package", 
                    };

                    classObjects.forEach(classObject => {
                        flatBatchList.push({
                            id: classObject.class_id, 
                            institution: inst_name,
                            course_category: stream_name,
                            level_category: level_name,
                            package_name: "Default Package",
                            batch_name: batch_name,
                            class_name: classObject.class_name,
                            display_batch_name: batch_name,
                            display_class_name: classObject.class_name,
                            total_students: classObject.totalStudents,
                            total_subjects: totalSubjects,
                            completed_hours: `${classObject.completed_hours} hrs`,
                            overall_status: classObject.overall_status,
                            mode: "Hybrid", 
                            status: is_active ? "Active" : "Inactive", 
                            fullBatchData: batchData,
                            fullClassData: classObject,
                        });
                    });

                    initialAllData[inst_id].levels[level_key]["Default Package"].push(batchData);
                });
            });
        });
    });

    allBatchesFlat = flatBatchList; 

    return { teachersMap, subjectsMap, allBatchesFlat: flatBatchList };
};

// =======================================================
// === 3. INITIALIZING CONSTANTS & COMPONENTS ===
// =======================================================
const { teachersMap, subjectsMap } = transformJSONData(institutionsData);

// --- Helper for generating filter options for DynamicTable (SUBJECT/CONTEXT FILTERS - NO "All...") ---
const generateOptionsForColumn = (data, columnName) => {
    const uniqueValues = Array.from(new Set(data.map(item => item[columnName])));
    
    const options = uniqueValues
        .filter(Boolean) 
        .sort((a, b) => a.localeCompare(b))
        .map(value => ({
            value: value,
            label: value 
        }));
    return options; 
};

// --- Helper for generating a fixed set of status filter options (NO "All...") ---
const generateStatusOptions = (columnName) => {
    const statusValues = ['Completed', 'Ongoing', 'Not Started'];
    const options = statusValues.map(value => ({
        value: value,
        label: value 
    }));
    return options;
}

// --- Helper for generating filter options (APPROVAL TABLE FILTERS - WITH "All...") ---
const generateApprovalFilterOptions = (data, columnName, includeAll = true) => {
    const uniqueValues = Array.from(new Set(data.map(item => item[columnName])));
    
    const options = uniqueValues
        .filter(Boolean) 
        .sort((a, b) => a.localeCompare(b))
        .map(value => ({
            value: value,
            label: value 
        }));
        
    if (includeAll) {
         return [{ value: '', label: `All ${columnName.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` }, ...options];
    }
    return options;
};

// --- AddBatchModal (Unchanged, simplified for file brevity) ---
const getInitialFormState = (data) => {
    const isEditing = data && data !== 'NEW';
    return {
        name: isEditing ? (data.name || "") : "",
        startTime: isEditing ? (data.startTime || "09:00 AM") : "09:00 AM",
        endTime: isEditing ? (data.endTime || "01:00 PM") : "01:00 PM",
        location: isEditing ? (data.location || "") : "",
        mode: isEditing ? (data.mode || "Hybrid") : "Hybrid",
        notes: isEditing ? (data.notes || "") : "",
        totalClasses: isEditing ? (data.totalClasses || 1) : 1,
    };
};

const AddBatchModal = ({ initialBatchData, onClose, courseCategory, levelCategory, onSubmit }) => {

    if (!initialBatchData) return null;
    const isEdit = initialBatchData !== 'NEW';
    const [form, setForm] = useState(() => getInitialFormState(initialBatchData));
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        setForm(getInitialFormState(initialBatchData));
        setShowConfirm(false);
    }, [initialBatchData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleConfirmSave = () => {
        onSubmit(form);
    };

    const modalTitle = isEdit ? `Edit Batch: ${initialBatchData.name}` : "Add New Batch";
    const saveButtonText = isEdit ? "Update Batch" : "Save Batch";
    const confirmMessage = isEdit
        ? `Are you sure you want to update the batch **${form.name}**?`
        : `Are you sure you want to save the new batch **${form.name}** for ${courseCategory} / ${levelCategory}?`;


    return (
        <div className="batch_modal batch_add-batch-modal">
            <div className="batch_modal-content">
                <div className="batch_modal-header">
                    <h3><FiPlus /> {modalTitle}</h3>
                    <FiX onClick={onClose} className="batch_close-modal" />
                </div>
                <form onSubmit={handleSaveClick}>
                    <div className="batch_form-group">
                        <label>Course/Level Selected</label>
                        <input
                            type="text"
                            value={`${courseCategory} / ${levelCategory}`}
                            readOnly
                            disabled
                            className="batch_read-only-field"
                        />
                    </div>
                    {/* Simplified Form fields */}
                    <div className="batch_form-group">
                        <label htmlFor="batchName">Batch Name <span className="required">*</span></label>
                        <input id="batchName" name="name" type="text" placeholder="e.g., CA Foundation May 2026" value={form.name} onChange={handleChange} required />
                    </div>
                    {/* Time Fields, Location, Mode, Total Class Count, Notes ... */}
                    <div className="batch_form-row">
                        <div className="batch_form-group"><label htmlFor="startTime">Start Time</label><input id="startTime" name="startTime" type="text" placeholder="e.g., 09:00 AM" value={form.startTime} onChange={handleChange} /></div>
                        <div className="batch_form-group"><label htmlFor="endTime">End Time</label><input id="endTime" name="endTime" type="text" placeholder="e.g., 01:00 PM" value={form.endTime} onChange={handleChange} /></div>
                    </div>
                    <div className="batch_form-group"><label htmlFor="location">Location</label><input id="location" name="location" type="text" placeholder="e.g., Main Campus, Room 101" value={form.location} onChange={handleChange} /></div>
                    <div className="batch_form-group">
                        <label>Mode <span className="required">*</span></label>
                        <div className="batch_radio-group">
                            {['Hybrid', 'Online', 'Offline'].map(mode => (<label key={mode} className="batch_radio-label"><input type="radio" name="mode" value={mode} checked={form.mode === mode} onChange={handleChange} required />{mode}</label>))}
                        </div>
                    </div>
                    <div className="batch_form-group"><label htmlFor="totalClasses">Total Class Count</label><input id="totalClasses" name="totalClasses" type="number" min="1" placeholder="e.g., 5" value={form.totalClasses} onChange={handleChange} /></div>
                    <div className="batch_form-group"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows="3" placeholder="Any special instructions or details about the batch..." value={form.notes} onChange={handleChange} /></div>

                    <div className="batch_modal-actions">
                        <button type="button" className="batch_btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="batch_btn-primary">{saveButtonText}</button>
                    </div>
                </form>
            </div>
            {showConfirm && (
                <div className="batch_modal-confirmation-overlay">
                    <div className="batch_modal-content batch_confirm-popup">
                        <FiAlertTriangle size={32} className="batch_confirm-icon" />
                        <h4>Confirm Batch {isEdit ? 'Update' : 'Creation'}</h4>
                        <p>{confirmMessage}</p>
                        <div className="batch_modal-actions">
                            <button className="batch_btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button className="batch_btn-primary" onClick={handleConfirmSave}>Confirm {isEdit ? 'Update' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Batches Component ---
const CourseCompletion = () => {
    
    // --- REFS ---
    const detailSectionRef = useRef(null);
    const approvalTableRef = useRef(null);
    
    // --- Refs for nested tables to ensure smooth individual scrolling ---
    const chapterTableRef = useRef(null);
    const topicTableRef = useRef(null);

    // --- STATE FOR DYNAMIC TABLE ---
    const [activeFilters, setActiveFilters] = useState({});
    const [approvalFilters, setApprovalFilters] = useState({}); // NEW STATE FOR APPROVAL TABLE FILTERS
    const [searchTerm, setSearchTerm] = useState(''); // Search for Subject Table (Level 1)
    const [approvalSearchTerm, setApprovalSearchTerm] = useState(''); // NEW: Separate Search for Approval Table
    
    // --- STATE FOR DETAIL VIEW (3-LEVEL HIERARCHY) ---
    const initialClassData = allBatchesFlat[0] || {};
    
    // Initialize state with the very first class's data to show subjects immediately
    const [selectedClassDetail, setSelectedClassDetail] = useState(initialClassData.fullClassData || null); 
    const [selectedSubjectId, setSelectedSubjectId] = useState(null); 
    const [selectedChapterId, setSelectedChapterId] = useState(null); 
    const [approvalRequests, setApprovalRequests] = useState(MOCK_APPROVAL_REQUESTS); 

    // --- MODAL STATE (Kept) ---
    const [modalCourseCategory, setModalCourseCategory] = useState(initialClassData.course_category || null);
    const [modalLevelCategory, setModalLevelCategory] = useState(initialClassData.level_category || null);

    // --- DYNAMIC TABLE COLUMN CONFIGURATION (Unchanged) ---
    const SUBJECT_COMPLETION_COLUMN_ORDER = [
        'subjectCode', 'subjectName', 'totalHours', 'completedHours', 'completionPercentage', 'teacherName', 'status',
    ];

    const CHAPTER_BREAKDOWN_COLUMN_ORDER = [
        'chapterNo', 'chapterName', 'actualHours', 'takenHours', 'completionPercentage', 'status',
    ];

    const TOPIC_BREAKDOWN_COLUMN_ORDER = [
        'topicName', 'actualHours', 'takenHours', 'completionPercentage', 'status',
    ];

    const APPROVAL_TABLE_COLUMN_ORDER = [
        'request_no', 'institution', 'batch_name', 'class_name', 'subject', 'chapter_no', 'date', 'started_time', 'ended_time', 'total_hours', 'request_action', 'approval_status',
    ];
    
    // --- MEMOIZED FILTER DEFINITIONS ---
    const filterDefinitions = useMemo(() => {
        return {
            institution: generateOptionsForColumn(allBatchesFlat, 'institution'),
            course_category: generateOptionsForColumn(allBatchesFlat, 'course_category'),
            level_category: generateOptionsForColumn(allBatchesFlat, 'level_category'),
            package_name: generateOptionsForColumn(allBatchesFlat, 'package_name'),
            batch_name: generateOptionsForColumn(allBatchesFlat, 'batch_name'),
            class_name: generateOptionsForColumn(allBatchesFlat, 'class_name'),
        };
    }, []);
    
    // --- MEMOIZED APPROVAL FILTER DEFINITIONS (Includes "All" option) ---
    const approvalFilterDefinitions = useMemo(() => {
        return {
            institution: generateApprovalFilterOptions(MOCK_APPROVAL_REQUESTS, 'institution'),
            batch_name: generateApprovalFilterOptions(MOCK_APPROVAL_REQUESTS, 'batch_name'),
            class_name: generateApprovalFilterOptions(MOCK_APPROVAL_REQUESTS, 'class_name'),
            subject: generateApprovalFilterOptions(MOCK_APPROVAL_REQUESTS, 'subject'),
            approval_status: generateApprovalFilterOptions(MOCK_APPROVAL_REQUESTS, 'approval_status'),
        };
    }, []);


    // --- INITIAL FILTER SETUP ---
    useEffect(() => {
        const initialActiveFilters = {};
        Object.keys(filterDefinitions).forEach(key => {
            if (filterDefinitions[key].length > 0) {
                initialActiveFilters[key] = filterDefinitions[key][0].value;
            }
        });
        
        // Initialize activeFilters only if empty
        setActiveFilters(prev => {
            return Object.keys(prev).length === 0 ? initialActiveFilters : prev;
        });

        // Initialize approvalFilters with 'All' (empty string value)
        const initialApprovalFilters = {};
        Object.keys(approvalFilterDefinitions).forEach(key => {
            initialApprovalFilters[key] = '';
        });
        setApprovalFilters(initialApprovalFilters);

    }, [filterDefinitions, approvalFilterDefinitions]);


    // --- HANDLERS FOR FILTER & DETAIL VIEW ---

    // Filters update the context data displayed for the Subject Table
    const handleFilterChange = useCallback((column, value) => {
        setActiveFilters(prev => ({ ...prev, [column]: value }));
        setSelectedSubjectId(null);
        setSelectedChapterId(null);
        
        // Find the new class context based on selected filters
        const matchingRow = allBatchesFlat.find(row => {
            const newFilters = { ...activeFilters, [column]: value };
            return Object.keys(newFilters).every(key => row[key] === newFilters[key]);
        });

        if (matchingRow) {
            setSelectedClassDetail(matchingRow.fullClassData);
            setModalCourseCategory(matchingRow.course_category);
            setModalLevelCategory(matchingRow.level_category);
        } else {
            setSelectedClassDetail(null);
        }
    }, [activeFilters]);

    // Filters for the Approval Table
    const handleApprovalFilterChange = useCallback((column, value) => {
        setApprovalFilters(prev => ({ ...prev, [column]: value }));
    }, []);
    
    // Search handler for SUBJECT/CONTECT TABLES (Level 1)
    const handleSearch = useCallback((query) => {
        setSearchTerm(query);
    }, []);
    
    // NEW: Search handler for APPROVAL TABLE
    const handleApprovalSearch = useCallback((query) => {
        setApprovalSearchTerm(query);
    }, []);
    
    
    // SCROLL UTILITY: Scrolls to a given ref element smoothly, centering it
    const scrollToElement = useCallback((ref) => {
        ref.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start', // 'start' usually works best to bring the target into view
        });
    }, []);
    
    
    // Handler for Subject Row Click (Level 1) - Scrolls to Chapter Table
    const handleSubjectSelect = useCallback((subjectId) => {
        if (selectedSubjectId === subjectId) {
            setSelectedSubjectId(null);
            setSelectedChapterId(null); 
        } else {
            setSelectedSubjectId(subjectId);
            setSelectedChapterId(null);
            
            // Scroll to the Chapter Table section
            setTimeout(() => scrollToElement(chapterTableRef), 100); 
        }
    }, [selectedSubjectId, scrollToElement]);
    
    // Handler for Chapter Row Click (Level 2) - Scrolls to Topic Table
    const handleChapterSelect = useCallback((chapterId) => {
        if (selectedChapterId === chapterId) {
            setSelectedChapterId(null);
        } else {
            setSelectedChapterId(chapterId);
            
            // Scroll to the Topic Table section
            setTimeout(() => scrollToElement(topicTableRef), 100);
        }
    }, [selectedChapterId, scrollToElement]);
    
    // Handler for Approval Table Action
    const handleApprovalStatusChange = useCallback((requestId, newStatus) => {
        setApprovalRequests(prev => prev.map(req => 
            req.id === requestId ? { ...req, approval_status: newStatus } : req
        ));
    }, []);

    // --- MODAL / CRUD Handlers (Disabled/Simplified) ---
    const handleAddClick = () => {
        if (!selectedClassDetail) {
             alert("Please ensure a valid Class context is selected via the filters before adding a new item.");
             return;
        }
        setModalBatchData('NEW'); 
    };
    
    // --- DATA TRANSFORMATION FOR DETAIL TABLES ---
    
    // 1. Subject Completion Data for DynamicTable (Level 1 Detail) - Uses 'searchTerm'
    const subjectCompletionData = useMemo(() => {
        if (!selectedClassDetail) return [];

        let filteredSubjects = MOCK_SUBJECT_COMPLETION.filter(sub => selectedClassDetail.subjectsIds.includes(sub.subjectId));

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            filteredSubjects = filteredSubjects.filter(sub => 
                sub.subjectCode.toLowerCase().includes(query) || getSubjectName(sub.subjectId, subjectsMap).toLowerCase().includes(query)
            );
        }

        return filteredSubjects
            .map(subject => {
                const teacherName = getTeacherName(subject.subjectId === 'sub_id_1' ? 'teacher_id_1' : 'teacher_id_2', teachersMap);
                const completionPercentage = subject.totalHours > 0 
                    ? Math.round((subject.completedHours / subject.totalHours) * 100) + '%'
                    : '0%';
                
                return {
                    id: subject.subjectId,
                    subjectCode: subject.subjectCode,
                    subjectName: getSubjectName(subject.subjectId, subjectsMap),
                    totalHours: `${subject.totalHours} hrs`,
                    completedHours: `${subject.completedHours} hrs`,
                    completionPercentage: completionPercentage, 
                    teacherName: teacherName,
                    status: subject.status,
                };
            });
    }, [selectedClassDetail, teachersMap, subjectsMap, searchTerm]);

    // 2. Chapter Breakdown Data for DynamicTable (Level 2 Detail)
    const chapterBreakdownData = useMemo(() => {
        if (!selectedSubjectId) return [];

        return (MOCK_CHAPTER_DETAILS[selectedSubjectId] || []).map(chapter => {
            const completionPercentage = chapter.actualHours > 0 
                ? Math.round((chapter.takenHours / chapter.actualHours) * 100) + '%'
                : '0%';
            
            return {
                id: chapter.chapterId,
                chapterNo: chapter.chapterNo,
                chapterName: chapter.chapterName,
                actualHours: `${chapter.actualHours} hrs`,
                takenHours: `${chapter.takenHours} hrs`,
                completionPercentage: completionPercentage, 
                status: chapter.status,
            };
        });
    }, [selectedSubjectId]);
    
    // 3. Topic Breakdown Data for DynamicTable (Level 3 Detail)
    const topicBreakdownData = useMemo(() => {
        if (!selectedChapterId) return [];
        
        return (MOCK_TOPIC_DETAILS[selectedChapterId] || []).map(topic => {
             const completionPercentage = topic.actualHours > 0 
                ? Math.round((topic.takenHours / topic.actualHours) * 100) + '%'
                : '0%';
            
            return {
                id: topic.topicId,
                topicName: topic.topicName,
                actualHours: `${topic.actualHours} hrs`,
                takenHours: `${topic.takenHours} hrs`,
                completionPercentage: completionPercentage,
                status: topic.status,
            };
        });
    }, [selectedChapterId]);


    // 4. Approval Table Data (Applied Approval Filters) - Uses 'approvalSearchTerm'
    const approvalTableData = useMemo(() => {
        let data = approvalRequests;

        // Apply filters from approvalFilters state
        Object.keys(approvalFilters).forEach(key => {
            const filterValue = approvalFilters[key];
            if (filterValue) {
                data = data.filter(req => req[key] === filterValue);
            }
        });
        
        // Apply independent search filter (UPDATED TO USE approvalSearchTerm)
        if (approvalSearchTerm) {
            const query = approvalSearchTerm.toLowerCase();
            data = data.filter(req => 
                req.institution.toLowerCase().includes(query) ||
                req.batch_name.toLowerCase().includes(query) ||
                req.class_name.toLowerCase().includes(query) ||
                req.subject.toLowerCase().includes(query) ||
                req.request_action.toLowerCase().includes(query) ||
                req.approval_status.toLowerCase().includes(query)
            );
        }
        
        return data.map(req => ({
            ...req,
            id: req.id,
            request_no: `#${req.request_no}`,
            started_time: req.started_time, 
            ended_time: req.ended_time, 
            total_hours: `${req.total_hours} hrs`,
        }));
    }, [approvalRequests, approvalFilters, approvalSearchTerm]); // Dependency updated

    // --- JSX Rendering ---

    // RENDER 1: Subject Completion Table (Level 1 Detail) - Uses `handleSearch`
    const renderSubjectDetailsTable = () => selectedClassDetail && (
   
            
            <DynamicTable
                data={subjectCompletionData}
                columnOrder={SUBJECT_COMPLETION_COLUMN_ORDER}
                title="Subjects"
                customDescription="Search for a specific subject or teacher."
                
                // FILTERS FOR CONTEXT SELECTION
                filterDefinitions={filterDefinitions}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                
                onRowClickable={true}
                onRowClick={handleSubjectSelect}
                selectedRowId={selectedSubjectId}
                pillColumns={['status']}
                columnDisplayNameMap={{
                    subjectCode: 'Code', subjectName: 'Subject Name', totalHours: 'Total Hrs', completedHours: 'Completed Hrs', completionPercentage: 'Completion %', teacherName: 'Teacher',
                }}
                onSearch={handleSearch} // Linked to subject searchTerm state
                // onAddNew={handleAddClick}
                onEdit={null}
                onDelete={null}
            />
        
    );
    
    // RENDER 2: Chapter Breakdown Table (Level 2 Detail)
    const renderChapterBreakdownTable = () => {
        if (!selectedSubjectId) return null;

        const selectedSubject = MOCK_SUBJECT_COMPLETION.find(s => s.subjectId === selectedSubjectId);
        const subjectName = selectedSubject ? getSubjectName(selectedSubject.subjectId, subjectsMap) : "Selected Subject";
        
        return (
            // Added chapterTableRef here for scrolling
            <div ref={chapterTableRef}> 
                <DynamicTable
                    data={chapterBreakdownData}
                    columnOrder={CHAPTER_BREAKDOWN_COLUMN_ORDER}
                    title={`Chapters in ${subjectName}`}
                    customDescription="Click a chapter row to view its topic breakdown."
                    onRowClickable={true}
                    onRowClick={handleChapterSelect} 
                    selectedRowId={selectedChapterId}
                    pillColumns={['status']}
                    columnDisplayNameMap={{
                        chapterNo: 'Chapter No', chapterName: 'Chapter Name', actualHours: 'Actual Hrs', takenHours: 'Taken Hrs', completionPercentage: 'Completion %',
                    }}
                />
            </div>
        );
    };
    
    // RENDER 3: Topic Breakdown Table (Level 3 Detail)
    const renderTopicBreakdownTable = () => {
        if (!selectedChapterId) return null;

        const selectedChapter = chapterBreakdownData.find(c => c.id === selectedChapterId);
        const chapterName = selectedChapter ? selectedChapter.chapterName : "Selected Chapter";

        return (
            // Added topicTableRef here for scrolling
            <div ref={topicTableRef}>
                <DynamicTable
                    data={topicBreakdownData}
                    columnOrder={TOPIC_BREAKDOWN_COLUMN_ORDER}
                    title={`Topics in ${chapterName}`}
                    customDescription="Details and status of individual topics."
                    pillColumns={['status']}
                    columnDisplayNameMap={{
                        topicName: 'Topic Name', actualHours: 'Actual Hrs', takenHours: 'Taken Hrs', completionPercentage: 'Completion %',
                    }}
                />
            </div>
        );
    };


    // RENDER 4: Completion Approval Table - Uses `handleApprovalSearch`
    const renderApprovalTable = () => (
        
            
            <div ref={approvalTableRef}>
                <DynamicTable
                    data={approvalTableData}
                    unfilteredData={MOCK_APPROVAL_REQUESTS} 
                    columnOrder={APPROVAL_TABLE_COLUMN_ORDER}
                    title="Completion Approval"
                    customDescription="Review and approve/reject hours logged by teachers/students."
                    
                    // FILTERS FOR APPROVAL TABLE
                    filterDefinitions={approvalFilterDefinitions}
                    activeFilters={approvalFilters}
                    onFilterChange={handleApprovalFilterChange}
                    
                    // Linked to independent approvalSearchTerm state
                    onSearch={handleApprovalSearch} 

                    onStatusChange={handleApprovalStatusChange} 
                    pillColumns={['approval_status', 'request_action']}
                    columnDisplayNameMap={{
                        request_no: 'Req. No', batch_name: 'Batch', class_name: 'Class', chapter_no: 'Chapter', started_time: 'Start Time', ended_time: 'End Time', total_hours: 'Total Hrs', request_action: 'Action Type', approval_status: 'Approval Status',
                    }}
                    hasApprovalActions={true} 
                    onEdit={null} 
                    onDelete={null} 
                />
            </div>
        
    );


    return (
        <div className="batch_wrapper">
            <div className="batch_wrapper_flex">

            <h1 className="batch_title">Course Completion Management</h1>
            <div className="batch_jump-to-approval">
                <button 
                    className="batch_btn-secondary"
                    // Scroll to the approval table when button is clicked
                    onClick={() => scrollToElement(approvalTableRef)}
                >
                    <FiSend size={16} style={{ marginRight: '8px' }}/> View Completion Approval Requests
                </button>
            </div>
            </div>
            
            <div className="batch_detail-sections" ref={detailSectionRef}>
                
                {/* DETAIL LEVEL 1: Subject Completion Table (PRIMARY VIEW WITH CONTEXT FILTERS) */}
                {renderSubjectDetailsTable()}

                {/* DETAIL LEVEL 2: Chapter Breakdown Table */}
                {renderChapterBreakdownTable()}
                
                {/* DETAIL LEVEL 3: Topic Breakdown Table */}
                {renderTopicBreakdownTable()}
            </div>
            
            {/* ==================================== */}
            {/* Completion Approval Table (WITH FILTERS) */}
            {/* ==================================== */}
            {renderApprovalTable()}


            {/* ==================================== */}
            {/* ADD/EDIT BATCH MODAL RENDER */}
            {/* ==================================== */}
            {modalCourseCategory && modalLevelCategory && (
                <AddBatchModal
                    initialBatchData={null} 
                    onClose={() => setModalBatchData(null)}
                    courseCategory={modalCourseCategory}
                    levelCategory={modalLevelCategory}
                    onSubmit={() => setModalBatchData(null)} 
                />
            )}

        </div>
    );
};

export default CourseCompletion;