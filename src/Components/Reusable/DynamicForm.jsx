import React, { useState, useEffect, useCallback } from 'react';
import '../../Styles/Reusable/DynamicForm.css'; 

// ===============================================
// 1. Utility Components
// ===============================================
const Pill = ({ label, color, onRemove }) => (
  <div className={`DFORM_Pill DFORM_Pill--${color || 'default'}`}>
    <span>{label}</span>
    {onRemove && (
      <button className="DFORM_Pill_Remove" onClick={onRemove}>
        &times;
      </button>
    )}
  </div>
);

/**
 * Renders a selectable pill for single/multi-select fields (without 'X' icon).
 */
const SelectableOptionPill = ({ option, isSelected, onClick, color }) => (
    <div
        className={`DFORM_SelectablePill DFORM_SelectablePill--${color || 'default'} ${isSelected ? 'DFORM_SelectablePill--Selected' : ''}`}
        onClick={() => onClick(option.value)}
        role="button"
        tabIndex="0"
    >
        {option.label}
    </div>
);

// ===============================================
// 2. Confirmation Modal Component
// ===============================================

const DFORM_ConfirmationModal = ({ isOpen, mode, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const actionText = mode === 'creation' ? 'create' : 'edit';
  const confirmationMessage = `Are you sure you want to ${actionText} this entry?`;
  const title = mode === 'creation' ? 'Confirm Creation' : 'Confirm Edit';

  return (
    <div className="DFORM_Modal_Overlay">
      <div className="DFORM_Modal_Content DFORM_Confirmation_Box">
        <h4 className="DFORM_Confirmation_Title">{title}</h4>
        <p className="DFORM_Confirmation_Message">{confirmationMessage}</p>
        <div className="DFORM_Confirmation_Actions">
          <button className="DFORM_Btn DFORM_Btn_Secondary" onClick={onCancel}>Cancel</button>
          <button className="DFORM_Btn DFORM_Btn_Primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// 3. Main Dynamic Form Component
// ===============================================

const DynamicForm = ({
  isOpen,
  mode,
  fieldsConfig = [], 
  initialData = {},
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Initialize form data based on mode and initialData
  useEffect(() => {
    let baseData = {};
    
    if (mode === 'edition' && Object.keys(initialData).length > 0) {
      baseData = initialData;
    } 

    const newFormData = {};
    
    fieldsConfig.forEach(field => {
      // Use existing data from baseData if present
      if (baseData[field.name] !== undefined && baseData[field.name] !== null) {
        newFormData[field.name] = baseData[field.name];
      }
      // Otherwise, use a default empty value
      else if (field.type === 'multi-select') {
        newFormData[field.name] = [];
      } else {
        newFormData[field.name] = '';
      }
    });
    
    setFormData(newFormData);

  }, [mode, initialData, fieldsConfig]); 

  // General change handler for text, number, date, time
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle Multi-select pill removal
  const handleRemovePill = useCallback((name, valueToRemove) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].filter(val => val !== valueToRemove),
    }));
  }, []);

  // Handle Single-select pill click (sets a single value)
  const handleSingleSelectClick = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);

  // Handle Multi-select pill click (toggles the value in the array)
  const handleMultiSelectClick = useCallback((name, value) => {
    setFormData(prev => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  }, []);


  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Basic Validation Check (Required Fields)
    const requiredFields = fieldsConfig.filter(f => f.required);
    let isValid = true;
    for (const field of requiredFields) {
        if (!formData[field.name] || (Array.isArray(formData[field.name]) && formData[field.name].length === 0)) {
            console.error(`Field ${field.label} is required.`);
            // A real app would set a visual error state here.
            isValid = false;
            break;
        }
    }

    if (isValid) {
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirmAction = () => {
    setIsConfirmationOpen(false);
    onSubmit(formData, mode); // Final submit action
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'creation' ? 'Create New Entry' : 'Edit Entry';

  return (
    <div className="DFORM_Modal_Overlay">
      <div className="DFORM_Modal_Content">
        <div className="DFORM_Modal_Header">
          <h3 className="DFORM_Modal_Title">{modalTitle}</h3>
          <button className="DFORM_Modal_Close" onClick={onClose}>&times;</button>
        </div>
        <form className="DFORM_Form" onSubmit={handleFormSubmit}>
          {fieldsConfig.map((field, index) => {
            // Logic for two columns: default to two columns, unless 'fullWidth' is true.
            const columnClass = field.fullWidth ? 'DFORM_Column_1' : 'DFORM_Column_2';

            const fieldProps = {
                id: field.name,
                name: field.name,
                value: formData[field.name] || '',
                onChange: (e) => handleChange(field.name, e.target.value),
                disabled: field.fixed || (mode === 'edition' && field.fixed),
            };

            const commonField = (
                <>
                    {field.descriptionText && <p className="DFORM_Field_Description">{field.descriptionText}</p>}
                    {field.hintText && <small className="DFORM_Field_Hint">{field.hintText}</small>}
                </>
            );

            let inputElement;

            switch (field.type) {
              case 'text-enter':
                inputElement = (
                    <input
                        type="text"
                        className="DFORM_Input_Text"
                        maxLength={field.numberLimit}
                        {...fieldProps}
                        onChange={field.autogeneratedMethod ? (e) => {
                          // Allow for custom autogenerated method if provided
                          handleChange(field.name, field.autogeneratedMethod(e.target.value));
                        } : fieldProps.onChange}
                        required={field.required}
                        // placeholder is handled by global CSS but can be added here
                    />
                );
                break;

              case 'number-limit':
                inputElement = (
                  <input
                    type="number"
                    className="DFORM_Input_Number"
                    max={field.numberLimit}
                    {...fieldProps}
                    required={field.required}
                  />
                );
                break;

              case 'single-select':
                const selectedValue = formData[field.name];
                inputElement = (
                    <div className="DFORM_Custom_Select_Container">
                        {field.options.map(option => (
                            <SelectableOptionPill
                                key={option.value}
                                option={option}
                                isSelected={selectedValue === option.value}
                                onClick={() => handleSingleSelectClick(field.name, option.value)}
                                color={field.pillsColor || 'pink'} // Use 'pink' as default brand color
                            />
                        ))}
                        {/* Hidden input to hold the value for submission/validation */}
                        <input type="hidden" name={field.name} value={selectedValue || ''} required={field.required} />
                    </div>
                );
                break;

              case 'multi-select':
                const selectedOptions = formData[field.name] || [];
                inputElement = (
                  <>
                    <div className="DFORM_Pills_Display_Container">
                      {/* Display currently selected options as removable pills */}
                      {selectedOptions.map(value => {
                        const option = field.options.find(opt => opt.value === value);
                        return (
                          <Pill
                            key={value}
                            label={option ? option.label : value}
                            color={field.pillsColor || 'pink'} // Use 'pink' as default brand color
                            onRemove={() => handleRemovePill(field.name, value)}
                          />
                        );
                      })}
                    </div>

                    <div className="DFORM_Custom_Select_Container DFORM_Multi_Options">
                        {/* Display all options as clickable pills to toggle selection */}
                        {field.options.map(option => (
                            <SelectableOptionPill
                                key={`opt-${option.value}`}
                                option={option}
                                isSelected={selectedOptions.includes(option.value)}
                                onClick={() => handleMultiSelectClick(field.name, option.value)}
                                color={field.pillsColor || 'pink'} // Use 'pink' as default brand color
                            />
                        ))}
                    </div>
                    {/* Visual warning for required multi-select */}
                    {field.required && selectedOptions.length === 0 && (
                        <small className="DFORM_Field_Error">Selection required.</small>
                    )}
                  </>
                );
                break;

              case 'display-box':
                inputElement = (
                    <div className="DFORM_DisplayBox">
                        <span className="DFORM_DisplayBox_Icon">{field.icon}</span>
                        <span className="DFORM_DisplayBox_Text">{field.displayText}</span>
                    </div>
                );
                break;

              case 'file-upload':
                inputElement = (
                    <>
                        {formData[field.name] && (
                            <div className="DFORM_CurrentFile">
                                <span>{formData[field.name]}</span>
                                {field.downloadVisibility && (
                                    <a href={formData[field.name]} target="_blank" rel="noopener noreferrer" className="DFORM_Download_Btn">Download</a>
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            className="DFORM_Input_File"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // fileUploadLimit is in bytes. index.css doesn't define size limits.
                                  if (field.fileUploadLimit && file.size > field.fileUploadLimit) {
                                    alert(`File size exceeds limit of ${field.fileUploadLimit / 1024 / 1024} MB.`);
                                    e.target.value = '';
                                  } else {
                                    handleChange(field.name, file.name); // Store file name/path
                                  }
                                }
                            }}
                            required={field.required && !formData[field.name]}
                        />
                        {field.fileUploadLimit && <small className="DFORM_Field_Hint">Max size: {field.fileUploadLimit / 1024 / 1024} MB</small>}
                    </>
                );
                break;

              case 'date-start':
              case 'date-end':
                inputElement = (
                    <input
                        type="date"
                        className="DFORM_Input_Date"
                        {...fieldProps}
                        required={field.required}
                    />
                );
                break;

              case 'time-start':
              case 'time-end':
                inputElement = (
                    <input
                        type="time"
                        className="DFORM_Input_Time"
                        {...fieldProps}
                        required={field.required}
                    />
                );
                break;

              case 'week-day':
                const weekdays = [
                  { label: 'Monday', value: 'mon' }, { label: 'Tuesday', value: 'tue' },
                  { label: 'Wednesday', value: 'wed' }, { label: 'Thursday', value: 'thu' },
                  { label: 'Friday', value: 'fri' }, { label: 'Saturday', value: 'sat' },
                  { label: 'Sunday', value: 'sun' },
                ];
                // Using selectable pills for weekday selection
                inputElement = (
                    <div className="DFORM_Custom_Select_Container">
                        {weekdays.map(day => (
                            <SelectableOptionPill
                                key={day.value}
                                option={day}
                                isSelected={formData[field.name] === day.value}
                                onClick={() => handleSingleSelectClick(field.name, day.value)}
                                color="default"
                            />
                        ))}
                         <input type="hidden" name={field.name} value={formData[field.name] || ''} required={field.required} />
                    </div>
                );
                break;

              default:
                inputElement = <p>Unknown Field Type</p>;
            }

            return (
              <div key={field.name} className={`DFORM_Form_Field ${columnClass}`}>
                <label className="DFORM_Label" htmlFor={field.name}>
                    {field.label} {field.required && <span className="DFORM_Required_Asterisk">*</span>}
                </label>
                {inputElement}
                {commonField}
              </div>
            );
          })}

          <div className="DFORM_Form_Actions DFORM_Column_1">
            <button type="submit" className="DFORM_Btn DFORM_Btn_Primary">
              {mode === 'creation' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        <DFORM_ConfirmationModal
          isOpen={isConfirmationOpen}
          mode={mode}
          onCancel={() => setIsConfirmationOpen(false)}
          onConfirm={handleConfirmAction}
        />
      </div>
    </div>
  );
};

export default DynamicForm;