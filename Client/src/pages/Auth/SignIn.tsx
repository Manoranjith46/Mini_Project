import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";

const SignIn = () => {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [phonenumber, setPhonenumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  // Auto-detect credential type
  useEffect(() => {
    const cleaned = phonenumber.trim().toUpperCase();
    if (!cleaned) {
      setDetectedRole(null);
      return;
    }

    // Phone number detection (starts with digit)
    if (/^\d/.test(cleaned)) {
      setDetectedRole("citizen");
    } 
    // ID detection (starts with prefix letters)
    else if (cleaned.startsWith("A")) {
      setDetectedRole("admin");
    } 
    else if (cleaned.startsWith("M")) {
      setDetectedRole("department");
    } 
    else {
      setDetectedRole(null);
    }
  }, [phonenumber]);

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (/^\d+$/.test(value.replace(/\s/g, ""))) {
      value = value.replace(/\D/g, "");
      if (value.length <= 10) {
        setPhonenumber(value);
      }
    } else {
      setPhonenumber(value.toUpperCase());
    }
    setError("");
  };

  const credentialType = /^\d+$/.test(phonenumber) ? "phone" : "empId";

  const isValidCredential = () => {
    if (!phonenumber) return false;
    if (credentialType === "phone") return phonenumber.length === 10;
    return phonenumber.length >= 4 && detectedRole !== null;
  };

  const getRoleTheme = () => {
    if (!detectedRole) return "default";
    switch (detectedRole) {
      case "citizen": return "citizen";
      case "department": return "department";
      case "admin": return "admin";
      default: return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "citizen": return "Citizen";
      case "department": return "Department Manager";
      case "admin": return "Super Admin";
      default: return "User";
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await sendOtp(phonenumber);

      if (result.success) {
        setDetectedRole(result.role || detectedRole);
        setStep("otp");
        toast.success("OTP Sent!", {
          description: `Verification code sent to ${credentialType === "phone" ? `+91 ${phonenumber}` : phonenumber}`,
        });
      } else {
        setError(result.message || "Failed to send OTP");
        toast.error("Failed!", { description: result.message });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const otpString = otp.join("");
      const success = await verifyOtp(phonenumber, otpString);

      if (success) {
        toast.success("Login Successful!", {
          description: `Welcome back, ${getRoleLabel(detectedRole || "citizen")}!`,
        });

        const role = detectedRole || "citizen";
        if (role === "citizen") {
          navigate("/citizen", { replace: true });
        } else if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "department") {
          navigate("/department", { replace: true });
        }
      } else {
        setError("Invalid OTP. Please try again.");
        toast.error("Verification Failed!", {
          description: "Invalid OTP",
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return (
    <div className={styles.authContainer} data-theme={getRoleTheme()}>
      <div className={styles.authWrapper}>
        {/* Left Side - Branding */}
        <div className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                </svg>
              </div>
              <h1 className={styles.brandName}>CivicReport</h1>
            </div>
            <p className={styles.brandTagline}>
              Your unified platform for civic issue reporting and management.
              Connect with your local government seamlessly.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
                <span>Community Upvoting</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <span>Real-time Tracking</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>Geo-tagged Reports</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span>Department Management</span>
              </div>
            </div>

            {/* Role Info */}
            <div className={styles.roleInfo}>
              <h4>How to Login</h4>
              <div className={styles.roleGuide}>
                <div className={styles.roleGuideItem}>
                  <span className={styles.roleColor} data-role="citizen"></span>
                  <span>Citizens: Enter 10-digit phone number</span>
                </div>
                <div className={styles.roleGuideItem}>
                  <span className={styles.roleColor} data-role="department"></span>
                  <span>Dept Manager: MGR001, MGR002...</span>
                </div>
                <div className={styles.roleGuideItem}>
                  <span className={styles.roleColor} data-role="admin"></span>
                  <span>Admin: ADM001, ADM002...</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.decorativeOrbs}>
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>
            <div className={styles.orb3}></div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            {/* Form Step */}
            {step === "form" && (
              <form onSubmit={handleSendOtp} className={styles.form}>
                <div className={styles.formHeader}>
                  <h2>Welcome Back</h2>
                  <p>Enter your phone number or employee ID</p>
                </div>

                {/* Unified Credential Input */}
                <div className={styles.inputGroup}>
                  <label>Phone Number or Employee ID</label>
                  <div className={styles.inputWrapper}>
                    {credentialType === "phone" && (
                      <span className={styles.inputPrefix}>+91</span>
                    )}
                    {credentialType !== "phone" && (
                      <span className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder="e.g., 9876543210 or ADM001"
                      value={phonenumber}
                      onChange={handleCredentialChange}
                      required
                    />
                  </div>
                  <span className={styles.inputHint}>
                    Phone for citizens, Employee ID for staff (ADM/MGR prefix)
                  </span>
                </div>

                {/* Show detected role indicator */}
                {detectedRole && (
                  <div className={styles.detectedRole} data-role={detectedRole}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Detected: <strong>{getRoleLabel(detectedRole)}</strong></span>
                  </div>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading || !isValidCredential()}
                >
                  {isLoading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      Send OTP
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className={styles.form}>
                <button type="button" className={styles.backBtn} onClick={resetForm}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back
                </button>

                <div className={styles.formHeader}>
                  <h2>Verify OTP</h2>
                  <p className={styles.otpInfo}>
                    Enter the 6-digit code sent to{" "}
                    <strong>
                      {credentialType === "phone" ? `+91 ${phonenumber}` : phonenumber}
                    </strong>
                  </p>
                </div>

                {/* Show detected role */}
                {detectedRole && (
                  <div className={styles.detectedRole} data-role={detectedRole}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>
                      Logging in as <strong>{getRoleLabel(detectedRole)}</strong>
                    </span>
                  </div>
                )}

                <div className={styles.otpInputs}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={styles.otpInput}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className={styles.resendOtp}>
                  <span>Did not receive code?</span>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleSendOtp as any}
                  >
                    Resend OTP
                  </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      Verify & Continue
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
