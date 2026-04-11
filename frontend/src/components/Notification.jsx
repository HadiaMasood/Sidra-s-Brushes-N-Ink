import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Notification.css';

export const Notification = ({ type = 'success', message, onClose, duration = 3000 }) => {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    info: <FaInfoCircle />,
    warning: <FaExclamationCircle />,
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{icons[type]}</span>
        <p className="notification-message">{message}</p>
      </div>
      <button className="notification-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          type={notif.type}
          message={notif.message}
          onClose={() => removeNotification(notif.id)}
          duration={notif.duration}
        />
      ))}
    </div>
  );
};

export default Notification;
