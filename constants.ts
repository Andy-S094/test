
import { CheckItem, CheckStatus } from './types';

export const DEFAULT_CHECK_ITEMS: CheckItem[] = [
  {
    id: 'rebar_size',
    label: '1.鋼筋尺寸、支數',
    standard: '查驗鋼筋規格與設計圖說是否相符',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：#10，22支）'
  },
  {
    id: 'coupler',
    label: '2.續接器位置與扭力值',
    standard: '查驗續接位置及扭力扳手實測值',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：550 kgf-cm）'
  },
  {
    id: 'stirrup_spacing',
    label: '3.箍筋號數與間距',
    standard: '查驗箍筋號數、間距及彎鉤角度',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：#4 @ 15cm）'
  },
  {
    id: 'first_stirrup',
    label: '4.柱箍筋第一支位置',
    standard: '第一支箍筋應於版面起算 5cm 內',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：5 cm）'
  },
  {
    id: 'wire_binding',
    label: '5.鐵絲綁紮間距',
    standard: '鐵絲綁紮是否牢固、間距是否符合規範',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：每二個節點以20號鐵絲捆紮）'
  },
  {
    id: 'concrete_cover',
    label: '6.保護層',
    standard: '墊塊配置是否充足，確保保護層厚度',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：5 cm）'
  },
  {
    id: 'joint_stirrup',
    label: '7.柱樑接頭箍筋',
    standard: '接頭內箍筋是否依圖說配置確實',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：#4 @10cm）'
  },
  {
    id: 'anchor_depth',
    label: '8.植筋深度',
    standard: '植筋孔位清理及深度是否符合設計要求',
    status: CheckStatus.OK,
    result: '',
    remark: '',
    placeholder: '請輸入檢查數據或內容(如：15cm）'
  }
];

export const SPACING_THRESHOLD = 15; // 範例標準間距 (cm)
