import CardSlider from '../../Components/Reusable/CardSlider';
import React, { useState, useEffect, useMemo, useRef } from "react"; // ADDED useRef
import '../../Styles/SuperAdmin/PackageManagement.css';
import institutionsData from '../dummy.json';
// -----------------------

import {
    FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle,
    FiHome, FiStar, FiLayers, FiBookOpen
} from "react-icons/fi";
import DynamicTable from '../Reusable/DynamicTable';

const MOCK_Programme = [
    { s_no: 1, name: "Default Package", id: "Default_Package_id", total_batches: 3, batch_names: ["Batch-Apr", "Batch-May", "Batch-Jun"] },
    { s_no: 2, name: "Sure Pass", id: "Sure_pass_id", total_batches: 2, batch_names: ["Batch-May", "Batch-Jun"] },
    { s_no: 3, name: "Junior Level", id: "Junior_level_id", total_batches: 4, batch_names: ["Batch-Jan", "Batch-Feb", "Batch-Mar", "Batch-Apr"] },
    { s_no: 4, name: "Remastered Pack", id: "remastered_pack_id", total_batches: 3, batch_names: ["Batch-Jul", "Batch-Aug", "Batch-Sep"] }
];
const MAPPED_Programme = MOCK_Programme.map(pkg => ({
    ...pkg,
    // Convert the array into a display string for the table
    "batch_names": pkg.batch_names.join(', ')
}));
const transformJSONData = (rawData) => {
    // 1. Reference Maps
    const mockInstitutions = (rawData.institutions_reference || []).map(inst => ({
        name: inst.name,
        id: inst.institution_id
    }));

    const coursesReference = rawData.courses_reference.reduce((acc, curr) => {
        acc[curr.course_id] = curr.course_name;
        return acc;
    }, {});

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

                    const batchData = {
                        name: batch_name, // Keep the batch name here
                        id: batch.batch_id,
                    };

                    // Place the batch into the mock package
                    // Default to the first package, if not specified in mock data
                    initialAllData[inst_id].levels[level_key][MOCK_Programme[0].name].push(batchData);
                });
            });
        });
    });

    return { mockInstitutions, initialAllData };
};

// =======================================================
// === 3. INITIALIZING CONSTANTS FROM TRANSFORMED DATA ===
// =======================================================
const { mockInstitutions, initialAllData } = transformJSONData(institutionsData);


// =======================================================
// === ADD/EDIT PACKAGE MODAL (Handles ADD and EDIT) ===
// =======================================================
const getInitialPackageFormState = (packageName) => {
    const isEditing = packageName && packageName !== 'NEW';
    return {
        name: isEditing ? (packageName || "") : "",
    };
};

