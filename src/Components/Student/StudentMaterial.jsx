import "../../Styles/SuperAdmin/MaterialsManagement.css";
import CardSlider from "../Reusable/CardSlider";
import DynamicTable from "../Reusable/DynamicTable";
import React, { useState, useRef } from "react";
import {
    FiChevronRight, FiList, FiBookOpen, FiFileText, FiEye
} from "react-icons/fi";

// --- STATIC DATA ---
const MATERIALS_TYPE_DATA = new Map([
    ['MAT_ID001', 'MCP-Materials'],
    ['MAT_ID002', 'MCP-Notes'],
    ['MAT_ID003', 'Class-Notes'],
    ['MAT_ID004', 'Tasks']
]);

const SUBJECTS_DATA_FULL = new Map([
    ['CA101', 'Financial Accounting'],
    ['CA102', 'Cost Accounting'],
    ['CA103', 'Business Law and Ethics'],
    ['CA104', 'Taxation – Direct and Indirect'],
    ['CA105', 'Auditing and Assurance'],
    ['CA106', 'Financial Management'],
    ['CA107', 'Corporate Accounting'],
    ['CA108', 'Management Information Systems'],
    ['CA109', 'Economics for Finance'],
    ['CA110', 'Strategic Management']
]);

const DISPLAY_SUBJECTS_DATA = SUBJECTS_DATA_FULL;


