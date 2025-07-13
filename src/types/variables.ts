export interface Variable {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  description?: string;
}

export interface Condition {
  id: string;
  variable: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: any;
  action: ConditionalAction;
}

export interface ConditionalAction {
  type: 'show' | 'hide' | 'animate' | 'trigger';
  targetId: string;
  parameters?: any;
}