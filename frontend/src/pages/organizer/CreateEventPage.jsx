import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createEvent, updateEvent, publishEvent, uploadEventBanner } from '../../features/events/eventSlice';
import { selectEventsLoading } from '../../features/events/eventSlice';
import ImageUpload from '../../components/ui/ImageUpload';

const CATEGORIES = ['concerts', 'sports', 'theatre', 'comedy', 'art', 'standup', 'conference', 'festival', 'other'];
const STEPS = ['Basic Info', 'Date & Venue', 'Tickets', 'Banner Image', 'Review & Publish'];

const defaultTicket = () => ({ name: '', price: 0, totalSeats: 100, description: '' });

const CreateEventPage = ({ existingEvent = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectEventsLoading);

  const [step, setStep] = useState(0);
  const [savedEventId, setSavedEventId] = useState(existingEvent?._id || null);
  const [bannerFile, setBannerFile] = useState(null);
  const [form, setForm] = useState({
    title: existingEvent?.title || '',
    description: existingEvent?.description || '',
    category: existingEvent?.category || '',
    tags: existingEvent?.tags?.join(', ') || '',
    venueName: existingEvent?.venue?.name || '',
    venueAddress: existingEvent?.venue?.address || '',
    venueCity: existingEvent?.venue?.city || '',
    venueState: existingEvent?.venue?.state || '',
    venueCountry: existingEvent?.venue?.country || 'India',
    dateStart: existingEvent?.date?.start?.slice(0, 16) || '',
    dateEnd: existingEvent?.date?.end?.slice(0, 16) || '',
    ticketTypes: existingEvent?.ticketTypes?.length
      ? existingEvent.ticketTypes.map((t) => ({ name: t.name, price: t.price, totalSeats: t.totalSeats, description: t.description || '' }))
      : [defaultTicket()],
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setTicket = (i, field, value) => {
    const t = [...form.ticketTypes];
    t[i] = { ...t[i], [field]: value };
    setForm((f) => ({ ...f, ticketTypes: t }));
  };

  const addTicket = () => setForm((f) => ({ ...f, ticketTypes: [...f.ticketTypes, defaultTicket()] }));
  const removeTicket = (i) => setForm((f) => ({ ...f, ticketTypes: f.ticketTypes.filter((_, idx) => idx !== i) }));

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (!form.category) errs.category = 'Select a category';
    }
    if (s === 1) {
      if (!form.venueName.trim()) errs.venueName = 'Venue name is required';
      if (!form.venueCity.trim()) errs.venueCity = 'City is required';
      if (!form.dateStart) errs.dateStart = 'Start date is required';
      if (!form.dateEnd) errs.dateEnd = 'End date is required';
      if (form.dateStart && form.dateEnd && new Date(form.dateEnd) <= new Date(form.dateStart))
        errs.dateEnd = 'End must be after start';
    }
    if (s === 2) {
      form.ticketTypes.forEach((t, i) => {
        if (!t.name.trim()) errs[`ticket_${i}_name`] = 'Required';
        if (t.totalSeats < 1) errs[`ticket_${i}_seats`] = 'Min 1 seat';
      });
    }
    return errs;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    venue: { name: form.venueName, address: form.venueAddress, city: form.venueCity, state: form.venueState, country: form.venueCountry },
    date: { start: new Date(form.dateStart), end: new Date(form.dateEnd) },
    ticketTypes: form.ticketTypes.map((t) => ({
      name: t.name.trim(),
      price: Number(t.price) || 0,
      totalSeats: Number(t.totalSeats) || 1,
      description: t.description ? t.description.trim() : '',
    })),
  });

  const next = async () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // On step 0 & 1: Transition UI cleanly (venue & dates are mandatory for DB creation)
    if (step < 2) {
      if (savedEventId) {
        await dispatch(updateEvent({ id: savedEventId, data: buildPayload() }));
      }
      setStep((s) => s + 1);
      return;
    }

    // On step 2 (Tickets filled): Now all required event attributes are present; create draft in DB
    if (step === 2) {
      if (!savedEventId) {
        const result = await dispatch(createEvent(buildPayload()));
        if (createEvent.fulfilled.match(result)) {
          setSavedEventId(result.payload._id);
          setStep(3);
        }
      } else {
        await dispatch(updateEvent({ id: savedEventId, data: buildPayload() }));
        setStep(3);
      }
      return;
    }

    // On step 3: upload banner image if selected
    if (step === 3) {
      if (savedEventId && bannerFile) {
        await dispatch(uploadEventBanner({ id: savedEventId, file: bannerFile }));
      }
      setStep(4);
      return;
    }
  };

  const handlePublish = async () => {
    if (!savedEventId) return;
    const result = await dispatch(publishEvent(savedEventId));
    if (publishEvent.fulfilled.match(result)) {
      navigate(`/events/${result.payload.slug || savedEventId}`);
    }
  };

  const handleSaveDraft = () => {
    navigate('/organizer/events');
  };

  const FieldError = ({ name }) => errors[name] ? <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors[name]}</p> : null;

  const inputStyle = (name) => ({
    width: '100%', padding: '0.75rem', border: `1.5px solid ${errors[name] ? '#dc2626' : '#e2e8f0'}`,
    borderRadius: '0.625rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
  });

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', color: '#0f172a', marginBottom: '0.25rem' }}>
            {existingEvent ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p style={{ color: '#64748b' }}>{existingEvent ? 'Update your event details' : 'Fill in the details to create your event'}</p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: '4px', borderRadius: '9999px', background: i <= step ? '#4f46e5' : '#e2e8f0', marginBottom: '0.375rem', transition: 'background 250ms' }} />
              <p style={{ fontSize: '0.7rem', color: i <= step ? '#4f46e5' : '#94a3b8', fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>
                {s}
              </p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>

          {/* STEP 0: Basic Info */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Basic Information</h2>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Event Title *</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Coldplay Live in Mumbai" style={inputStyle('title')} maxLength={120} />
                <FieldError name="title" />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Description *</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your event in detail..." rows={5} style={{ ...inputStyle('description'), resize: 'vertical' }} maxLength={5000} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <FieldError name="description" />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{form.description.length}/5000</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => set('category', cat)} style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1.5px solid', borderColor: form.category === cat ? '#4f46e5' : '#e2e8f0', background: form.category === cat ? '#4f46e5' : 'white', color: form.category === cat ? 'white' : '#374151', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 150ms' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <FieldError name="category" />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Tags (optional)</label>
                <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="music, outdoor, family (comma-separated)" style={inputStyle('tags')} />
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Separate tags with commas. Max 10.</p>
              </div>
            </div>
          )}

          {/* STEP 1: Date & Venue */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Date & Venue</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Start Date & Time *</label>
                  <input type="datetime-local" value={form.dateStart} onChange={(e) => set('dateStart', e.target.value)} style={inputStyle('dateStart')} />
                  <FieldError name="dateStart" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>End Date & Time *</label>
                  <input type="datetime-local" value={form.dateEnd} onChange={(e) => set('dateEnd', e.target.value)} style={inputStyle('dateEnd')} />
                  <FieldError name="dateEnd" />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Venue Name *</label>
                <input value={form.venueName} onChange={(e) => set('venueName', e.target.value)} placeholder="e.g. DY Patil Stadium" style={inputStyle('venueName')} />
                <FieldError name="venueName" />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Address</label>
                <input value={form.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} placeholder="Street address" style={inputStyle('venueAddress')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>City *</label>
                  <input value={form.venueCity} onChange={(e) => set('venueCity', e.target.value)} placeholder="Mumbai" style={inputStyle('venueCity')} />
                  <FieldError name="venueCity" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>State</label>
                  <input value={form.venueState} onChange={(e) => set('venueState', e.target.value)} placeholder="Maharashtra" style={inputStyle('venueState')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Country</label>
                  <input value={form.venueCountry} onChange={(e) => set('venueCountry', e.target.value)} style={inputStyle('venueCountry')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tickets */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Ticket Types</h2>

              {form.ticketTypes.map((t, i) => (
                <div key={i} style={{ border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 600, color: '#374151' }}>Ticket Type {i + 1}</h4>
                    {form.ticketTypes.length > 1 && (
                      <button onClick={() => removeTicket(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Name *</label>
                      <input value={t.name} onChange={(e) => setTicket(i, 'name', e.target.value)} placeholder="e.g. General, VIP" style={inputStyle(`ticket_${i}_name`)} />
                      <FieldError name={`ticket_${i}_name`} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Price (₹) *</label>
                      <input type="number" value={t.price} min={0} onChange={(e) => setTicket(i, 'price', Number(e.target.value))} style={inputStyle(`ticket_${i}_price`)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Total Seats *</label>
                      <input type="number" value={t.totalSeats} min={1} onChange={(e) => setTicket(i, 'totalSeats', Number(e.target.value))} style={inputStyle(`ticket_${i}_seats`)} />
                      <FieldError name={`ticket_${i}_seats`} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Description (optional)</label>
                    <input value={t.description} onChange={(e) => setTicket(i, 'description', e.target.value)} placeholder="e.g. Includes backstage pass" style={inputStyle('')} />
                  </div>
                </div>
              ))}

              <button onClick={addTicket} style={{ width: '100%', padding: '0.75rem', border: '1.5px dashed #4f46e5', background: '#f8f7ff', color: '#4f46e5', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                + Add Ticket Type
              </button>
            </div>
          )}

          {/* STEP 3: Banner Image */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>Event Banner</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload a banner image for your event. Recommended: 1200 × 630 px.</p>
              <ImageUpload
                label=""
                onFileSelect={setBannerFile}
                previewUrl={existingEvent?.bannerImage?.url}
              />
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                {bannerFile ? `✅ Ready to upload: ${bannerFile.name}` : 'You can skip this step and add a banner later.'}
              </p>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Review & Publish</h2>
              {[
                { label: 'Title', value: form.title },
                { label: 'Category', value: form.category },
                { label: 'Start', value: form.dateStart ? new Date(form.dateStart).toLocaleString('en-IN') : '' },
                { label: 'End', value: form.dateEnd ? new Date(form.dateEnd).toLocaleString('en-IN') : '' },
                { label: 'Venue', value: `${form.venueName}, ${form.venueCity}` },
                { label: 'Tickets', value: form.ticketTypes.map((t) => `${t.name} — ₹${t.price} (${t.totalSeats} seats)`).join(' | ') },
                { label: 'Tags', value: form.tags || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ color: '#0f172a', fontSize: '0.875rem' }}>{value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={handleSaveDraft} style={{ flex: 1, padding: '0.875rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}>
                  💾 Save as Draft
                </button>
                <button onClick={handlePublish} disabled={isLoading} style={{ flex: 1, padding: '0.875rem', background: isLoading ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.9375rem' }}>
                  {isLoading ? 'Publishing...' : '🚀 Publish Event'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ padding: '0.75rem 1.5rem', border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', borderRadius: '0.75rem', fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}
            >
              ← Back
            </button>
            <button
              onClick={next}
              disabled={isLoading}
              style={{ padding: '0.75rem 2rem', background: isLoading ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Saving...' : step === 3 ? (bannerFile ? 'Upload & Continue →' : 'Skip & Continue →') : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;