// Renamed from AddBatchModal
const AddPackageModal = ({ initialPackageName, onClose, courseCategory, levelCategory, onSubmit }) => {

    if (!initialPackageName) return null;

    const isEdit = initialPackageName !== 'NEW';

    const [form, setForm] = useState(() => getInitialPackageFormState(initialPackageName));
    const [showConfirm, setShowConfirm] = useState(false); // State to control confirmation

    useEffect(() => {
        setForm(getInitialPackageFormState(initialPackageName));
        setShowConfirm(false); // Ensure confirmation is hidden on modal open
    }, [initialPackageName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 1. User clicks the main Save/Update button -> Show confirmation
    const handleSaveClick = (e) => {
        e.preventDefault();
        if (form.name.trim() === '') {
            alert("Package Name is required.");
            return;
        }
        setShowConfirm(true);
    };

    // 2. User clicks the Confirm button in the popup -> Submit and close
    const handleConfirmSave = () => {
        // Pass original name if editing, or simply the new form data
        onSubmit(isEdit ? { oldName: initialPackageName, newName: form.name } : { newName: form.name });
        setShowConfirm(false);
    };

    const modalTitle = isEdit ? `Edit Package: ${initialPackageName}` : "Add New Package";
    const saveButtonText = isEdit ? "Update Package" : "Save Package";
    // Using simple string replacement for markdown bolding in the confirmation message
    const confirmMessage = isEdit
        ? `Are you sure you want to update the package **${initialPackageName}** to **${form.name}**?`
        : `Are you sure you want to save the new package **${form.name}** for ${courseCategory} / ${levelCategory}?`;


    return (
        <div className="PM_batch_modal PM_batch_add-batch-modal">
            {/* Main Modal Content (The form) */}
            <div className="PM_batch_modal-content">
                <div className="PM_batch_modal-header">
                    <h3><FiPlus /> {modalTitle}</h3>
                    <FiX onClick={onClose} className="PM_batch_close-modal" />
                </div>
                <form onSubmit={handleSaveClick}>
                    {/* Display Course/Level (Non-Editable) */}
                    <div className="PM_batch_form-group">
                        <label>Course Selected</label>
                        <input
                            type="text"
                            value={courseCategory}
                            readOnly
                            disabled
                            className="PM_batch_read-only-field"
                        />
                    </div>

                    <div className="PM_batch_form-group">
                        <label>Level Selected</label>
                        <input
                            type="text"
                            value={levelCategory}
                            readOnly
                            disabled
                            className="PM_batch_read-only-field"
                        />
                    </div>

                    {/* Package Name (Editable) */}
                    <div className="PM_batch_form-group">
                        <label htmlFor="packageName">Package Name <span className="required">*</span></label>
                        <input
                            id="packageName"
                            name="name"
                            type="text"
                            placeholder="e.g., Sure Pass 2026"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="PM_batch_modal-actions">
                        <button type="button" className="PM_batch_btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="PM_batch_btn-primary">{saveButtonText}</button>
                    </div>
                </form>
            </div>

            {/* Confirmation Popup */}
            {showConfirm && (
                <div className="PM_batch_modal-confirmation-overlay">
                    <div className="PM_batch_modal-content PM_batch_confirm-popup">
                        <FiAlertTriangle size={32} className="PM_batch_confirm-icon" />
                        <h4>Confirm Package {isEdit ? 'Update' : 'Creation'}</h4>
                        {/* Using dangerouslySetInnerHTML for basic bolding of the dynamically generated message */}
                        <p dangerouslySetInnerHTML={{ __html: confirmMessage.replace(/\*\*/g, '<strong>') }}></p>
                        <div className="PM_batch_modal-actions">
                            <button
                                className="PM_batch_btn-secondary"
                                onClick={() => setShowConfirm(false)} // Close confirmation, return to form
                            >
                                Cancel
                            </button>
                            <button
                                className="PM_batch_btn-primary"
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


// --- Main Programme Component (Renamed from Batches) ---
const Programme = () => {
    // MODIFIED: Set the initial activeInstitutionId to the first available ID
    const initialInstitutionId = mockInstitutions.length > 0 ? mockInstitutions[0].id : null;

    const [allInstData, setAllInstData] = useState(initialAllData);
    // MODIFIED: Use initialInstitutionId to start with a selection
    const [activeInstitutionId, setActiveInstitutionId] = useState(initialInstitutionId);
    const [activeCourseCategory, setActiveCourseCategory] = useState(null);
    const [activeLevelCategory, setActiveLevelCategory] = useState(null);

    const [modalPackageName, setModalPackageName] = useState(null);
    const [ProgrammeearchTerm, setProgrammeearchTerm] = useState("");
    const [instSearchTerm, setInstSearchTerm] = useState("");
    const [courseSearchTerm, setCourseSearchTerm] = useState("");

    const [confirmDeletePackage, setConfirmDeletePackage] = useState(null);

    const currentInstData = useMemo(() => activeInstitutionId ? allInstData[activeInstitutionId] : null, [activeInstitutionId, allInstData]);

    const institutions = useMemo(() => mockInstitutions.filter(inst => inst.name.toLowerCase().includes(instSearchTerm.toLowerCase())), [instSearchTerm]);

    const coursesForSelectedInst = useMemo(() => currentInstData?.streams.filter(s => s.name.toLowerCase().includes(courseSearchTerm.toLowerCase())) || [], [currentInstData, courseSearchTerm]);

    const levelsForSelectedCourse = useMemo(() => currentInstData?.courses.filter(c => c.stream === activeCourseCategory) || [], [currentInstData, activeCourseCategory]);


    // === ADDED: REFs for scrolling ===
    const coursesRef = useRef(null);
    const levelsRef = useRef(null);
    const ProgrammeRef = useRef(null);


    // === ADDED: Scroll to Top on Component Mount ===
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // === NEW: Data transformation for CardSlider (Map<ID, Name> format) ===

    // 1. Institution Data Map: ID -> Name
    const institutionMap = useMemo(() => {
        // ID is used for selection
        return new Map(institutions.map(inst => [inst.id, inst.name]));
    }, [institutions]);

    // 2. Course/Stream Data Map: Name -> Name
    const courseMap = useMemo(() => {
        // Name is used for selection ID (activeCourseCategory)
        return new Map(coursesForSelectedInst.map(course => [course.name, course.name]));
    }, [coursesForSelectedInst]);

    // 3. Level Data Map: Name -> Name
    const levelMap = useMemo(() => {
        // Name is used for selection ID (activeLevelCategory)
        return new Map(levelsForSelectedCourse.map(level => [level.name, level.name]));
    }, [levelsForSelectedCourse]);

    // ====================================================================

    // DERIVED STATE FOR Programme (UPDATED: Added batchNames field)
    const ProgrammeForSelectedLevel = useMemo(() => {
        if (activeCourseCategory && activeLevelCategory && currentInstData) {
            const level_key = `${activeCourseCategory}_${activeLevelCategory}`;
            const ProgrammeObject = currentInstData.levels[level_key] || {};

            // Transform ProgrammeObject into an array of package records for the table
            const packageRecords = Object.entries(ProgrammeObject).map(([packageName, batches], index) => {
                // NEW: Extract and limit the batch names for display (max 5)
                const batchNames = (batches || []).slice(0, 5).map(b => b.name);

                return {
                    s_no: index + 1, // Add s_no for the table
                    name: packageName,
                    total_batches: batches.length, // Change totalBatches to total_batches for consistent keying
                    batch_names: batchNames.join(', ') // Join batches for the pillColumn display (The DynamicTable logic usually splits this back)
                };
            }).filter(pkg =>
                pkg.name.toLowerCase().includes(ProgrammeearchTerm.toLowerCase())
            );

            return packageRecords;
        }
        return [];
    }, [currentInstData, activeCourseCategory, activeLevelCategory, ProgrammeearchTerm]);


    // Other States (Kept for completeness)
    const [addInstitutionOpen, setAddInstitutionOpen] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState("");

    // === SCROLLING HELPER FUNCTION ===
    const scrollToRef = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center' // Scroll to center the element
            });
        }
    };


    // --- Handlers (Modified to include scrolling) ---
    const handleInstitutionSelect = (instId) => {
           // The CardSlider component handles its own selection/deselection toggle internally
           setActiveInstitutionId(instId);
           setActiveCourseCategory(null);
           setActiveLevelCategory(null);
           // NOTE: Since Institution selection is removed, this handler is redundant but kept
           // for component integrity.
    };

    const handleCourseCategorySelect = (courseCategoryName) => {
        // The CardSlider component handles its own selection/deselection toggle internally
        setActiveCourseCategory(courseCategoryName);
        setActiveLevelCategory(null);

        // Scroll down to the Levels section when a Course is selected
        if (courseCategoryName) {
            setTimeout(() => scrollToRef(levelsRef), 100); // Small timeout to ensure element is rendered
        }
    };

    const handleLevelCategorySelect = (levelCategoryName) => {
        // The CardSlider component handles its own selection/deselection toggle internally
        setActiveLevelCategory(levelCategoryName);

        // Scroll down to the Programme section when a Level is selected
        if (levelCategoryName) {
            setTimeout(() => scrollToRef(ProgrammeRef), 100); // Small timeout to ensure element is rendered
        }
    };


    const handleEditPackageClick = (packageName) => {
        setModalPackageName(packageName);
    };

    const handleAddPackageClick = () => {
        setModalPackageName('NEW');
    };

    const handleDeletePackageClick = (packageName) => {
        // console.log("Preparing to delete:", packageName);
        setConfirmDeletePackage(packageName);
    };

    const handleProgrammeubmit = ({ oldName, newName }) => {

        if (!activeCourseCategory || !activeLevelCategory || !activeInstitutionId) {
            console.error("Selection incomplete. Cannot submit package.");
            setModalPackageName(null);
            return;
        }

        const trimmedNewName = newName.trim();

        const level_key = `${activeCourseCategory}_${activeLevelCategory}`;

        let success = false;

        setAllInstData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));

            const Programme = newData[activeInstitutionId].levels[level_key];
            const existingPackageNames = Object.keys(Programme).map(n => n.toLowerCase());

            if (oldName) {
                // EDITING (Rename)
                if (oldName !== trimmedNewName) {
                    if (existingPackageNames.includes(trimmedNewName.toLowerCase())) {
                        alert(`A package named "${trimmedNewName}" already exists.`);
                        return prevData;
                    }

                    const batches = Programme[oldName] || [];

                    // Rename the key
                    delete Programme[oldName];
                    Programme[trimmedNewName] = batches;
                }
            } else {
                // ADDING
                if (existingPackageNames.includes(trimmedNewName.toLowerCase())) {
                    alert(`A package named "${trimmedNewName}" already exists.`);
                    return prevData;
                }

                if (!Programme[trimmedNewName]) {
                    // Initialize with an empty array of batches
                    Programme[trimmedNewName] = [];
                }
            }
            success = true;
            return newData;
        });

        if (success) {
            setModalPackageName(null);
        }
    };

    const handlePackageDeleteConfirm = (packageName) => {
          if (!activeCourseCategory || !activeLevelCategory || !activeInstitutionId) {
             console.error("Selection incomplete. Cannot delete package.");
             return;
         }

        const level_key = `${activeCourseCategory}_${activeLevelCategory}`;

        setAllInstData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));

            // Check if the package exists and delete it
            if (newData[activeInstitutionId]?.levels[level_key]?.[packageName]) {
                delete newData[activeInstitutionId].levels[level_key][packageName];
            }

            return newData;
        });
        setConfirmDeletePackage(null); // Close confirmation modal
    };

    const handleNewInstitutionSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting new institution:", newInstitutionName);
        setAddInstitutionOpen(false);
        setNewInstitutionName("");
    };

    // --- JSX Rendering (Added refs to the main containers) ---

    // REMOVED: renderInstitutionSelection()

    const renderCourseSelection = () => activeInstitutionId && (
             // ADDED coursesRef to target this container
             <div ref={coursesRef}>
                 <CardSlider
                     institutes={courseMap}
                     title='Courses'
                     icon_title="Courses"
                     onSelectInstitute={handleCourseCategorySelect}
                 />
             </div>
    );


    const renderLevelSelection = () => activeCourseCategory && (
             // ADDED levelsRef to target this container
             <div ref={levelsRef}>
                 <CardSlider
                     institutes={levelMap}
                     title='Levels'
                     icon_title="Levels"
                     fromTabOf="Programme"
                     onSelectInstitute={handleLevelCategorySelect}
                 />
             </div>
    );
        // Renders the Programme Table (Original table logic is kept)
    const renderProgrammeTable = () => activeLevelCategory && (
             // ADDED ProgrammeRef to target this container
             <div ref={ProgrammeRef}>
                 <DynamicTable
                     data={ProgrammeForSelectedLevel} // *** USE LIVE FILTERED DATA ***
                     columnOrder={[
                         's_no',
                         'name',
                         'total_batches',
                         'batch_names'
                     ]}
                     onEdit={(pkg) => handleEditPackageClick(pkg.name)} // Pass package name to edit handler
                     onDelete={(pkg) => handleDeletePackageClick(pkg.name)} // Pass package name to delete handler
                     onAddNew={handleAddPackageClick} // Pass the add handler
                     onSearch={setProgrammeearchTerm} // Pass the state setter for search
                     pillColumns={["batch_names"]}
                     title={'Programme'} // Dynamic title
                     userRole={'teacher'}
                 />
             </div>


    );


    return (
        <div className="PM_batch_wrapper">
            <h1 className="PM_batch_title">Programme Management Panel</h1>

            {/* Institution selection is removed, Course selection is now first */}
            {renderCourseSelection()}
            {renderLevelSelection()}

            {/* Only render the table if an institution (always selected), course, and level are selected */}
            {(activeInstitutionId && activeCourseCategory && activeLevelCategory) && renderProgrammeTable()}


            {/* ADD INSTITUTION MODAL (Kept as is for completeness, though access path is gone) */}
            {addInstitutionOpen && (
                <div className="PM_batch_modal PM_batch_add-institution-modal">
                    <div className="PM_batch_modal-content">
                        <div className="PM_batch_modal-header">
                            <h3><FiHome /> Add New Institution</h3>
                            <FiX onClick={() => setAddInstitutionOpen(false)} className="PM_batch_close-modal" />
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
                            <div className="PM_batch_modal-actions">
                                <button type="button" className="PM_batch_btn-secondary" onClick={() => setAddInstitutionOpen(false)}>Cancel</button>
                                <button type="submit" className="PM_batch_btn-primary">Add Institution</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD/EDIT PACKAGE MODAL RENDER */}
            {(activeCourseCategory && activeLevelCategory && modalPackageName) && (
                <AddPackageModal
                    initialPackageName={modalPackageName}
                    onClose={() => setModalPackageName(null)}
                    courseCategory={activeCourseCategory}
                    levelCategory={activeLevelCategory}
                    onSubmit={handleProgrammeubmit} // Use the combined submit handler
                />
            )}

            {/* DELETE CONFIRMATION POPUP */}
            {confirmDeletePackage && (
                <div className=" PM_batch_modal-confirmation-overlay">
                    <div className="PM_batch_modal-content PM_batch_confirm-popup">
                        <FiAlertTriangle size={32} className="PM_batch_confirm-icon" />
                        <h4>Confirm Package Deletion</h4>
                        <p>Are you sure you want to **delete** the package: <strong>{confirmDeletePackage}</strong>?</p>
                        <p>This action is irreversible and any associated batches will no longer belong to this package.</p>
                        <div className="PM_batch_modal-actions">
                            <button
                                className="PM_batch_btn-secondary"
                                onClick={() => setConfirmDeletePackage(null)} // Close confirmation, return
                            >
                                Cancel
                            </button>
                            <button
                                className="PM_batch_btn-delete"
                                onClick={() => handlePackageDeleteConfirm(confirmDeletePackage)}
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

export default Programme;