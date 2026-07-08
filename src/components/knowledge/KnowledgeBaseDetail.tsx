import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  Tag, 
  Globe, 
  Lock,
  Clock
} from 'lucide-react';
import { KnowledgeBaseEntry } from '@/hooks/useKnowledgeBase';

interface KnowledgeBaseDetailProps {
  entry: KnowledgeBaseEntry;
  onEdit: () => void;
  onBack: () => void;
}

export function KnowledgeBaseDetail({ entry, onEdit, onBack }: KnowledgeBaseDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {entry.title}
          </h1>
        </div>
        <Button 
          onClick={onEdit}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-0 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {entry.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card className="bg-white border-0 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {entry.is_public ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Visibilidad</p>
                  <p className="text-muted-foreground">
                    {entry.is_public ? 'Pública' : 'Privada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Categoría</p>
                  <Badge variant="outline" className="text-xs">
                    {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Creado</p>
                  <p className="text-muted-foreground">
                    {entry.created_at.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Actualizado</p>
                  <p className="text-muted-foreground">
                    {entry.updated_at.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <Card className="bg-white border-0 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}