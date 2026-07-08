import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotContact } from '@/hooks/useBotContacts';

interface ContactFormProps {
  contact?: BotContact;
  onSubmit: (data: { name: string; phone: string }) => Promise<void>;
  onCancel: () => void;
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      return;
    }

    if (!validatePhone(phone)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), phone: phone.trim() });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del contacto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Número de teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+52 123 456 7890"
          required
          pattern="[\d\s\+\-\(\)]+"
        />
        <p className="text-xs text-muted-foreground">
          Incluye código de país (ej: +52 para México)
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : contact ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
