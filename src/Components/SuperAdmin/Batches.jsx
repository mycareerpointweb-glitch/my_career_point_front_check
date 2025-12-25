import React, { useState, useEffect, useRef, useMemo } from "react";
import '../../Styles/SuperAdmin/Batches.css'; // Link to the new CSS
import institutionsData from '../dummy.json'; // Acting as local file
import DynamicTable from "../Reusable/DynamicTable"; // 1. Import DynamicTable

import {
    FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle,
    FiHome, FiStar, FiLayers, FiChevronDown, FiUsers, FiClock, FiBookOpen
} from "react-icons/fi";
import CardSlider from "../Reusable/CardSlider"; // CardSlider is kept/added
// import Dummy from "../Reusable/practise"; // Removed as requested

// =======================================================
// === 1. MOCK DATA CONSTANTS ===
// =======================================================
// --- MOCK Programme CONSTANT ---
const MOCK_Programme = [
    { name: "Default Package", key: "Default_Package_id" },
    { name: "Sure pass", key: "Sure_pass_id" },
    { name: "Junior level", key: "Junior_level_id" },
    { name: "remastered pack", key: "remastered_pack_id" },
];
// --- END MOCK Programme CONSTANT ---

// --- DYNAMIC TABLE COLUMN DEFINITION ---
const BATCHES_COLUMN_ORDER = [
    'name',
    'active',
    'totalClasses',
    'totalSubjects',
    'assignedTeachersDisplay' // A calculated field
];
// --- END COLUMN DEFINITION ---


// =======================================================
// === 2. DATA TRANSFORMATION LOGIC (Normalized Data) ===
// =======================================================
// Helper function to get teacher name from ID (using global map)
const getTeacherName = (id, teachersMap) => teachersMap[id]?.name || id;

// Helper function to get subject name from ID (using global map)
const getSubjectName = (id, subjectsMap) => subjectsMap[id] || id;

const transformJSONData = (rawData) => {
    // 1. Reference Maps
    const mockInstitutions = (rawData.institutions_reference || []).map(inst => ({
        name: inst.name,
        id: inst.institution_id
    }));

    // Map teachers for quick lookup of name and subjects taught
    const teachersMap = (rawData.teachers_reference || []).reduce((acc, curr) => {
        acc[curr.teacher_id] = { name: curr.name, subjects: curr.subjects_taught_ids || [] };
        return acc;
    }, {});

    // Map subjects for quick lookup of name
    const subjectsMap = (rawData.subjects_reference || []).reduce((acc, curr) => {
        acc[curr.subject_id] = curr.subject_name;
        return acc;
    }, {});

    const coursesReference = rawData.courses_reference.reduce((acc, curr) => {
        acc[curr.course_id] = curr.course_name;
        return acc;
    }, {});

    // Helper to get teacher IDs who teach at least one of the subjects
    const getTeachersForSubjects = (subjectIds) => {
        const teacherIds = new Set();
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

    detailedInstRecords.forEach(inst_data => {
        const inst_id = inst_data.institution_id;
        // Updated structure: levels will contain nested Programme
        initialAllData[inst_id] = { streams: [], courses: [], levels: {} };
        const processed_stream_ids = new Set();

        (inst_data.courses || []).forEach(course => {
            const stream_id = course.course_id;
            const stream_name = coursesReference[stream_id] || stream_id;

            if ((course.levels || []).length === 0) {
                return;
            }

            if (!processed_stream_ids.has(stream_id)) {
                initialAllData[inst_id].streams.push({ name: stream_name, id: stream_id });
                processed_stream_ids.add(stream_id);
            }

            (course.levels || []).forEach(level => {
                const level_name = level.level_name;
                const level_id = level.level_id;

                initialAllData[inst_id].courses.push({ stream: stream_name, name: level_name, id: level_id });

                // Key for Level (Stream_LevelName)
                const level_key = `${stream_name}_${level_name}`;

                // Programme are now nested under the level key
                if (!initialAllData[inst_id].levels[level_key]) {
                     // MODIFIED: Initialize the level with ALL mock Programme so they appear for selection
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
                    const allSubjectIds = Array.from(new Set([...commonSubjects, ...specificSubjectsFlat]));
                    const totalSubjects = allSubjectIds.length;
                    const assignedTeachers = getTeachersForSubjects(allSubjectIds);

                    // Prepare data for DynamicTable
                    const assignedTeachersNames = assignedTeachers.map(tId => getTeacherName(tId, teachersMap));

                    const batchData = {
                        name: batch_name,
                        id: batch.batch_id,
                        active: is_active ? 'Active' : 'Inactive', // Display string for DynamicTable
                        totalClasses: totalClasses,
                        totalSubjects: totalSubjects,
                        assignedTeachers: assignedTeachers, // ID list
                        assignedTeachersDisplay: assignedTeachersNames.join(', '), // Comma-separated list for PillColumn in DT
                        classes: classes.map(c => {
                            const groupKey = c.class_name.split(' ').pop();
                            const classSpecificSubjects = specificSubjectsGroups[groupKey] || [];

                            const classSubjectsIds = Array.from(new Set([...commonSubjects, ...classSpecificSubjects]));
                            const classTeachersIds = getTeachersForSubjects(classSubjectsIds);

                            return {
                                ...c,
                                totalStudents: c.students_ids ? c.students_ids.length : 0,
                                subjectsIds: classSubjectsIds,
                                teachersIds: classTeachersIds,
                                class_name: c.class_name,
                                class_id: c.class_id,
                                // Pass references needed for detailed mapping
                                allSubjects: subjectsMap,
                                allTeachers: teachersMap,
                            };
                        }),
                        startTime: "09:00 AM", // Mocked field for form
                        endTime: "01:00 PM", // Mocked field for form
                        location: "Main Campus, Room 101", // Mocked field for form
                        mode: "Hybrid", // Mocked field for form
                        notes: "This batch focuses on advanced topics.", // Mocked field for form
                    };

                    // Place the batch into the mock package
                    initialAllData[inst_id].levels[level_key]["Default Package"].push(batchData);
                });
            });
        });
    });

    return { mockInstitutions, teachersMap, subjectsMap, initialAllData };
};

