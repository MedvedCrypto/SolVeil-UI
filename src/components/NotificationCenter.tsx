// components/NotificationCenter.tsx
import React from "react";
import { Notification } from "../App";

interface NotificationCenterProps {
  notifications: Notification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => (
  <div className="fixed top-4 right-4 space-y-3 max-w-xs z-50">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`notification ${notification.type}`}
      >
        {notification.message}
      </div>
    ))}
  </div>
);

export default NotificationCenter;