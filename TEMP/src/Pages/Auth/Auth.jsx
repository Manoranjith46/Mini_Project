'use client';

import { useState, useEffect } from 'react';
import styles from './Auth.module.css';

const DEPARTMENTS = [
  { id: 'electricity', name: 'Electricity', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'water-supply', name: 'Water Supply', icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
  { id: 'roads', name: 'Roads & Infrastructure', icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' },
  { id: 'sanitation', name: 'Sanitation', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  { id: 'parks', name: 'Parks & Recreation', icon: 'M12 3v19m-7-7l7-7 7 7' },
  { id: 'public-health', name: 'Public Health', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // login, signup
  const [step, setStep] = useState('form'); // form, otp, details
  
  // Form states
  const [credential, setCredential] = useState(''); // Can be phone or employee ID
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Detected role based on credential input
  const [detectedRole, setDetectedRole] = useState(null);
  const [credentialType, setCredentialType] = useState(null); // 'phone' or 'empId'
  
  // Department specific
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [assignedArea, setAssignedArea] = useState('');

  // Auto-detect credential type and role
  useEffect(() => {
    const cleaned = credential.replace(/\s/g, '');
    
    if (!cleaned) {
      setDetectedRole(null);
      setCredentialType(null);
      return;
    }
    
    // Check if it's a phone number (all digits, starts with 6-9 for Indian numbers)
    const isPhone = /^[6-9]\d{0,9}$/.test(cleaned);
    
    if (isPhone) {
      setCredentialType('phone');
      setDetectedRole('citizen');
    } else {
      setCredentialType('empId');
      // Detect role from prefix
      const prefix = cleaned.substring(0, 3).toUpperCase();
      if (prefix === 'ADM') {
        setDetectedRole('admin');
      } else if (prefix === 'MGR') {
        setDetectedRole('dept-manager');
      } else if (prefix === 'FOF') {
        setDetectedRole('field-officer');
      } else {
        setDetectedRole(null);
      }
    }
  }, [credential]);

  const formatAadhar = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return value;
  };

  const handleAadharChange = (e) => {
    const formatted = formatAadhar(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 12) {
      setAadharNumber(formatted);
    }
  };

  const handleCredentialChange = (e) => {
    let value = e.target.value;
    
    // If it looks like a phone number, only allow digits and limit to 10
    if (/^\d+$/.test(value.replace(/\s/g, ''))) {
      value = value.replace(/\D/g, '');
      if (value.length <= 10) {
        setCredential(value);
      }
    } else {
      // Employee ID - convert to uppercase
      setCredential(value.toUpperCase());
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('otp');
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const role = detectedRole || 'citizen';
    
    if (authMode === 'login') {
      if (role === 'citizen') {
        onLogin({ 
          role: 'citizen', 
          mobile: credential, 
          name: 'Citizen User',
          id: `CIT-${Date.now()}`
        });
      } else if (role === 'admin') {
        onLogin({ 
          role: 'admin', 
          employeeId: credential,
          name: 'Admin User',
          designation: 'Super Administrator'
        });
      } else {
        // dept-manager or field-officer need department details
        setStep('details');
        setIsLoading(false);
      }
    } else {
      // Signup for citizen - go to details for additional info
      setStep('details');
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    
    const role = detectedRole || 'citizen';
    
    const userData = {
      role,
      name: fullName || 'User',
      aadhar: aadharNumber,
      id: `${role.toUpperCase().substring(0, 3)}-${Date.now()}`
    };

    if (role === 'citizen') {
      userData.mobile = credential;
      onLogin(userData);
    } else if (role === 'admin') {
      userData.employeeId = credential;
      userData.designation = designation || 'Super Administrator';
      userData.officeLocation = officeLocation;
      onLogin(userData);
    } else {
      // dept-manager or field-officer
      userData.employeeId = credential;
      userData.department = selectedDepartment;
      userData.departmentName = DEPARTMENTS.find(d => d.id === selectedDepartment)?.name || selectedDepartment;
      userData.designation = designation || (role === 'dept-manager' ? 'Department Manager' : 'Field Officer');
      userData.officeLocation = officeLocation;
      if (role === 'field-officer') {
        userData.assignedArea = assignedArea;
      }
      onLogin(userData);
    }
  };

  const resetForm = () => {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setCredential('');
    setFullName('');
    setAadharNumber('');
    setSelectedDepartment('');
    setDesignation('');
    setOfficeLocation('');
    setAssignedArea('');
    setDetectedRole(null);
    setCredentialType(null);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'citizen': return 'Citizen';
      case 'dept-manager': return 'Department Manager';
      case 'field-officer': return 'Field Officer';
      case 'admin': return 'Super Admin';
      default: return 'User';
    }
  };

  const getRoleTheme = () => {
    if (!detectedRole) return 'default';
    switch (detectedRole) {
      case 'citizen': return 'citizen';
      case 'dept-manager': 
      case 'field-officer': return 'department';
      case 'admin': return 'admin';
      default: return 'default';
    }
  };

  const isValidCredential = () => {
    if (!credential) return false;
    if (credentialType === 'phone') {
      return credential.length === 10;
    }
    return credential.length >= 4 && detectedRole !== null;
  };

  // For signup, only citizens can self-register
  const canSignup = authMode === 'signup' && credentialType === 'phone' && detectedRole === 'citizen';

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
              <h1 className={styles.brandName}>CivicConnect</h1>
            </div>
            <p className={styles.brandTagline}>
              Your unified platform for civic issue reporting and management. 
              Connect with your local government seamlessly.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                </span>
                <span>Voice-Based Reporting</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                </span>
                <span>Community Upvoting</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </span>
                <span>Real-time Tracking</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </span>
                <span>Internal Chat System</span>
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
                  <span className={styles.roleColor} data-role="department"></span>
                  <span>Field Officer: FOF001, FOF002...</span>
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
            {/* Login/Signup Toggle Tabs */}
            <div className={styles.authTabs}>
              <button 
                className={`${styles.authTab} ${authMode === 'login' ? styles.activeTab : ''}`}
                onClick={() => { setAuthMode('login'); resetForm(); }}
              >
                Login
              </button>
              <button 
                className={`${styles.authTab} ${authMode === 'signup' ? styles.activeTab : ''}`}
                onClick={() => { setAuthMode('signup'); resetForm(); }}
              >
                Sign Up
              </button>
            </div>

            {/* Form Step */}
            {step === 'form' && (
              <form onSubmit={handleSendOtp} className={styles.form}>
                <div className={styles.formHeader}>
                  <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                  <p>
                    {authMode === 'login' 
                      ? 'Enter your phone number or employee ID'
                      : 'Only citizens can create their own account'}
                  </p>
                </div>

                {/* Signup fields - Only for citizens */}
                {authMode === 'signup' && (
                  <>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Aadhar Number</label>
                      <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2"/>
                            <line x1="7" y1="8" x2="17" y2="8"/>
                            <line x1="7" y1="12" x2="13" y2="12"/>
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="XXXX XXXX XXXX"
                          value={aadharNumber}
                          onChange={handleAadharChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Unified Credential Input */}
                <div className={styles.inputGroup}>
                  <label>{authMode === 'login' ? 'Phone Number or Employee ID' : 'Mobile Number'}</label>
                  <div className={styles.inputWrapper}>
                    {credentialType === 'phone' && (
                      <span className={styles.inputPrefix}>+91</span>
                    )}
                    {credentialType !== 'phone' && (
                      <span className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder={authMode === 'login' ? "e.g., 9876543210 or ADM001" : "Enter 10-digit mobile number"}
                      value={credential}
                      onChange={handleCredentialChange}
                      required
                    />
                  </div>
                  {authMode === 'login' && (
                    <span className={styles.inputHint}>
                      Phone for citizens, Employee ID for staff (ADM/MGR/FOF prefix)
                    </span>
                  )}
                  {authMode === 'signup' && (
                    <span className={styles.inputHint}>
                      OTP will be sent to this number for verification
                    </span>
                  )}
                </div>

                {/* Show detected role indicator */}
                {detectedRole && authMode === 'login' && (
                  <div className={styles.detectedRole} data-role={detectedRole}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Detected: <strong>{getRoleLabel(detectedRole)}</strong></span>
                  </div>
                )}

                {/* Signup restriction notice for non-citizens */}
                {authMode === 'signup' && credentialType === 'empId' && (
                  <div className={styles.restrictionNotice}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                      <strong>Self-signup not available</strong>
                      <p>Only citizens can create their own accounts. Staff accounts are created by administrators.</p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isLoading || !isValidCredential() || (authMode === 'signup' && !canSignup)}
                >
                  {isLoading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      Send OTP
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className={styles.form}>
                <button type="button" className={styles.backBtn} onClick={() => setStep('form')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back
                </button>

                <div className={styles.formHeader}>
                  <h2>Verify OTP</h2>
                  <p className={styles.otpInfo}>
                    Enter the 6-digit code sent to{' '}
                    <strong>
                      {credentialType === 'phone' ? `+91 ${credential}` : credential}
                    </strong>
                  </p>
                </div>

                {/* Show detected role */}
                {detectedRole && (
                  <div className={styles.detectedRole} data-role={detectedRole}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Logging in as <strong>{getRoleLabel(detectedRole)}</strong></span>
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
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={styles.otpInput}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className={styles.resendOtp}>
                  <span>Did not receive code?</span>
                  <button type="button" className={styles.resendBtn}>Resend OTP</button>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      Verify & Continue
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Details Step - For department staff or citizen signup completion */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className={styles.form}>
                <button type="button" className={styles.backBtn} onClick={() => setStep('otp')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back
                </button>

                <div className={styles.formHeader}>
                  <h2>Complete Your Profile</h2>
                  <p>
                    {detectedRole === 'citizen' 
                      ? 'Verify your details to complete registration'
                      : `Enter your ${getRoleLabel(detectedRole)} details`
                    }
                  </p>
                </div>

                {/* Detected role badge */}
                <div className={styles.detectedRole} data-role={detectedRole}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Role: <strong>{getRoleLabel(detectedRole)}</strong></span>
                </div>

                {/* Department selection for dept-manager and field-officer */}
                {(detectedRole === 'dept-manager' || detectedRole === 'field-officer') && (
                  <div className={styles.inputGroup}>
                    <label>Department</label>
                    <div className={styles.inputWrapper}>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        required
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Designation */}
                {detectedRole !== 'citizen' && (
                  <div className={styles.inputGroup}>
                    <label>Designation</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder={detectedRole === 'admin' ? 'e.g., Super Administrator' : 'e.g., Senior Engineer'}
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Office Location */}
                {detectedRole !== 'citizen' && (
                  <div className={styles.inputGroup}>
                    <label>Office Location</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., Municipal Office, Block A"
                        value={officeLocation}
                        onChange={(e) => setOfficeLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Assigned Area for Field Officers */}
                {detectedRole === 'field-officer' && (
                  <div className={styles.inputGroup}>
                    <label>Assigned Area</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                          <line x1="8" y1="2" x2="8" y2="18"/>
                          <line x1="16" y1="6" x2="16" y2="22"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., Ward 12, Sector 5"
                        value={assignedArea}
                        onChange={(e) => setAssignedArea(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className={styles.submitBtn}>
                  Complete Registration
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