// =======================================================
// === 3. INITIALIZING CONSTANTS FROM TRANSFORMED DATA ===
// =======================================================
const { mockInstitutions, teachersMap, subjectsMap, initialAllData } = transformJSONData(institutionsData);


// --- Timetable Generation Helper (MODIFIED FOR DYNAMICTABLE) ---
const generateMockTimetable = (classId, subjectTeacherMap) => {
    // Subjects relevant to CA/CMA/ACMA
    const allSubjects = ['Accounting', 'Taxation', 'Law', 'Costing', 'Auditing', 'Economics', 'Maths', 'Statistics'];
    const filteredSubjects = allSubjects.filter(sub => Object.keys(subjectTeacherMap).includes(sub));
    const finalSubjects = filteredSubjects.length > 0 ? filteredSubjects : ['Accounting', 'Taxation', 'Law', 'Economics']; // Fallback

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { time: '8:00 AM - 9:00 AM', period: 'P1' },
        { time: '9:00 AM - 10:00 AM', period: 'P2' },
        { time: '10:00 AM - 11:00 AM', period: 'P3' },
        { time: '11:00 AM - 12:00 PM', period: 'P4' },
        { time: '1:00 PM - 2:00 PM', period: 'P5' },
        { time: '2:00 PM - 3:00 PM', period: 'P6' },
    ];
    
    // Simulate 3 to 4 days active with 4 to 6 classes per day
    const activeDaysCount = Math.floor(Math.random() * 2) + 3; // 3 or 4 days
    const activeDays = days.slice(0, activeDaysCount);

    const schedule = []; // Array of rows for DynamicTable
    let subjectIndex = 0;

    timeSlots.forEach((slot) => {
        const row = { timeSlot: slot.time }; // First column is the time slot
        
        days.forEach(day => {
            const cellKey = day.toLowerCase(); // Column key: monday, tuesday, etc.
            
            if (activeDays.includes(day)) {
                // Determine how many classes today (4-6)
                const classesToday = Math.floor(Math.random() * 3) + 4; 
                const slotIndex = timeSlots.findIndex(s => s.time === slot.time);

                if (slotIndex < classesToday) {
                    const subjectName = finalSubjects[subjectIndex % finalSubjects.length];
                    // Use the teacher from the class detail if available, otherwise use a mock teacher for the chosen subject
                    const teacherName = subjectTeacherMap[subjectName] || `Tutor ${subjectIndex % 3 + 1}`;

                    // Content for the cell (Subject Name, Teacher Name) - Separated by comma for PillColumn splitting
                    row[cellKey] = `${subjectName}, ${teacherName}`; 
                    subjectIndex++;
                } else {
                    row[cellKey] = '---'; // Placeholder for slots outside the active teaching period
                }
            } else {
                row[cellKey] = '---'; // Day is not active
            }
        });
        schedule.push(row);
    });

    // DynamicTable column order: Time Slot + Days
    const columnOrder = ['timeSlot', ...days.map(d => d.toLowerCase())];
    
    // DynamicTable display names
    const columnDisplayNameMap = {
        timeSlot: 'Time Slot',
        ...days.reduce((acc, curr) => {
            acc[curr.toLowerCase()] = curr;
            return acc;
        }, {})
    };

    return { schedule, columnOrder, columnDisplayNameMap };
};

