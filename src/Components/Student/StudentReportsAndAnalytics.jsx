import { FiSearch } from 'react-icons/fi';
import '../../Styles/Student/StudentReportsAndAnalytics.css'; // Custom styles for this component
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
// import './StudentReportAnalytics.css'; // Custom styles for this component

// --- DUMMY DATA FOR CHARTERED ACCOUNTANCY SUBJECTS ---
const CA_SUBJECTS = [
  'Accounting',
  'Business Law',
  'Taxation',
  'Cost & Management Accounting',
  'Auditing and Assurance'
];

const DUMMY_REPORTS = {
  // Report data for 'Accounting'
  'Accounting': {
    tests: [
      // ADDED 'date' field here
      { id: 1, name: 'Basic Accounting Concepts Test', number: 'T001', totalMarks: 50, marksObtained: 40, passMark: 25, date: '2025-08-10', status: 'Pass' },
      { id: 2, name: 'Partnership Accounts Exam', number: 'T002', totalMarks: 100, marksObtained: 55, passMark: 50, date: '2025-09-05', status: 'Pass' },
      { id: 3, name: 'Company Accounts Mid-Term', number: 'T003', totalMarks: 75, marksObtained: 30, passMark: 38, date: '2025-09-28', status: 'Fail' },
      { id: 4, name: 'Inventory Valuation Quiz', number: 'T004', totalMarks: 30, marksObtained: 28, passMark: 15, date: '2025-10-15', status: 'Pass' },
    ],
    assignments: [
      { id: 1, name: 'Journal Entries Practice', number: 'A001', totalMarks: 20, marksObtained: 18, submissionDate: '2025-09-01', status: 'Completed' },
      { id: 2, name: 'Final Accounts Case Study', number: 'A002', totalMarks: 50, marksObtained: 45, submissionDate: '2025-09-15', status: 'Completed' },
      { id: 3, name: 'Rectification of Errors Homework', number: 'A003', totalMarks: 30, marksObtained: 20, submissionDate: '2025-09-29', status: 'Pending Review' },
    ]
  },
  // Report data for 'Business Law'
  'Business Law': {
    tests: [
      // ADDED 'date' field here
      { id: 1, name: 'Indian Contract Act - Part 1', number: 'T101', totalMarks: 50, marksObtained: 45, passMark: 25, date: '2025-08-20', status: 'Pass' },
      { id: 2, name: 'Sale of Goods Act Mock', number: 'T102', totalMarks: 80, marksObtained: 38, passMark: 40, date: '2025-09-10', status: 'Fail' },
    ],
    assignments: [
      { id: 1, name: 'Contract Validity Analysis', number: 'A101', totalMarks: 30, marksObtained: 28, submissionDate: '2025-10-05', status: 'Completed' },
    ]
  },
  // Report data for 'Taxation'
  'Taxation': {
    tests: [
      // ADDED 'date' field here
      { id: 1, name: 'Income Tax Basics', number: 'T201', totalMarks: 60, marksObtained: 55, passMark: 30, date: '2025-09-01', status: 'Pass' },
      { id: 2, name: 'GST Framework Test', number: 'T202', totalMarks: 40, marksObtained: 20, passMark: 20, date: '2025-09-25', status: 'Pass' },
    ],
    assignments: [
      { id: 1, name: 'TDS Calculation Exercise', number: 'A201', totalMarks: 25, marksObtained: 22, submissionDate: '2025-09-20', status: 'Completed' },
      { id: 2, name: 'Income Head Classification', number: 'A202', totalMarks: 40, marksObtained: 35, submissionDate: '2025-10-10', status: 'Completed' },
    ]
  },
  // Report data for 'Cost & Management Accounting'
  'Cost & Management Accounting': {
    tests: [
      // ADDED 'date' field here
      { id: 1, name: 'Cost Sheet Preparation Test', number: 'T301', totalMarks: 70, marksObtained: 68, passMark: 35, date: '2025-09-15', status: 'Pass' },
    ],
    assignments: [
      { id: 1, name: 'Material Costing Problem Set', number: 'A301', totalMarks: 35, marksObtained: 30, submissionDate: '2025-10-01', status: 'Completed' },
    ]
  },
  // Report data for 'Auditing and Assurance'
  'Auditing and Assurance': {
    tests: [
      // ADDED 'date' field here
      { id: 1, name: 'Audit Standards Quiz', number: 'T401', totalMarks: 40, marksObtained: 32, passMark: 20, date: '2025-10-01', status: 'Pass' },
      { id: 2, name: 'Audit Report Procedures Exam', number: 'T402', totalMarks: 90, marksObtained: 40, passMark: 45, date: '2025-10-20', status: 'Fail' },
    ],
    assignments: [
      { id: 1, name: 'Internal Control Case Analysis', number: 'A401', totalMarks: 40, marksObtained: 40, submissionDate: '2025-10-15', status: 'Completed' },
    ]
  },
};

