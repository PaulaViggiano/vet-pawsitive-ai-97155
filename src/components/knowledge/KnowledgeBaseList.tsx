import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Eye,
  Filter,
  Globe,
  Lock
} from 'lucide-react';
import { KnowledgeBaseEntry } from '@/hooks/useKnowledgeBase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface KnowledgeBaseListProps {
  entries: KnowledgeBaseEntry[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (entry: KnowledgeBaseEntry) => void;
  onView: (entry: KnowledgeBaseEntry) => void;
  onDelete: (entry: KnowledgeBaseEntry) => void;
}

export function KnowledgeBaseList({ 
  entries, 
  isLoading, 
  onCreateNew, 
  onEdit, 
  onView, 
  onDelete 
}: KnowledgeBaseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletingEntry, setDeletingEntry] = useState<KnowledgeBaseEntry | null>(null);

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const uniqueCategories = [...new Set(entries.map(e => e.category))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-80 bg-muted/30 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted/50 rounded animate-pulse"></div>
        </div>

        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted/50 rounded mb-2"></div>
                <div className="h-4 bg-muted/30 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-muted/50 rounded"></div>
                  <div className="h-6 w-20 bg-muted/50 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Base de Conocimiento
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gestiona tu biblioteca de información veterinaria
          </p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Entrada
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en título, contenido o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredEntries.length} de {entries.length} entradas
        </p>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card className="bg-white border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {entries.length === 0 ? 'No hay entradas registradas' : 'No se encontraron entradas'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {entries.length === 0 
                ? 'Comienza creando tu primera entrada de conocimiento' 
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
            {entries.length === 0 && (
              <Button onClick={onCreateNew} className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Entrada
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="bg-white border-0 shadow-lg shadow-primary/5 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {entry.title}
                      </h3>
                      {entry.is_public ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {entry.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                      </Badge>
                      {entry.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Actualizado: {entry.updated_at.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(entry)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(entry)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingEntry(entry)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la entrada "{deletingEntry?.title}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletingEntry) {
                  onDelete(deletingEntry);
                  setDeletingEntry(null);
                }
              }} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}