// import React, { useState, useRef } from 'react';
// import '../../Styles/Reusable/CardSlider.css'; 
// import { 
//   FaUniversity, 
//   FaBoxes, 
//   FaBook, 
//   FaLayerGroup, 
//   FaChalkboardTeacher, 
//   FaBookOpen, 
//   FaBox, 
//   FaFileAlt,
//   FaCogs,
//   FaUserFriends
// } from "react-icons/fa";

// const CardSlider = ({ title, institutes, onSelectInstitute ,icon_title,fromTabOf,searchBar}) => {
//   const [selectedId, setSelectedId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState(''); 
//   const sliderRef = useRef(null);

//   const instituteArray = Array.from(institutes, ([id, value]) => ({ id, name: value }));

//   const filteredInstitutes = instituteArray.filter(institute =>
//     institute.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleCardClick = (id) => {
//     const newSelectedId = selectedId === id ? null : id;
//     setSelectedId(newSelectedId);
//     onSelectInstitute(newSelectedId);
//   };

//   const handleSlide = (direction) => {
//     if (sliderRef.current) {
//       const scrollAmount = sliderRef.current.offsetWidth * 0.75; 
//       sliderRef.current.scrollBy({
//         left: direction * scrollAmount,
//         behavior: 'smooth',
//       });
//     }
//   };

//   const handleAddClick = () => {
//     console.log("Add New Institute action triggered.");
//   };

//   const iconMap = {
//     institutions: <FaUniversity />,
//     batches: <FaBoxes />,
//     Programme: <FaBox />,
//     courses: <FaBook />,
//     levels: <FaLayerGroup />,
//     classes: <FaChalkboardTeacher />,
//     subjects: <FaBookOpen />,
//     materials: <FaFileAlt/>,
//     actions: <FaCogs/>,
//     roles: <FaUserFriends />,
    

//   };

//   // Get lowercase version of title for matching
//   const selectedIcon = iconMap[title?.toLowerCase()] || null;

//   return (
//     <div className="IN_card-slider-container-wrapper"> 
      
//       {/* Search, Add, Title Section */}
//       <div className="IN_search-and-action-container">
//         {title && <h2 className="IN_slider-title">{title}</h2>}

//         {!searchBar && <div className="IN_search-bar-container">
//           <svg className="IN_search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.388 4.388c.18.18.44.27.707.27s.527-.09.707-.27a1 1 0 0 0 0-1.414l-4.388-4.388A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"/>
//           </svg>
//           <input
//             type="text"
//             className="IN_search-input"
//             placeholder={`Search for a ${title?.toLowerCase()}...`}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             aria-label={`Search ${title}`}
//           />
//         </div>}
//         {fromTabOf===title && (
//                 <button 
//                 className="IN_add-button"
//                 onClick={handleAddClick}
//                 aria-label={`Add New ${title}`}
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
//                     <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/>
//                 </svg>
//                 Add New {icon_title.slice(0, -1)}
//                 </button>
//         )}
//       </div>

//       <p className="IN_description-text">** Select one card from below to proceed **</p>
      
//       <div className="IN_card-slider-container">
//         <div className="IN_slider-controls">
//           <button 
//             className="IN_slider-button IN_prev" 
//             onClick={() => handleSlide(-1)} 
//             aria-label="Previous Card"
//           >
//             &lt;
//           </button>
//         </div>
        
//         <div className="IN_cards-wrapper" ref={sliderRef}>
//           {filteredInstitutes.length > 0 ? (
//             filteredInstitutes.map(({ id, name }) => (
//               <div
//                 key={id}
//                 className={`IN_institute-card ${selectedId === id ? 'IN_selected' : ''}`}
//                 onClick={() => handleCardClick(id)}
//                 role="button"
//                 tabIndex="0"
//                 aria-pressed={selectedId === id}
//               >
//                 <div className='IN_card-flexy'>
//                   <div className="IN_card-icon">
//                     {selectedIcon}
//                   </div>
                
//                 <span className="IN_institute-name">{name}</span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="IN_no-institutes">
//               No matching {title?.toLowerCase()}s found for **"{searchTerm}"**.
//             </div>
//           )}
//         </div>

//         <div className="IN_slider-controls">
//           <button 
//             className="IN_slider-button IN_next" 
//             onClick={() => handleSlide(1)} 
//             aria-label="Next Card"
//           >
//             &gt;
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CardSlider;


import React, { useState, useRef } from 'react';
import '../../Styles/Reusable/CardSlider.css'; 
import { 
  FaUniversity, 
  FaBoxes, 
  FaBook, 
  FaLayerGroup, 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaBox, 
  FaFileAlt,
  FaCogs,
  FaUserFriends
} from "react-icons/fa";

