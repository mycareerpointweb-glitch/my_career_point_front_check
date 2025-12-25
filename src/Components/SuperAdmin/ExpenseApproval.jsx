// ExpenseRequestDashboard.js

import React, { useState, useMemo, useCallback } from 'react';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import ExpenseFormModal from './ExpenseFormModal'; 
import DynamicTable from "../Reusable/DynamicTable"; 
import '../../Styles/SuperAdmin/ExpenseApprovalForm.css'; 

// Mock Data updated with 'lineItems' and 'totalAmount' field
const initialExpenses = [
    { 
        id: 1, 
        teacherName: "CA Ramesh Kumar", 
        employeeId: "TCH502", 
        batchCourse: "CA Inter – Batch A",
        expenseType: "Travel",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-05", 
        submittedDate: "06-10-2025", 
        status: "Pending", 
        totalAmount: "₹2,500", 
        approvalDate: "-", 
        lineItems: [
            { purpose: "Flight ticket", amount: "₹1,800" }, 
            { purpose: "Local taxi fair", amount: "₹700" },
        ],
       Document: "travel_receipt.pdf"
    },
    { 
        id: 2, 
        teacherName: "Prof. Priya Singh", 
        employeeId: "TCH510", 
        batchCourse: "CS Exec – Batch B",
        expenseType: "Training",
        paymentMode: "Institute Advance",
        expenseDate: "2025-09-12",
        submittedDate: "15-09-2025", 
        status: "Approved", 
        totalAmount: "₹1,800", 
        approvalDate: "16-09-2025", 
        lineItems: [
            { purpose: "Software license", amount: "₹1,500" }, 
            { purpose: "Printing materials", amount: "₹300" }, 
        ],
       Document: "software_invoice.pdf"
    },
    { 
        id: 3, 
        teacherName: "CA Ramesh Kumar", 
        employeeId: "TCH502", 
        batchCourse: "CMA Final – Batch C",
        expenseType: "Accommodation",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-01",
        submittedDate: "01-10-2025", 
        status: "Rejected", 
        totalAmount: "₹4,200", 
        approvalDate: "03-10-2025", 
        lineItems: [
            { purpose: "Hotel stay", amount: "₹4,200" }, 
        ],
       Document: "hotel_bill.pdf"
    },
    { 
        id: 5, 
        teacherName: "CA Ramesh Kumar", 
        employeeId: "TCH502", 
        batchCourse: "CA Inter – Batch A",
        expenseType: "Materials",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-20",
        submittedDate: "21-10-2025", 
        status: "Pending", 
        totalAmount: "₹1,550", 
        approvalDate: "-", 
        lineItems: [
            { purpose: "Software license", amount: "₹1,550" }, 
        ],
       Document: "renewal_invoice.pdf"
    },
    { 
        id: 6, 
        teacherName: "CA Ramesh Kumar", 
        employeeId: "TCH502", 
        batchCourse: "CA Final – Batch D",
        expenseType: "Food",
        paymentMode: "Self-paid",
        expenseDate: "2025-08-10",
        submittedDate: "11-08-2025", 
        status: "Approved", 
        totalAmount: "₹850", 
        approvalDate: "12-08-2025", 
        lineItems: [
            { purpose: "Team lunch", amount: "₹850" }, 
        ],
       Document: "food_bill.pdf"
    },
];

// Common purpose options for filtering
const COMMON_PURPOSES = [
    'Flight ticket', 'Local taxi fair', 'Software license', 'Printing materials', 
    'Hotel stay', 'Team lunch'
];

// Define the current teacher's context
const CURRENT_TEACHER_CONTEXT = {
    teacherName: "CA Ramesh Kumar",
    employeeId: "TCH502",
};

const currencyToNumber = (currencyString) => {
    if (typeof currencyString === 'number') return currencyString;
    return parseFloat(currencyString.replace(/[^0-9.-]+/g,""));
};

// --- DynamicTable Column Definitions ---
const EXPENSE_COLUMN_ORDER = [
    'id', 
    'teacherName', 
    'employeeId', 
    'lineItemPurposes', 
    'expenseDate', 
    'submittedDate', 
    'status',
    'totalAmount', 
    'Document', 
];

const columnDisplayNameMap = {
    id: 'ID',
    teacherName: 'Teacher Name',
    employeeId: 'ID',
    lineItemPurposes: 'Purpose / Amount', 
    expenseDate: 'Expense Date', 
    submittedDate: 'Submitted Date',
    status: 'Approval Status',
    totalAmount: 'Total Amount',
   Document: 'Document', 
};


