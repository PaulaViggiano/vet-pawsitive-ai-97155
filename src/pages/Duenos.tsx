import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOwners, Owner } from '@/hooks/useOwners';
import { OwnerFormDialog } from '@/components/owners/OwnerFormDialog';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  PawPrint,
  Heart,
  User,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

export default function Duenos() {
  const { owners, loading, saving, createOwner, updateOwner, deleteOwner } = useOwners();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  
  const highlightedOwnerId = searchParams.get('highlight');
  
  useEffect(() => {
    if (highlightedOwnerId && !loading) {
      const element = document.getElementById(`owner-${highlightedOwnerId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setSearchParams({});
        }, 2000);
      }
    }
  }, [highlightedOwnerId, loading, setSearchParams]);

  const handleCreateOwner = () => {
    setSelectedOwner(undefined);
    setFormDialogOpen(true);
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (owner: Owner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ownerToDelete) {
      await deleteOwner(ownerToDelete.id);
      setDeleteDialogOpen(false);
      setOwnerToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedOwner) {
      return await updateOwner(selectedOwner.id, formData);
    } else {
      return await createOwner(formData);
    }
  };

  const handleNavigateToPet = (mascotaId: string) => {
    navigate(`/pacientes?highlight=${mascotaId}`);
  };
  
  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.phone?.includes(searchQuery) ||
    owner.mascotas?.some(m => m.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dueños</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-lg capitalize">Gestiona la información</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {owners.length} Dueños
          </Badge>
          <Button onClick={handleCreateOwner}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Dueño
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email, teléfono o mascota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Owners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOwners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOwners.map((owner) => (
            <Card 
              key={owner.id} 
              id={`owner-${owner.id}`}
              className={`hover:shadow-lg transition-all ${
                highlightedOwnerId === owner.id ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{owner.name}</CardTitle>
                    {owner.relationship && (
                      <Badge variant="outline" className="mt-1">
                        {owner.relationship}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOwner(owner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(owner)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {owner.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{owner.phone}</span>
                    </div>
                  )}
                  {owner.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                  )}
                  {owner.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{owner.address}</span>
                    </div>
                  )}
                </div>

                {/* Mascotas */}
                {owner.mascotas && owner.mascotas.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mascotas ({owner.mascotas.length})</span>
                    </div>
                    <div className="space-y-1">
                      {owner.mascotas.map((mascota) => (
                        <button
                          key={mascota.id}
                          onClick={() => handleNavigateToPet(mascota.id)}
                          className="w-full flex items-center gap-2 text-sm p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="font-medium text-primary hover:underline">{mascota.nombre}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground capitalize">{mascota.especie}</span>
                          {mascota.es_principal && (
                            <Heart className="h-3 w-3 text-red-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron dueños</p>
          </CardContent>
        </Card>
      )}

      <OwnerFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        owner={selectedOwner}
        saving={saving}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {ownerToDelete?.name} de la base de datos.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
