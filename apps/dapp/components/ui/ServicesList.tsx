import React from "react";

export interface ServicesListProps {
  services?: any[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services = [] }) => {
  return (
    <div className="ServicesList">
      <h3 className="text-lg font-semibold mb-2">Services</h3>
      {services.length === 0 ? (
        <p className="text-gray-500">No services</p>
      ) : (
        <ul>
          {services.map((service, i) => (
            <li key={i} className="border-b py-2">
              {service.name || `Service #${i + 1}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
