import React, { useState, useMemo } from 'react';
import DynamicTable from '../Reusable/DynamicTable';
import { 
  CheckCircle, 
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Save
} from 'lucide-react';

// ==========================================
// 1. MOCK DATA
// ==========================================
const RAW_HIERARCHY_DATA = {
    institutions_reference: [{ institution_id: "inst_01", name: "Green Valley Institute" }],
    courses_reference: [{ course_id: "course_sci", course_name: "Science Stream" }],
    batches_reference: [{ batch_id: "batch_2024_A", batch_name: "Batch 2024-A (Morning)" }],
    teachers_reference: [
        { teacher_id: "T_SARAH", name: "Prof. Sarah Wilson", subjects_taught_ids: ["sub_id_1"] }
    ],
    subjects_reference: [
        { subject_id: "sub_id_1", subject_name: "CA/CMA Accounts" }
    ],
    data: [
        {
            institution_id: "inst_01",
            courses: [
                {
                    course_id: "course_sci",
                    levels: [
                        {
                            level_id: "lvl_12",
                            level_name: "Grade 12",
                            batches: [
                                {
                                    batch_id: "batch_2024_A",
                                    package_name: "Premium Pack", 
                                    classes: [
                                        {
                                            class_id: "class_12A",
                                            class_name: "Class 12-A",
                                            common_subjects_ids: ["sub_id_1"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

const INITIAL_CHAPTERS = {
    "sub_id_1": [
        { 
            uniqueId: "chp_1", chapterNo: 1, chapterName: "Basic Accounting Principles", 
            actualHours: 20, takenHours: 0, status: "Not Started", 
            approvedStartDate: "", approvedEndDate: "" 
        },
        { 
            uniqueId: "chp_2", chapterNo: 2, chapterName: "Depreciation Methods", 
            actualHours: 15, takenHours: 15, status: "Completed", 
            // Format: "YYYY-MM-DD HH:MM AM/PM"
            approvedStartDate: "2023-11-01 09:30 AM", 
            approvedEndDate: "2023-11-05 04:00 PM"
        },
        { 
            uniqueId: "chp_3", chapterNo: 3, chapterName: "Partnership Accounts", 
            actualHours: 30, takenHours: 10, status: "Ongoing", 
            approvedStartDate: "2023-12-01 10:00 AM", 
            approvedEndDate: "" 
        },
    ]
};

const INITIAL_REQUESTS = [
    {
        requestId: "req_1",
        chapterId: "chp_3",
        subjectId: "sub_id_1",
        chapterName: "Partnership Accounts",
        chapterNo: 3,
        startDate: "2023-12-01",
        endDate: "2023-12-05",
        status: "Pending", 
    }
];

// --- NEW: Color Map for Statuses ---
const CHAPTER_STATUS_COLORS = {
    'Completed': 'success',   // Green
    'Ongoing': 'primary',     // Blue
    'Not Started': 'default', // Gray/Neutral
    'Pending': 'warning',     // Yellow/Orange
    'Approved': 'success',    // Green
    'Rejected': 'danger'      // Red
};

// ==========================================
// 2. ADD NEW CHAPTER MODAL COMPONENT
// ==========================================
const AddChapterModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        chapterNo: '',
        chapterName: '',
        actualHours: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ chapterNo: '', chapterName: '', actualHours: '' }); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" />
                        Add New Chapter
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Number</label>
                        <input type="number" name="chapterNo" required value={formData.chapterNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. 4"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name</label>
                        <input type="text" name="chapterName" required value={formData.chapterName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. Advanced Auditing"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                        <input type="number" name="actualHours" required value={formData.actualHours} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. 12"/>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none shadow-sm flex items-center gap-2"><Save size={16} /> Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const TeacherCompletionPage = () => {
    const CURRENT_TEACHER_ID = "T_SARAH";
    
    // --- STATE ---
    const [activeFilters, setActiveFilters] = useState({});
    const [activeChapterFilters, setActiveChapterFilters] = useState({});
    
    // Search States
    const [subjectSearch, setSubjectSearch] = useState('');
    const [chapterSearch, setChapterSearch] = useState('');

    // Selection State
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [selectedChapterId, setSelectedChapterId] = useState(null);

    // Modal State
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);

    // Data State
    const [chapterData, setChapterData] = useState(INITIAL_CHAPTERS);
    const [requestsData, setRequestsData] = useState(INITIAL_REQUESTS);

    // --- HANDLERS ---
    
    const handleAddNewChapter = (formData) => {
        if (!selectedSubjectId) return;
        const newChapter = {
            uniqueId: `chp_${Date.now()}`,
            chapterNo: parseInt(formData.chapterNo),
            chapterName: formData.chapterName,
            actualHours: parseInt(formData.actualHours),
            takenHours: 0,
            status: "Not Started",
            approvedStartDate: "",
            approvedEndDate: ""
        };
        setChapterData(prev => ({
            ...prev,
            [selectedSubjectId]: [...(prev[selectedSubjectId] || []), newChapter]
        }));
        setIsAddChapterModalOpen(false);
    };

    const handleRequestDateChange = (reqId, field, value) => {
        setRequestsData(prev => prev.map(r => r.requestId === reqId ? { ...r, [field]: value } : r));
    };

    const handleDeleteRequest = (reqId) => {
        if(window.confirm("Delete this completion request?")) {
            setRequestsData(prev => prev.filter(r => r.requestId !== reqId));
        }
    };

    const handleEditRequest = (reqId) => {
        if(window.confirm("Edit this request? Status will reset to Pending.")) {
             setRequestsData(prev => prev.map(r => r.requestId === reqId ? { ...r, status: 'Pending' } : r));
        }
    };

    // Helper to extract Date/Time from string "YYYY-MM-DD HH:MM AM"
    const splitDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return { date: '--', time: '--' };
        const parts = dateTimeStr.split(' ');
        const date = parts[0] || '--';
        const time = parts.slice(1).join(' ') || '--';
        return { date, time };
    };

    // ==========================================
    // DATA PREPARATION
    // ==========================================

    // --- LEVEL 1: SUBJECT LIST ---
    const subjectList = useMemo(() => {
        const rows = [];
        const raw = RAW_HIERARCHY_DATA;
        
        const instMap = raw.institutions_reference.reduce((acc, i) => ({...acc, [i.institution_id]: i.name}), {});
        const courseMap = raw.courses_reference.reduce((acc, c) => ({...acc, [c.course_id]: c.course_name}), {});
        const batchMap = raw.batches_reference.reduce((acc, b) => ({...acc, [b.batch_id]: b.batch_name}), {});
        const subjectMap = raw.subjects_reference.reduce((acc, s) => ({...acc, [s.subject_id]: s.subject_name}), {});
        const teacher = raw.teachers_reference.find(t => t.teacher_id === CURRENT_TEACHER_ID);
        const mySubjects = teacher ? teacher.subjects_taught_ids : [];

        raw.data.forEach(inst => {
            inst.courses.forEach(course => {
                course.levels.forEach(level => {
                    level.batches.forEach(batch => {
                        batch.classes.forEach(cls => {
                            const classSubjects = cls.common_subjects_ids.filter(sid => mySubjects.includes(sid));
                            classSubjects.forEach(subId => {
                                const chapters = chapterData[subId] || [];
                                const totalActual = chapters.reduce((sum, ch) => sum + ch.actualHours, 0);
                                const totalTaken = chapters.reduce((sum, ch) => sum + ch.takenHours, 0);
                                const percent = totalActual > 0 ? Math.round((totalTaken / totalActual) * 100) : 0;

                                rows.push({
                                    id: subId, 
                                    institution: instMap[inst.institution_id],
                                    course: courseMap[course.course_id],
                                    level: level.level_name,
                                    programme: batch.package_name || "Default Package",
                                    batch: batchMap[batch.batch_id],
                                    class_name: cls.class_name,
                                    subject: subjectMap[subId],
                                    total_actual_hours: `${totalActual} Hrs`,
                                    total_taken_hours: `${totalTaken} Hrs`,
                                    percent_completed: (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold w-8 text-right">{percent}%</span>
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${percent}%`}}></div>
                                            </div>
                                        </div>
                                    )
                                });
                            });
                        });
                    });
                });
            });
        });

        if (subjectSearch) {
            const lowerQuery = subjectSearch.toLowerCase();
            return rows.filter(r => r.subject.toLowerCase().includes(lowerQuery) || r.class_name.toLowerCase().includes(lowerQuery));
        }
        return rows;
    }, [chapterData, subjectSearch]);

    // --- LEVEL 2: CHAPTER LIST ---
    const chapterList = useMemo(() => {
        if (!selectedSubjectId) return [];
        const chapters = chapterData[selectedSubjectId] || [];

        let formattedChapters = chapters.map(chap => {
            // Extract Date and Time separately
            const startDT = splitDateTime(chap.approvedStartDate);
            const endDT = splitDateTime(chap.approvedEndDate);

            return {
                uniqueId: chap.uniqueId,
                chapterNo: `Ch-${chap.chapterNo}`,
                chapterName: chap.chapterName,
                actualHours: `${chap.actualHours} hrs`,
                
                // COLUMN 1: STATUS - Sending raw string for pills
                status: chap.status,
                
                // COLUMN 2: DATE SCHEDULE
                dateSchedule: (chap.approvedStartDate || chap.approvedEndDate) ? (
                    <div>
                         {startDT.date !== '--' && endDT.date !== '--' && (
                                 <span>{startDT.date} -  {endDT.date}</span>
                        )}
                    </div>
                ) : <span>--</span>,

                // COLUMN 3: TIME SCHEDULE
                timeSchedule: (chap.approvedStartDate || chap.approvedEndDate) ? (
                    <div className="flex flex-col gap-1 text-[11px]">
                         {startDT.time !== '--' && endDT.time !== '--' &&  (
                            <span>{startDT.time} - {endDT.time}</span>
                        )}
                    
                    </div>
                ) : <span className="text-xs text-gray-400 italic pl-2">--</span>,

            };
        });

        if (chapterSearch) {
            const lowerQuery = chapterSearch.toLowerCase();
            return formattedChapters.filter(c => c.chapterName.toLowerCase().includes(lowerQuery) || c.status.toLowerCase().includes(lowerQuery));
        }
        return formattedChapters;

    }, [selectedSubjectId, chapterData, chapterSearch]);

    // --- LEVEL 3: REQUEST LIST ---
    const requestsList = useMemo(() => {
        if (!selectedChapterId) return [];
        return requestsData.filter(r => r.chapterId === selectedChapterId).map(req => {
            const isLocked = req.status === 'Approved' || req.status === 'Rejected';
            return {
                id: req.requestId,
                subject: subjectList.find(s => s.id === selectedSubjectId)?.subject,
                chapterName: req.chapterName,
                chapterNo: `Ch-${req.chapterNo}`,
                
                startDateInput: (
                    <div className="flex items-center bg-white border rounded px-2 py-1 h-8 w-32">
                        <Calendar size={14} className="text-gray-400 mr-2 flex-shrink-0"/>
                        <input type="date" value={req.startDate} disabled={isLocked} onChange={(e) => handleRequestDateChange(req.requestId, 'startDate', e.target.value)} className="text-xs focus:outline-none w-full bg-transparent"/>
                    </div>
                ),
                endDateInput: (
                    <div className="flex items-center bg-white border rounded px-2 py-1 h-8 w-32">
                        <Calendar size={14} className="text-gray-400 mr-2 flex-shrink-0"/>
                        <input type="date" value={req.endDate} disabled={isLocked} min={req.startDate} onChange={(e) => handleRequestDateChange(req.requestId, 'endDate', e.target.value)} className="text-xs focus:outline-none w-full bg-transparent"/>
                    </div>
                ),
                statusPill: (
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${req.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : req.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {req.status}
                    </span>
                ),
                actions: (
                    <div className="flex items-center gap-2">
                         <button onClick={() => handleEditRequest(req.requestId)} className="text-gray-600 hover:text-blue-600 p-1 rounded hover:bg-gray-100" title="Edit"><Edit2 size={16} /></button>
                        {!isLocked && (<button onClick={() => handleDeleteRequest(req.requestId)} className="text-gray-600 hover:text-red-600 p-1 rounded hover:bg-gray-100" title="Delete"><Trash2 size={16} /></button>)}
                    </div>
                )
            };
        });
    }, [selectedChapterId, requestsData, selectedSubjectId, subjectList]);

    const filterDefs = useMemo(() => {
        const getOpts = (k) => [...new Set(subjectList.map(d => d[k]))].sort().map(v => ({label:v, value:v}));
        return {
            institution: getOpts('institution'),
            course: getOpts('course'),
            level: getOpts('level'),
            programme: getOpts('programme'),
            batch: getOpts('batch'),
            class_name: getOpts('class_name'),
            subject: getOpts('subject')
        };
    }, [subjectList]);

    const chapterFilterDefs = useMemo(() => {
        const getOpts = (k) => [...new Set(chapterList.map(d => d[k]))].sort().map(v => ({label:v, value:v}));
        const rawChapters = selectedSubjectId ? (chapterData[selectedSubjectId] || []) : [];
        const statusOpts = [...new Set(rawChapters.map(c => c.status))].sort().map(v => ({label: v, value: v}));

        return { 
            chapterNo: getOpts('chapterNo'),
            status: statusOpts 
        };
    }, [chapterList, chapterData, selectedSubjectId]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
            <h1 className='atm_section-title'>Course Completion Panel</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <DynamicTable
                    data={subjectList}
                    columnOrder={['institution', 'course', 'level', 'programme', 'batch', 'class_name', 'subject', 'total_actual_hours', 'total_taken_hours', 'percent_completed']}
                    columnDisplayNameMap={{
                        institution: 'Institute', course: 'Course', level: 'Level', programme: 'Programme', 
                        batch: 'Batch', class_name: 'Class', subject: 'Subject', 
                        total_actual_hours: 'Actual Hours', total_taken_hours: 'Taken Hours', percent_completed: '% Completed'
                    }}
                    filterDefinitions={filterDefs}
                    activeFilters={activeFilters}
                    onFilterChange={(k, v) => setActiveFilters(p => ({...p, [k]: v}))}
                    
                    onRowClickable={true}
                    onRowClick={(id) => {
                        setSelectedSubjectId(prev => prev === id ? null : id);
                        setSelectedChapterId(null);
                        setActiveChapterFilters({}); 
                    }}
                    selectedRowId={selectedSubjectId}
                    
                    onSearch={(term) => setSubjectSearch(term)}
                    userRole="teacher"
                    onAddNew={null}
                    unfilteredData={null}
                    title={'Course Completion Info'} 
                />
            </div>

            {selectedSubjectId && (
                <div className="ml-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-2">
                    <DynamicTable
                        data={chapterList}
                        columnOrder={['chapterNo', 'chapterName', 'actualHours', 'status', 'dateSchedule', 'timeSchedule']}
                        columnDisplayNameMap={{
                            chapterNo: 'No', chapterName: 'Chapter Name', actualHours: 'Actual Hrs', 
                            status: 'Status', dateSchedule: 'Approved Date', timeSchedule: 'Approved Time'
                        }}
                        
                        filterDefinitions={chapterFilterDefs}
                        activeFilters={activeChapterFilters}
                        onFilterChange={(k, v) => setActiveChapterFilters(p => ({...p, [k]: v}))}

                        onSearch={(term) => setChapterSearch(term)}
                        
                        onAddNew={activeChapterFilters['chapterNo'] ? () => setIsAddChapterModalOpen(true) : null}
                        userRole="teacher"

                        onRowClickable={true}
                        onRowClick={(id) => setSelectedChapterId(prev => prev === id ? null : id)}
                        selectedRowId={selectedChapterId}
                        
                        unfilteredData={null}
                        title={'Chapters'}
                        customDescription={"** For uploading the course completion you have to choose chapter npo from the above table and then you can request for date approval **"}

                        // --- UPDATED: Pill columns with Custom Colors ---
                        pillColumns={['status']}
                        statusColorMap={CHAPTER_STATUS_COLORS}
                    />
                </div>
            )}
            <AddChapterModal 
                isOpen={isAddChapterModalOpen}
                onClose={() => setIsAddChapterModalOpen(false)}
                onSubmit={handleAddNewChapter}
            />
        </div>
    );
};

export default TeacherCompletionPage;