// NEW Timetable Component using DynamicTable
const DynamicTimetable = ({ classDetail }) => {
    const subjectTeacherMap = getClassSubjectTeacherMap(classDetail);
    const { schedule, columnOrder, columnDisplayNameMap } = generateMockTimetable(classDetail.class_id, subjectTeacherMap);

    // Using pillColumns to display Subject, Teacher Name in a pill format
    const pillColumns = columnOrder.filter(col => col !== 'timeSlot');

    return (
    
          
             <DynamicTable
                data={schedule}
                columnOrder={columnOrder}
                // NOTE: columnDisplayNameMap is passed but DynamicTable uses an internal formatter if this is not mapped.
                // columnDisplayNameMap={columnDisplayNameMap} 
                title="Time Table" // Title is rendered by the H4 above
                onSearch={null} // Disable search/controls for timetable
                onAddNew={null}
                pillColumns={pillColumns} // Apply pill formatting to all day columns
            />
    );
};


const getClassSubjectTeacherMap = (classDetail) => {
    const subjectTeacherMap = {};
    const teachersMap = classDetail.allTeachers;
    const subjectsMap = classDetail.allSubjects;
    const availableTeachersIds = classDetail.teachersIds;

    classDetail.subjectsIds.forEach(subId => {
        let assignedTeacher = "No Teacher Assigned";

        for (const teacherId of availableTeachersIds) {
            const teacherData = teachersMap[teacherId];
            if (teacherData && teacherData.subjects.includes(subId)) {
                assignedTeacher = getTeacherName(teacherId, teachersMap);
                break;
            }
        }
        subjectTeacherMap[getSubjectName(subId, subjectsMap)] = assignedTeacher;
    });
    return subjectTeacherMap;
};

// =======================================================
// === UPDATED BATCH FORM MODAL (Handles both ADD and EDIT) (Unchanged) ===
// =======================================================
const getInitialFormState = (data) => {
    const isEditing = data && data !== 'NEW';
    // Mapping batch properties to form properties, with fallbacks
    return {
        id: isEditing ? (data.id || null) : null,
        name: isEditing ? (data.name || "") : "",
        startTime: isEditing ? (data.startTime || "09:00 AM") : "09:00 AM",
        endTime: isEditing ? (data.endTime || "01:00 PM") : "01:00 PM",
        location: isEditing ? (data.location || "") : "",
        mode: isEditing ? (data.mode || "Hybrid") : "Hybrid",
        notes: isEditing ? (data.notes || "") : "",
        totalClasses: isEditing ? (data.totalClasses || 1) : 1,
    };
};

