
export interface Trigger {
  id: string;
  triggerText: string;
  responseText: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  lastUsed?: string;
}

export interface TriggerResponse {
  response: string;
  found: boolean;
}

export interface CreateTriggerRequest {
  triggerText: string;
  responseText: string;
  isActive: boolean;
}
