
import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import TriggerForm from './TriggerForm';
import { Trigger } from '../types/trigger';

interface TriggerManagerProps {
  triggers: Trigger[];
  loading: boolean;
  showAddForm: boolean;
  onAddTrigger: (trigger: Omit<Trigger, 'id' | 'createdAt' | 'lastUsed'>) => void;
  onUpdateTrigger: (id: string, updates: Partial<Trigger>) => void;
  onDeleteTrigger: (id: string) => void;
  onCloseForm: () => void;
}

const TriggerManager: React.FC<TriggerManagerProps> = ({
  triggers,
  loading,
  showAddForm,
  onAddTrigger,
  onUpdateTrigger,
  onDeleteTrigger,
  onCloseForm,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Trigger>>({});

  const handleEdit = (trigger: Trigger) => {
    setEditingId(trigger.id);
    setEditForm({
      triggerText: trigger.triggerText,
      responseText: trigger.responseText,
      isActive: trigger.isActive,
    });
  };

  const handleSave = () => {
    if (editingId && editForm.triggerText && editForm.responseText) {
      onUpdateTrigger(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const toggleActive = (trigger: Trigger) => {
    onUpdateTrigger(trigger.id, { isActive: !trigger.isActive });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAddForm && (
        <TriggerForm
          onSubmit={onAddTrigger}
          onCancel={onCloseForm}
        />
      )}

      {triggers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum gatilho configurado</h3>
          <p className="text-gray-500 mb-4">Comece criando seu primeiro gatilho para automação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                trigger.isActive 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              {editingId === trigger.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gatilho
                    </label>
                    <Input
                      value={editForm.triggerText || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, triggerText: e.target.value }))}
                      placeholder="Ex: #PEDIDO123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resposta
                    </label>
                    <Textarea
                      value={editForm.responseText || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, responseText: e.target.value }))}
                      placeholder="Mensagem de resposta automática"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editForm.isActive || false}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <span className="text-sm text-gray-600">Ativo</span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={trigger.isActive ? "default" : "secondary"}
                        className={trigger.isActive ? "bg-green-600" : ""}
                      >
                        {trigger.triggerText}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(trigger)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          {trigger.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-xs text-gray-500">
                          {trigger.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(trigger)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteTrigger(trigger.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{trigger.responseText}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Usado {trigger.usageCount} vezes</span>
                    <span>Criado em {new Date(trigger.createdAt).toLocaleDateString()}</span>
                    {trigger.lastUsed && (
                      <span>Último uso: {new Date(trigger.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TriggerManager;
