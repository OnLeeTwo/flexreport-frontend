export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface Template {
  id: number
  name: string
  table_name: string
  columns: string[]
  filters: Record<string, any>
}

export interface Column {
  column_name: string
  data_type: 'text' | 'bigint' | 'boolean' | 'date'
}
