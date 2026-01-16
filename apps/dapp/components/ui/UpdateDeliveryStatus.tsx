import React from "react";

export interface UpdateDeliveryStatusProps {
  transaction?: any;
  mutate?: () => void;
}

export const UpdateDeliveryStatus: React.FC<UpdateDeliveryStatusProps> = () => {
  return (
    <div className="UpdateDeliveryStatus">
      <select className="px-3 py-2 border rounded">
        <option>Pending</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>
    </div>
  );
};
