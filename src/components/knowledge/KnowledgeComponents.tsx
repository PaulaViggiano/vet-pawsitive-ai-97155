import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Filter,
  Star,
  Clock,
  Tag,
  FileText,
  Video,
  Image,
  Link,
  Archive,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  attachments?: string[];
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  article_count: number;
  color: string;
  icon: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  views: number;
  created_at: string;
}

// Knowledge Article Card Component
export function KnowledgeArticleCard({ 
  article, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  article: KnowledgeArticle; 
  onEdit: (article: KnowledgeArticle) => void;
  onDelete: (article: KnowledgeArticle) => void;
  onView: (article: KnowledgeArticle) => void;
}) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer" onClick={() => onView(article)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {article.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {article.content.substring(0, 150)}...
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <span>Por {article.author}</span>
            <span>{format(new Date(article.created_at), 'PP', { locale: es })}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {article.views} vistas
            </span>
          </div>
        </div>

        {/* Status and difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge className={getStatusColor(article.status)}>
              {article.status}
            </Badge>
            <Badge className={getDifficultyColor(article.difficulty_level)}>
              {article.difficulty_level}
            </Badge>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(article);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(article);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Category Management Component
export function KnowledgeCategoryManager({ 
  categories, 
  onCreateCategory, 
  onEditCategory, 
  onDeleteCategory 
}: {
  categories: KnowledgeCategory[];
  onCreateCategory: () => void;
  onEditCategory: (category: KnowledgeCategory) => void;
  onDeleteCategory: (category: KnowledgeCategory) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Categorías
        </CardTitle>
        <Button onClick={onCreateCategory} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCategory(category)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">
                    {category.article_count} artículos
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// FAQ Component
export function KnowledgeFAQ({ 
  faqs, 
  onCreateFAQ, 
  onEditFAQ, 
  onDeleteFAQ 
}: {
  faqs: FAQ[];
  onCreateFAQ: () => void;
  onEditFAQ: (faq: FAQ) => void;
  onDeleteFAQ: (faq: FAQ) => void;
}) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const featuredFAQs = faqs.filter(faq => faq.is_featured);
  const regularFAQs = faqs.filter(faq => !faq.is_featured);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Preguntas Frecuentes
        </CardTitle>
        <Button onClick={onCreateFAQ} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva FAQ
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Featured FAQs */}
        {featuredFAQs.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Destacadas
            </h4>
            <div className="space-y-2">
              {featuredFAQs.map((faq) => (
                <Card key={faq.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <h5 className="font-medium">{faq.question}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.views} vistas
                        </Badge>
                        <Button variant="ghost" size="sm">
                          {expandedFAQ === faq.id ? '−' : '+'}
                        </Button>
                      </div>
                    </div>
                    
                    {expandedFAQ === faq.id && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          {faq.answer}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditFAQ(faq);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFAQ(faq);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular FAQs */}
        {regularFAQs.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Todas las Preguntas</h4>
            <div className="space-y-2">
              {regularFAQs.map((faq) => (
                <Card key={faq.id}>
                  <CardContent className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <h5 className="font-medium">{faq.question}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.views} vistas
                        </Badge>
                        <Button variant="ghost" size="sm">
                          {expandedFAQ === faq.id ? '−' : '+'}
                        </Button>
                      </div>
                    </div>
                    
                    {expandedFAQ === faq.id && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          {faq.answer}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditFAQ(faq);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFAQ(faq);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {faqs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay preguntas frecuentes</p>
            <Button onClick={onCreateFAQ} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera FAQ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Knowledge Stats Component
export function KnowledgeStats({ 
  articles, 
  categories, 
  faqs 
}: {
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
  faqs: FAQ[];
}) {
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const featuredArticles = articles.filter(a => a.is_featured).length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Artículos Publicados</p>
              <p className="text-3xl font-bold text-foreground">{publishedArticles}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Vistas</p>
              <p className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categorías</p>
              <p className="text-3xl font-bold text-foreground">{categories.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl">
              <Archive className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Borradores</p>
              <p className="text-3xl font-bold text-foreground">{draftArticles}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl">
              <Edit className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Search and Filter Component
export function KnowledgeSearchFilter({ 
  onSearch, 
  onCategoryFilter, 
  onStatusFilter,
  categories 
}: {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onStatusFilter: (status: string) => void;
  categories: KnowledgeCategory[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    onCategoryFilter(category);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    onStatusFilter(status);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Búsqueda y Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos, categorías, etiquetas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}