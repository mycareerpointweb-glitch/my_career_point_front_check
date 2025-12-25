import React, { useState, useEffect, useRef } from 'react';
import '../../Styles/Reusable/DynamicTable.css';
import {
    AlertTriangle, Edit, FileText, Trash2, Plus, Search, 
    CheckCircle, XOctagon, ListChecks, 
    Upload, 
    Download, 
    UserX,
    UserCheck,
    PauseCircle, 
    PlayCircle,
    Calendar // <--- Added Icon
} from 'lucide-react';

// --- LIBRARIES ---
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
// -----------------

import { FaUnlock } from 'react-icons/fa';

/**
 * DynamicTable - Reusable data table with automatic Column Visibility Control
 */
const DynamicTable = ({
    data,
    userRole,
    onEdit,
    onDelete,
    onSearch,
    onStatusChange,
    onHold, 
    columnOrder, 
    title,
    onAddNew,
    customDescription,

    // --- Import/Export Props ---
    onDataImported,
    onExcelFormat, 
    unfilteredData, 

    // --- NEW: Suspend/Reactivate Prop ---
    onSuspendReactivate, 

    // --- NEW: Date Picker Props ---
    showDateFilter = false,    // Set to true to show the calendar
    activeDateFilter = '',     // The current selected date value
    onDateChange,              // Function to handle date selection

    // Row Click Props
    onRowClick, 
    onRowClickable = false, 
    selectedRowId = null, 
    
    // STANDARD ROW FILTER PROPS 
    filterDefinitions = {},
    activeFilters = {},
    onFilterChange,
    
    pillColumns = []
}) => {
    // State to track which custom dropdown is currently open (for standard filters)
    const [openFilterKey, setOpenFilterKey] = useState(null);
    const [openVisibilityFilter, setOpenVisibilityFilter] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // --- COLUMN DISCOVERY ---
    const hasData = data && data.length > 0;
    const allDefinedKeys = columnOrder || (hasData ? Object.keys(data[0]) : []);
    const [activeVisibleColumns, setActiveVisibleColumns] = useState(allDefinedKeys);

    // Refs
    const visibilityFilterRef = useRef(null);
    const exportMenuRef = useRef(null);
    const importInputRef = useRef(null);
    
    // Handle clicks outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (visibilityFilterRef.current && !visibilityFilterRef.current.contains(event.target)) {
                setOpenVisibilityFilter(false);
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [visibilityFilterRef, exportMenuRef]);

    if (!data) {
        return (
          <div className="DT_no-data-container">
            <AlertTriangle size={18} />
            <p className="DT_no-data-text">No data to display for {title}.</p>
          </div>
        );
    }
    
    const noResults = data.length === 0;
    const normalizeKey = (key) => key.toLowerCase().trim();

    const formatHeader = (key) =>
        key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
    // --- COLUMN VISIBILITY LOGIC ---
    let columnsToDisplay = allDefinedKeys.filter(key => activeVisibleColumns.includes(key));
    const columns = columnsToDisplay; 

    // Action Column Logic
    const hasEditDeleteActions = (onEdit || onDelete || onSuspendReactivate); 
    const hasApprovalActions = onStatusChange || onHold; 
    
    const showActionsColumn = hasEditDeleteActions;
    const showApprovalActionsColumn = hasApprovalActions && !showActionsColumn;
    const hasSuspendAction = onSuspendReactivate;

    const filterKeys = Object.keys(filterDefinitions);
    const hasFilters = filterKeys.length > 0 && onFilterChange;
    const shouldDisplayVisibilityFilter = allDefinedKeys.length > 0;

    const getColumnClassName = (key) =>
        `DT_column-${normalizeKey(key).replace(/[^a-z0-9_]/g, '')}`;

    const formatCellData = (key, value) => {
        if (value == null) return '';
        const isPillColumn = pillColumns.map((col) => normalizeKey(col)).includes(normalizeKey(key));
        if (isPillColumn) {
            const items = Array.isArray(value) ? value : String(value).split(',').map((i) => i.trim()).filter((i) => i.length > 0);
            return (
                <div className="DT_multi-pill-container">
                    {items.map((item, index) => (
                        <span key={index} className={`DT_pill DT_pill-${item.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}`}>
                            {item}
                        </span>
                    ))}
                </div>
            );
        }
        return value;
    };
    
    const handleColumnVisibilityToggle = (columnKey) => {
        setActiveVisibleColumns(prev => prev.includes(columnKey) ? prev.filter(key => key !== columnKey) : [...prev, columnKey]);
    };
    
    const handleAllColumnsToggle = () => {
        setActiveVisibleColumns(activeVisibleColumns.length === allDefinedKeys.length ? [] : allDefinedKeys);
    };

    const getVisibilityFilterHeader = () => {
        if (activeVisibleColumns.length === allDefinedKeys.length) return "All Columns";
        if (activeVisibleColumns.length === 0) return "No Columns Selected";
        return `${activeVisibleColumns.length} of ${allDefinedKeys.length} Columns`;
    }
    
    const getRowUniqueId = (row) => row.id || row.code || row.user_id || row.material_id || null;

    const handleInternalRowClick = (row) => {
        if (onRowClickable && onRowClick) {
            const rowId = getRowUniqueId(row);
            if (rowId) onRowClick(rowId);
        }
    };

    // --- HANDLE EXCEL EXPORT ---
    const handleExport = (withFilters) => {
        const dataToExport = withFilters ? data : unfilteredData;
        if (!dataToExport || dataToExport.length === 0) return alert('No data to export.');

        const keysToExport = columnOrder || Object.keys(dataToExport[0]);
        const formattedData = dataToExport.map(row => {
            let newRow = {};
            keysToExport.forEach(key => { newRow[formatHeader(key)] = row[key]; });
            return newRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, `${title || 'data'}_${withFilters ? 'filtered' : 'all'}.xlsx`);
        setIsExportOpen(false);
    };

    // --- HANDLE PDF EXPORT ---
    const handleExportPDF = (withFilters) => {
        try {
            const dataToExport = withFilters ? data : (unfilteredData || data);
            if (!dataToExport || dataToExport.length === 0) return alert('No data to export.');

            // Initialize PDF - landscape
            const doc = new jsPDF('landscape', 'pt', 'a4');
            const keysToExport = columnOrder || Object.keys(dataToExport[0]);
            
            // Generate Headers
            const headers = [keysToExport.map(key => formatHeader(key))];
            
            // Generate Body
            const body = dataToExport.map(row => 
                keysToExport.map(key => {
                    const value = row[key];
                    if (value === null || value === undefined) return '';
                    return String(value);
                })
            );

            // Add Title
            doc.setFontSize(18);
            doc.text(`${title || 'Data'} Report`, 40, 40);

            // Use the autoTable function directly
            autoTable(doc, {
                head: headers,
                body: body,
                startY: 60,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            });

            // Save PDF
            doc.save(`${title || 'data'}_${withFilters ? 'filtered' : 'all'}.pdf`);
        } catch (error) {
            console.error("PDF Export Error: ", error);
            alert("PDF generation failed. See console.");
        }
        setIsExportOpen(false);
    };
    
    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file || !onDataImported) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                onDataImported(json);
            } catch (error) { alert("Failed to import file."); }
            if (importInputRef.current) importInputRef.current.value = null;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="DT_main-container">
            <div className="DT_header-row">
                {title && <h2 className="DT_title-header DT_header-title">{title}</h2>}

                {(onSearch || onAddNew || onDataImported) && (
                    <div className="DT_controls-group DT_top-controls">
                        {onSearch && (
                            <div className="DT_search-container">
                                <Search size={16} className="DT_search-icon" />
                                <input type="text" placeholder={`Search ${title || 'Data'}...`} onChange={(e) => onSearch(e.target.value)} className="DT_search-input" />
                            </div>
                        )}
                        
                        {onAddNew && (userRole === 'teacher' || ((userRole==='admin' || userRole === 'super admin' ) && title==="Institutions") )&& (
                            <button onClick={onAddNew} className="DT_add-new-btn">
                                <Plus size={18} /> Add New {title}
                            </button>
                        )}

                        {onExcelFormat && (
                            <a 
                                href={onExcelFormat} 
                                download 
                                className="DT_action-btn DT_excel-format-btn"
                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <FileText size={18} /> Excel Format
                            </a>
                        )}

                        {onDataImported && (
                            <>
                                <button onClick={() => importInputRef.current && importInputRef.current.click()} className="DT_action-btn DT_import-btn">
                                    <Upload size={18} /> Import
                                </button>
                                <input type="file" ref={importInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".xlsx, .xls" />
                            </>
                        )}
                        
                        {/* Export Dropdown */}
                        <div className="DT_export-container" ref={exportMenuRef}>
                            <button onClick={() => setIsExportOpen(!isExportOpen)} className="DT_action-btn DT_export-btn">
                                <Download size={18} /> Export
                            </button>
                            
                            {isExportOpen && (
                                <div className="DT_export-menu" style={{ position: 'absolute', left: 0, top: '100%', backgroundColor: 'white', border: '1px solid #ddd', zIndex: 1000, minWidth: '150px', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: '#999', background: '#f9f9f9' }}>EXCEL DOWNLOAD</div>
                                    <div className="DT_export-option" onClick={() => handleExport(true)} style={{ padding: '8px 12px', cursor: 'pointer' }}>Excel (Filtered)</div>
                                    <div className={`DT_export-option ${!unfilteredData ? 'DT_disabled' : ''}`} onClick={() => unfilteredData && handleExport(false)} style={{ padding: '8px 12px', cursor: 'pointer' }}>Excel (All Data)</div>
                                    <div style={{ height: '1px', background: '#eee' }}></div>
                                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: '#888', background: '#f9f9f9' }}>PDF DOWNLOAD</div>
                                    <div className="DT_export-option" onClick={() => handleExportPDF(true)} style={{ padding: '8px 12px', cursor: 'pointer' }}>PDF (Filtered)</div>
                                    <div className={`DT_export-option ${!unfilteredData ? 'DT_disabled' : ''}`} onClick={() => unfilteredData && handleExportPDF(false)} style={{ padding: '8px 12px', cursor: 'pointer' }}>PDF (All Data)</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {(hasFilters || shouldDisplayVisibilityFilter || showDateFilter) && (
                <div className="DT_filter-row">
                    {customDescription ? <p>{customDescription}</p> : <p>** filters for below Table ** </p> }
                    <div className='DT_filter_flexy'>
                        
                        {/* --- NEW DATE FILTER --- */}
                        {showDateFilter && (
                            <div className="DT_filter-container">
                                <div 
                                    className="DT_custom-date-wrapper" 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        height: '35px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Calendar size={16} style={{ marginRight: '8px', color: '#666' }} />
                                    <input
                                        type="date"
                                        value={activeDateFilter || ''}
                                        onChange={(e) => onDateChange && onDateChange(e.target.value)}
                                        className="DT_date-input-element"
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            color: '#444',
                                            fontSize: '13px',
                                            fontFamily: 'inherit',
                                            background: 'transparent',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    {activeDateFilter && (
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); onDateChange && onDateChange(''); }}
                                            style={{ marginLeft: '8px', fontSize: '16px', color: '#999', cursor: 'pointer', lineHeight: 1 }}
                                        >
                                            &times;
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {shouldDisplayVisibilityFilter && (
                            <div className="DT_filter-container" ref={visibilityFilterRef}>
                                <div className={`DT_custom-dropdown-select ${openVisibilityFilter ? 'DT_dropdown-open' : ''}`} onClick={() => setOpenVisibilityFilter(!openVisibilityFilter)} tabIndex="0">
                                    <div className="DT_custom-dropdown-value DT_flex-start">
                                        <ListChecks size={18} style={{ marginRight: '8px' }} />
                                        {getVisibilityFilterHeader()}
                                    </div>
                                    <div className="DT_custom-dropdown-arrow">&#9662;</div>
                                </div>
                                {openVisibilityFilter && (
                                    <div className="DT_custom-dropdown-menu"> 
                                        <div className="DT_custom-dropdown-option DT_select-all" onClick={handleAllColumnsToggle} style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                                            <input type="checkbox" checked={activeVisibleColumns.length === allDefinedKeys.length} readOnly className="DT_column-checkbox" />
                                            <span className="DT_column-label">{activeVisibleColumns.length === allDefinedKeys.length ? 'Deselect All' : 'Select All'}</span>
                                        </div>
                                        {allDefinedKeys.map((key) => (
                                            <div key={key} className={`DT_custom-dropdown-option ${activeVisibleColumns.includes(key) ? 'DT_active-option' : ''}`} onClick={() => handleColumnVisibilityToggle(key)}>
                                                <input type="checkbox" checked={activeVisibleColumns.includes(key)} readOnly className="DT_column-checkbox" />
                                                <span className="DT_column-label">{formatHeader(key)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {hasFilters && filterKeys.map(columnKey => (
                            <div key={columnKey} className="DT_filter-container">
                                <div className={`DT_custom-dropdown-select ${openFilterKey === columnKey ? 'DT_dropdown-open' : ''}`} onClick={() => setOpenFilterKey(openFilterKey === columnKey ? null : columnKey)} tabIndex="0">
                                    <div className="DT_custom-dropdown-value">
                                        {filterDefinitions[columnKey].find(opt => opt.value === (activeFilters[columnKey] || ''))?.label || formatHeader(columnKey)}
                                    </div>
                                    <div className="DT_custom-dropdown-arrow">&#9662;</div>
                                </div>
                                {openFilterKey === columnKey && (
                                    <div className="DT_custom-dropdown-menu">
                                        {filterDefinitions[columnKey].map((option) => (
                                            <div key={option.value} className={`DT_custom-dropdown-option ${option.value === activeFilters[columnKey] ? 'DT_active-option' : ''}`} onClick={() => { onFilterChange(columnKey, option.value); setOpenFilterKey(null); }}>
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className='DT_table-wrapper'>
                <div className="DT_Table-wrapper-container">
                    <table className="DT_table">
                        <thead className="DT_table-head">
                            <tr>
                                {columns.map((key) => (
                                    <th key={key} className={`DT_th-cell ${getColumnClassName(key)}`}>
                                        <div className="DT_th-content-wrapper">{formatHeader(key)}</div>
                                    </th>
                                ))}
                                {showApprovalActionsColumn && <th className="DT_th-cell DT_column-approval-actions">Actions</th>}
                                {showActionsColumn && <th className="DT_th-cell DT_column-actions">Actions</th>}
                            </tr>
                        </thead>
                        
                        {noResults ? (
                            <tbody>
                                <tr>
                                    <td colSpan={columns.length + (showApprovalActionsColumn ? 1 : 0) + (showActionsColumn ? 1 : 0)} className="DT_td-cell DT_no-results-cell">
                                        <div className="DT_no-data-container DT_no-results-message">
                                            <FileText size={18} className="DT_no-results-icon"/>
                                            <p className="DT_no-data-text">No results found matching your search or filter criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="DT_table-body">
                                {data.map((row, rowIndex) => {
                                    const isRowSelected = selectedRowId !== null && getRowUniqueId(row) === selectedRowId;
                                    const rowStatus = row.status || row.approved_status;
                                    
                                    return (
                                        <tr key={rowIndex} className={`DT_tr ${onRowClickable ? 'DT_row-clickable' : ''} ${isRowSelected ? 'DT_row-selected' : ''}`} onClick={onRowClickable ? (e) => handleInternalRowClick(row) : undefined}>
                                            {columns.map((colKey) => (
                                                <td key={`${rowIndex}-${colKey}`} className={`DT_td-cell ${getColumnClassName(colKey)} ${pillColumns.map(c => normalizeKey(c)).includes(normalizeKey(colKey)) ? 'DT_td-has-pill' : ''}`}>
                                                    {formatCellData(colKey, row[colKey])}
                                                </td>
                                            ))}
                                            {showApprovalActionsColumn && (
                                                <td className="DT_td-cell DT_td-approval-action-cell DT_column-approval-actions">
                                                    <div className="DT_action-btn-container">
                                                        
                                                        {/* --- APPROVE / REJECT BUTTONS --- */}
                                                        {onStatusChange && (rowStatus !== 'Approved') && (
                                                            <button className="DT_action-btn DT_approve-btn" onClick={(e) => { e.stopPropagation(); onStatusChange(getRowUniqueId(row) || row, 'Approved'); }}>
                                                                <CheckCircle size={16} /> Approve
                                                            </button>
                                                        )}
                                                        {onStatusChange && (rowStatus !== 'Rejected') && (
                                                            <button className="DT_action-btn DT_reject-btn" onClick={(e) => { e.stopPropagation(); onStatusChange(getRowUniqueId(row) || row, 'Rejected'); }}>
                                                                <XOctagon size={16} /> Reject
                                                            </button>
                                                        )}

                                                        {/* --- UPDATED: ON HOLD BUTTON LOGIC --- */}
                                                        {/* Only show if onHold prop exists AND status is NOT Approved AND NOT Rejected */}
                                                        {onHold && (rowStatus !== 'Approved' && rowStatus !== 'Rejected') && (() => {
                                                            const isOnHold = rowStatus === 'OnHolded';
                                                            return (
                                                                <button 
                                                                    className={`DT_action-btn ${isOnHold ? 'DT_release-btn' : 'DT_onhold-btn'}`} 
                                                                    style={{ 
                                                                        backgroundColor: isOnHold ? '#10b981' : '#f59e0b', // Green for Release, Amber for Hold
                                                                        color: 'white',
                                                                        borderColor: 'transparent'
                                                                    }}
                                                                    onClick={(e) => { 
                                                                        e.stopPropagation(); 
                                                                        // If currently OnHolded -> pass 'Released', else 'OnHolded'
                                                                        onHold(getRowUniqueId(row) || row, isOnHold ? 'Released' : 'OnHolded'); 
                                                                    }}
                                                                >
                                                                    {isOnHold ? <PlayCircle size={16} /> : <PauseCircle size={16} />} 
                                                                    {isOnHold ? 'Release' : 'On Hold'}
                                                                </button>
                                                            );
                                                        })()}

                                                    </div>
                                                </td>
                                            )}
                                            {showActionsColumn && (
                                                <td className="DT_td-cell DT_td-action-cell DT_column-actions">
                                                    <div className="DT_action-btn-container">
                                                        {hasSuspendAction && (() => {
                                                            const isSuspended = row.status === 'Suspended';
                                                            return (
                                                                <button className={`DT_action-btn ${isSuspended ? 'DT_unsuspend-btn' : 'DT_suspend-btn'}`} title={isSuspended ? 'Reactivate User' : 'Suspend User'} onClick={(e) => { e.stopPropagation(); onSuspendReactivate(row); }}>
                                                                    {isSuspended ? <UserCheck size={16} /> : <UserX size={16} />} 
                                                                </button>
                                                            );
                                                        })()}
                                                        {onEdit && (
                                                            <button className="DT_action-btn DT_edit-btn" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
                                                                <Edit size={16} />
                                                            </button>
                                                        )}
                                                        {onDelete && (
                                                            <button className="DT_action-btn DT_delete-btn" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(row); }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DynamicTable;