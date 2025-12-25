import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiAlertTriangle, 
  FiCheckCircle,   
} from "react-icons/fi";
import { MdBlock } from "react-icons/md";
import { RiUserForbidFill } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi";
import "../../Styles/SuperAdmin/UserManagement.css";
import DynamicTable from "../Reusable/DynamicTable";

// ⚠️ IMPORTANT: Set the API Base URL (Kept for reference, but fetch is commented out below)
const API_BASE_URL = "http://localhost:5000/api";

// --- COLUMN DEFINITION FOR DYNAMICTABLE ---
const USER_COLUMN_ORDER = [
    'username', 
    'role', 
    'status', 
    'last_login_display',
];

// --- NEW: COLUMN DEFINITION FOR PENDING USERS TABLE ---
const PENDING_USER_COLUMN_ORDER = [
    'username',
    'fullName',
    'email',
    'phone',
    'role',
    'status',
];
// --- END COLUMN DEFINITION ---

// --- SuspendUserModal (Unchanged) ---
const SuspendUserModal = ({ user, onClose, onSave }) => {
  const isSuspended = user.status === "Suspended";
  const [reason, setReason] = useState(user.suspensionReason || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); 

  useEffect(() => {
    // Logic for setting initial dates for suspended users (optional)
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSuspended && !reason.trim()) {
        alert("Suspension reason is required.");
        return;
    }
    setShowConfirm(true); 
  };

  const handleConfirmAction = () => {
    setShowConfirm(false); 
    
    const payload = {
      user_id: user.user_id,
      action: isSuspended ? "reactivate" : "suspend",
      reason: isSuspended ? "" : reason, 
      timeline: { startDate, endDate }
    };

    onSave(payload); 
    onClose(); 
  };


  if (showConfirm) {
    // Confirmation Popup
    return (
        <div className="modal-overlay">
            <div className="modal-content small-modal">
                <h3 className="modal-title">Confirm {isSuspended ? "Reactivation" : "Suspension"}</h3>
                <p>Are you sure you want to {isSuspended ? "REACTIVATE" : "SUSPEND"} the user **{user.username}**?</p>
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                        Cancel
                    </button>
                    <button className={`btn ${isSuspended ? "btn-primary" : "btn-danger"}`} onClick={handleConfirmAction}>
                        {isSuspended ? "Confirm Reactivate" : "Confirm Suspend"}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // Main Suspend/Reactivate Form Modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {isSuspended ? "Reactivate User" : "Suspend User"}
          </h3>
          <FiX className="close-icon" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <p className="user-info-text">
            User: {user.fullName}  - {user.role}
          </p>

          {!isSuspended && (
            <>
              <div className="form-group">
                <label htmlFor="reason">Reason for Suspension <span className="required">*</span></label>
                <textarea
                  id="reason"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Enter the detailed reason for suspension..."
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="startDate">Suspension Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Suspension End Date (Optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary`}
            >
              {isSuspended ? "Reactivate User" : "Suspend User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ----------------------------


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null); 
  const [filters, setFilters] = useState({
    role: null,
    status: null,
    batch: null,
  });

  const [availableBatches, setAvailableBatches] = useState([]);

  // Ref for cleanup (not strictly necessary now filter dropdown is removed)
  const filterRef = useRef(null); 

  const [editUser, setEditUser] = useState(null);
  const [formSource, setFormSource] = useState(null);

  const [suspendPopup, setSuspendPopup] = useState({ open: false, user: null });
  
  // States for form submissions and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // --- NEW: State for imported users awaiting approval ---
  const [pendingUsers, setPendingUsers] = useState([]);


  // Dummy Users instead of API
  useEffect(() => {
    const dummyUsers = [
      {
        user_id: 1,
        username: "john_doe",
        fullName: "John Doe",
        email: "john@student.com",
        phone: "9998887776",
        role: "Student",
        status: "Active",
        rollNo: "23STU101",
        school: "Career Point - Chennai Branch",
        guardianName: "Jane Doe",
        guardianPhone: "9876543210",
        batch: "Batch A - 2025",
        course: "Physics + Chemistry",
        admissionDate: "2025-10-11",
        notes: "Scholarship student",
        last_login: "2025-10-01T10:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 2,
        username: "jane_admin",
        fullName: "Jane Admin",
        email: "jane@careerpoint.com",
        phone: "9123456789",
        role: "Admin",
        status: "Suspended",
        employeeID: "ADM2003",
        assignedSchool: "Career Point - Mumbai Branch",
        suspensionReason: "Leave request for 3 months starting Oct 15.", 
        notes: "Manages batches for School A",
        last_login: "2025-09-28T12:30:00",
        profile_image: null,
      },
      {
        user_id: 3,
        username: "super_user",
        fullName: "Ramesh Kumar",
        email: "ramesh@careerpoint.com",
        phone: "9876543210",
        role: "Super Admin",
        status: "Active",
        employeeID: "SA1001",
        department: "Academic Affairs",
        notes: "Handles all institutes",
        last_login: "2025-10-02T15:45:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 4,
        username: "vikram_teacher",
        fullName: "Vikram Rao",
        email: "vikram@careerpoint.com",
        phone: "9812345678",
        role: "Teacher",
        status: "Active",
        employeeID: "TCH502",
        joiningDate: "2025-07-01",
        courses: "Physics, Math",
        assignedBatch: "Batch A - 2025, Batch C - 2026",
        notes: "Specializes in JEE coaching",
        last_login: "2025-10-10T11:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 5,
        username: "ananya_s",
        fullName: "Ananya Sharma",
        email: "ananya@student.com",
        phone: "9000011111",
        role: "Student",
        status: "Active",
        rollNo: "23STU102",
        school: "Career Point - Delhi Branch",
        guardianName: "Manoj Sharma",
        guardianPhone: "9000022222",
        batch: "Batch C - 2026",
        course: "Biology",
        admissionDate: "2025-11-01",
        notes: "New admission",
        last_login: "2025-10-11T09:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 6,
        username: "ananya_s_2",
        fullName: "Ananya Sharma II",
        email: "ananya2@student.com",
        phone: "9000011112",
        role: "Student",
        status: "Active",
        rollNo: "23STU103",
        school: "Career Point - Delhi Branch",
        guardianName: "Manoj Sharma",
        guardianPhone: "9000022222",
        batch: "Batch C - 2027",
        course: "Biology",
        admissionDate: "2025-11-01",
        notes: "New admission",
        last_login: "2025-10-11T09:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
    ];
    setUsers(dummyUsers);
    setLoading(false);

    // Calculate unique batches from dummy users who are students
    const studentBatches = [...new Set(
      dummyUsers
        .filter(user => user.role === 'Student' && user.batch)
        .map(user => user.batch)
    )];
    setAvailableBatches(studentBatches.sort());

  }, []);
  
  // Helper to clear feedback messages after a delay
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);


  // Close filter dropdown on outside click (Cleanup only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        // setFilterOpen(false); // Removed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Dynamic Table Filters Definition ---
  const userFilterDefinitions = useMemo(() => {
      // Role Options
      const roleOptions = ["Admin", "Teacher", "Super Admin", "Student"].map(role => ({
          value: role, 
          label: role
      }));
      roleOptions.unshift({ value: '', label: 'All Roles' });

      // Status Options
      const statusOptions = ["Active","Suspended", "Pending",].map(status => ({
          value: status, 
          label: status
      }));
      statusOptions.unshift({ value: '', label: 'All Statuses' });
      
      // Batch Options (Conditional based on role filter)
      const batchOptions = availableBatches.map(batch => ({
          value: batch, 
          label: batch
      }));
      batchOptions.unshift({ value: '', label: 'All Batches' });

      const definitions = {
          role: roleOptions,
          status: statusOptions,
      };
      
      // Only include batch filter if the current role selection is 'Student'
      if (filters.role === 'Student') {
          definitions.batch = batchOptions;
      }
      
      return definitions;
      
  }, [availableBatches, filters.role]);
  
  // Dynamic Table Filter Change Handler
  const handleFilterChange = (key, value) => {
    const newValue = value === '' ? null : value;
    
    setFilters((prev) => {
        const newFilters = { ...prev, [key]: newValue };
        
        // Logic to clear dependent filters: If role is cleared or changed from 'Student', clear 'batch'.
        if (key === 'role' && newValue !== 'Student') {
            newFilters.batch = null;
        }
        
        return newFilters;
    });
  };
  
  // Filter users based on *internal* state filters (DynamicTable calls onSearch for text)
  const filteredUsers = useMemo(() => {
      return users.filter((user) => {
        // Filter by role
        const matchesRole = filters.role
          ? user.role?.toLowerCase() === filters.role.toLowerCase()
          : true;
        // Filter by status
        const matchesStatus = filters.status
          ? user.status?.toLowerCase() === filters.status.toLowerCase()
          : true;
        // Filter by batch
        const matchesBatch = filters.batch ? user.batch === filters.batch : true;
          
        return matchesRole && matchesStatus && matchesBatch;
      });
  }, [users, filters]);
  
  // Final filter combining internal filter state and DynamicTable's search query
  const filteredUsersForTable = useMemo(() => {
      const lowerCaseSearch = searchTerm.toLowerCase();

      return filteredUsers.filter((user) => {
        // Apply text search on the pre-filtered list
        return (
            user.username?.toLowerCase().includes(lowerCaseSearch) ||
            user.fullName?.toLowerCase().includes(lowerCaseSearch) ||
            user.email?.toLowerCase().includes(lowerCaseSearch) ||
            user.rollNo?.toLowerCase().includes(lowerCaseSearch) ||
            user.employeeID?.toLowerCase().includes(lowerCaseSearch)
        );
      }).map(user => ({
          // Transform data for DynamicTable display
          ...user,
          // Format last login date for display column
          last_login_display: user.last_login
              ? new Date(user.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'N/A',
          // Use status as a pill for visualization (DT's formatCellData handles this implicitly)
          status: user.status || 'N/A', 
          // Add unique ID for DT's keying (already present as user_id)
          id: user.user_id 
      }));
  }, [filteredUsers, searchTerm]);
  
  // --- NEW: Memoized list of all users formatted for export ---
  const mappedUsersForExport = useMemo(() => users.map(user => ({
        ...user,
        last_login_display: user.last_login
            ? new Date(user.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A',
        id: user.user_id 
  })), [users]);
  
  // Dynamic Table Search Handler
  const handleDynamicTableSearch = (query) => {
      setSearchTerm(query);
  };
  
  // Helper to get the full user object from the simplified row data (if needed)
  const getUserFromRow = (row) => users.find(u => u.user_id === row.id);


  // Handle checkbox selection (kept for batch actions)
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedUsers(checked ? filteredUsers.map((u) => u.user_id) : []);
  };
  
  // Handle batch Suspend/Reactivate for selected users
  const handleBatchSuspend = (action) => {
      if (selectedUsers.length === 0) {
          alert(`Please select users to ${action}.`);
          return;
      }
      // For simplicity in this demo, open the modal for the *first* selected user.
      const usersToActOn = users.find(u => selectedUsers.includes(u.user_id));
      
      if (usersToActOn) {
          setSuspendPopup({ open: true, user: usersToActOn });
      }
  };
  
  /**
   * HANDLER FOR DELETING USER (API INTEGRATION - SIMULATED)
   */
  const handleDeleteUser = async (userRow) => {
    const id = userRow.id; // DynamicTable passes the row object
    if(window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        const userToDelete = users.find(u => u.user_id === id);

        if (!userToDelete) {
            setError("User not found for deletion.");
            setIsSubmitting(false);
            return;
        }

        // --- START: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
        await new Promise(resolve => setTimeout(resolve, 500)); 
        try {
            setUsers((prev) => prev.filter((user) => user.user_id !== id));
            setSuccess(`✅ ${userToDelete.role} (${userToDelete.username}) Deleted Successfully!`);
        } catch (err) {
            setError(err.message || "Failed to delete user.");
        } finally {
            setIsSubmitting(false);
        }
        // --- END: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
    }
  };


  /**
   * HANDLER FOR CREATING/EDITING USER (API INTEGRATION - SIMULATED)
   */
  const handleSave = async (userData) => {

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    const isUpdate = !!userData.user_id; 
    
    // --- START: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    try {
        const savedUser = isUpdate 
            ? userData 
            : { ...userData, user_id: Date.now(), status: "Active", suspensionReason: null, last_login: new Date().toISOString() };
            
        
        if (isUpdate) {
            setUsers((prev) =>
                prev.map((user) =>
                    user.user_id === savedUser.user_id ? savedUser : user
                )
            );
            setSuccess(`✅ ${savedUser.role} Updated Successfully!`);
            setEditUser(null); 
        } else {
            setUsers((prev) => [savedUser, ...prev]);
            setSuccess(`✅ ${savedUser.role} Created Successfully!\nUsername: ${savedUser.username}`);
            setSelectedRole(null); 
        }
        
    } catch (err) {
        setError(err.message || `Failed to ${isUpdate ? 'update' : 'create'} user. Check console for details.`);
        
    } finally {
        setIsSubmitting(false);
        setFormSource(null);
    }
    // --- END: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
  };

  /**
   * HANDLER FOR SUSPEND/REACTIVATE (API INTEGRATION - SIMULATED)
   */
  const handleSuspendSave = async ({ user_id, action, reason, timeline }) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const userToUpdate = users.find(u => u.user_id === user_id);
    const actionText = action === "suspend" ? "Suspend" : "Reactivate";

    if (!userToUpdate) {
        setError("User not found for status update.");
        setIsSubmitting(false);
        return;
    }
    
    // --- START: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    try {
        const updatedUser = {
            ...userToUpdate,
            status: action === "suspend" ? "Suspended" : "Active",
            suspensionReason: action === "suspend" ? reason : null,
        };

        setUsers(prev => prev.map(user => 
            user.user_id === user_id ? updatedUser : user
        ));
        
        setSuccess(`✅ User (${userToUpdate.username}) ${actionText}ed Successfully!`);
    } catch (err) {
        setError(err.message || `Failed to ${actionText.toLowerCase()} user.`);
    } finally {
        setIsSubmitting(false);
    }
    // --- END: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
  };

  
  // --- *** NEW: Handler for Imported Excel Data *** ---
  const handleDataImported = (importedJson) => {
      if (!importedJson || importedJson.length === 0) {
          alert("Import file is empty or invalid.");
          return;
      }
      
      const formattedData = importedJson.map((row, index) => {
          // Assumes Excel headers like 'username', 'fullName', 'email', 'phone', 'role'
          const newId = `PEND_${Date.now() + index}`;
          return {
              user_id: newId,
              id: newId, // Required by DynamicTable
              username: row.username || `imported_user_${index}`,
              fullName: row.fullName || "N/A",
              email: row.email || "N/A",
              phone: row.phone || "N/A",
              role: row.role || "Student", // Default to Student
              status: "Pending", // KEY REQUIREMENT
              last_login_display: "N/A",
              ...row // Spread any other properties from the Excel row
          };
      });
      
      setPendingUsers(prev => [...prev, ...formattedData]);
      setSuccess(`✅ ${formattedData.length} users imported and are awaiting approval.`);
  };
  
  // --- *** NEW: Handler for Approving/Rejecting Pending Users *** ---
  const handlePendingUserStatusChange = (userRow, newStatus) => {
      const userToProcess = pendingUsers.find(u => u.id === userRow.id);
      if (!userToProcess) return;

      if (newStatus === 'Approved') {
          // 1. Create a new "real" user object
          const activatedUser = {
              ...userToProcess,
              status: 'Active',
              user_id: Date.now(), // Give it a new "real" ID
              id: Date.now(),
              last_login: new Date().toISOString(),
              suspensionReason: null,
          };
          
          // 2. Add to main users list
          setUsers(prev => [activatedUser, ...prev]);
          
          // 3. Remove from pending list
          setPendingUsers(prev => prev.filter(u => u.id !== userRow.id));
          
          setSuccess(`User ${activatedUser.username} approved and added to main list.`);
          
      } else if (newStatus === 'Rejected') {
          // 1. Just remove from pending list
          setPendingUsers(prev => prev.filter(u => u.id !== userRow.id));
          setSuccess(`Pending user ${userToProcess.username} was rejected.`);
      }
  };


  // Helper to open the form for creation, clearing any existing edit state
  const handleOpenCreateUser = (role) => {
    setEditUser(null);
    setFormSource(null); 
    setSelectedRole(role);
    setError(null); 
    setSuccess(null);
  };
  
  // Helper to open the form for editing from the action column
  const handleOpenEditUser = (userRow) => {
    const user = getUserFromRow(userRow); 
    if(!user) return;
    
    setSelectedRole(null); 
    setFormSource("action"); 
    setEditUser(user);
    setError(null); 
    setSuccess(null);
  };
  
  // NEW: Custom Action Handler to open Suspend/Reactivate modal from the table row
  const handleSuspendReactivateAction = (userRow) => {
      const user = getUserFromRow(userRow);
      if (user) {
          setSuspendPopup({
              open: true,
              user: user,
          });
      }
  };


  return (
    <div className="user-management">
        
        {/* Global Success/Error Notification */}
        {(success || error) && (
            <div className={`notification ${success ? 'success' : 'error'}`}>
                {success && <FiCheckCircle size={20} style={{ marginRight: '8px' }} />}
                {error && <FiAlertTriangle size={20} style={{ marginRight: '8px' }} />}
                {success || error}
                <button className="close-btn" onClick={() => { setSuccess(null); setError(null); }}>
                    <FiX size={16} />
                </button>
            </div>
        )}
        
      {/* Header (Simplified) */}
      <div className="um-header">
        <h2 className="page-title">User Management</h2>
        
        <div className="um-actions">
          
          {/* Batch Actions for Selected Users */}
          {selectedUsers.length > 0 && (
              <div className="batch-actions-group">
                  <span className="selected-count">{selectedUsers.length} Selected:</span>
                  <button className="btn btn-danger" onClick={() => handleBatchSuspend("suspend")}>
                      <RiUserForbidFill /> Suspend Batch
                  </button>
                  <button className="btn btn-primary" onClick={() => handleBatchSuspend("reactivate")}>
                      <FiCheckCircle /> Reactivate Batch
                  </button>
              </div>
          )}

          {/* Separate Add User Buttons */}
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Student")}>
            <FiPlus /> Add Student
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Teacher")}>
            <FiPlus /> Add Teacher
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Admin")}>
            <FiPlus /> Add Admin
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Super Admin")}>
            <FiPlus /> Add Super Admin
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Users</h4>
          <p className="summary-value">{users.length}</p>
        </div>
        {/* NEW: Pending Users Card */}
        {pendingUsers.length > 0 && (
            <div className="summary-card warning">
                <h4>Pending Imports</h4>
                <p className="summary-value">{pendingUsers.length}</p>
            </div>
        )}
        {(searchTerm || filters.role || filters.status || filters.batch) && (
          <div className="summary-card">
            <h4>Filtered Results</h4>
            <p className="summary-value">{filteredUsersForTable.length}</p> 
          </div>
        )}
        {selectedUsers.length > 0 && (
          <div className="summary-card highlight">
            <h4>Selected Users</h4>
            <p className="summary-value">{selectedUsers.length}</p>
          </div>
        )}
      </div>


      {/* Reusable Create/Edit User Form (Modal) */}
      {(selectedRole || editUser) && (
        <div className="modal-overlay">
          <CreateUserForm
            role={selectedRole || editUser?.role}
            initialData={editUser}
            formSource={formSource} 
            onClose={() => {
              setSelectedRole(null);
              setEditUser(null);
              setFormSource(null); 
            }}
            onSubmit={handleSave}
            isSubmitting={isSubmitting} 
          />
        </div>
      )}
      
      {/* Suspend/Reactivate Modal */}
      {suspendPopup.open && suspendPopup.user && (
        <SuspendUserModal
            user={suspendPopup.user}
            onClose={() => setSuspendPopup({ open: false, user: null })}
            onSave={handleSuspendSave}
        />
      )}

      {/* Users Table: USING DYNAMICTABLE */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
          <>
            {/* --- NEW: Pending Users Table --- */}
            {pendingUsers.length > 0 && (
                <div className="pending-users-section">
                    <DynamicTable
                        data={pendingUsers}
                        columnOrder={PENDING_USER_COLUMN_ORDER}
                        title="Pending Imported Users"
                        
                        // --- APPROVAL ACTIONS ---
                        onStatusChange={handlePendingUserStatusChange} // This enables Approve/Reject
                        
                        // Disable other actions for this table
                        onEdit={null}
                        onDelete={null}
                        onSearch={null}
                        onAddNew={null}
                        hasSuspension={false}
                        
                        // Custom Display
                        pillColumns={['status', 'role']}
                        customDescription="Approve or Reject the imported users below. Approved users will be added to the main list."
                    />
                </div>
            )}
          
            {/* --- Main Users Table --- */}
            <DynamicTable
                data={filteredUsersForTable}
                unfilteredData={mappedUsersForExport} // <-- ADDED for Export
                onDataImported={handleDataImported}   // <-- ADDED for Import
                columnOrder={USER_COLUMN_ORDER}
                title="All Users"
                
                // Actions
                onEdit={handleOpenEditUser} 
                onDelete={handleDeleteUser} 
                
                // NEW: Suspension Action
                hasSuspension={true}
                onSuspendReactivate={handleSuspendReactivateAction} // New handler passed
                
                // Search and Filtering
                onSearch={handleDynamicTableSearch}
                filterDefinitions={userFilterDefinitions}
                activeFilters={Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== null).map(([k, v]) => [k, v])
                )}
                onFilterChange={handleFilterChange}
                
                // Custom Display/Pills
                pillColumns={['status', 'role']} 

                // Custom 'Add New' button logic (We use the separate buttons above, so disable DT's)
                onAddNew={null} 
            />
          </>
      )}
    </div>
  );
};

export default UserManagement;