const AddBatchModal = ({ initialBatchData, onClose, courseCategory, levelCategory, teachersMap, onSubmit }) => {

    if (!initialBatchData) return null;

    const isEdit = initialBatchData !== 'NEW';

    const [form, setForm] = useState(() => getInitialFormState(initialBatchData));
    const [showConfirm, setShowConfirm] = useState(false); // State to control confirmation

    // Effect to reset form when modal opens/closes or switches mode
    useEffect(() => {
        setForm(getInitialFormState(initialBatchData));
        setShowConfirm(false); // Ensure confirmation is hidden on modal open/mode switch
    }, [initialBatchData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 1. User clicks the main Save/Update button
    const handleSaveClick = (e) => {
        e.preventDefault();
        // Here, we show the confirmation popup. The actual submission is deferred.
        setShowConfirm(true);
    };

    // 2. User clicks the Confirm button in the popup
    const handleConfirmSave = () => {
        onSubmit(form); // Call the main submission handler (which closes the modal internally)
    };

    const modalTitle = isEdit ? `Edit Batch: ${initialBatchData.name}` : "Add New Batch";
    const saveButtonText = isEdit ? "Update Batch" : "Save Batch";
    const confirmMessage = isEdit
        ? `Are you sure you want to update the batch **${form.name}**?`
        : `Are you sure you want to save the new batch **${form.name}** for ${courseCategory} / ${levelCategory}?`;


    return (
        <div className="batch_modal batch_add-batch-modal">
            {/* Main Modal Content (The form) */}
            <div className="batch_modal-content">
                <div className="batch_modal-header">
                    <h3><FiPlus /> {modalTitle}</h3>
                    <FiX onClick={onClose} className="batch_close-modal" />
                </div>
                <form onSubmit={handleSaveClick}>
                    {/* Display Course/Level (Non-Editable) */}
                    <div className="batch_form-group">
                        <label>Course/Level Selected</label>
                        {/* Course and Level are displayed but NOT editable, fulfilling the user request */}
                        <input
                            type="text"
                            value={`${courseCategory} / ${levelCategory}`}
                            readOnly
                            disabled
                            className="batch_read-only-field"
                        />
                    </div>

                    {/* Batch Name (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="batchName">Batch Name <span className="required">*</span></label>
                        <input
                            id="batchName"
                            name="name"
                            type="text"
                            placeholder="e.g., CA Foundation May 2026"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Time Fields (Editable) */}
                    <div className="batch_form-row">
                        <div className="batch_form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="text"
                                placeholder="e.g., 09:00 AM"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="batch_form-group">
                            <label htmlFor="endTime">End Time</label>
                            <input
                                id="endTime"
                                name="endTime"
                                type="text"
                                placeholder="e.g., 01:00 PM"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Location (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g., Main Campus, Room 101"
                            value={form.location}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Mode (Editable) */}
                    <div className="batch_form-group">
                        <label>Mode <span className="required">*</span></label>
                        <div className="batch_radio-group">
                            {['Hybrid', 'Online', 'Offline'].map(mode => (
                                <label key={mode} className="batch_radio-label">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value={mode}
                                        checked={form.mode === mode}
                                        onChange={handleChange}
                                        required
                                    />
                                    {mode}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Total Class Count (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="totalClasses">Total Class Count</label>
                        <input
                            id="totalClasses"
                            name="totalClasses"
                            type="number"
                            min="1"
                            placeholder="e.g., 5"
                            value={form.totalClasses}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Notes (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            placeholder="Any special instructions or details about the batch..."
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="batch_modal-actions">
                        <button type="button" className="batch_btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="batch_btn-primary">{saveButtonText}</button>
                    </div>
                </form>
            </div>

            {/* Confirmation Popup: MOVED OUTSIDE the inner batch_modal-content to ensure it overlays the entire form */}
            {showConfirm && (
                <div className="batch_modal-confirmation-overlay">
                    <div className="batch_modal-content batch_confirm-popup">
                        <FiAlertTriangle size={32} className="batch_confirm-icon" />
                        <h4>Confirm Batch {isEdit ? 'Update' : 'Creation'}</h4>
                        <p>{confirmMessage}</p>
                        <div className="batch_modal-actions">
                            <button
                                className="batch_btn-secondary"
                                onClick={() => setShowConfirm(false)} // Close confirmation, return to form
                            >
                                Cancel
                            </button>
                            <button
                                className="batch_btn-primary"
                                onClick={handleConfirmSave} // Final submission here
                            >
                                Confirm {isEdit ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Batches Component ---
const Batches = () => {

    // ====================================
    // === SCROLL REFS ===
    // ====================================
    const coursesRef = useRef(null);
    const levelsRef = useRef(null);
    const ProgrammeRef = useRef(null);
    const batchesListRef = useRef(null);
    const classDetailsRef = useRef(null);


    // --- State Initialization (Kept for logic) ---
    const [allInstData] = useState(initialAllData);
    const [activeInstitutionId, setActiveInstitutionId] = useState(null);
    const [activeCourseCategory, setActiveCourseCategory] = useState(null);
    const [activeLevelCategory, setActiveLevelCategory] = useState(null);
    const [selectedPackageName, setSelectedPackageName] = useState(null);
    const [activeBatches, setActiveBatches] = useState([]);

    // STATES FOR DRILL-DOWN
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [tableSearchTerm, setTableSearchTerm] = useState(''); // New state for DynamicTable search
    const [, setSelectedPackage] = useState(null); // Retained for completeness


    // 2. Search States
    const [instSearchTerm, setInstSearchTerm] = useState("");
    const [courseSearchTerm, setCourseSearchTerm] = useState("");

    // 3. Derived State (useMemo for efficiency)
    const currentInstData = useMemo(() => activeInstitutionId ? allInstData[activeInstitutionId] : null, [activeInstitutionId, allInstData]);

    const institutions = useMemo(() => mockInstitutions.filter(inst => inst.name.toLowerCase().includes(instSearchTerm.toLowerCase())
    ), [instSearchTerm]);

    const coursesForSelectedInst = useMemo(() => currentInstData?.streams.filter(s => s.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
    ) || [], [currentInstData, courseSearchTerm]
    );

    const levelsForSelectedCourse = useMemo(() => currentInstData?.courses.filter(c => c.stream === activeCourseCategory) || [], [currentInstData, activeCourseCategory]
    );


    // DERIVED STATE FOR Programme (MOCK)
    const ProgrammeForSelectedLevel = useMemo(() => {
        if (activeCourseCategory && activeLevelCategory && currentInstData) {
            const level_key = `${activeCourseCategory}_${activeLevelCategory}`;
            const ProgrammeObject = currentInstData.levels[level_key] || {};
            return Object.keys(ProgrammeObject);
        }
        return [];
    }, [currentInstData, activeCourseCategory, activeLevelCategory]);

    // DERIVED STATE FOR CLASSES (NEW)
    const classMap = useMemo(() => {
        if (selectedBatch) {
            // Map the class list to a Map<class_id, class_name> for CardSlider
            return new Map(selectedBatch.classes.map(c => [c.class_id, c.class_name]));
        }
        return new Map();
    }, [selectedBatch]);


    // 4. Modal and Form States (Simplified)
    const [addInstitutionOpen, setAddInstitutionOpen] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState("");
    const [addStreamOpen] = useState(false);
    const [addCourseOpen] = useState(false);

    // BATCH MODAL STATE (Handles both ADD ('NEW') and EDIT ({batch}))
    const [modalBatchData, setModalBatchData] = useState(null);

    // ---
    const [, setNewCourseForm] = useState({ stream: null, name: "" });
    const [, setNewLevelForm] = useState({ name: "", teachers: Object.keys(teachersMap).slice(0, 2), status: 'Active' });


    // ====================================
    // === SCROLL EFFECTS ===
    // ====================================
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

    // Scroll to Courses when Institution is selected
    useEffect(() => {
        if (activeInstitutionId) {
            scrollToRef(coursesRef);
        }
    }, [activeInstitutionId]);

    // Scroll to Levels when Course is selected
    useEffect(() => {
        if (activeCourseCategory) {
            scrollToRef(levelsRef);
        }
    }, [activeCourseCategory]);

    // Scroll to Programme when Level is selected
    useEffect(() => {
        if (activeLevelCategory) {
            scrollToRef(ProgrammeRef);
        }
    }, [activeLevelCategory]);

    // Scroll to Batches List when Package is selected
    useEffect(() => {
        if (selectedPackageName) {
            // Give a short delay to allow the batches data to render completely
            const timer = setTimeout(() => {
                scrollToRef(batchesListRef);
            }, 100); 
            return () => clearTimeout(timer);
        }
    }, [selectedPackageName]);

    // Scroll to Class Details/Timetable when a Batch is selected
    useEffect(() => {
        if (selectedBatch) {
            // Use a short delay for the class details section to render
            const timer = setTimeout(() => {
                scrollToRef(classDetailsRef);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedBatch]);
    
    // Scroll to Timetable when a Class is selected
    useEffect(() => {
        if (selectedClass) {
            // Use a short delay for the timetable to render
            const timer = setTimeout(() => {
                scrollToRef(classDetailsRef); // Use the same ref as batch selection
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedClass]);
    // ====================================
    // === END SCROLL EFFECTS ===
    // ====================================


    // EFFECT TO LOAD BATCHES (Keep this)
    useEffect(() => {
        if (activeInstitutionId && activeCourseCategory && activeLevelCategory && currentInstData && selectedPackageName) {
            const level_key = `${activeCourseCategory}_${activeLevelCategory}`;
            const batches = currentInstData.levels[level_key]?.[selectedPackageName] || [];
            setActiveBatches(batches);
        } else {
             // Ensure batches are cleared if selection is incomplete
            setActiveBatches([]);
        }
    }, [activeInstitutionId, activeCourseCategory, activeLevelCategory, selectedPackageName, currentInstData]);


    // --- Handlers (Modified slightly to work with CardSlider's output) ---
    const handleInstitutionSelect = (instId) => {
        // CardSlider returns the key (ID)
        setActiveInstitutionId(instId);
        setActiveCourseCategory(null);
        setActiveLevelCategory(null);
        setSelectedPackageName(null); // Reset package
        setActiveBatches([]);
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleCourseCategorySelect = (courseId) => {
        // CardSlider returns the key (ID), need to find the Course Name for state
        const courseName = institutionsData.courses_reference.find(c => c.course_id === courseId)?.course_name || courseId;

        if (activeCourseCategory === courseName) return;

        setActiveCourseCategory(courseName);
        setActiveLevelCategory(null);
        setSelectedPackageName(null); // Reset package
        setActiveBatches([]);
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleLevelCategorySelect = (levelId) => {
        // CardSlider returns the key (ID), need to find the Level Name for state
        const selectedLevel = levelsForSelectedCourse.find(l => l.id === levelId);
        const levelCategoryName = selectedLevel?.name || levelId;

        if (activeLevelCategory === levelCategoryName) return;

        setActiveLevelCategory(levelCategoryName);
        setSelectedPackageName(null); // Reset package
        setActiveBatches([]); // Clear batches until package is selected
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleProgrammeelect = (packageName) => {
        // CardSlider returns the key (Name, as there's no ID)
        if (selectedPackageName === packageName) {
            setSelectedPackageName(null);
        } else {
            setSelectedPackageName(packageName);
        }
        // The useEffect handles the batch loading/clearing
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleRowSelect = (batchId) => {
        // DynamicTable onRowSelect passes the ID if onRowClickable is true. 
        // We need to find the full row object from the activeBatches array.
        const batch = activeBatches.find(b => b.id === batchId);

        // *** CONFIRMATION LOG: CHECK IF THIS IS REACHED ***
        console.log(`--- handleRowSelect triggered with ID: ${batchId} ---`); 

        if (selectedBatch?.id === batchId) {
            // Deselecting the batch
            console.log(`Deselecting Batch ID: ${batchId}`); 
            setSelectedBatch(null); 
            setSelectedClass(null);
        } else if (batch) {
            // Selecting a new batch
            console.log(`Selecting Batch: ${batch.name} (ID: ${batchId})`); 
            setSelectedBatch(batch);
            setSelectedClass(null); // Clear selected class
        }
    };

    const handleClassSelect = (classId) => {
        // CardSlider returns the key (ID)
        const selectedClassDetail = selectedBatch?.classes.find(c => c.class_id === classId);

        if (selectedClass?.class_id === classId) {
            console.log(`Deselecting Class ID: ${classId}`); 
            setSelectedClass(null); // Deselect class
        } else {
            console.log(`Selecting Class: ${selectedClassDetail.class_name} (ID: ${classId})`); 
            setSelectedClass(selectedClassDetail); // Select class, which will display the timetable
        }
    };

    const handleNewInstitutionSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting new institution:", newInstitutionName);
        setAddInstitutionOpen(false);
        setNewInstitutionName("");
    };

    const handleEditClick = (batchRow) => {
        // DynamicTable passes the entire row object, which is already ready for the modal
        setModalBatchData(batchRow);
    };

    const handleAddClick = () => {
        setModalBatchData('NEW'); // Use a special string to denote 'Add New'
    };

    const handleBatchSubmit = (formData) => {
        console.log("Batch Submitted/Updated:", formData);

        // Store the updated/new batch object temporarily
        let updatedOrNewBatch = null;

        setActiveBatches(prevBatches => {
            const isEditing = formData.id;
            if (isEditing) {
                // Find the original batch to retain classes/subjects/teachers data
                const originalBatch = prevBatches.find(b => b.id === formData.id);

                // Merge new form data with original batch data
                if (originalBatch) {
                     // Get current assigned teachers display string to avoid recalculating the whole array
                    const assignedTeachersNames = originalBatch.assignedTeachers.map(tId => getTeacherName(tId, teachersMap));
                    const assignedTeachersDisplay = assignedTeachersNames.join(', ');

                    const updatedBatch = {
                        ...originalBatch, // Retain all non-form data (like classes, subjects, etc.)
                        ...formData,
                        totalClasses: parseInt(formData.totalClasses, 10),
                        assignedTeachersDisplay: assignedTeachersDisplay // Retain existing display string
                    };
                    
                    // --- FIX: Capture updated batch for state update after setActiveBatches ---
                    updatedOrNewBatch = updatedBatch; 
                    // --- END FIX ---
                    
                    return prevBatches.map(b => b.id === formData.id ? updatedBatch : b);
                }
                return prevBatches;

            } else {
                // Mock adding a new batch
                const mockAssignedTeachersIds = Object.keys(teachersMap).slice(0, Math.floor(Math.random() * 3) + 1);
                const mockAssignedTeachersNames = mockAssignedTeachersIds.map(tId => getTeacherName(tId, teachersMap));

                const newBatch = {
                    ...formData,
                    id: `mock-batch-${Date.now()}`,
                    totalClasses: parseInt(formData.totalClasses, 10),
                    active: 'Active',
                    totalSubjects: Math.floor(Math.random() * 5) + 3, // Mock data
                    assignedTeachers: mockAssignedTeachersIds,
                    assignedTeachersDisplay: mockAssignedTeachersNames.join(', '), // New display string
                    classes: [{
                        class_name: `${formData.name} - Class A`,
                        class_id: `mock-class-a-${Date.now()}`,
                        students_ids: Array(Math.floor(Math.random() * 30) + 10).fill(0),
                        allSubjects: subjectsMap,
                        allTeachers: teachersMap,
                        subjectsIds: ['sub_id_1', 'sub_id_2'], // Mock data
                        teachersIds: ['teacher_id_1', 'teacher_id_2'], // Mock data
                    }],
                };

                // --- FIX: Capture new batch for state update after setActiveBatches ---
                updatedOrNewBatch = newBatch;
                // --- END FIX ---
                
                return [...prevBatches, newBatch];
            }
        });

        // --- FIX: Update selectedBatch state if the currently selected one was edited ---
        // This ensures the class detail section updates immediately after editing the batch.
        if (updatedOrNewBatch && selectedBatch?.id === updatedOrNewBatch.id) {
            setSelectedBatch(updatedOrNewBatch);
        }
        // --- END FIX ---
        
        setModalBatchData(null); // Close modal
    };

    const handleBatchDelete = (batchRow) => {
        console.log("Deleting batch:", batchRow.name);
        setActiveBatches(prevBatches => prevBatches.filter(b => b.id !== batchRow.id));
        if (selectedBatch?.id === batchRow.id) {
            setSelectedBatch(null);
            setSelectedClass(null);
        }
    };

    // --- DynamicTable Helper Functions ---
    // Function to handle the global search input from DynamicTable
    const handleTableSearchChange = (query) => {
        setTableSearchTerm(query);
    };

    // Filter active batches based on search term
    const filteredActiveBatches = useMemo(() => {
        if (!tableSearchTerm) return activeBatches;
        const query = tableSearchTerm.toLowerCase();

        return activeBatches.filter(batch => {
            return (
                batch.name.toLowerCase().includes(query) ||
                batch.assignedTeachersDisplay.toLowerCase().includes(query)
            );
        });
    }, [activeBatches, tableSearchTerm]);

    // Define the display names for columns
    const batchColumnDisplayNameMap = useMemo(() => ({
        name: 'Batch Name',
        active: 'Status',
        totalClasses: 'Classes',
        totalSubjects: 'Subjects',
        assignedTeachersDisplay: 'Assigned Teachers',
    }), []);


    // --- Data Mapping for CardSlider (Unchanged) ---
    // The CardSlider component from practise.jsx expects data as a Map<ID, Name>
    const institutionMap = useMemo(() => new Map(institutions.map(inst => [inst.id, inst.name])), [institutions]);

    // Active ID must be the key (ID), not the name, for CardSlider
    const activeCourseId = coursesForSelectedInst.find(c => c.course_id === activeCourseCategory)?.id || null;
    const courseMap = useMemo(() => new Map(coursesForSelectedInst.map(course => [course.id, course.name])), [coursesForSelectedInst]);

    const activeLevelId = levelsForSelectedCourse.find(l => l.name === activeLevelCategory)?.id || null;
    const levelMap = useMemo(() => new Map(levelsForSelectedCourse.map(level => [level.id, level.name])), [levelsForSelectedCourse]);

    // Package data is just names, so we use Name as the key/ID for the map
    const packageMap = useMemo(() => new Map(ProgrammeForSelectedLevel.map(pkg => [pkg, pkg])), [ProgrammeForSelectedLevel]);


    // --- JSX Rendering Functions for Steps 5 & 6 (Updated Step 5 to use DynamicTable) ---

    const renderBatchesList = () => selectedPackageName && (
        // Attach ref to the containing div for scrolling
        <div ref={batchesListRef}>
                   <DynamicTable
                    data={filteredActiveBatches}
                    columnOrder={BATCHES_COLUMN_ORDER}
                    columnDisplayNameMap={batchColumnDisplayNameMap}
                    title="Batches" // DynamicTable renders this as a header
                    onEdit={handleEditClick}
                    userRole={'teacher'}
                    onDelete={handleBatchDelete}
                    onAddNew={handleAddClick}
                    onSearch={handleTableSearchChange}
                    onRowClick={handleRowSelect} // *** FIX: Used onRowClick as expected by DynamicTable ***
                    selectedRowId={selectedBatch?.id} // Highlight selected row
                    onRowClickable={true} // *** KEY: Enable row click to select batch ***

                    // Custom formatting for the Assigned Teachers column
                    pillColumns={['assignedTeachersDisplay']}
                />
        </div>

    );

    const renderClassDetails = () => selectedBatch && (
        // Attach ref to the containing div for scrolling
        <div ref={classDetailsRef}>
            

            {/* NEW: Use CardSlider for Class Selection */}
            <CardSlider
                institutes={classMap}
                title={`Classes in ${selectedBatch.name}`}
                icon_title="Classes"
                fromTabOf="Batches"
                onSelectInstitute={handleClassSelect}
                activeId={selectedClass?.class_id}
                showSearch={false}
                // The icon is dynamically rendered by CardSlider but we use FiBookOpen as the context icon
            />

            {/* Timetable Component (Visible only when a class is selected) */}
            {selectedClass && <DynamicTimetable classDetail={selectedClass} />}
        </div>
    );


    return (
        <div className="batch_wrapper">
            <h1 className="batch_title">Batch Management</h1>
            {/* Institution CardSlider (No ref needed for the first section) */}
            <CardSlider
                institutes={institutionMap}
                title='Institutions'
                icon_title="Institutions"
                onSelectInstitute={handleInstitutionSelect}
                fromTabOf="Batches"
                activeId={activeInstitutionId}
                searchTerm={instSearchTerm}
                onSearchChange={setInstSearchTerm}
                showAddButton={true}
                onAddClick={() => setAddInstitutionOpen(true)}
            />
            
            {/* Courses CardSlider */}
            {activeInstitutionId && (
                <div ref={coursesRef}>
                    <CardSlider
                        institutes={courseMap}
                        title='Courses'
                        icon_title="Courses"
                        fromTabOf="Batches"
                        onSelectInstitute={handleCourseCategorySelect}
                        activeId={activeCourseId}
                        searchTerm={courseSearchTerm}
                        onSearchChange={setCourseSearchTerm}
                    />
                </div>
            )}
            
            {/* Levels CardSlider */}
            {activeCourseCategory && (
                <div ref={levelsRef}>
                    <CardSlider
                        institutes={levelMap}
                        title='Levels'
                        icon_title="Levels"
                        fromTabOf="Batches"
                        onSelectInstitute={handleLevelCategorySelect}
                        activeId={activeLevelId}
                    />
                </div>
            )}
            
            {/* Programme CardSlider */}
            {activeLevelCategory && (
                <div ref={ProgrammeRef}>
                    <CardSlider
                        institutes={packageMap}
                        title='Programme'
                        icon_title="Programme"
                        fromTabOf="Batches"
                        onSelectInstitute={handleProgrammeelect}
                        activeId={selectedPackageName}
                    />
                </div>
            )}


            {/* ==================================== */}
            {/* STEP 5: Batches List (Now using DynamicTable) */}
            {/* ==================================== */}
            {renderBatchesList()}

            {/* ==================================== */}
            {/* STEP 6: Class Breakdown (Starts after Batch selection) */}
            {/* ==================================== */}
            {renderClassDetails()}


            {/* ==================================== */}
            {/* ADD INSTITUTION MODAL RENDER */}
            {/* ==================================== */}
            {addInstitutionOpen && (
                <div className="batch_modal batch_add-institution-modal">
                    <div className="batch_modal-content">
                        <div className="batch_modal-header">
                            <h3><FiHome /> Add New Institution</h3>
                            <FiX onClick={() => setAddInstitutionOpen(false)} className="batch_close-modal" />
                        </div>
                        <form onSubmit={handleNewInstitutionSubmit}>
                            <label htmlFor="instName">Institution Name <span className="required">*</span></label>
                            <input
                                id="instName"
                                name="instName"
                                type="text"
                                placeholder="e.g., Oxford High School"
                                value={newInstitutionName}
                                onChange={(e) => setNewInstitutionName(e.target.value)}
                                required
                            />
                            <div className="batch_modal-actions">
                                <button type="button" className="batch_btn-secondary" onClick={() => setAddInstitutionOpen(false)}>Cancel</button>
                                <button type="submit" className="batch_btn-primary">Add Institution</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================== */}
            {/* NEW ADD/EDIT BATCH MODAL RENDER */}
            {/* ==================================== */}
            {/* Modal only opens if modalBatchData is not null AND course/level are selected */}
            {(activeCourseCategory && activeLevelCategory && modalBatchData) && (
                <AddBatchModal
                    initialBatchData={modalBatchData}
                    onClose={() => setModalBatchData(null)}
                    courseCategory={activeCourseCategory}
                    levelCategory={activeLevelCategory}
                    teachersMap={teachersMap}
                    onSubmit={handleBatchSubmit} // Use the combined submit handler
                />
            )}

        </div>
    );
};

export default Batches;