import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Filter,
  BookOpen,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created_at: Date;
  updated_at: Date;
  views: number;
  is_favorite: boolean;
  status: 'draft' | 'published' | 'archived';
}

interface KnowledgeBaseProps {
  articles: KnowledgeArticle[];
  isLoading?: boolean;
  onCreateArticle: () => void;
  onEditArticle: (article: KnowledgeArticle) => void;
  onDeleteArticle: (article: KnowledgeArticle) => void;
  onViewArticle: (article: KnowledgeArticle) => void;
  onToggleFavorite: (article: KnowledgeArticle) => void;
}

const categories = [
  'Diagnóstico',
  'Tratamiento', 
  'Cirugía',
  'Emergencias',
  'Farmacología',
  'Nutrición',
  'Comportamiento',
  'Prevención',
  'Protocolos',
  'Otro'
];

export function KnowledgeBase({
  articles,
  isLoading = false,
  onCreateArticle,
  onEditArticle,
  onDeleteArticle,
  onViewArticle,
  onToggleFavorite
}: KnowledgeBaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Diagnóstico': 'bg-blue-100 text-blue-800',
      'Tratamiento': 'bg-green-100 text-green-800',
      'Cirugía': 'bg-red-100 text-red-800',
      'Emergencias': 'bg-orange-100 text-orange-800',
      'Farmacología': 'bg-purple-100 text-purple-800',
      'Nutrición': 'bg-yellow-100 text-yellow-800',
      'Comportamiento': 'bg-pink-100 text-pink-800',
      'Prevención': 'bg-cyan-100 text-cyan-800',
      'Protocolos': 'bg-indigo-100 text-indigo-800',
      'Otro': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Otro'];
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-vet-success text-white',
      archived: 'bg-muted text-muted-foreground'
    };
    
    const labels = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    favorites: articles.filter(a => a.is_favorite).length,
    categories: new Set(articles.map(a => a.category)).size
  };

  const renderArticleCard = (article: KnowledgeArticle) => (
    <Card key={article.id} className="hover:shadow-md transition-all duration-200 hover:border-vet-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('text-xs', getCategoryColor(article.category))}>
                {article.category}
              </Badge>
              {getStatusBadge(article.status)}
              {article.is_favorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewArticle(article)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditArticle(article)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(article)}>
                <Star className="h-4 w-4 mr-2" />
                {article.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteArticle(article)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {article.content}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.tags.length - 3} más
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            {article.views} vistas
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {format(article.updated_at, 'dd MMM', { locale: es })}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewArticle(article)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button 
            size="sm" 
            onClick={() => onEditArticle(article)}
            className="flex-1 bg-vet-primary hover:bg-vet-primary/90"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Cargando base de conocimiento...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Base de Conocimiento</h1>
          <p className="text-muted-foreground mt-1">
            Centraliza y organiza el conocimiento médico veterinario
          </p>
        </div>
        <Button 
          onClick={onCreateArticle}
          className="bg-vet-primary hover:bg-vet-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-vet-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Artículos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-vet-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Publicados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
                <p className="text-sm text-muted-foreground">Favoritos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-8 w-8 text-vet-info" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.categories}</p>
                <p className="text-sm text-muted-foreground">Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos, etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron artículos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'No hay artículos que coincidan con los filtros aplicados.'
                  : 'Aún no has creado ningún artículo en tu base de conocimiento.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={onCreateArticle} className="bg-vet-primary hover:bg-vet-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Artículo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(renderArticleCard)}
        </div>
      )}
    </div>
  );
}