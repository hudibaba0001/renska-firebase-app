import React, { useState } from 'react';
import { 
  Button, 
  Badge, 
  Dropdown,
  Card,
  Avatar,
  Spinner
} from 'flowbite-react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useRealtimeNotifications } from '../hooks/useRealtimeMetrics';

export default function NotificationCenter({ companyId }) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useRealtimeNotifications(companyId);
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return DocumentTextIcon;
      case 'payment':
        return CreditCardIcon;
      case 'customer':
        return UserGroupIcon;
      case 'system':
        return CogIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'text-blue-500';
      case 'payment':
        return 'text-green-500';
      case 'customer':
        return 'text-purple-500';
      case 'system':
        return 'text-gray-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle notification action if specified
    if (notification.action) {
      window.location.href = notification.action;
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <Button color="gray" size="sm" disabled>
          <Spinner size="sm" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Dropdown
        arrowIcon={false}
        inline
        label={
          <div className="relative">
            <Button color="gray" size="sm" className="relative">
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  color="failure"
                  size="sm"
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        }
        placement="bottom-end"
      >
        <div className="w-80 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  color="gray"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <Badge color="failure" size="sm">
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
              <Button
                size="sm"
                color="gray"
                className="w-full"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = `/admin/${companyId}/notifications`;
                }}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      </Dropdown>
    </div>
  );
}

// System-wide alerts component for superadmin
export function SystemAlertsCenter() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'High Server Load',
      message: 'Server CPU usage is at 85%. Consider scaling up.',
      priority: 'high',
      createdAt: new Date(),
      active: true
    },
    {
      id: 2,
      type: 'info',
      title: 'Maintenance Scheduled',
      message: 'System maintenance planned for July 25, 2025 at 2:00 AM CET.',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      active: true
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily database backup completed successfully.',
      priority: 'low',
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      active: true
    }
  ]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      case 'info':
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const IconComponent = getAlertIcon(alert.type);
        const iconColor = getAlertColor(alert.type);
        
        return (
          <Card key={alert.id} className="border-l-4 border-l-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 ${iconColor}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    {alert.priority === 'high' && (
                      <Badge color="failure" size="sm">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {alert.message}
                  </p>
                  
                  <span className="text-xs text-gray-400 mt-2 block">
                    {alert.createdAt.toLocaleString('sv-SE')}
                  </span>
                </div>
              </div>
              
              <Button
                size="xs"
                color="gray"
                onClick={() => dismissAlert(alert.id)}
                className="ml-4"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
