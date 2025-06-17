import { ObjectId } from 'mongodb';

// Frontend config interface
export interface Config {
  nextShopDate?: Date;
}

// Database document structure for config
export interface ConfigDocument {
  _id?: ObjectId;
  name: string; // e.g., 'nextShopDate'
  value: any; // The actual value (Date, string, number, etc.)
  createdAt: Date;
  updatedAt: Date;
}

// API request types
export interface UpdateConfigRequest {
  name: string;
  value: any;
}

export interface ConfigResponse {
  success: boolean;
  data?: Config;
  error?: string;
}

// Convert MongoDB documents to frontend Config
export function documentsToConfig(docs: ConfigDocument[]): Config {
  const config: Config = {};
  
  docs.forEach(doc => {
    if (doc.name === 'nextShopDate' && doc.value) {
      config.nextShopDate = new Date(doc.value);
    }
  });
  
  return config;
} 