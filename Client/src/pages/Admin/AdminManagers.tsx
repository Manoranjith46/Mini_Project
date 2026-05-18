const AdminManagers = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Department Managers</h1>
        <p className="text-slate-500 mt-1">Manage and assign roles to department heads</p>
      </div>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-700">Managers Directory</h2>
          <p className="text-slate-500 mt-2">Manager list and management tools will go here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminManagers;
