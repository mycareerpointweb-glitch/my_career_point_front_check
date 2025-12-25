// StudentAttendance.jsx

import React, { useState, useMemo } from 'react';
import '../../Styles/Student/StudentAttendance.css';
import DynamicTable from '../Reusable/DynamicTable'; 

// Dummy Data (Matching the requirements)
const subjectData = [
  {
    id: 'S001',
    subject: 'Web Development',
    teacher: 'Mr. Alex Johnson',
    code: 'CS401',
    totalPeriods: 80,
    periodsPresent: 68,
    periodsAbsent: 12,
  },
  {
    id: 'S002',
    subject: 'Data Structures',
    teacher: 'Ms. Emily Davis',
    code: 'CS402',
    totalPeriods: 75,
    periodsPresent: 55,
    periodsAbsent: 20,
  },
  {
    id: 'S003',
    subject: 'Database Management',
    teacher: 'Dr. Michael Chen',
    code: 'CS403',
    totalPeriods: 60,
    periodsPresent: 58,
    periodsAbsent: 2,
  },
  {
    id: 'S004',
    subject: 'Operating Systems',
    teacher: 'Mrs. Sarah Lee',
    code: 'CS404',
    totalPeriods: 70,
    periodsPresent: 60,
    periodsAbsent: 10,
  },
  {
    id: 'S005',
    subject: 'Discrete Mathematics',
    teacher: 'Prof. David Kim',
    code: 'MA405',
    totalPeriods: 90,
    periodsPresent: 75,
    periodsAbsent: 15,
  },
];

// Calculate overall attendance for the summary table
const totalPeriodsAvailable = subjectData.reduce((acc, sub) => acc + sub.totalPeriods, 0);
const totalPeriodsPresent = subjectData.reduce((acc, sub) => acc + sub.periodsPresent, 0);
const totalPeriodsAbsent = subjectData.reduce((acc, sub) => acc + sub.periodsAbsent, 0);

const overallAttendance = {
  presentPercentage: ((totalPeriodsPresent / totalPeriodsAvailable) * 100).toFixed(2),
  absentPercentage: ((totalPeriodsAbsent / totalPeriodsAvailable) * 100).toFixed(2),
  totalPeriodsAvailable,
  totalPeriodsPresent,
  totalPeriodsAbsent,
};

// Dummy daily attendance data for a selected subject (Now structured for a table)
const dailyAttendanceData = [
    { date: '2024-10-01', day: 'Tuesday', hour: 1, periodNo: 2, status: 'Present' },
    { date: '2024-10-01', day: 'Tuesday', hour: 3, periodNo: 4, status: 'Present' },
    { date: '2024-10-03', day: 'Thursday', hour: 2, periodNo: 3, status: 'Absent' },
    { date: '2024-10-03', day: 'Thursday', hour: 4, periodNo: 5, status: 'Present' },
    { date: '2024-10-03', day: 'Thursday', hour: 5, periodNo: 6, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 1, periodNo: 2, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 2, periodNo: 3, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 4, periodNo: 5, status: 'Absent' },
    { date: '2024-10-07', day: 'Monday', hour: 6, periodNo: 7, status: 'Present' },
];

const StudentAttendance = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectData[0].id);
  const selectedSubject = subjectData.find(sub => sub.id === selectedSubjectId);
  const selectedSubjectName = selectedSubject?.subject || 'No Subject Selected';
  
  // --- Memoized Data for DynamicTable ---
  
  // 1. Overall Summary Data
  const summaryTableData = useMemo(() => [
      { 
          id: 'overall-summary',
          // Combine data into a single row object
          presentPercentage: overallAttendance.presentPercentage + '%',
          absentPercentage: overallAttendance.absentPercentage + '%',
          totalPeriodsPresent: overallAttendance.totalPeriodsPresent,
          totalPeriodsAbsent: overallAttendance.totalPeriodsAbsent,
          totalPeriodsAvailable: overallAttendance.totalPeriodsAvailable,
      }
  ], []);

  // 2. Subject-wise Data
  const subjectTableData = useMemo(() => subjectData.map(subject => ({
    id: subject.id, 
    subject: subject.subject,
    teacher: subject.teacher,
    code: subject.code,
    totalPeriods: subject.totalPeriods,
    presented: subject.periodsPresent,
    absented: subject.periodsAbsent,
    attendancePercentage: ((subject.periodsPresent / subject.totalPeriods) * 100).toFixed(2) + '%',
  })), []);

  // 3. Daily Log Data
  const dailyLogData = useMemo(() => dailyAttendanceData.map((log, index) => ({
    id: `log-${index}`, 
    date: log.date,
    day: log.day,
    hour: log.hour,
    periodNo: log.periodNo,
    status: log.status,
  })), []);
  
  // --- Column Definitions ---
  
  // Overall Summary Columns
  const summaryColumnOrder = [
      'presentPercentage', 
      'absentPercentage', 
      'totalPeriodsPresent', 
      'totalPeriodsAbsent', 
      'totalPeriodsAvailable'
  ];
  const summaryColumnDisplayNameMap = {
      presentPercentage: 'Total Present %',
      absentPercentage: 'Total Absent %',
      totalPeriodsPresent: 'Total Periods Presented',
      totalPeriodsAbsent: 'Total Periods Absent',
      totalPeriodsAvailable: 'Total Periods Available',
  };

  // Subject Table Columns
  const subjectColumnOrder = ['subject', 'teacher', 'code', 'totalPeriods', 'presented', 'absented', 'attendancePercentage'];
  const subjectColumnDisplayNameMap = {
      subject: 'Subject',
      teacher: 'Teacher Name',
      code: 'Subject Code',
      totalPeriods: 'Total Periods',
      presented: 'Presented',
      absented: 'Absented',
      attendancePercentage: 'Attendance %',
  };
  
  // Daily Log Columns
  const dailyLogColumnOrder = ['date', 'day', 'hour', 'periodNo', 'status'];
  const dailyLogColumnDisplayNameMap = {
      date: 'Date',
      day: 'Day',
      hour: 'Hour',
      periodNo: 'Period No.',
      status: 'Status',
  };

  const handleRowClick = (id) => {
    setSelectedSubjectId(id);
    console.log(`Selected subject ID: ${id}`);
  };

  return (
    <div className="STAT_container">
      <h1 className="STAT_title">Student Attendance Report</h1>

        <DynamicTable
            data={summaryTableData}
            columnOrder={summaryColumnOrder} 
            columnDisplayNameMap={summaryColumnDisplayNameMap} 
            title='Overall Attendance Summary'
            // Disable all controls for a pure display table
            onSearch={null} 
            onAddNew={null}
            unfilteredData={null}
        />

        <DynamicTable
            data={subjectTableData}
            columnOrder={subjectColumnOrder} 
            columnDisplayNameMap={subjectColumnDisplayNameMap}
            title='Subject Attendance'
            onRowClickable={true} 
            onRowClick={(id) => handleRowClick(id)}
            selectedRowId={selectedSubjectId}
            onSearch={null} 
            onAddNew={null}
        />

      
        <DynamicTable
            data={dailyLogData}
            columnOrder={dailyLogColumnOrder}
            columnDisplayNameMap={dailyLogColumnDisplayNameMap}
            title={`Daily Log for ${selectedSubjectName}`}
            pillColumns={['status']} 
            onSearch={null}
            onAddNew={null}
        />
      </div>
  );
};

export default StudentAttendance;