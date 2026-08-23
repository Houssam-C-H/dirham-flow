import type { StorageAdapter, AppStateData } from './StorageAdapter';
import { ApiClient } from '../api/ApiClient';
import { INITIAL_DEMO_DATA } from './LocalStorageAdapter';

export class ApiAdapter implements StorageAdapter {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || new ApiClient();
  }

  /**
   * Hydrates state via API action endpoint POST /api/v1/state/sync
   */
  async loadState(): Promise<AppStateData> {
    const res = await this.client.post<AppStateData>('/state/sync', { timestamp: new Date().toISOString() });
    if (res.success && res.data) {
      return res.data;
    }
    console.warn('ApiAdapter loadState failed, using fallback demo state:', res.message);
    return INITIAL_DEMO_DATA;
  }

  /**
   * Persists full state snapshot via API action endpoint POST /api/v1/state/save
   */
  async saveState(state: AppStateData): Promise<void> {
    const res = await this.client.post('/state/save', state);
    if (!res.success) {
      console.error('ApiAdapter saveState failed:', res.message);
    }
  }

  /**
   * Resets server state via API action endpoint POST /api/v1/state/reset
   */
  async resetToDemoData(): Promise<AppStateData> {
    const res = await this.client.post<AppStateData>('/state/reset', {});
    if (res.success && res.data) {
      return res.data;
    }
    return INITIAL_DEMO_DATA;
  }
}
