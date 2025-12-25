
export enum CheckStatus {
  OK = '○',
  FAIL = '╳',
  NA = '/'
}

export enum InspectionTiming {
  DURING = '施工中檢查',
  HOLD_POINT = '查驗停留點',
  POST = '施工完成檢查'
}

export interface CheckItem {
  id: string;
  label: string;
  standard: string;
  status: CheckStatus;
  result: string;
  remark: string;
  placeholder?: string; // Specific hint for the result input
}

export interface InspectionRecord {
  id: string;
  timestamp: string;
  location: string;
  stage: InspectionTiming;
  items: CheckItem[];
  photos: {
    panorama: string[];
    detail: string[];
  };
  signatures: {
    engineer?: string;
  };
  aiAnalysis?: string;
}

export interface AppState {
  records: InspectionRecord[];
}
