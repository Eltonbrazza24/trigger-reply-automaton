
import { Trigger } from '../types/trigger';

// Simulação de banco de dados local
let triggerDatabase: Trigger[] = [
  {
    id: '1',
    triggerText: '#PEDIDO123',
    responseText: 'Olá! Seu pedido #123 está sendo preparado e será entregue em até 30 minutos. Obrigado pela preferência! 🍕',
    isActive: true,
    usageCount: 15,
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-05-20T14:22:00Z',
  },
  {
    id: '2',
    triggerText: '#SUPORTE',
    responseText: 'Olá! Recebi sua mensagem e nossa equipe de suporte entrará em contato em até 1 hora. Para urgências, ligue: (11) 99999-9999 📞',
    isActive: true,
    usageCount: 8,
    createdAt: '2024-02-10T09:15:00Z',
    lastUsed: '2024-05-21T11:45:00Z',
  },
  {
    id: '3',
    triggerText: '#HORARIO',
    responseText: 'Nosso horário de funcionamento:\n\n🕐 Segunda a Sexta: 9h às 18h\n🕐 Sábado: 9h às 14h\n🕐 Domingo: Fechado\n\nEstamos ansiosos para atendê-lo!',
    isActive: true,
    usageCount: 23,
    createdAt: '2024-03-05T16:20:00Z',
    lastUsed: '2024-05-22T08:30:00Z',
  },
  {
    id: '4',
    triggerText: '#CARDAPIO',
    responseText: 'Confira nosso cardápio completo em: www.exemplo.com/cardapio\n\nDestaques do dia:\n🍕 Pizza Margherita - R$ 35\n🍔 Hambúrguer Artesanal - R$ 28\n🥤 Bebidas a partir de R$ 8',
    isActive: false,
    usageCount: 5,
    createdAt: '2024-04-12T13:10:00Z',
  },
];

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAPI = {
  // Listar todos os gatilhos
  async getTriggers(): Promise<Trigger[]> {
    await delay(500);
    return [...triggerDatabase].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Buscar resposta por gatilho (usado pelo app Android)
  async getResponse(trigger: string): Promise<{ response: string; found: boolean }> {
    await delay(200);
    const foundTrigger = triggerDatabase.find(
      t => t.triggerText.toLowerCase() === trigger.toLowerCase() && t.isActive
    );

    if (foundTrigger) {
      // Incrementa contador de uso
      foundTrigger.usageCount++;
      foundTrigger.lastUsed = new Date().toISOString();
      
      return {
        response: foundTrigger.responseText,
        found: true,
      };
    }

    return {
      response: 'Gatilho não encontrado ou inativo.',
      found: false,
    };
  },

  // Criar novo gatilho
  async createTrigger(data: Omit<Trigger, 'id' | 'createdAt' | 'lastUsed'>): Promise<Trigger> {
    await delay(300);
    
    // Verifica se o gatilho já existe
    const exists = triggerDatabase.some(
      t => t.triggerText.toLowerCase() === data.triggerText.toLowerCase()
    );
    
    if (exists) {
      throw new Error('Gatilho já existe');
    }

    const newTrigger: Trigger = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    triggerDatabase.push(newTrigger);
    return newTrigger;
  },

  // Atualizar gatilho
  async updateTrigger(id: string, updates: Partial<Trigger>): Promise<Trigger> {
    await delay(300);
    
    const index = triggerDatabase.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Gatilho não encontrado');
    }

    // Verifica se o novo texto do gatilho já existe em outro registro
    if (updates.triggerText) {
      const exists = triggerDatabase.some(
        t => t.id !== id && t.triggerText.toLowerCase() === updates.triggerText!.toLowerCase()
      );
      
      if (exists) {
        throw new Error('Gatilho já existe');
      }
    }

    triggerDatabase[index] = { ...triggerDatabase[index], ...updates };
    return triggerDatabase[index];
  },

  // Deletar gatilho
  async deleteTrigger(id: string): Promise<void> {
    await delay(300);
    
    const index = triggerDatabase.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Gatilho não encontrado');
    }

    triggerDatabase.splice(index, 1);
  },

  // Estatísticas (para uso futuro)
  async getStats() {
    await delay(200);
    return {
      totalTriggers: triggerDatabase.length,
      activeTriggers: triggerDatabase.filter(t => t.isActive).length,
      totalResponses: triggerDatabase.reduce((acc, t) => acc + t.usageCount, 0),
      averageUsage: triggerDatabase.length > 0 
        ? triggerDatabase.reduce((acc, t) => acc + t.usageCount, 0) / triggerDatabase.length 
        : 0,
    };
  },
};

// Endpoint simulado para o app Android
export const androidAPI = {
  async checkTrigger(message: string): Promise<{ response?: string; found: boolean }> {
    // Extrai gatilhos da mensagem (palavras que começam com #)
    const triggerMatch = message.match(/#\w+/g);
    
    if (!triggerMatch) {
      return { found: false };
    }

    // Verifica cada gatilho encontrado
    for (const trigger of triggerMatch) {
      const result = await mockAPI.getResponse(trigger);
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

console.log('Mock API inicializada com', triggerDatabase.length, 'gatilhos');
