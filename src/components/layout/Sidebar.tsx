import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      current: location.pathname === '/dashboard',
      badge: null
    },
    {
      name: 'Pacientes',
      href: '/pacientes',
      icon: Heart,
      current: location.pathname === '/pacientes',
      badge: '24'
    },
    {
      name: 'Historia Médica',
      href: '/historia-medica',
      icon: FileText,
      current: location.pathname === '/historia-medica',
      badge: null
    },
    {
      name: 'Citas',
      href: '/citas',
      icon: Calendar,
      current: location.pathname === '/citas',
      badge: '8'
    },
    {
      name: 'Clientes',
      href: '/clientes',
      icon: Users,
      current: location.pathname === '/clientes',
      badge: null
    }
  ];

  const quickActions = [
    {
      name: 'Nueva Cita',
      icon: Plus,
      action: () => console.log('Nueva cita'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Emergencia',
      icon: AlertCircle,
      action: () => console.log('Emergencia'),
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Consulta - Max',
      time: '10:30 AM',
      type: 'appointment'
    },
    {
      id: 2,
      title: 'Vacunación - Luna',
      time: '11:15 AM',
      type: 'vaccination'
    },
    {
      id: 3,
      title: 'Cirugía - Rocky',
      time: '2:00 PM',
      type: 'surgery'
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.current
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Quick Actions */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Acciones Rápidas</h3>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.name}
                    onClick={action.action}
                    className={cn(
                      "w-full justify-start text-white",
                      action.color
                    )}
                    size="sm"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Recent Activity */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Actividad Reciente</h3>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t">
            <Link
              to="/configuracion"
              onClick={() => onClose()}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}