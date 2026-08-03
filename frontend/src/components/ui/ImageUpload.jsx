import { useState, useRef } from 'react';

const ImageUpload = ({ onFileSelect, previewUrl, label = 'Event Banner', disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(previewUrl || null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    onFileSelect?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = ''; // reset input so same file can be re-selected
  };

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
          {label}
        </label>
      )}

      <div
        id="image-upload-zone"
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#4f46e5' : error ? '#dc2626' : '#e2e8f0'}`,
          borderRadius: '0.75rem',
          background: isDragging ? '#f8f7ff' : '#f8fafc',
          cursor: disabled ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          transition: 'all 150ms',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src={preview}
              alt="Banner preview"
              style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }}
            />
            {!disabled && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.querySelector('span').style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.querySelector('span').style.opacity = '0'; }}
              >
                <span style={{ opacity: 0, color: 'white', fontWeight: 600, fontSize: '0.9rem', transition: 'opacity 150ms', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                  Click to change image
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
            <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
              {isDragging ? 'Drop it here!' : 'Drop image or click to upload'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>JPG, PNG, WebP — max 5 MB</p>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Recommended: 1200 × 630 px</p>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="image-file-input"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
