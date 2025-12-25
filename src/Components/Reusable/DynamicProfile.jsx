import '../../Styles/Reusable/DynamicProfile.css';
import React, { useState, useEffect } from 'react';

// Import necessary React Icons
import { FaCrown, FaCog, FaChalkboardTeacher, FaBook, FaUser, FaEnvelope, FaPhoneAlt, FaHistory, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoAlertCircleOutline, IoReloadCircleSharp } from 'react-icons/io5';

// --- Mock Data Fetching Function (Simulates API call based on Role) ---
const fetchProfileData = async (userRole) => {
  const allProfiles = {
    'Super Admin': { 
      username: 'superb_bob', fullname: 'Bob Superuser', email: 'bob@school.edu', 
      password: 'Welcome@123', phone: '+1 (555) 901-0001', 
      last_login: '2025-11-15 17:45 IST', role: 'SuperAdmin', 
      photo_url: 'https://picsum.photos/200'
    },
    'Admin': { 
      username: 'alice_a', fullname: 'Alice Admin', email: 'alice@school.edu', 
      password: 'Welcome@123', phone: '+1 (555) 902-0002', 
      last_login: '2025-11-14 10:30 IST', role: 'Admin', 
      photo_url: 'https://picsum.photos/200'
    },
    'Teacher': { 
      username: 'charlie_t', fullname: 'Charlie Teacher', email: 'charlie@school.edu', 
      password: 'Welcome@123', phone: '+1 (555) 903-0003', 
      last_login: '2025-11-15 08:15 IST', role: 'Teacher', 
      photo_url: 'https://picsum.photos/200'
    },
    'Student': { 
      username: 'dana_s', fullname: 'Dana Student', email: 'dana@school.edu', 
      password: 'Welcome@123', phone: '+1 (555) 904-0004', 
      last_login: '2025-11-15 15:00 IST', role: 'Student', 
      photo_url: 'https://picsum.photos/200'
    },
  };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return allProfiles[userRole] || null;
};

const DynamicProfile = ({ userRole = 'SuperAdmin' }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!userRole || typeof userRole !== 'string') {
        setError('Invalid or missing userRole prop.');
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    fetchProfileData(userRole)
      .then(data => {
        if (data) {
          setProfile(data);
        } else {
          setError(`Profile data not found for role: ${userRole}`);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userRole]); 

  const ICON_SIZE_ROLE_BADGE = 14; // Matches small text size for role badge
  const ICON_SIZE_CARD_TITLE = 18; // Matches card title font size
  const ICON_SIZE_INFO_ROW = 24;   // Fits well in 40px icon box (DYPR_info-icon)
  const ICON_SIZE_ROLE_EMOJI = 26; // Fits well in 40px badge (DYPR_role-icon-badge)
  const ICON_SIZE_LOADING_ERROR = 40; // Matches spinner/error icon size

  if (isLoading) {
    return (
      <div className="DYPR_loading-container">
        {/* Replaced DYPR_spinner div with an icon that can be styled */}
        <IoReloadCircleSharp className="DYPR_spinner" size={ICON_SIZE_LOADING_ERROR} />
        <p className="DYPR_loading-text">Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="DYPR_error-container">
        {/* Replaced ⚠️ with an icon */}
        <IoAlertCircleOutline className="DYPR_error-icon" size={ICON_SIZE_LOADING_ERROR} />
        <p className="DYPR_error-text">Error: {error}</p>
      </div>
    );
  }
  
  if (!profile) {
    return <div className="DYPR_not-found">No profile data available.</div>;
  }
  
  const { username, fullname, role, email, password, phone, last_login, photo_url } = profile;

  const getRoleIcon = (currentRole, size = ICON_SIZE_ROLE_EMOJI) => {
    const icons = {
      'SuperAdmin': <FaCrown size={size} />,
      'Admin': <FaCog size={size} />,
      'Teacher': <FaChalkboardTeacher size={size} />,
      'Student': <FaBook size={size} />,
    };
    return icons[currentRole] || <FaUser size={size} />;
  };

  const roleClass = `DYPR_role-${role.toLowerCase().replace(' ', '')}`;

  return (
    <div className="DYPR_page-container">
      <div className="DYPR_profile-container">
        {/* Hero Header */}
        <div className={`DYPR_hero-header ${roleClass}`}>
          <div className="DYPR_hero-content">
            <div className="DYPR_avatar-wrapper">
              <img src={photo_url} alt={`${fullname}'s Photo`} className="DYPR_avatar" />
              <div className={`DYPR_role-icon-badge ${roleClass}`}>
                <span className="DYPR_role-emoji">{getRoleIcon(role, ICON_SIZE_ROLE_EMOJI)}</span>
              </div>
            </div>
            <div className="DYPR_hero-text">
              <h1 className="DYPR_hero-name">{fullname}</h1>
              <p className="DYPR_hero-username">@{username}</p>
              <span className={`DYPR_role-badge ${roleClass}`}>
                {getRoleIcon(role, ICON_SIZE_ROLE_BADGE)} {role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="DYPR_content-wrapper">
          {/* Contact Information Card */}
          <div className="DYPR_card">
            <div className="DYPR_card-header">
              {/* Replaced 📇 with an icon */}
              <h2 className="DYPR_card-title">
                <FaHistory size={ICON_SIZE_CARD_TITLE} style={{ marginRight: '8px' }}/> Contact Information
              </h2>
            </div>
            <div className="DYPR_card-body">
              <div className="DYPR_info-row">
                {/* Replaced 📧 with an icon */}
                <div className="DYPR_info-icon"><FaEnvelope size={ICON_SIZE_INFO_ROW} /></div>
                <div className="DYPR_info-content">
                  <span className="DYPR_info-label">Email Address</span>
                  <span className="DYPR_info-value">{email}</span>
                </div>
              </div>
              
              <div className="DYPR_info-row">
                {/* Replaced 📞 with an icon */}
                <div className="DYPR_info-icon"><FaPhoneAlt size={ICON_SIZE_INFO_ROW} /></div>
                <div className="DYPR_info-content">
                  <span className="DYPR_info-label">Phone Number</span>
                  <span className="DYPR_info-value">{phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Activity Card */}
          <div className="DYPR_card">
            <div className="DYPR_card-header">
              {/* Replaced 🕐 with an icon */}
              <h2 className="DYPR_card-title">
                <FaHistory size={ICON_SIZE_CARD_TITLE} style={{ marginRight: '8px' }}/> Account Activity
              </h2>
            </div>
            <div className="DYPR_card-body">
              <div className="DYPR_activity-item">
                <div className="DYPR_activity-dot"></div>
                <div className="DYPR_activity-content">
                  <span className="DYPR_activity-label">Last Login</span>
                  <span className="DYPR_activity-value">{last_login}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="DYPR_card DYPR_card-full">
            
            <div className="DYPR_card-body">
              <div className="DYPR_password-container">
                <div className="DYPR_password-label">
                  {/* Replaced 🔒 with an icon */}
                  <span className="DYPR_lock-icon"><FaLock size={20} /></span>
                  <span>Password</span>
                </div>
                <div className="DYPR_password-input-group">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    readOnly
                    className="DYPR_password-input"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="DYPR_password-toggle btn btn-outline btn-sm"
                  >
                    {/* Replaced 🙈 Hide : 👁️ Show with icons */}
                    {showPassword 
                      ? <><FaEyeSlash size={14} style={{ marginRight: '4px' }}/> Hide</> 
                      : <><FaEye size={14} style={{ marginRight: '4px' }}/> Show</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicProfile;