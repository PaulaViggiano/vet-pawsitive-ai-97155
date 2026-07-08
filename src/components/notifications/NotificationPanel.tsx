import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  Calendar,
  Heart,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Trash2,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'patient':
        return <Heart className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-red-500 bg-red-50';
    
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'appointment':
        return 'border-blue-500 bg-blue-50';
      case 'patient':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : getNotificationsByCategory(activeTab);

  const categoryCount = {
    appointment: getNotificationsByCategory('appointment').filter(n => !n.read).length,
    patient: getNotificationsByCategory('patient').filter(n => !n.read).length,
    system: getNotificationsByCategory('system').filter(n => !n.read).length,
    reminder: getNotificationsByCategory('reminder').filter(n => !n.read).length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                <CardTitle>Notificaciones</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Mantente al día con las actividades de tu clínica
            </CardDescription>
            
            {/* Acciones rápidas */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5 rounded-none">
                <TabsTrigger value="all" className="text-xs">
                  Todas
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="appointment" className="text-xs">
                  Citas
                  {categoryCount.appointment > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {categoryCount.appointment}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="patient" className="text-xs">
                  Pacientes
                  {categoryCount.patient > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {categoryCount.patient}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reminder" className="text-xs">
                  Recordatorios
                  {categoryCount.reminder > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {categoryCount.reminder}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs">
                  Sistema
                  {categoryCount.system > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {categoryCount.system}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0 h-full">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay notificaciones
                      </h3>
                      <p className="text-sm text-gray-500">
                        {activeTab === 'all' 
                          ? 'No tienes notificaciones en este momento'
                          : `No hay notificaciones en la categoría ${activeTab}`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                            getNotificationColor(notification.type, notification.priority)
                          } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`mt-1 ${
                                notification.type === 'error' || notification.priority === 'urgent'
                                  ? 'text-red-600'
                                  : notification.type === 'warning'
                                  ? 'text-yellow-600'
                                  : notification.type === 'success'
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              }`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-medium ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-600'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(notification.timestamp, {
                                      addSuffix: true,
                                      locale: es
                                    })}
                                  </span>
                                  {getPriorityBadge(notification.priority)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="ml-2 h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPanel;