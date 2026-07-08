import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'patient';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'appointment' | 'patient' | 'financial' | 'reminder';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('vet_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('vet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Simular notificaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular notificaciones aleatorias cada 30 segundos
      if (Math.random() > 0.7) {
        const randomNotifications = [
          {
            type: 'appointment' as const,
            title: 'Nueva Cita Programada',
            message: 'Se ha programado una nueva cita para mañana a las 10:00 AM',
            priority: 'medium' as const,
            category: 'appointment' as const
          },
          {
            type: 'warning' as const,
            title: 'Vacuna Próxima a Vencer',
            message: 'La vacuna antirrábica de Luna vence en 3 días',
            priority: 'high' as const,
            category: 'reminder' as const
          },
          {
            type: 'patient' as const,
            title: 'Resultados de Laboratorio',
            message: 'Los resultados de Max están listos para revisión',
            priority: 'high' as const,
            category: 'patient' as const
          },
          {
            type: 'info' as const,
            title: 'Recordatorio de Inventario',
            message: 'Revisar stock de medicamentos para la próxima semana',
            priority: 'low' as const,
            category: 'system' as const
          }
        ];
        
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar toast según el tipo y prioridad
    const toastMessage = `${newNotification.title}: ${newNotification.message}`;
    
    switch (newNotification.type) {
      case 'success':
        toast.success(toastMessage);
        break;
      case 'error':
        toast.error(toastMessage);
        break;
      case 'warning':
        toast.warning(toastMessage);
        break;
      case 'appointment':
        toast.info(toastMessage, {
          description: 'Nueva cita programada'
        });
        break;
      case 'patient':
        toast.info(toastMessage, {
          description: 'Actualización de paciente'
        });
        break;
      default:
        toast.info(toastMessage);
    }

    // Auto-eliminar notificaciones de baja prioridad después de 5 minutos
    if (newNotification.priority === 'low') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5 * 60 * 1000);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(notification => notification.category === category);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook para crear notificaciones específicas del sistema veterinario
export const useVetNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyAppointmentCreated = (patientName: string, time: string) => {
    addNotification({
      type: 'appointment',
      title: 'Nueva Cita Programada',
      message: `Cita para ${patientName} programada para ${time}`,
      priority: 'medium',
      category: 'appointment'
    });
  };

  const notifyAppointmentReminder = (patientName: string, time: string) => {
    addNotification({
      type: 'info',
      title: 'Recordatorio de Cita',
      message: `Cita con ${patientName} en 30 minutos (${time})`,
      priority: 'high',
      category: 'appointment'
    });
  };

  const notifyVaccineExpiring = (patientName: string, vaccine: string, days: number) => {
    addNotification({
      type: 'warning',
      title: 'Vacuna Próxima a Vencer',
      message: `${vaccine} de ${patientName} vence en ${days} días`,
      priority: 'high',
      category: 'reminder'
    });
  };

  const notifyLabResults = (patientName: string) => {
    addNotification({
      type: 'patient',
      title: 'Resultados de Laboratorio',
      message: `Resultados de ${patientName} están listos para revisión`,
      priority: 'high',
      category: 'patient'
    });
  };

  const notifyEmergency = (patientName: string, description: string) => {
    addNotification({
      type: 'error',
      title: 'Emergencia',
      message: `${patientName}: ${description}`,
      priority: 'urgent',
      category: 'patient'
    });
  };

  const notifyPaymentReceived = (amount: number, clientName: string) => {
    addNotification({
      type: 'success',
      title: 'Pago Recibido',
      message: `Pago de $${amount} recibido de ${clientName}`,
      priority: 'low',
      category: 'financial'
    });
  };

  const notifyInventoryLow = (item: string, quantity: number) => {
    addNotification({
      type: 'warning',
      title: 'Inventario Bajo',
      message: `Quedan solo ${quantity} unidades de ${item}`,
      priority: 'medium',
      category: 'system'
    });
  };

  return {
    notifyAppointmentCreated,
    notifyAppointmentReminder,
    notifyVaccineExpiring,
    notifyLabResults,
    notifyEmergency,
    notifyPaymentReceived,
    notifyInventoryLow
  };
};