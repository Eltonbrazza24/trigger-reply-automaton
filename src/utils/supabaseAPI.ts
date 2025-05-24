
import { supabase } from '@/integrations/supabase/client';
import { Trigger } from '../types/trigger';

export const supabaseAPI = {
  // Listar todos os gatilhos
  async getTriggers(): Promise<Trigger[]> {
    const { data, error } = await supabase
      .from('triggers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar gatilhos:', error);
      throw new Error('Falha ao carregar gatilhos');
    }

    return data || [];
  },

  // Buscar resposta por gatilho (usado pelo app Android)
  async getResponse(trigger: string): Promise<{ response: string; found: boolean }> {
    const { data, error } = await supabase
      .from('triggers')
      .select('*')
      .eq('trigger_text', trigger.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar gatilho:', error);
      throw new Error('Erro ao buscar resposta');
    }

    if (!data) {
      return {
        response: 'Gatilho não encontrado ou inativo.',
        found: false,
      };
    }

    // Incrementa contador de uso
    await supabase
      .from('triggers')
      .update({ 
        usage_count: data.usage_count + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', data.id);

    return {
      response: data.response_text,
      found: true,
    };
  },

  // Criar novo gatilho
  async createTrigger(data: Omit<Trigger, 'id' | 'createdAt' | 'lastUsed'>): Promise<Trigger> {
    const { data: newTrigger, error } = await supabase
      .from('triggers')
      .insert({
        trigger_text: data.triggerText.toUpperCase(),
        response_text: data.responseText,
        is_active: data.isActive,
        usage_count: data.usageCount || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Gatilho já existe');
      }
      console.error('Erro ao criar gatilho:', error);
      throw new Error('Falha ao criar gatilho');
    }

    return {
      id: newTrigger.id,
      triggerText: newTrigger.trigger_text,
      responseText: newTrigger.response_text,
      isActive: newTrigger.is_active,
      usageCount: newTrigger.usage_count,
      createdAt: newTrigger.created_at,
      lastUsed: newTrigger.last_used,
    };
  },

  // Atualizar gatilho
  async updateTrigger(id: string, updates: Partial<Trigger>): Promise<Trigger> {
    const updateData: any = {};
    
    if (updates.triggerText) updateData.trigger_text = updates.triggerText.toUpperCase();
    if (updates.responseText) updateData.response_text = updates.responseText;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.usageCount !== undefined) updateData.usage_count = updates.usageCount;

    const { data, error } = await supabase
      .from('triggers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Gatilho já existe');
      }
      console.error('Erro ao atualizar gatilho:', error);
      throw new Error('Falha ao atualizar gatilho');
    }

    if (!data) {
      throw new Error('Gatilho não encontrado');
    }

    return {
      id: data.id,
      triggerText: data.trigger_text,
      responseText: data.response_text,
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      lastUsed: data.last_used,
    };
  },

  // Deletar gatilho
  async deleteTrigger(id: string): Promise<void> {
    const { error } = await supabase
      .from('triggers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar gatilho:', error);
      throw new Error('Falha ao remover gatilho');
    }
  },

  // Estatísticas
  async getStats() {
    const { data, error } = await supabase
      .from('triggers')
      .select('is_active, usage_count');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }

    const totalTriggers = data.length;
    const activeTriggers = data.filter(t => t.is_active).length;
    const totalResponses = data.reduce((acc, t) => acc + t.usage_count, 0);
    const averageUsage = totalTriggers > 0 ? totalResponses / totalTriggers : 0;

    return {
      totalTriggers,
      activeTriggers,
      totalResponses,
      averageUsage,
    };
  },
};

// API para o app Android verificar gatilhos
export const androidAPI = {
  async checkTrigger(message: string): Promise<{ response?: string; found: boolean }> {
    // Extrai gatilhos da mensagem (palavras que começam com #)
    const triggerMatch = message.match(/#\w+/g);
    
    if (!triggerMatch) {
      return { found: false };
    }

    // Verifica cada gatilho encontrado
    for (const trigger of triggerMatch) {
      const result = await supabaseAPI.getResponse(trigger);
      if (result.found) {
        return {
          response: result.response,
          found: true,
        };
      }
    }

    return { found: false };
  },
};

console.log('Supabase API inicializada');
