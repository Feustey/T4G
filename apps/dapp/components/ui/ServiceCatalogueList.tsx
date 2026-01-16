import React from "react";

export interface ServiceCatalogueListProps {
  services?: any[];
}

export const ServiceCatalogueList: React.FC<ServiceCatalogueListProps> = ({ services = [] }) => {
  return (
    <div className="ServiceCatalogueList">
      <h3 className="text-lg font-semibold mb-2">Service Catalogue</h3>
      {services.length === 0 ? (
        <p className="text-gray-500">No services in catalogue</p>
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
