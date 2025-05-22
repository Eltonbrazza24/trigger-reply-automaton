
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trigger } from '../types/trigger';

interface TriggerFormProps {
  onSubmit: (trigger: Omit<Trigger, 'id' | 'createdAt' | 'lastUsed'>) => void;
  onCancel: () => void;
}

const TriggerForm: React.FC<TriggerFormProps> = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    triggerText: '',
    responseText: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.triggerText.trim()) {
      newErrors.triggerText = 'Gatilho é obrigatório';
    } else if (!form.triggerText.startsWith('#')) {
      newErrors.triggerText = 'Gatilho deve começar com #';
    }

    if (!form.responseText.trim()) {
      newErrors.responseText = 'Resposta é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        triggerText: form.triggerText.trim(),
        responseText: form.responseText.trim(),
        isActive: form.isActive,
        usageCount: 0,
      });
      setForm({ triggerText: '', responseText: '', isActive: true });
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-lg">Novo Gatilho</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gatilho *
            </label>
            <Input
              value={form.triggerText}
              onChange={(e) => setForm(prev => ({ ...prev, triggerText: e.target.value }))}
              placeholder="Ex: #PEDIDO123, #SUPORTE, #INFO"
              className={errors.triggerText ? 'border-red-500' : ''}
            />
            {errors.triggerText && (
              <p className="text-red-500 text-xs mt-1">{errors.triggerText}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              O gatilho deve começar com # seguido do código
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resposta Automática *
            </label>
            <Textarea
              value={form.responseText}
              onChange={(e) => setForm(prev => ({ ...prev, responseText: e.target.value }))}
              placeholder="Digite a mensagem que será enviada automaticamente..."
              rows={4}
              className={errors.responseText ? 'border-red-500' : ''}
            />
            {errors.responseText && (
              <p className="text-red-500 text-xs mt-1">{errors.responseText}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
            />
            <span className="text-sm text-gray-600">Ativar gatilho imediatamente</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Gatilho
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TriggerForm;
