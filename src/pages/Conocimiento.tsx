import React, { useState } from 'react';
import { KnowledgeBaseList } from '@/components/knowledge/KnowledgeBaseList';
import { KnowledgeBaseForm } from '@/components/knowledge/KnowledgeBaseForm';
import { KnowledgeBaseDetail } from '@/components/knowledge/KnowledgeBaseDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useKnowledgeBase, KnowledgeBaseEntry } from '@/hooks/useKnowledgeBase';

export default function Conocimiento() {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<KnowledgeBaseEntry | null>(null);
  
  const { 
    entries, 
    isLoading, 
    isSaving, 
    createEntry, 
    updateEntry, 
    deleteEntry 
  } = useKnowledgeBase();

  const handleCreateNew = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEdit = (entry: KnowledgeBaseEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleView = (entry: KnowledgeBaseEntry) => {
    setViewingEntry(entry);
    setShowDetail(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, formData);
      } else {
        await createEntry(formData);
      }
      
      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving knowledge base entry:', error);
    }
  };

  const handleDelete = async (entry: KnowledgeBaseEntry) => {
    try {
      await deleteEntry(entry.id);
    } catch (error) {
      console.error('Error deleting knowledge base entry:', error);
    }
  };

  const handleEditFromDetail = () => {
    if (viewingEntry) {
      setEditingEntry(viewingEntry);
      setShowDetail(false);
      setShowForm(true);
    }
  };

  return (
    <>
      {showDetail && viewingEntry ? (
        <KnowledgeBaseDetail
          entry={viewingEntry}
          onEdit={handleEditFromDetail}
          onBack={() => {
            setShowDetail(false);
            setViewingEntry(null);
          }}
        />
      ) : (
        <KnowledgeBaseList
          entries={entries}
          isLoading={isLoading}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <KnowledgeBaseForm
            initialData={editingEntry || undefined}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}