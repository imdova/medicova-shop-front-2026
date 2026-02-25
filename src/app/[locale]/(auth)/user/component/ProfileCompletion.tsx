import React from "react";

interface ProfileCompletionProps {
  percentage: number;
  isArabic: boolean;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  percentage,
  isArabic,
}) => {
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {isArabic ? "اكتمال الملف الشخصي" : "Profile Completion"}
        </span>
        <span className="rounded-full bg-green-600 px-1 text-xs font-semibold text-white">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-green-600"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
