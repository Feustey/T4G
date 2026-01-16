import React from "react";

export interface DeleteUserProps {
  lang?: any;
}

export const DeleteUser: React.FC<DeleteUserProps> = () => {
  return (
    <div className="DeleteUser">
      <button className="text-red-500">Delete User</button>
    </div>
  );
};
