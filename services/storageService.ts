
import { InspectionRecord } from '../types';

const STORAGE_KEY = 'site_check_pro_records';

export const storageService = {
  saveRecord: (record: InspectionRecord) => {
    const existing = storageService.getAllRecords();
    const updated = [record, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  getAllRecords: (): InspectionRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  getRecordById: (id: string): InspectionRecord | undefined => {
    return storageService.getAllRecords().find(r => r.id === id);
  },
  deleteRecord: (id: string) => {
    const existing = storageService.getAllRecords();
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
