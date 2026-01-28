import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Bell, X, Inbox } from "lucide-react";
import { Badge } from "@/app/components/ui/badge.jsx";
import { toast } from "sonner";

export function NotificationPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/user/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
        toast.success('Notification dismissed');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="icon" 
        className="relative border-2 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={`size-5 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 size-6 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-[9999] animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-200 bg-blue-50">
            <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 font-bold shadow-md">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="max-h-[450px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <Inbox className="size-14 text-blue-600" />
                </div>
                <p className="text-base font-semibold text-gray-700">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div 
                    key={notification.notification_id}
                    className="flex items-start gap-3 p-4 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleDeleteNotification(notification.notification_id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
