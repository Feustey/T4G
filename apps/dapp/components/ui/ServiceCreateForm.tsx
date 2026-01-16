import React from "react";

export interface ServiceCreateFormProps {
  onSubmit?: (data: any) => void;
}

export const ServiceCreateForm: React.FC<ServiceCreateFormProps> = () => {
  return (
    <div className="ServiceCreateForm p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Create Service</h3>
      <form>
        <input 
          type="text" 
          placeholder="Service name" 
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
};
