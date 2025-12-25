import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaUniversity } from 'react-icons/fa';
import institutionsData from '../dummy.json'; 
import '../../Styles/SuperAdmin/InstitutionsDashboard.css';
import DynamicTable from "../Reusable/DynamicTable";
import CardSlider from "../Reusable/CardSlider"; // Imported CardSlider

// --- Reference Data Extraction ---
const availableAdmins = institutionsData.admins_reference || [];
const availableCoursesRef = institutionsData.courses_reference || [];
const adminRefMap = new Map(availableAdmins.map(ref => [ref.admin_id, ref.name]));

// --- Utility to Extract Batches ---
const getBatches = (instFullData) => {
    const batches = [];
    (instFullData.courses || []).forEach(course => {
        (course.levels || []).forEach(level => {
            (level.batches || []).forEach(batch => {
                const totalStudents = (batch.classes || []).reduce(
                    (sum, cls) => sum + (cls.students_ids ? cls.students_ids.length : 0), 0
                );
                batches.push({
                    id: batch.batch_id,
                    name: batch.batch_name || `Batch ${batch.batch_id}`,
                    course: course.course_id.toUpperCase(),
                    level: level.level_name,
                    totalStudents: totalStudents,
                });
            });
        });
    });
    return batches;
};

// --- Institution Details Panel Component ---
const InstitutionDetailsPanel = React.forwardRef(({ institution, instRawData, onClear }, ref) => {
    if (!institution || !instRawData) return null;

    const batchesList = getBatches(instRawData);
    const batchesColumnOrder = ['id', 'name', 'course_level', 'totalStudents'];
    
    const transformedBatchesList = batchesList.map(batch => ({
        id: batch.id,
        name: batch.name,
        course_level: `${batch.course} - ${batch.level}`,
        totalStudents: batch.totalStudents,
    }));
    
    const BatchesDynamicTable = () => (
        <DynamicTable 
            data={transformedBatchesList}
            columnOrder={batchesColumnOrder}
            title={'Available Batches'}
            onEdit={null}
            onDelete={null}
            onSearch={null}
            onAddNew={null}
            filterDefinitions={{}}
        />
    );

    return (
        <div ref={ref} className="inst_details_panel_container">
            <div className="inst_details_panel">
                <header className="inst_details_panel_header">
                    <h3 className="inst_details_title">Details for {institution.name}</h3>
                    <button className="inst_details_close_btn" onClick={onClear}>&times;</button>
                </header>
                
                <section className="inst_details_summary">
                    <p><strong>ID:</strong> {institution.id}</p>
                    <p><strong>Location:</strong> {institution.location}</p>
                    <p><strong>Admins:</strong> {institution.adminNamesList}</p>
                </section>

                <h4 className="inst_details_subtitle">Available Batches ({batchesList.length})</h4>
                
                {batchesList.length > 0 ? (
                    <div className="inst_batches_table_responsive">
                        <BatchesDynamicTable />
                    </div>
                ) : (
                    <p className="inst_no_results_small">No active batches found for this institution.</p>
                )}
            </div>
        </div>
    );
});

// --- Data Processing ---
const processInstitutionData = (rawData) => {
  const dataArray = rawData.data || [];
  const institutionRefMap = new Map(
    (rawData.institutions_reference || []).map(ref => [ref.institution_id, ref])
  );
  const adminRefMap = new Map(
    (rawData.admins_reference || []).map(ref => [ref.admin_id, ref.name])
  );
  
  if (!dataArray || dataArray.length === 0) return [];
  
  return dataArray.map(instData => {
    const ref = institutionRefMap.get(instData.institution_id) || {};
    
    let totalBatches = 0;
    let totalStudents = 0;
    const availableCourses = new Set();
    
    const adminNamesList = (instData.admins_ids || [])
        .map(id => adminRefMap.get(id))
        .filter(name => name)
        .join(', ');

    (instData.courses || []).forEach(course => {
      (course.levels || []).forEach(level => {
        if (course.course_id) {
            availableCourses.add(`${course.course_id.toUpperCase()} ${level.level_name || ''}`);
        }
        
        (level.batches || []).forEach(batch => {
          totalBatches++;
          const studentCount = (batch.classes || []).reduce(
            (sum, cls) => sum + (cls.students_ids ? cls.students_ids.length : 0), 0
          );
          totalStudents += studentCount;
        });
      });
    });
    
    const currentCourseIds = (instData.courses || []).map(c => c.course_id).filter(id => id);

    return {
      id: instData.institution_id,
      name: ref.name || `Unknown Institution (${instData.institution_id})`,
      location: ref.location || 'N/A',
      adminNamesList: adminNamesList || 'N/A',
      adminIds: instData.admins_ids || [], 
      courseIds: currentCourseIds, 
      totalBatches: totalBatches,
      totalStudents: totalStudents,
      coursesList: Array.from(availableCourses).join(', ') || 'No Courses Found', 
      rawInstData: instData 
    };
  });
};

