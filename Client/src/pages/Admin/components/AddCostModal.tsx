import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { X, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";

interface AddCostModalProps {
  isOpen: boolean;
  issueId: string;
  issueTitle: string;
  onClose: () => void;
  onSuccess: (costAmount: number) => void;
}

const AddCostModal = ({
  isOpen,
  issueId,
  issueTitle,
  onClose,
  onSuccess,
}: AddCostModalProps) => {
  const [costAmount, setCostAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!costAmount.trim()) {
      newErrors.costAmount = "Cost amount is required";
    } else if (isNaN(Number(costAmount))) {
      newErrors.costAmount = "Please enter a valid number";
    } else if (Number(costAmount) < 0) {
      newErrors.costAmount = "Cost cannot be negative";
    } else if (Number(costAmount) === 0) {
      newErrors.costAmount = "Cost must be greater than 0";
    }

    if (costAmount && Number(costAmount) > 10000000) {
      newErrors.costAmount = "Cost exceeds maximum limit (₹1 Cr)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/issue/${issueId}/cost`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            costAmount: Number(costAmount),
            status: "Resolved",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update issue cost");
      }

      toast.success("Issue resolved with cost recorded!");
      onSuccess(Number(costAmount));
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update issue");
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCostAmount("");
    setDescription("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-black/50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Record Resolution Cost</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Issue Title Display */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Issue</p>
            <p className="mt-1 line-clamp-2 text-slate-800">{issueTitle}</p>
          </div>

          {/* Cost Amount Input */}
          <label className="mb-5 block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Cost Amount <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-medium">
                ₹
              </span>
              <Input
                type="number"
                value={costAmount}
                onChange={(e) => {
                  setCostAmount(e.target.value);
                  if (errors.costAmount) {
                    setErrors({ ...errors, costAmount: "" });
                  }
                }}
                placeholder="Enter cost amount"
                min="0"
                step="0.01"
                className={`pl-8 bg-white ${errors.costAmount ? "border-red-500" : ""}`}
                disabled={submitting}
              />
            </div>
            {errors.costAmount && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.costAmount}
              </div>
            )}
            <p className="text-xs text-slate-500">Enter the total amount spent on resolving this issue</p>
          </label>

          {/* Description (Optional) */}
          <label className="mb-6 block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Labor cost, materials, equipment rental..."
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={submitting}
            />
          </label>

          {/* Info Box */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This cost will be recorded and included in the analytics dashboard. The issue will be marked as "Resolved".
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Record & Resolve
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default AddCostModal;
