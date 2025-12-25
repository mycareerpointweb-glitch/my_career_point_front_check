import '../../Styles/Student/StudentBatches.css';
import React, { useMemo } from 'react';
// 1. Import DynamicTable
import DynamicTable from "../Reusable/DynamicTable";
// 2. Import DynamicGrid from the reusable components folder
import DynamicGrid from "../Reusable/DynamicGrid";


// --- Updated Dummy Data ---
const batchData = {
  batchName: "CA - Foundation APR 2025",
  startDate: "15th April 2024",
  endDate: "30th March 2025",
  schedule: "Mon–Fri, 6 PM – 8 PM",
  totalStudents: 60,
  mode: "Hybrid",
  location: "Chennai",
  instructors: [
    "Dr. S. K. Sharma (Taxation)",
    "Prof. A. R. Singh (Accounting)",
    "Ms. J. V. Iyer (Law)",
  ],
};

const subjectsData = [
  {
    name: "Taxation (Income Tax & GST)",
    code: "CF-TAX-101",
    teacher: "Dr. S. K. Sharma",
    status: "Live",
    description: 'Covers Income Tax principles and comprehensive analysis of GST regulations.',
  },
  {
    name: "Financial Accounting",
    code: "CF-ACC-102",
    teacher: "Prof. A. R. Singh",
    status: "Revision",
    description: 'Focuses on final accounts, company accounts, and fundamental accounting standards.',
  },
  {
    name: "Business Laws",
    code: "CF-LAW-103",
    teacher: "Ms. J. V. Iyer",
    status: "Completed",
    description: 'Key acts including the Indian Contract Act and Sale of Goods Act.',
  },
  {
    name: "Quantitative Aptitude & Economics",
    code: "CF-QA-104",
    teacher: "Mr. R. P. Gupta",
    status: "Upcoming",
    description: 'A blend of statistical methods and macro/micro-economic theory.',
  },
  {
    name: "Auditing Principles",
    code: "CF-AUD-105",
    teacher: "Ms. P. L. Menon",
    status: "Live",
    description: 'Covers auditing standards, types of audits, and professional ethics.',
  },
];

// Updated Timetable Data (Min 2, Max 4 periods per day + breaks)
const timetableData = [
  // Total 8 periods, with max 4 allocated slots per day
  { time: "9:00 AM - 10:00 AM", Mon: "Taxation", Tue: "Accounting", Wed: "Law", Thu: "", Fri: "Auditing" },
  { time: "10:00 AM - 11:00 AM", Mon: "Accounting", Tue: "Law", Wed: "", Thu: "Auditing", Fri: "QA & Economics" },
  { time: "11:00 AM - 11:15 AM", Mon: "BREAK", Tue: "BREAK", Wed: "BREAK", Thu: "BREAK", Fri: "BREAK" },
  { time: "11:15 AM - 12:15 PM", Mon: "Law", Tue: "", Wed: "Accounting", Thu: "Taxation", Fri: "" },
  { time: "12:15 PM - 1:15 PM", Mon: "", Tue: "Auditing", Wed: "Law", Thu: "Accounting", Fri: "Taxation" },
  { time: "1:15 PM - 2:15 PM", Mon: "LUNCH", Tue: "LUNCH", Wed: "LUNCH", Thu: "LUNCH", Fri: "LUNCH" },
  { time: "2:15 PM - 3:15 PM", Mon: "", Tue: "Taxation", Wed: "QA & Economics", Thu: "", Fri: "Accounting" },
  { time: "3:15 PM - 4:15 PM", Mon: "", Tue: "", Wed: "", Thu: "QA & Economics", Fri: "" },
];


// --- Function to map raw data to the required structured format for DynamicGrid ---
const mapToGridContent = (dataArray) => {
    return dataArray.map((subject, index) => ({
        no: index + 1,
        cellTitle: subject.name,
        data: [
            { key: 'Code', value: subject.code },
            { key: 'Teacher', value: subject.teacher },
        ],
        metadata: [
            subject.description,
        ],
        pill: {
            active: subject.status === "Live" || subject.status === "Revision",
            color: subject.status === "Live" ? 'var(--brand-pink)' :
                   subject.status === "Revision" ? 'var(--brand-orange)' :
                   'var(--color-gray-500)',
        }
    }));
};
// --------------------------------------------------------------------------------


