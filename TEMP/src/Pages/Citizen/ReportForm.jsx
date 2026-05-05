'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ReportForm.module.css';

export default function ReportForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    image: null,
    location: null,
    voiceNote: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const categories = [
    { value: 'electricity', label: 'Electricity', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'water-supply', label: 'Water Supply', icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
    { value: 'roads', label: 'Roads & Potholes', icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' },
    { value: 'sanitation', label: 'Sanitation', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    { value: 'parks', label: 'Parks & Recreation', icon: 'M12 3v19m-7-7l7-7 7 7' },
    { value: 'public-health', label: 'Public Health', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setFormData((prev) => ({ ...prev, voiceNote: audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const removeRecording = () => {
    setAudioUrl(null);
    setFormData((prev) => ({ ...prev, voiceNote: null }));
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Location Functions
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setHasLocation(true);
          setLocationAddress(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
    // Reset form
    setFormData({ category: '', description: '', image: null, location: null, voiceNote: null });
    setImagePreview(null);
    setAudioUrl(null);
    setHasLocation(false);
    setLocationAddress('');
    setRecordingTime(0);
    alert('Issue reported successfully! You can track it in "My Reports".');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Report a Civic Issue</h2>
        <p className={styles.subtitle}>
          Help us improve your community. You can type, record voice, or upload photos.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Category Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Issue Category *</label>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`${styles.categoryCard} ${formData.category === cat.value ? styles.activeCategory : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={cat.icon} />
                </svg>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            required
          />
        </div>

        {/* Voice Recording */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Voice Note (Optional)</label>
          <div className={styles.voiceSection}>
            {!audioUrl ? (
              <div className={styles.voiceRecorder}>
                {isRecording ? (
                  <>
                    <div className={styles.recordingIndicator}>
                      <span className={styles.recordingDot}></span>
                      <span className={styles.recordingTime}>{formatTime(recordingTime)}</span>
                    </div>
                    <button type="button" className={styles.stopBtn} onClick={stopRecording}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                      Stop Recording
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.recordBtn} onClick={startRecording}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    Record Voice Note
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.audioPlayer}>
                <audio src={audioUrl} controls className={styles.audio} />
                <button type="button" className={styles.removeAudio} onClick={removeRecording}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Upload Photo</label>
          <div className={styles.uploadArea}>
            {imagePreview ? (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                <button
                  type="button"
                  className={styles.removeImage}
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, image: null }));
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>Click to upload or drag and drop</span>
                <span className={styles.uploadHint}>PNG, JPG up to 10MB</span>
              </label>
            )}
          </div>
        </div>

        {/* Location */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Location</label>
          <button
            type="button"
            className={`${styles.locationBtn} ${hasLocation ? styles.locationActive : ''}`}
            onClick={getLocation}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {hasLocation ? locationAddress : 'Get Current Location'}
            {hasLocation && (
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Submit Report
          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
