
import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TriggerManager from './TriggerManager';
import StatsCard from './StatsCard';
import { mockAPI } from '../utils/mockAPI';
import { Trigger } from '../types/trigger';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTriggers();
  }, []);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const data = await mockAPI.getTriggers();
      setTriggers(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar gatilhos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrigger = async (triggerData: Omit<Trigger, 'id' | 'createdAt' | 'lastUsed'>) => {
    try {
      const newTrigger = await mockAPI.createTrigger(triggerData);
      setTriggers(prev => [newTrigger, ...prev]);
      setShowAddForm(false);
      toast({
        title: "Sucesso",
        description: "Gatilho criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar gatilho",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTrigger = async (id: string, updates: Partial<Trigger>) => {
    try {
      const updatedTrigger = await mockAPI.updateTrigger(id, updates);
      setTriggers(prev => prev.map(t => t.id === id ? updatedTrigger : t));
      toast({
        title: "Sucesso",
        description: "Gatilho atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar gatilho",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    try {
      await mockAPI.deleteTrigger(id);
      setTriggers(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Gatilho removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover gatilho",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalTriggers: triggers.length,
    activeTriggers: triggers.filter(t => t.isActive).length,
    totalResponses: triggers.reduce((acc, t) => acc + t.usageCount, 0),
    successRate: 98.5
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Automaton</h1>
            <p className="text-gray-600">Dashboard de Respostas Automáticas</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Gatilhos"
          value={stats.totalTriggers}
          icon={Settings}
          color="blue"
        />
        <StatsCard
          title="Gatilhos Ativos"
          value={stats.activeTriggers}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Respostas Enviadas"
          value={stats.totalResponses}
          icon={MessageSquare}
          color="purple"
        />
        <StatsCard
          title="Taxa de Sucesso"
          value={`${stats.successRate}%`}
          icon={Activity}
          color="emerald"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trigger Manager */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Gatilhos</CardTitle>
                  <CardDescription>
                    Configure os gatilhos e suas respostas automáticas
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Gatilho
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TriggerManager
                triggers={triggers}
                loading={loading}
                showAddForm={showAddForm}
                onAddTrigger={handleAddTrigger}
                onUpdateTrigger={handleUpdateTrigger}
                onDeleteTrigger={handleDeleteTrigger}
                onCloseForm={() => setShowAddForm(false)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Serviço Android</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Ativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WhatsApp Business</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Conectado</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Dashboard</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruções de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>1.</strong> Ative o serviço em Configurações > Acessibilidade
                </p>
                <p>
                  <strong>2.</strong> Configure os gatilhos com # (ex: #PEDIDO123)
                </p>
                <p>
                  <strong>3.</strong> O app irá responder automaticamente quando detectar os gatilhos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
