import React from 'react';

const ProfessionalCard = ({ 
  title, 
  subtitle, 
  children, 
  className = "", 
  headerColor = "from-blue-600 to-indigo-600",
  showHeader = true,
  padding = "p-6"
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {showHeader && (
        <div className={`bg-gradient-to-r ${headerColor} px-6 py-4`}>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-white text-opacity-80 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
};

export default ProfessionalCard; 