const StudentBatches = () => {

  const mainSubjectGridContent = mapToGridContent(subjectsData);
  const rows = 2;
  const cols = 3;

  return (
    <div className="container student-batches-container fade-in">
      <h1 className="mt-4 mb-8 font-bold text-center text-pink">Batch Curriculum Overview</h1>

      <BatchDetailsCard data={batchData} />

      {/* Replaced SubjectsCard with SubjectsGridSection using DynamicGrid */}
      <SubjectsGridSection
        content={mainSubjectGridContent}
        rows={rows}
        cols={cols}
        batchName={batchData.batchName}
      />

      <TimetableCard timetable={timetableData} />
    </div>
  );
};


const BatchDetailsCard = ({ data }) => (
  <div className="card batch-details-card shadow-lg rounded-lg slide-down">
    
    <div className="card-body p-6">

      {/* 1. Batch Info Box */}
      <div className="batch-info-box shadow rounded-lg p-5">
        <p className="text-brand-pink mb-4 font-semibold">Batch Information</p>

        <div className="batch-info-grid">
            <p className="m-0">Batch Name : <strong> <span className="text-gray-700">{data.batchName}</span></strong></p>

            <p>Start Date : <strong> <span className="text-gray-700">{data.startDate}</span></strong></p>
            <p>End Date : <strong> <span className="text-gray-700">{data.endDate}</span></strong></p>
            <p>Schedule : <strong> <span className="text-gray-700 font-semibold">{data.schedule}</span></strong></p>
            <p>Total Students : <strong><span className="text-gray-700">{data.totalStudents}</span></strong></p>
            <p>Mode : <strong>
                <span>
                    {data.mode}
                </span>
                </strong>
            </p>
            <p className="m-0">Location : <strong> <span className="text-gray-700">{data.location}</span></strong></p>


        </div>
      </div>
    </div>
  </div>
);

// --- NEW COMPONENT using DynamicGrid for Subjects ---
const SubjectsGridSection = ({ content, rows, cols, batchName }) => (
      <div className="card-body p-0">
          <DynamicGrid
              rowCount={rows}
              secondaryTitle="Subject & Instructors"
              colCount={cols}
              content={content}
              outerBorderStyles={true}
              // The original Practise.jsx used a wrapper to show the primary title.
              // We'll pass it here, assuming DynamicGrid can consume it, or just use the card header.
              // In this version, we will rely on the card header for the main title.
          />
      </div>
);
// ----------------------------------------------------


// 2. Modify TimetableCard to use DynamicTable
const TimetableCard = ({ timetable }) => {

    // Define the fixed column order based on the keys in the data
    const ATTENDANCE_COLUMN_ORDER = useMemo(() => {
        if (timetable.length === 0) return [];
        // Extract all keys from the first object
        return Object.keys(timetable[0]);
    }, [timetable]);

    // Define custom display names for the columns
    const columnDisplayNameMap = useMemo(() => {
        return {
            time: 'Time Slot',
            Mon: 'Monday',
            Tue: 'Tuesday',
            Wed: 'Wednesday',
            Thu: 'Thursday',
            Fri: 'Friday',
            Sat: 'Saturday',
            Sun: 'Sunday',
        };
    }, []);

    // Define 'time' as a pill column to give it distinct styling (optional but useful)
    const pillColumns = ['Mon','Tue','Wed','Thu','Fri'];


    return (
        <div className="card timetable-card shadow-lg rounded-lg mt-8 slide-down">
            <div className="card-header bg-brand-pink-dark">
                <h2 className="text-center">Weekly Timetable</h2>
            </div>
            <div className="card-body p-0">
                <DynamicTable
                    data={timetable}
                    columnOrder={ATTENDANCE_COLUMN_ORDER}
                    columnDisplayNameMap={columnDisplayNameMap}
                    title='Timetable'
                    // We don't need search, add, or any row actions for a simple timetable view
                    onSearch={null}
                    onAddNew={null}
                    onEdit={null}
                    onDelete={null}
                    // Disable row clicking
                    onRowClickable={false}
                    // Make sure all columns are visible by default and cannot be changed
                    columnVisibilityDefinition={false}
                    // Use pill columns for styling
                    pillColumns={pillColumns}
                    customDescription={'Timetable data below'}
                />
            </div>
        </div>
    );
};

export default StudentBatches;