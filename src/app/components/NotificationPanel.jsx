import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Bell,
  X,
  Inbox,
  CheckCheck,
  Calendar,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog.jsx";
import { toast } from "sonner";

export function NotificationPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId
            ? { ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }
            : n
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

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

  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
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
                  {unreadCount} unread
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
                  <p className="text-sm text-gray-500 mt-1">You&apos;re all caught up</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.notification_id}
                      onClick={() => openNotificationDetail(notification)}
                      className={`flex items-start gap-3 p-4 transition-all group cursor-pointer ${notification.is_read ? 'hover:bg-gray-50' : 'bg-blue-50/60 hover:bg-blue-100/70'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${notification.is_read ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-green-100 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.notification_id);
                            }}
                            title="Mark as read"
                          >
                            <CheckCheck className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.notification_id);
                          }}
                          title="Dismiss"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Notification Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              Review the item and claim message details.
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              {selectedNotification.item_image_url && (
                <img
                  src={selectedNotification.item_image_url}
                  alt={selectedNotification.item_title || "Reported item"}
                  className="w-full h-52 object-cover rounded-xl border border-gray-200"
                />
              )}

              <div className="flex items-center gap-2">
                <Badge
                  className={selectedNotification.report_type === "found" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                >
                  {(selectedNotification.report_type || "item").toUpperCase()}
                </Badge>
                {!selectedNotification.is_read && (
                  <Badge className="bg-blue-600 text-white">Unread</Badge>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedNotification.item_title || "Item details unavailable"}
                </h4>
                {selectedNotification.item_description && (
                  <p className="text-sm text-gray-700 mt-1">{selectedNotification.item_description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <MapPin className="size-4 text-gray-500" />
                  <span>{selectedNotification.location_name || "Unknown location"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <Calendar className="size-4 text-gray-500" />
                  <span>
                    {selectedNotification.item_date
                      ? new Date(selectedNotification.item_date).toLocaleString()
                      : "Unknown date"}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Notification
                </p>
                <p className="text-sm text-gray-800 mt-1.5">{selectedNotification.message}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                <p className="text-sm font-semibold text-gray-800">
                  Claim Message from {selectedNotification.requester_name || "Unknown user"}
                </p>
                <p className="text-sm text-gray-700 mt-1.5">
                  {selectedNotification.requester_message || "No message provided."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedNotification && !selectedNotification.is_read && (
              <Button
                onClick={async () => {
                  await handleMarkAsRead(selectedNotification.notification_id);
                  setSelectedNotification((prev) => prev ? { ...prev, is_read: true } : prev);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCheck className="size-4 mr-2" />
                Mark as Read
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
