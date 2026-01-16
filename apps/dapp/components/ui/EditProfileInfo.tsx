import React from "react";

export interface EditProfileInfoProps {
  user?: any;
  lang?: any;
}

export const EditProfileInfo: React.FC<EditProfileInfoProps> = () => {
  return (
    <div className="EditProfileInfo">
      <p>Edit Profile (placeholder component)</p>
    </div>
  );
};