const ExpenseRequestDashboard = ( {userRole}) => { 
    const isTeacherRole = userRole.toLowerCase() === 'teacher'; 
    const isApprovalRole = (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'super admin'); 
    
    const isTeacherView = (isTeacherRole || isApprovalRole); 
    const currentTeacherId = CURRENT_TEACHER_CONTEXT.employeeId;

    const [expenses, setExpenses] = useState(initialExpenses);
    const [searchText, setSearchText] = useState('');
    
    // --- STATE ---
    const [activeFilters, setActiveFilters] = useState({
        status: 'All',
        purpose: '', 
        // submittedDate removed from here, handled by separate state below
    });

    // New State for Date Picker
    const [selectedDateFilter, setSelectedDateFilter] = useState(''); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // --- CRUD and Status Handlers ---
    const handleSaveExpense = (newExpenseData) => { 
        const expenseToSave = {
            ...newExpenseData,
            id: newExpenseData.id || Date.now(), 
            status: 'Pending', 
            approvalDate: '-',
            submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        };

        if (editingExpense) {
            setExpenses(prevExpenses =>
                prevExpenses.map(exp => (exp.id === expenseToSave.id ? expenseToSave : exp))
            );
        } else {
            setExpenses(prevExpenses => [expenseToSave, ...prevExpenses]);
        }
        setEditingExpense(null); 
    };

    const handleStatusChange = useCallback((id, newStatus) => {
        setExpenses(prevExpenses => prevExpenses.map(exp => {
            if (exp.id === id) {
                return { 
                    ...exp, 
                    status: newStatus,
                    approvalDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                };
            }
            return exp;
        }));
        alert(`Expense ID ${id} has been ${newStatus}.`);
    }, []);

    const handleHoldStatus = useCallback((rowOrId, newStatus) => {
        const id = typeof rowOrId === 'object' ? rowOrId.id : rowOrId;
        setExpenses(prevExpenses => prevExpenses.map(exp => {
            if (exp.id === id) {
                return { 
                    ...exp, 
                    status: newStatus, 
                };
            }
            return exp;
        }));
    }, []);

    const handleDeleteExpense = useCallback((row) => { 
        const expenseId = row.id;
        if (row.status !== 'Pending') {
             alert(`Cannot delete expense ID ${expenseId}. Only 'Pending' requests can be deleted.`);
             return;
        }
        if (window.confirm(`Are you sure you want to DELETE expense ID ${expenseId}? This action cannot be undone.`)) {
            setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
        }
    }, []);

    const handleEditExpense = useCallback((row) => { 
        if (row.status === 'Pending') {
            const originalExpense = expenses.find(exp => exp.id === row.id);
            setEditingExpense(originalExpense);
            setIsModalOpen(true);
        } else {
            alert(`Cannot edit expense ID ${row.id}. Only 'Pending' requests can be edited.`);
        }
    }, [expenses]);
    
    const handleFilterChange = useCallback((column, value) => {
        setActiveFilters(prev => ({ ...prev, [column]: value }));
    }, []);
    
    const handleSearchChange = useCallback((query) => {
        setSearchText(query);
    }, []);


    // --- Memoized Filtering and Data Transformation ---
    const allTeacherExpenses = useMemo(() => {
        return isTeacherView 
            ? expenses.filter(expense => expense.employeeId === currentTeacherId)
            : expenses; 
    }, [expenses, isTeacherView, currentTeacherId]);

    const filteredExpensesRaw = useMemo(() => {
        let filtered = allTeacherExpenses;
        const statusFilter = activeFilters.status;
        const purposeFilter = activeFilters.purpose;
        
        // 1. Filter by Status
        if (statusFilter && statusFilter !== 'All') {
            filtered = filtered.filter(expense => expense.status === statusFilter);
        }
        
        // 2. Filter by Purpose
        if (purposeFilter) {
             filtered = filtered.filter(expense => 
                expense.lineItems.some(item => item.purpose === purposeFilter)
            );
        }
        
        // 3. Filter by Date Picker (Submitted Date)
        if (selectedDateFilter) {
             filtered = filtered.filter(expense => {
                // expense.submittedDate is in "DD-MM-YYYY" (e.g., "06-10-2025")
                // selectedDateFilter is in "YYYY-MM-DD" (e.g., "2025-10-06")
                
                if (!expense.submittedDate) return false;

                // Split the data date
                const [day, month, year] = expense.submittedDate.split('-');
                // Construct standard ISO date string
                const formattedDataDate = `${year}-${month}-${day}`;

                return formattedDataDate === selectedDateFilter;
             });
        }


        // 4. Filter by Search Text
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(expense => {
                const purposeMatch = expense.lineItems.some(item => 
                    item.purpose.toLowerCase().includes(searchLower)
                );
                return (
                    expense.teacherName.toLowerCase().includes(searchLower) ||
                    expense.employeeId.toLowerCase().includes(searchLower) ||
                    purposeMatch
                );
            });
        }
        
        return filtered;
    }, [allTeacherExpenses, activeFilters.status, activeFilters.purpose, selectedDateFilter, searchText]); 
    
    
    const transformedTableData = useMemo(() => {
        return filteredExpensesRaw.map(expense => {
            
            const lineItemPurposes = (
                <div className="EXP_line-items-cell">
                    {expense.lineItems.map((item, index) => (
                        <div key={index} className="EXP_line-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0'}}>
                            <span className="EXP_purpose-col" style={{ flex: '2', minWidth: '60%' }}>{item.purpose}</span>
                            <span className="EXP_amount-col" style={{ flex: '1', minWidth: '40%', textAlign: 'right', fontWeight: 'bold' }}>{item.amount}</span>
                        </div>
                    ))}
                </div>
            );

            return {
                id: expense.id,
                teacherName: expense.teacherName,
                employeeId: expense.employeeId,
                lineItemPurposes: lineItemPurposes, 
                expenseDate: expense.expenseDate, 
                submittedDate: expense.submittedDate,
                status: expense.status, 
                totalAmount: expense.totalAmount, 
               Document: ( 
                    <button className="DT_action-btn DT_view-doc" title="View Document">
                        <FaEye size={16} />
                    </button>
                ),
                approved_status: expense.status, 
            };
        });
    }, [filteredExpensesRaw]);


    // --- DynamicTable Filter Definitions ---
    const expenseFilterDefinitions = useMemo(() => {
        const statusOptions = [
            { value: 'All', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'OnHolded', label: 'On Hold' }, 
            { value: 'Released', label: 'Released' }, 
        ];
        
        const purposeOptions = [
            { value: '', label: 'All Purposes' },
            ...COMMON_PURPOSES.map(p => ({ value: p, label: p }))
        ];
        
        // Removed the previous 'submittedDate' dropdown options logic 
        // because we are now using the Date Picker prop

        return {
            status: statusOptions,
            purpose: purposeOptions,
        };
    }, []);

    const summaryData = useMemo(() => {
        const pendingCount = allTeacherExpenses.filter(exp => exp.status === 'Pending').length;
        const totalApprovedAmount = allTeacherExpenses
            .filter(exp => exp.status === 'Approved')
            .reduce((total, exp) => total + currencyToNumber(exp.totalAmount), 0);
        const formattedTotalApprovedAmount = `₹${totalApprovedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        return { pendingCount, totalApprovedAmount: formattedTotalApprovedAmount, };
    }, [allTeacherExpenses]);


    const handleOpenAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };
    
    // Conditional Action Props
    const actionProps = {};

    if (isTeacherRole) {
        actionProps.onEdit = handleEditExpense;
        actionProps.onDelete = handleDeleteExpense;
    } else if (isApprovalRole) {
        actionProps.onStatusChange = handleStatusChange;
        actionProps.onHold = handleHoldStatus; 
    }


    return (
        <div className="EXP_approval-dashboard">
            <h1 className="EXP_header">Expenses</h1>
            
            <div className="EXP_summary-cards-row">
                <div className="EXP_summary-card EXP_pending-card">
                    <div className="EXP_card-title">Pending Requests</div>
                    <div className="EXP_card-value EXP_pending-value">{summaryData.pendingCount}</div>
                </div>
                <div className="EXP_summary-card EXP_approved-card">
                    <div className="EXP_card-title">Total Approved Expenses</div>
                    <div className="EXP_card-value EXP_approved-value">{summaryData.totalApprovedAmount}</div>
                </div>
                <div className="EXP_summary-card EXP_total-card">
                    <div className="EXP_card-title">Total Requests Submitted</div>
                    <div className="EXP_card-value EXP_total-value">{allTeacherExpenses.length}</div>
                </div>
            </div>
            
            <hr className='EXP_summary-separator' />

                <DynamicTable
                    data={transformedTableData}
                    columnOrder={EXPENSE_COLUMN_ORDER}
                    columnDisplayNameMap={columnDisplayNameMap}
                    title='Expense Requests'
                    userRole ={userRole.toLowerCase()}
                    
                    {...actionProps}
                    
                    // --- Filters and Search ---
                    onSearch={handleSearchChange} 
                    filterDefinitions={expenseFilterDefinitions}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                   
                    // --- NEW: Date Picker Props ---
                    showDateFilter={true} 
                    activeDateFilter={selectedDateFilter} 
                    onDateChange={setSelectedDateFilter} 

                    onAddNew={handleOpenAddModal} 

                    add_new_button_label={'Add Expense Request'}
                    
                    customDescription={'Filters for Expense Status, Purpose, and Submitted Date:'}
                    pillColumns={['status']} 
                />

            <ExpenseFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                currentExpense={editingExpense}
                onSave={handleSaveExpense}
                teacherContext={CURRENT_TEACHER_CONTEXT}
            />
        </div>
    );
};

export default ExpenseRequestDashboard;