const initialProcessedData = processInstitutionData(institutionsData);
const rawDataMap = new Map(initialProcessedData.map(inst => [inst.id, inst.rawInstData]));

// --- Custom Multi-Select with Pills Component ---
const MultiSelectPillInput = ({ label, options, selectedItems, onSelect, onRemove, displayKey, valueKey }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filteredOptions = options.filter(option =>
        (option[displayKey] || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.some(item => item[valueKey] === option[valueKey])
    );
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="inst_form_group" ref={wrapperRef}>
            <label>{label}</label>

            <div className="inst_pills_container">
                {selectedItems.map((item) => (
                    <div key={item[valueKey]} className="inst_pill">
                        {item[displayKey]}
                        <button type="button" onClick={() => onRemove(item[valueKey])} className="inst_pill_remove_btn">
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <div 
                className={`inst_custom_select ${isOpen ? 'is_open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <input 
                    type="text"
                    placeholder={selectedItems.length === 0 ? `Search and select ${label.toLowerCase()}` : 'Search for more...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="inst_custom_select_input"
                />
                
                {isOpen && (
                    <div className="inst_custom_select_dropdown">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option[valueKey]}
                                    className="inst_dropdown_option"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(option);
                                        setSearchTerm('');
                                    }}
                                >
                                    {option[displayKey]}
                                </div>
                            ))
                        ) : (
                            <div className="inst_dropdown_no_results">
                                {searchTerm ? `No results for "${searchTerm}"` : 'All options selected.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Modal Component for Adding/Editing an Institution ---
const InstitutionFormModal = ({ isOpen, onClose, onSubmit, isEdit, initialData }) => {
    
    const defaultFormData = {
        institution_id: '', 
        name: '', 
        location: '', 
        admins: [], 
        courses: [], 
    };

    const [formData, setFormData] = useState(defaultFormData);
    const [idDisabled, setIdDisabled] = useState(false);

    useEffect(() => {
        if (isOpen && isEdit && initialData) {
            const initialAdmins = (initialData.adminIds || []).map(id => {
                const name = adminRefMap.get(id);
                return name ? { admin_id: id, name: name } : null;
            }).filter(Boolean);

            const initialCourses = (initialData.courseIds || []).map(id => {
                const courseRef = availableCoursesRef.find(c => c.course_id === id);
                return courseRef ? { course_id: id, course_name: courseRef.course_name } : null;
            }).filter(Boolean);

            setFormData({
                institution_id: initialData.id,
                name: initialData.name,
                location: initialData.location,
                admins: initialAdmins,
                courses: initialCourses,
            });
            setIdDisabled(true); 
        } else if (isOpen && !isEdit) {
            setFormData(defaultFormData);
            setIdDisabled(false);
        }
    }, [isOpen, isEdit, initialData]);


    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSelectAdmin = (admin) => {
        setFormData(prev => ({ ...prev, admins: [...prev.admins, admin] }));
    };

    const handleRemoveAdmin = (id) => {
        setFormData(prev => ({ ...prev, admins: prev.admins.filter(a => a.admin_id !== id) }));
    };
    
    const handleSelectCourse = (course) => {
        setFormData(prev => ({ ...prev, courses: [...prev.courses, course] }));
    };
    
    const handleRemoveCourse = (id) => {
        setFormData(prev => ({ ...prev, courses: prev.courses.filter(c => c.course_id !== id) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, isEdit);
        onClose(); 
    };
    
    const title = isEdit ? `Edit Institution: ${initialData?.name || ''}` : 'Add New Institution';
    const actionText = isEdit ? 'Save Changes' : 'Save Institution';

    return (
        <div className="inst_modal_overlay">
            <div className="inst_modal_content">
                <div className="inst_modal_header">
                    <h2 className="inst_modal_title">{title}</h2>
                    <button className="inst_modal_close" onClick={onClose}>&times;</button>
                </div>
                <form className="inst_form" onSubmit={handleSubmit}>
                    
                    <div className="inst_form_group">
                        <label htmlFor="institution_id">Institution ID</label>
                        <input
                            id="institution_id"
                            type="text"
                            name="institution_id"
                            value={formData.institution_id}
                            onChange={handleChange}
                            placeholder="Unique Identifier (e.g., INST004)"
                            required
                            disabled={idDisabled}
                        />
                    </div>

                    <div className="inst_form_group">
                        <label htmlFor="name">Institution Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Apex Commerce College"
                            required
                        />
                    </div>
                    
                    <div className="inst_form_group">
                        <label htmlFor="location">Location / City</label>
                        <input
                            id="location"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Mumbai, Pune, etc."
                            required
                        />
                    </div>
                    
                    <MultiSelectPillInput
                        label="Admins (Multiple Selection)"
                        options={availableAdmins}
                        selectedItems={formData.admins}
                        onSelect={handleSelectAdmin}
                        onRemove={handleRemoveAdmin}
                        displayKey="name"
                        valueKey="admin_id"
                    />
                    
                    <MultiSelectPillInput
                        label="Courses Offered (Multiple Selection)"
                        options={availableCoursesRef}
                        selectedItems={formData.courses}
                        onSelect={handleSelectCourse}
                        onRemove={handleRemoveCourse}
                        displayKey="course_name"
                        valueKey="course_id"
                    />

                    <div className="inst_modal_actions">
                        <button type="button" className="inst_btn_secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="inst_btn_primary">
                            <svg className="inst_icon_prefix" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {actionText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Confirmation/Message Modal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isConfirmation, confirmText, institutionId }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(institutionId);
        onClose();
    };

    return (
        <div className="inst_modal_overlay">
            <div className={`inst_modal_content inst_confirm_modal ${isConfirmation ? 'inst_delete_confirmation' : 'inst_save_message'}`}>
                <div className="inst_modal_header">
                    <h2 className="inst_modal_title">{title}</h2>
                    <button className="inst_modal_close" onClick={onClose}>&times;</button>
                </div>
                <div className="inst_form" style={{ padding: '20px' }}>
                    <p>{message}</p>
                    <div className="inst_modal_actions" style={{ position: 'relative', borderTop: 'none', padding: 0 }}>
                        {!isConfirmation && (
                             <button type="button" className="inst_btn_primary" onClick={onClose}>
                                OK
                            </button>
                        )}
                        {isConfirmation && (
                            <>
                                <button type="button" className="inst_btn_secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="button" className="inst_action_btn inst_delete_btn" onClick={handleConfirm} style={{ padding: '8px 16px' }}>
                                    {confirmText || 'Confirm'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const InstitutionsDashboard = ({userRole}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionsList, setInstitutionsList] = useState(initialProcessedData); 
  const [formModalState, setFormModalState] = useState({ isOpen: false, mode: 'add', data: null }); 
  const [confirmModalState, setConfirmModalState] = useState({ 
      isOpen: false, 
      title: '', 
      message: '', 
      isConfirmation: false, 
      confirmAction: () => {}, 
      confirmText: '',
      targetId: null, 
  });
  
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const detailsPanelRef = useRef(null);
  const INSTITUTIONS_COLUMN_ORDER = useMemo(() => ([
      'id', 
      'name', 
      'location', 
      'adminNamesList', 
      'coursesList', 
      'totalBatches', 
      'totalStudents'
  ]), []);
  const getInstitutionFromRow = (row) => institutionsList.find(inst => inst.id === (row.id || row));


  // --- NEW: Prepare Data for CardSlider ---
  // Transforms the reference data into a Map that includes the 'image' field
  const institutionsForSlider = useMemo(() => {
    const refs = institutionsData.institutions_reference || [];
    // Map: Key = ID, Value = { name, image } Object
    return new Map(refs.map(ref => [
        ref.institution_id, 
        { 
            name: ref.name, 
            image: ref.image 
        }
    ]));
  }, []);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
      if (selectedInstitution && detailsPanelRef.current) {
          detailsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, [selectedInstitution]);

  
  const handleEdit = (instRow) => {
    const inst = getInstitutionFromRow(instRow); 
    if(inst) {
        setFormModalState({ isOpen: true, mode: 'edit', data: inst });
    }
  };

  const handlePerformDelete = (id) => {
    setInstitutionsList(prevList => prevList.filter(inst => inst.id !== id));
    handleClearDetails(); 
    
    setConfirmModalState({
        isOpen: true,
        title: 'Institution Deleted',
        message: `Institution ID: ${id} has been successfully removed from the system.`,
        isConfirmation: false,
        confirmAction: () => {},
        confirmText: 'OK',
        targetId: null,
    });
  };

  const handleDelete = (instRow) => {
    const inst = getInstitutionFromRow(instRow); 
    if(!inst) return;
    
    setConfirmModalState({
        isOpen: true,
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${inst.name}" (ID: ${inst.id})? This action cannot be undone.`,
        isConfirmation: true,
        confirmAction: handlePerformDelete, 
        confirmText: 'Delete Institution',
        targetId: inst.id,
    });
  };
  
  const handleViewBatches = (institution) => {
    if (selectedInstitution && selectedInstitution.id === institution.id) {
        setSelectedInstitution(null);
    } else {
        setSelectedInstitution(institution);
    }
  };

  // --- NEW: Handle selection from Slider ---
  const handleSliderSelect = (instId) => {
      if(!instId) {
          // If deselected in slider, clear filter/selection
          setSearchTerm('');
          setSelectedInstitution(null);
          return;
      }
      
      const inst = institutionsList.find(i => i.id === instId);
      if(inst) {
          // You can choose to just select it (show details) OR filter the table
          // Here, we select it for details view:
          handleViewBatches(inst);
      }
  };
  
  const handleClearDetails = () => {
      setSelectedInstitution(null);
  }

  const filteredInstitutions = useMemo(() => {
    if (!searchTerm) return institutionsList;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return institutionsList.filter(inst => 
      inst.name.toLowerCase().includes(lowerCaseSearch) ||
      inst.location.toLowerCase().includes(lowerCaseSearch) ||
      inst.id.toLowerCase().includes(lowerCaseSearch) ||
      inst.coursesList.toLowerCase().includes(lowerCaseSearch) ||
      inst.adminNamesList.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, institutionsList]);

  const totalInstitutions = institutionsList.length;

  const handleModalSubmit = (formData, isEdit) => {
    const newAdminNamesList = formData.admins.map(a => a.name).join(', ') || 'N/A';
    const newAdminIds = formData.admins.map(a => a.admin_id);
    const newCoursesList = formData.courses.map(c => c.course_id).join(', ') || 'N/A'; 
    const newCourseIds = formData.courses.map(c => c.course_id);
    
    let message, title;
    
    if (isEdit) {
        setInstitutionsList(prevList => 
            prevList.map(inst => 
                inst.id === formData.institution_id
                    ? {
                        ...inst,
                        name: formData.name,
                        location: formData.location,
                        adminNamesList: newAdminNamesList,
                        adminIds: newAdminIds,
                        coursesList: newCoursesList, 
                        courseIds: newCourseIds,
                      }
                    : inst
            )
        );
        title = 'Update Successful';
        message = `The institution "${formData.name}" (ID: ${formData.institution_id}) has been updated successfully.`;
    } else {
        const newInstitution = {
            id: formData.institution_id,
            name: formData.name,
            location: formData.location,
            adminNamesList: newAdminNamesList,
            adminIds: newAdminIds,
            coursesList: newCoursesList,
            courseIds: newCourseIds,
            totalBatches: 0, 
            totalStudents: 0,
            rawInstData: {} 
        };
        setInstitutionsList([newInstitution, ...institutionsList]);
        title = 'Institution Added';
        message = `New institution "${formData.name}" has been added to the list.`;
    }
    
    setConfirmModalState({
        isOpen: true,
        title: title,
        message: message,
        isConfirmation: false, 
        confirmAction: () => {},
        confirmText: 'OK',
        targetId: null,
    });
  };
  
  const handleDataImported = (importedJson) => {
        if (!importedJson || importedJson.length === 0) {
            alert("Import file is empty or invalid.");
            return;
        }

        const newInstitutions = importedJson.map((row, index) => {
            const id = row.ID || row.id || `IMPORT_${Date.now() + index}`;
            const name = row.Name || row.name || `Imported Institution ${index + 1}`;
            const location = row.Location || row.location || 'N/A';
            
            const adminIdString = (row["Admin IDs"] || row["admin_ids"] || '').toString();
            const adminIds = adminIdString.split(',').map(s => s.trim()).filter(Boolean);
            const adminNamesList = adminIds
                .map(id => adminRefMap.get(id)) 
                .filter(Boolean) 
                .join(', ') || 'N/A';

            const courseIdString = (row["Course IDs"] || row["course_ids"] || '').toString();
            const courseIds = courseIdString.split(',').map(s => s.trim()).filter(Boolean);
            const coursesList = courseIds.join(', ') || 'N/A'; 
            
            return {
                id: id,
                name: name,
                location: location,
                adminNamesList: adminNamesList,
                adminIds: adminIds,
                coursesList: coursesList, 
                courseIds: courseIds,
                totalBatches: 0, 
                totalStudents: 0,
                rawInstData: {} 
            };
        });

        setInstitutionsList(prevList => [...newInstitutions, ...prevList]);

        setConfirmModalState({
            isOpen: true,
            title: 'Import Successful',
            message: `Successfully imported ${newInstitutions.length} institutions.`,
            isConfirmation: false,
            confirmAction: () => {},
            confirmText: 'OK',
            targetId: null,
        });
  };
  
  
  const handleFormModalClose = () => {
    setFormModalState({ isOpen: false, mode: 'add', data: null });
  };
  
  const handleConfirmModalClose = () => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDynamicTableSearch = (query) => {
      setSearchTerm(query);
  };
  
  const handleAddNewInstitution = () => {
      setFormModalState({ isOpen: true, mode: 'add', data: null });
  };


  const rawDataForPanel = selectedInstitution ? rawDataMap.get(selectedInstitution.id) : null;
  
  const handleRowClick = (instId) => {
      const inst = getInstitutionFromRow({ id: instId }); 
      if(inst) {
        handleViewBatches(inst);
      }
  };


  return (
    <>
        <div className="inst_dashboard_container">
            <header className="inst_dashboard_header">
                <h1 className="inst_main_title">Institutions<FaUniversity /></h1>
                <p className="inst_total_count">
                    Total Institutions: <span className="inst_count_value">{totalInstitutions}</span>
                </p>
            </header>

             {/* --- ADDED CARD SLIDER --- */}
             <CardSlider 
                title="Institutions" 
                institutes={institutionsForSlider} // Pass the Map with image objects
                onSelectInstitute={handleSliderSelect} 
                icon_title="Institutions"
                searchBar={false} 
            />

             <DynamicTable
                    data={filteredInstitutions}
                    columnOrder={INSTITUTIONS_COLUMN_ORDER}
                    title="Institutions"
                    userRole={'teacher'}
                    
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    
                    onSearch={handleDynamicTableSearch}
                    onAddNew={handleAddNewInstitution}
                    
                    // onDataImported={handleDataImported}
                    unfilteredData={institutionsList}  
                    
                    onRowClickable={true}
                    onRowClick={handleRowClick}
                    selectedRowId={selectedInstitution ? selectedInstitution.id : null}
                    
                    pillColumns={['adminNamesList', 'coursesList']}
                />
            
            <InstitutionDetailsPanel
                ref={detailsPanelRef}
                institution={selectedInstitution}
                instRawData={rawDataForPanel}
                onClear={handleClearDetails}
            />

            <InstitutionFormModal 
                isOpen={formModalState.isOpen} 
                onClose={handleFormModalClose}
                onSubmit={handleModalSubmit}
                isEdit={formModalState.mode === 'edit'}
                initialData={formModalState.data}
            />
            
            <ConfirmationModal 
                isOpen={confirmModalState.isOpen}
                onClose={handleConfirmModalClose}
                onConfirm={confirmModalState.confirmAction}
                title={confirmModalState.title}
                message={confirmModalState.message}
                isConfirmation={confirmModalState.isConfirmation}
                confirmText={confirmModalState.confirmText}
                institutionId={confirmModalState.targetId}
            />

        </div>
    </>
  );
};

export default InstitutionsDashboard;