const StudentReportAnalytics = () => {
  const [selectedSubject, setSelectedSubject] = useState(CA_SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'assignments'
  const [searchTerm, setSearchTerm] = useState('');

  // Get the current report data based on the selected subject
  const currentReport = DUMMY_REPORTS[selectedSubject];
  
  // Determine which data (tests or assignments) is active
  const activeData = activeTab === 'tests' ? currentReport.tests : currentReport.assignments;
  
  // Memoized filter logic for search bar
  const filteredData = useMemo(() => {
    if (!searchTerm) return activeData;
    return activeData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeData, searchTerm]);

  // UPDATED: Added 'Date' to testHeaders
  const testHeaders = ['Test Name', 'Test No', 'Date', 'Total Marks', 'Marks Obtained', 'Pass Mark', 'Status'];
  const assignmentHeaders = ['Assignment Name', 'Assignment No', 'Total Marks', 'Marks Obtained', 'Submission Date', 'Status'];

  // Table Renderer
  const renderTable = (data, headers, type) => {
    return (
      <div className="STRA_table-responsive">
        <table className="STRA_report-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.number}</td>
                  {/* CONDITIONAL RENDERING: Display date for tests */}
                  {type === 'tests' && <td>{item.date}</td>} 
                  {/* CONDITIONAL RENDERING: Display Submission Date for assignments */}
                  {type !== 'tests' && <td>{item.submissionDate}</td>}

                  <td className="text-center font-semibold">{item.totalMarks}</td>
                  <td className="text-center font-bold">
                    <span className={type === 'tests' 
                        ? item.status === 'Pass' ? 'text-success' : 'text-error'
                        : 'text-orange'
                    }>
                      {item.marksObtained}
                    </span>
                  </td>
                  {type === 'tests' && <td>{item.passMark}</td>}
                  
                  <td>
                    <span className={`STRA_status-badge ${type === 'tests' ? item.status.toLowerCase() : item.status.replace(/\s/g, '').toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center p-4 text-gray-500 font-medium">
                  {searchTerm ? `No ${type} found matching "${searchTerm}"` : `No ${type} data available for this subject.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <header className="mb-4">
        <h1>Student Performance Report 📈</h1>
        <p>Detailed analytics for {selectedSubject} and other Chartered Accountancy subjects.</p>
      </header>
      
      {/* Subject Selection Cards */}
      <div className="STRA_subject-cards-grid gap-4 mb-4">
        {CA_SUBJECTS.map((subject) => (
          <div
            key={subject}
            className={`STRA_subject-card shadow-sm rounded p-4 flex flex-col items-center justify-center cursor-pointer transition-base ${selectedSubject === subject ? 'STRA_subject-card-active' : ''}`}
            onClick={() => {
              setSelectedSubject(subject);
              setSearchTerm(''); // Clear search on subject change
            }}
          >
            <h5 className="m-0 text-center font-semibold">{subject}</h5>
          </div>
        ))}
      </div>

      {/* Report Card */}
      <div className="STRA_report-card bg-white shadow-lg rounded-lg p-4">
        <h3 className="mb-4 text-pink">{selectedSubject} Performance Overview</h3>
        
        {/* Tab Navigation */}
        <div className="STRA_tabs-nav mb-4">
          <button
            className={`STRA_tab-btn btn ${activeTab === 'tests' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveTab('tests');
              setSearchTerm('');
            }}
          >
            Test Report
          </button>
          <button
            className={`STRA_tab-btn btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveTab('assignments');
              setSearchTerm('');
            }}
          >
            Assignment Report
          </button>
        </div>

        {/* Search Bar and Report */}
        <div className="STRA_search-and-report">
          <div className="Search-wrapper">
            
              {/* <FiSearch className="search-icon" /> */}
             <input
              type="text"
              className='search-input'
              placeholder={`Search by ${activeTab === 'tests' ? 'Test Name' : 'Assignment Name'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <div className="search-wrapper">
                  <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                  />
                  <FiSearch className="search-icon" />
              </div> */}
          
          </div>

          

          {activeTab === 'tests' && renderTable(filteredData, testHeaders, 'tests')}
          {activeTab === 'assignments' && renderTable(filteredData, assignmentHeaders, 'assignments')}
        </div>
      </div>
    </div>
  );
};

export default StudentReportAnalytics;