// --- EXPANDED MATERIAL DATA ---
const MACP_MATERIALS = [
    {"material_id": "MCPM1-01", "material_type_id": "MAT_ID001", "material_name": "CA101 - Fin Acc Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA101", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM1-02", "material_type_id": "MAT_ID001", "material_name": "CA101 - Fin Acc Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA101", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM1-03", "material_type_id": "MAT_ID001", "material_name": "CA101 - Fin Acc Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA101", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM2-01", "material_type_id": "MAT_ID001", "material_name": "CA102 - Cost Acc Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA102", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM2-02", "material_type_id": "MAT_ID001", "material_name": "CA102 - Cost Acc Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA102", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM2-03", "material_type_id": "MAT_ID001", "material_name": "CA102 - Cost Acc Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA102", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM3-01", "material_type_id": "MAT_ID001", "material_name": "CA103 - Bus Law Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA103", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM3-02", "material_type_id": "MAT_ID001", "material_name": "CA103 - Bus Law Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA103", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM3-03", "material_type_id": "MAT_ID001", "material_name": "CA103 - Bus Law Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA103", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM4-01", "material_type_id": "MAT_ID001", "material_name": "CA104 - Tax Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA104", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM4-02", "material_type_id": "MAT_ID001", "material_name": "CA104 - Tax Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA104", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM4-03", "material_type_id": "MAT_ID001", "material_name": "CA104 - Tax Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA104", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM5-01", "material_type_id": "MAT_ID001", "material_name": "CA105 - Audit Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA105", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM5-02", "material_type_id": "MAT_ID001", "material_name": "CA105 - Audit Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA105", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM5-03", "material_type_id": "MAT_ID001", "material_name": "CA105 - Audit Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA105", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM6-01", "material_type_id": "MAT_ID001", "material_name": "CA106 - FM Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA106", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM6-02", "material_type_id": "MAT_ID001", "material_name": "CA106 - FM Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA106", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM6-03", "material_type_id": "MAT_ID001", "material_name": "CA106 - FM Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA106", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM7-01", "material_type_id": "MAT_ID001", "material_name": "CA107 - Corp Acc Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA107", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM7-02", "material_type_id": "MAT_ID001", "material_name": "CA107 - Corp Acc Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA107", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM7-03", "material_type_id": "MAT_ID001", "material_name": "CA107 - Corp Acc Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA107", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM8-01", "material_type_id": "MAT_ID001", "material_name": "CA108 - MIS Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA108", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM8-02", "material_type_id": "MAT_ID001", "material_name": "CA108 - MIS Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA108", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM8-03", "material_type_id": "MAT_ID001", "material_name": "CA108 - MIS Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA108", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM9-01", "material_type_id": "MAT_ID001", "material_name": "CA109 - Econ Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA109", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM9-02", "material_type_id": "MAT_ID001", "material_name": "CA109 - Econ Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA109", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM9-03", "material_type_id": "MAT_ID001", "material_name": "CA109 - Econ Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA109", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPM10-01", "material_type_id": "MAT_ID001", "material_name": "CA110 - Strategy Item 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA110", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPM10-02", "material_type_id": "MAT_ID001", "material_name": "CA110 - Strategy Item 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA110", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPM10-03", "material_type_id": "MAT_ID001", "material_name": "CA110 - Strategy Item 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA110", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN1-01", "material_type_id": "MAT_ID002", "material_name": "CA101 - Fin Acc Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA101", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN1-02", "material_type_id": "MAT_ID002", "material_name": "CA101 - Fin Acc Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA101", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN1-03", "material_type_id": "MAT_ID002", "material_name": "CA101 - Fin Acc Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA101", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN2-01", "material_type_id": "MAT_ID002", "material_name": "CA102 - Cost Acc Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA102", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN2-02", "material_type_id": "MAT_ID002", "material_name": "CA102 - Cost Acc Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA102", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN2-03", "material_type_id": "MAT_ID002", "material_name": "CA102 - Cost Acc Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA102", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN3-01", "material_type_id": "MAT_ID002", "material_name": "CA103 - Bus Law Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA103", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN3-02", "material_type_id": "MAT_ID002", "material_name": "CA103 - Bus Law Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA103", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN3-03", "material_type_id": "MAT_ID002", "material_name": "CA103 - Bus Law Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA103", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN4-01", "material_type_id": "MAT_ID002", "material_name": "CA104 - Tax Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA104", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN4-02", "material_type_id": "MAT_ID002", "material_name": "CA104 - Tax Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA104", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN4-03", "material_type_id": "MAT_ID002", "material_name": "CA104 - Tax Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA104", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN5-01", "material_type_id": "MAT_ID002", "material_name": "CA105 - Audit Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA105", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN5-02", "material_type_id": "MAT_ID002", "material_name": "CA105 - Audit Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA105", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN5-03", "material_type_id": "MAT_ID002", "material_name": "CA105 - Audit Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA105", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN6-01", "material_type_id": "MAT_ID002", "material_name": "CA106 - FM Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA106", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN6-02", "material_type_id": "MAT_ID002", "material_name": "CA106 - FM Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA106", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN6-03", "material_type_id": "MAT_ID002", "material_name": "CA106 - FM Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA106", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN7-01", "material_type_id": "MAT_ID002", "material_name": "CA107 - Corp Acc Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA107", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN7-02", "material_type_id": "MAT_ID002", "material_name": "CA107 - Corp Acc Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA107", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN7-03", "material_type_id": "MAT_ID002", "material_name": "CA107 - Corp Acc Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA107", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN8-01", "material_type_id": "MAT_ID002", "material_name": "CA108 - MIS Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA108", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN8-02", "material_type_id": "MAT_ID002", "material_name": "CA108 - MIS Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA108", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN8-03", "material_type_id": "MAT_ID002", "material_name": "CA108 - MIS Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA108", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN9-01", "material_type_id": "MAT_ID002", "material_name": "CA109 - Econ Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA109", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN9-02", "material_type_id": "MAT_ID002", "material_name": "CA109 - Econ Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA109", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN9-03", "material_type_id": "MAT_ID002", "material_name": "CA109 - Econ Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA109", "status": "Rejected", "date_status_change": null},
    {"material_id": "MCPN10-01", "material_type_id": "MAT_ID002", "material_name": "CA110 - Strategy Notes 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA110", "status": "Approved", "date_status_change": "2025-11-12"},
    {"material_id": "MCPN10-02", "material_type_id": "MAT_ID002", "material_name": "CA110 - Strategy Notes 2", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA110", "status": "Pending", "date_status_change": null},
    {"material_id": "MCPN10-03", "material_type_id": "MAT_ID002", "material_name": "CA110 - Strategy Notes 3", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA110", "status": "Rejected", "date_status_change": null}
];

const CLASS_NOTES = [
    {"material_id": "CNOT1-01", "material_type_id": "MAT_ID003", "material_name": "CA101 - Fin Acc Q&A Set", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA101", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT1-02", "material_type_id": "MAT_ID003", "material_name": "CA101 - Fin Acc Quiz", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA101", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT1-03", "material_type_id": "MAT_ID003", "material_name": "CA101 - Fin Acc Theory", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA101", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT2-01", "material_type_id": "MAT_ID003", "material_name": "CA102 - Cost Acc Intro", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA102", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT2-02", "material_type_id": "MAT_ID003", "material_name": "CA102 - Cost Acc Problems", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA102", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT2-03", "material_type_id": "MAT_ID003", "material_name": "CA102 - Cost Acc Formulas", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA102", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT3-01", "material_type_id": "MAT_ID003", "material_name": "CA103 - Bus Law Ch 1", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA103", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT3-02", "material_type_id": "MAT_ID003", "material_name": "CA103 - Bus Law Ethics", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA103", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT3-03", "material_type_id": "MAT_ID003", "material_name": "CA103 - Bus Law Cases", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA103", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT4-01", "material_type_id": "MAT_ID003", "material_name": "CA104 - Tax Direct", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA104", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT4-02", "material_type_id": "MAT_ID003", "material_name": "CA104 - Tax Indirect", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA104", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT4-03", "material_type_id": "MAT_ID003", "material_name": "CA104 - Tax Amendments", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA104", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT5-01", "material_type_id": "MAT_ID003", "material_name": "CA105 - Audit Standards", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA105", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT5-02", "material_type_id": "MAT_ID003", "material_name": "CA105 - Audit Ethics", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA105", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT5-03", "material_type_id": "MAT_ID003", "material_name": "CA105 - Audit Planning", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA105", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT6-01", "material_type_id": "MAT_ID003", "material_name": "CA106 - FM Working Cap", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA106", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT6-02", "material_type_id": "MAT_ID003", "material_name": "CA106 - FM Cost of Capital", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA106", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT6-03", "material_type_id": "MAT_ID003", "material_name": "CA106 - FM Leverage", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA106", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT7-01", "material_type_id": "MAT_ID003", "material_name": "CA107 - Corp Acc Mergers", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA107", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT7-02", "material_type_id": "MAT_ID003", "material_name": "CA107 - Corp Acc IFRS", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA107", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT7-03", "material_type_id": "MAT_ID003", "material_name": "CA107 - Corp Acc Consolid", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA107", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT8-01", "material_type_id": "MAT_ID003", "material_name": "CA108 - MIS DBMS", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA108", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT8-02", "material_type_id": "MAT_ID003", "material_name": "CA108 - MIS Security", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA108", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT8-03", "material_type_id": "MAT_ID003", "material_name": "CA108 - MIS E-Commerce", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA108", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT9-01", "material_type_id": "MAT_ID003", "material_name": "CA109 - Econ Demand", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA109", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT9-02", "material_type_id": "MAT_ID003", "material_name": "CA109 - Econ Supply", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA109", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT9-03", "material_type_id": "MAT_ID003", "material_name": "CA109 - Econ Monetary", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA109", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT10-01", "material_type_id": "MAT_ID003", "material_name": "CA110 - Strategy PESTEL", "size_kb": 1100, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA110", "status": "Approved", "date_status_change": "2025-11-12", "institute_name": "MACP Academy"},
    {"material_id": "CNOT10-02", "material_type_id": "MAT_ID003", "material_name": "CA110 - Strategy SWOT", "size_kb": 1200, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA110", "status": "Pending", "date_status_change": null, "institute_name": "MACP Academy"},
    {"material_id": "CNOT10-03", "material_type_id": "MAT_ID003", "material_name": "CA110 - Strategy Porter", "size_kb": 1300, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA110", "status": "Rejected", "date_status_change": null, "institute_name": "MACP Academy"}
];

const TASKS_DATA = [
    {"material_id": "TASK1-01", "material_type_id": "MAT_ID004", "material_name": "CA101 - Fin Acc Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA101", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK1-02", "material_type_id": "MAT_ID004", "material_name": "CA101 - Fin Acc HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA101", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK1-03", "material_type_id": "MAT_ID004", "material_name": "CA101 - Fin Acc Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA101", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK2-01", "material_type_id": "MAT_ID004", "material_name": "CA102 - Cost Acc Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA102", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK2-02", "material_type_id": "MAT_ID004", "material_name": "CA102 - Cost Acc HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA102", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK2-03", "material_type_id": "MAT_ID004", "material_name": "CA102 - Cost Acc Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA102", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK3-01", "material_type_id": "MAT_ID004", "material_name": "CA103 - Bus Law Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA103", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK3-02", "material_type_id": "MAT_ID004", "material_name": "CA103 - Bus Law HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA103", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK3-03", "material_type_id": "MAT_ID004", "material_name": "CA103 - Bus Law Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA103", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK4-01", "material_type_id": "MAT_ID004", "material_name": "CA104 - Tax Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA104", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK4-02", "material_type_id": "MAT_ID004", "material_name": "CA104 - Tax HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA104", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK4-03", "material_type_id": "MAT_ID004", "material_name": "CA104 - Tax Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA104", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK5-01", "material_type_id": "MAT_ID004", "material_name": "CA105 - Audit Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA105", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK5-02", "material_type_id": "MAT_ID004", "material_name": "CA105 - Audit HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA105", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK5-03", "material_type_id": "MAT_ID004", "material_name": "CA105 - Audit Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA105", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK6-01", "material_type_id": "MAT_ID004", "material_name": "CA106 - FM Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA106", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK6-02", "material_type_id": "MAT_ID004", "material_name": "CA106 - FM HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA106", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK6-03", "material_type_id": "MAT_ID004", "material_name": "CA106 - FM Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA106", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK7-01", "material_type_id": "MAT_ID004", "material_name": "CA107 - Corp Acc Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA107", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK7-02", "material_type_id": "MAT_ID004", "material_name": "CA107 - Corp Acc HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA107", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK7-03", "material_type_id": "MAT_ID004", "material_name": "CA107 - Corp Acc Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA107", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK8-01", "material_type_id": "MAT_ID004", "material_name": "CA108 - MIS Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA108", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK8-02", "material_type_id": "MAT_ID004", "material_name": "CA108 - MIS HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA108", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK8-03", "material_type_id": "MAT_ID004", "material_name": "CA108 - MIS Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA108", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK9-01", "material_type_id": "MAT_ID004", "material_name": "CA109 - Econ Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA109", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK9-02", "material_type_id": "MAT_ID004", "material_name": "CA109 - Econ HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA109", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK9-03", "material_type_id": "MAT_ID004", "material_name": "CA109 - Econ Exam", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA109", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK10-01", "material_type_id": "MAT_ID004", "material_name": "CA110 - Strategy Quiz 1", "size_kb": null, "uploded_date": "2025-11-11", "uploaded_by": "Admin 1", "subject_code": "CA110", "status": "Approved", "date_status_change": "2025-11-12", "obtained_marks": 15, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK10-02", "material_type_id": "MAT_ID004", "material_name": "CA110 - Strategy HW 1", "size_kb": null, "uploded_date": "2025-11-12", "uploaded_by": "Uploader 2", "subject_code": "CA110", "status": "Pending", "date_status_change": null, "obtained_marks": null, "max_marks": 20, "institute_name": "MACP Academy"},
    {"material_id": "TASK10-03", "material_type_id": "MAT_ID004", "material_name": "CA110 - Strategic Planning", "size_kb": null, "uploded_date": "2025-11-13", "uploaded_by": "Admin 3", "subject_code": "CA110", "status": "Rejected", "date_status_change": null, "obtained_marks": 0, "max_marks": 20, "institute_name": "MACP Academy"}
];

const ALL_MATERIALS = [...MACP_MATERIALS, ...CLASS_NOTES, ...TASKS_DATA];


// --- Main Component: StudentMaterial ---
const StudentMaterial = () => {

    // 1. State Hooks
    const [selectedMaterialType, setSelectedMaterialType] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectCardKey, setSubjectCardKey] = useState(0);
    // NEW: State for search term
    const [searchTerm, setSearchTerm] = useState('');
    const materialListRef = useRef(null);

    // 2. Handlers

    const handleMaterialTypeSelect = (typeOrId) => {
        let type = typeOrId;

        if (typeof typeOrId === 'string') {
            const name = MATERIALS_TYPE_DATA.get(typeOrId);
            if (!name) return;
            type = { id: typeOrId, name };
        } else if (!typeOrId || !typeOrId.id) {
            type = null;
        }

        let newType = null;

        if (selectedMaterialType && selectedMaterialType.id === type?.id) {
            newType = null;
        } else {
            newType = type;
        }

        setSelectedMaterialType(newType);

        // Reset search and subject selection
        setSelectedSubject(null);
        setSearchTerm(''); // NEW: Reset search term
        
        // CRITICAL FIX: Increment the key to force the Subject CardSlider component to remount
        // and visually reset its selection state.
        setSubjectCardKey(prev => prev + 1);
    };

    const handleSubjectSelect = (subjectOrId) => {
        let subject = subjectOrId;

        if (typeof subjectOrId === 'string') {
            const name = DISPLAY_SUBJECTS_DATA.get(subjectOrId);
            if (!name) return;
            subject = { id: subjectOrId, name };
        } else if (!subjectOrId || !subjectOrId.id) {
            subject = null;
        }

        if (selectedSubject && selectedSubject.id === subject?.id) {
            setSelectedSubject(null);
        } else {
            setSelectedSubject(subject);
            // Reset search term when a new subject is selected
            setSearchTerm(''); // NEW: Reset search term

            setTimeout(() => {
                if (materialListRef.current) {
                    materialListRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 200);
        }
    };
    
    // NEW: Search Handler
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // 3. Data Filtering Logic
    const getFilteredData = () => {
        if (!selectedMaterialType || !selectedSubject) return [];

        const typeId = selectedMaterialType.id;
        const subjectCode = selectedSubject.id;

        // 1. Filter by Type and Subject
        let data = ALL_MATERIALS.filter(material =>
            material.material_type_id === typeId &&
            material.subject_code === subjectCode
        );
        
        // 2. Filter by Search Term (Case-insensitive search across key fields)
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        
        if (lowerCaseSearchTerm) {
            data = data.filter(item => 
                item.material_id.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.material_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.uploaded_by.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.status.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        return data;
    };

    const finalDisplayData = getFilteredData();

    // 4. Dynamic Table Column Definitions
    const typeId = selectedMaterialType?.id;
    const isTasksOrNotesType = typeId === 'MAT_ID003' || typeId === 'MAT_ID004';
    const isTasksType = typeId === 'MAT_ID004';
    const isMACPType = typeId === 'MAT_ID001' || typeId === 'MAT_ID002';

    const baseColumns = [
        { key: 's_no', header: 'S.No.', isSortable: false, render: (item, index) => index + 1 },
        { key: 'material_id', header: 'File ID', isSortable: true, isFilterable: true },
        { key: 'material_name', header: 'File Name', isSortable: true, isFilterable: true },
        { key: 'subject_code', header: 'Subject Code', isSortable: true, isFilterable: true },
        // FIX: Handles null size_kb correctly
        { key: 'size_kb', header: 'File Size', isSortable: true, render: (item) => item.size_kb ? `${item.size_kb} KB` : 'N/A' },
        { key: 'uploaded_by', header: 'Uploaded By', isSortable: true, isFilterable: true },
        { key: 'uploded_date', header: 'Upload Date', isSortable: true, isFilterable: true },
    ];

    const statusColumns = isTasksOrNotesType ? [
        { key: 'status', header: 'File Status', isSortable: true, isFilterable: true },
        { key: 'date_status_change', header: 'Status Date', isSortable: true, isFilterable: true, render: (item) => item.date_status_change || 'N/A' },
    ] : [];

    const nonMACPColumns = isTasksOrNotesType ? [
        { key: 'institute_name', header: 'Institute', isSortable: true, isFilterable: true },
    ] : [];

    const taskSpecificColumns = isTasksType ? [
        {
            key: 'marks_data',
            header: 'Marks (Obt./Max.)',
            isSortable: false,
            // FIX: Uses Nullish Coalescing Operator (??) to correctly show 'N/A' if marks are null/undefined
            render: (item) => item.status === 'Approved'
                ? `${item.obtained_marks ?? 'N/A'} / ${item.max_marks ?? 'N/A'}`
                : '-'
        }
    ] : [];

    const finalActionColumn = {
        key: 'view_icon',
        header: 'View File',
        isSortable: false,
        render: () => <FiEye size={18} title="View Material" style={{ cursor: 'pointer', color: '#007bff'}}/>
    };

    const getColumnDefinitions = () => {
        let columns = [
            ...baseColumns,
            ...nonMACPColumns,
            ...statusColumns,
            ...taskSpecificColumns,
            finalActionColumn
        ];

        if (isMACPType) {
            columns = columns.filter(col => col.key !== 'institute_name');
        }

        return columns;
    };

    const columnOrder = getColumnDefinitions().map(col => col.key);

    const simplifiedFilterDefinitions = {
        status: [
            { label: 'All Statuses', value: '' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Rejected', value: 'Rejected' },
        ],
    };


    return (
        <div className="mm_wrapper">
            <div className="mm_header">
                <h1 className="mm_page-title">Student Materials Access</h1>
              
            </div>

            {/* 1. Materials Type Selection */}
            <CardSlider
                institutes={MATERIALS_TYPE_DATA}
                title='Materials'
                icon_title="Materials"
                selectedCard={selectedMaterialType}
                onSelectInstitute={handleMaterialTypeSelect}
            />

            {/* 2. Subject Selection (Conditional on Material Type) */}
            {selectedMaterialType && (
                <CardSlider
                    // Key change forces the component to reset to a fresh state
                    key={subjectCardKey}
                    institutes={DISPLAY_SUBJECTS_DATA}
                    title={`Subjects`}
                    icon_title="Subjects"
                    selectedCard={selectedSubject}
                    onSelectInstitute={handleSubjectSelect}
                />
            )}

            
            {selectedMaterialType && selectedSubject && (
                <div ref={materialListRef} className="mm_material-list-section">
                    <DynamicTable
                        data={finalDisplayData}
                        columnOrder={columnOrder}
                        columnDefinitions={getColumnDefinitions()}
                        title={'Materials list'}
                        // UPDATED: Pass the search handler
                        onSearch={handleSearch}
                        // UPDATED: Pass the current search term to the table (if it supports displaying it)
                        searchTerm={searchTerm} 
                        filterDefinitions={isTasksOrNotesType ? simplifiedFilterDefinitions : {}}
                        activeFilters={{}}
                        onFilterChange={() => {}}
                        pillColumns={isTasksOrNotesType ? ['status'] : []}
                        onAddNew={null}
                        onEdit={null}
                        onDelete={null}
                        onStatusChange={null}
                    />
                </div>
            )}

           

        </div>
    );
};

export default StudentMaterial;