import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const AdminAddManager = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [place, setPlace] = useState("");
  const [designation, setDesignation] = useState("Department Manager");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/managers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            fullName,
            phonenumber,
            employeeId,
            place,
            designation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add manager");
      }

      toast.success("Manager added successfully");
      navigate("/admin/managers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-full"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Add Manager</h1>
          <p className="mt-1 text-slate-500">
            Create a corporation zone manager login profile
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/managers")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border border-green-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <Input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter manager name"
              className="bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Phone Number</span>
            <Input
              required
              value={phonenumber}
              onChange={(event) => setPhonenumber(event.target.value)}
              placeholder="Enter phone number"
              className="bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Employee ID</span>
            <Input
              required
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              placeholder="Example: DEPT006"
              className="bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Zone</span>
            <Input
              required
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="Example: North Zone"
              className="bg-white"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Designation</span>
            <Input
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              placeholder="Department Manager"
              className="bg-white"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add Manager
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminAddManager;
