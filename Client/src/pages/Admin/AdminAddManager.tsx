import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useLoader } from "../../context/LoaderContext";

interface FormErrors {
  fullName?: string;
  phonenumber?: string;
  employeeId?: string;
  place?: string;
  designation?: string;
}

// Common zones/departments in the system
const AVAILABLE_ZONES = [
  "North Zone",
  "South Zone",
  "East Zone",
  "West Zone",
  "Central Zone",
];

const DESIGNATIONS = [
  "Department Manager",
  "Assistant Manager",
  "Senior Manager",
  "Coordinator",
];

const AdminAddManager = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [fullName, setFullName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [place, setPlace] = useState("");
  const [designation, setDesignation] = useState("Department Manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation rules based on project requirements
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate Full Name
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = "Full name must be less than 100 characters";
    }

    // Validate Phone Number (10 digits for Indian phone)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phonenumber.trim()) {
      newErrors.phonenumber = "Phone number is required";
    } else if (!phoneRegex.test(phonenumber.replace(/\s+/g, ""))) {
      newErrors.phonenumber = "Enter a valid 10-digit phone number starting with 6-9";
    }

    // Validate Employee ID
    if (!employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    } else if (!/^[A-Z0-9]{3,20}$/.test(employeeId.trim().toUpperCase())) {
      newErrors.employeeId = "Employee ID must be 3-20 alphanumeric characters";
    }

    // Validate Zone
    if (!place.trim()) {
      newErrors.place = "Zone is required";
    }

    // Validate Designation
    if (!designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and spaces
    const value = e.target.value.replace(/[^\d\s]/g, "");
    setPhonenumber(value);
    if (errors.phonenumber) {
      setErrors({ ...errors, phonenumber: undefined });
    }
  };

  const handleEmployeeIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow only alphanumeric characters
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
    setEmployeeId(value.toUpperCase());
    if (errors.employeeId) {
      setErrors({ ...errors, employeeId: undefined });
    }
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors({ ...errors, fullName: undefined });
    }
  };

  const handlePlaceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPlace(e.target.value);
    if (errors.place) {
      setErrors({ ...errors, place: undefined });
    }
  };

  const handleDesignationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDesignation(e.target.value);
    if (errors.designation) {
      setErrors({ ...errors, designation: undefined });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    showLoader();

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
            fullName: fullName.trim(),
            phonenumber: phonenumber.replace(/\s+/g, ""),
            employeeId: employeeId.trim().toUpperCase(),
            place: place.trim(),
            designation: designation.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from server
        if (data.message?.includes("already exists")) {
          toast.error("Phone number or Employee ID already exists in the system");
        } else {
          throw new Error(data.message || "Unable to add manager");
        }
        return;
      }

      toast.success("Manager added successfully!");
      navigate("/admin/managers");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to add manager";
      toast.error(errorMessage);
      console.error("Error adding manager:", error);
    } finally {
      setIsSubmitting(false);
      hideLoader();
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
            Create a new department/zone manager profile
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
        {/* Full Name Field */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </span>
            <Input
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="Enter manager's full name"
              className={`bg-white ${errors.fullName ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.fullName}
              </div>
            )}
          </label>

          {/* Phone Number Field */}
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </span>
            <Input
              value={phonenumber}
              onChange={handlePhoneChange}
              placeholder="10-digit mobile number (e.g., 9876543210)"
              maxLength={10}
              className={`bg-white ${errors.phonenumber ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.phonenumber && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.phonenumber}
              </div>
            )}
            <p className="text-xs text-slate-500">Must start with 6-9 and be 10 digits</p>
          </label>

          {/* Employee ID Field */}
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Employee ID <span className="text-red-500">*</span>
            </span>
            <Input
              value={employeeId}
              onChange={handleEmployeeIdChange}
              placeholder="e.g., DEPT006 or MGR001"
              className={`bg-white ${errors.employeeId ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.employeeId && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.employeeId}
              </div>
            )}
            <p className="text-xs text-slate-500">3-20 alphanumeric characters (auto-uppercase)</p>
          </label>

          {/* Zone/Place Dropdown */}
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Zone <span className="text-red-500">*</span>
            </span>
            <select
              value={place}
              onChange={handlePlaceChange}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.place ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a zone</option>
              {AVAILABLE_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            {errors.place && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.place}
              </div>
            )}
          </label>

          {/* Designation Dropdown */}
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Designation <span className="text-red-500">*</span>
            </span>
            <select
              value={designation}
              onChange={handleDesignationChange}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.designation ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            >
              {DESIGNATIONS.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
            {errors.designation && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.designation}
              </div>
            )}
          </label>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/managers")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
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
            {isSubmitting ? "Adding Manager..." : "Add Manager"}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> A login account will be automatically created for the new manager
          with their phone number. They can update their profile and change password after first login.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AdminAddManager;