// --- Helper Component: Individual Card ---
// Handles image loading state independently. 
// If image fails or is missing, it falls back to the defaultIcon.
const CardItem = ({ id, name, image, isSelected, onClick, defaultIcon, showImage }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`IN_institute-card ${isSelected ? 'IN_selected' : ''}`}
      onClick={() => onClick(id)}
      role="button"
      tabIndex="0"
      aria-pressed={isSelected}
    >
      <div className='IN_card-flexy'>
        <div className="IN_card-icon">
          {/* LOGIC: Display Image ONLY if:
             1. showImage is true (we are in 'Institutions' mode)
             2. An image URL exists
             3. The image hasn't failed to load
          */}
          {showImage && image && !imgError ? (
            <img 
              src={image} 
              alt={name} 
              className="IN_card-img-display"
              style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover', 
                  borderRadius: '50%' 
              }}
              onError={() => setImgError(true)} // Revert to icon on error
            />
          ) : (
            defaultIcon 
          )}
        </div>
        <span className="IN_institute-name">{name}</span>
      </div>
    </div>
  );
};

const CardSlider = ({ title, institutes, onSelectInstitute, icon_title, fromTabOf, searchBar }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const sliderRef = useRef(null);

  // --- 1. Modified Data Parsing ---
  // Transforms the Map input into an array of objects.
  // Handles both legacy (Map<id, name>) and new (Map<id, {name, image}>) formats.
  const instituteArray = Array.from(institutes, ([id, value]) => {
    if (typeof value === 'object' && value !== null) {
      return { id, name: value.name, image: value.image };
    }
    return { id, name: value, image: null };
  });

  const filteredInstitutes = instituteArray.filter(institute =>
    (institute.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (id) => {
    const newSelectedId = selectedId === id ? null : id;
    setSelectedId(newSelectedId);
    onSelectInstitute(newSelectedId);
  };

  const handleSlide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.75; 
      sliderRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddClick = () => {
    console.log("Add New Institute action triggered.");
  };

  const iconMap = {
    institutions: <FaUniversity />,
    batches: <FaBoxes />,
    programme: <FaBox />,
    courses: <FaBook />,
    levels: <FaLayerGroup />,
    classes: <FaChalkboardTeacher />,
    subjects: <FaBookOpen />,
    materials: <FaFileAlt/>,
    actions: <FaCogs/>,
    roles: <FaUserFriends />,
  };

  const lowerTitle = title?.toLowerCase();
  const selectedIcon = iconMap[lowerTitle] || <FaUniversity />;

  // Only attempt to show images if the slider title is 'institutions'
  const shouldShowImage = lowerTitle === 'institutions';

  return (
    <div className="IN_card-slider-container-wrapper"> 
      
      {/* Search, Add, Title Section */}
      <div className="IN_search-and-action-container">
        {title && <h2 className="IN_slider-title">{title}</h2>}

        {!searchBar && (
          <div className="IN_search-bar-container">
            <svg className="IN_search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.388 4.388c.18.18.44.27.707.27s.527-.09.707-.27a1 1 0 0 0 0-1.414l-4.388-4.388A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"/>
            </svg>
            <input
              type="text"
              className="IN_search-input"
              placeholder={`Search for a ${lowerTitle}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={`Search ${title}`}
            />
          </div>
        )}
        
        {fromTabOf === title && (
            <button 
            className="IN_add-button"
            onClick={handleAddClick}
            aria-label={`Add New ${title}`}
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/>
            </svg>
            Add New {icon_title?.slice(0, -1)}
            </button>
        )}
      </div>

      <p className="IN_description-text">** Select one card from below to proceed **</p>
      
      <div className="IN_card-slider-container">
        <div className="IN_slider-controls">
          <button 
            className="IN_slider-button IN_prev" 
            onClick={() => handleSlide(-1)} 
            aria-label="Previous Card"
          >
            &lt;
          </button>
        </div>
        
        <div className="IN_cards-wrapper" ref={sliderRef}>
          {filteredInstitutes.length > 0 ? (
            filteredInstitutes.map((inst) => (
              <CardItem 
                key={inst.id}
                id={inst.id}
                name={inst.name}
                image={inst.image}
                isSelected={selectedId === inst.id}
                onClick={handleCardClick}
                defaultIcon={selectedIcon}
                showImage={shouldShowImage}
              />
            ))
          ) : (
            <div className="IN_no-institutes">
              No matching {lowerTitle}s found for **"{searchTerm}"**.
            </div>
          )}
        </div>

        <div className="IN_slider-controls">
          <button 
            className="IN_slider-button IN_next" 
            onClick={() => handleSlide(1)} 
            aria-label="Next Card"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSlider;