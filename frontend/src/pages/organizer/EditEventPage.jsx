import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById, selectCurrentEvent, selectDetailLoading } from '../../features/events/eventSlice';
import CreateEventPage from './CreateEventPage';

const EditEventPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const event = useSelector(selectCurrentEvent);
  const isLoading = useSelector(selectDetailLoading);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [id]);

  if (isLoading) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center' }}>
      <p style={{ color: '#64748b' }}>Loading event...</p>
    </div>
  );

  if (!event) return null;

  return <CreateEventPage existingEvent={event} />;
};

export default EditEventPage;
