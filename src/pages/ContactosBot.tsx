import { useState, useMemo } from 'react';
import { Plus, Search, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactList } from '@/components/contacts/ContactList';
import { useBotContacts, BotContact } from '@/hooks/useBotContacts';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactosBot() {
  const { contacts, loading, createContact, updateContact, deleteContact } = useBotContacts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<BotContact | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const handleCreate = () => {
    setEditingContact(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: BotContact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: { name: string; phone: string }) => {
    if (editingContact) {
      await updateContact(editingContact.id, data);
    } else {
      await createContact(data);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contactos del Bot</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona los contactos para tu bot de WhatsApp
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No se encontraron contactos' : 'No hay contactos registrados'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer contacto
                </Button>
              )}
            </div>
          ) : (
            <ContactList
              contacts={filteredContacts}
              onEdit={handleEdit}
              onDelete={deleteContact}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            contact={editingContact}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
