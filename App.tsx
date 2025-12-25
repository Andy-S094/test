
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  ChevronLeft, 
  Save, 
  Camera, 
  AlertTriangle,
  FileText,
  Trash2,
  Sparkles,
  Share2,
  X
} from 'lucide-react';
import { 
  CheckStatus, 
  InspectionTiming, 
  InspectionRecord, 
  CheckItem 
} from './types';
import { DEFAULT_CHECK_ITEMS } from './constants';
import { storageService } from './services/storageService';
import { getAIReview } from './services/geminiService';
import { SignaturePad } from './components/SignaturePad';

type View = 'dashboard' | 'form' | 'history' | 'view-record';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState<InspectionTiming>(InspectionTiming.POST);
  const [items, setItems] = useState<CheckItem[]>(DEFAULT_CHECK_ITEMS);
  const [panoramaList, setPanoramaList] = useState<string[]>([]);
  const [detailList, setDetailList] = useState<string[]>([]);
  const [engineerSign, setEngineerSign] = useState('');

  useEffect(() => {
    setRecords(storageService.getAllRecords());
  }, []);

  const resetForm = () => {
    setLocation('');
    setStage(InspectionTiming.POST);
    setItems(DEFAULT_CHECK_ITEMS.map(i => ({ ...i, status: CheckStatus.OK, result: '', remark: '' })));
    setPanoramaList([]);
    setDetailList([]);
    setEngineerSign('');
    setIsSubmitting(false);
  };

  const handleCreateNew = () => {
    resetForm();
    setCurrentView('form');
  };

  const handleSaveRecord = async () => {
    if (!location) {
      alert('請填寫檢查位置');
      return;
    }

    setIsSubmitting(true);
    
    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-TW'),
      location,
      stage,
      items,
      photos: {
        panorama: panoramaList,
        detail: detailList
      },
      signatures: {
        engineer: engineerSign
      }
    };

    // Auto AI Review if there are failures
    if (items.some(i => i.status === CheckStatus.FAIL)) {
      setAiLoading(true);
      newRecord.aiAnalysis = await getAIReview(newRecord);
      setAiLoading(false);
    }

    storageService.saveRecord(newRecord);
    setRecords(storageService.getAllRecords());
    setIsSubmitting(false);
    setCurrentView('dashboard');
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemStatus = (id: string, status: CheckStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const updateItemResult = (id: string, result: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, result } : item));
  };

  const updateItemRemark = (id: string, remark: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, remark } : item));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此紀錄嗎？')) {
      storageService.deleteRecord(id);
      setRecords(storageService.getAllRecords());
      if (selectedRecordId === id) setCurrentView('dashboard');
    }
  };

  const selectedRecord = selectedRecordId ? storageService.getRecordById(selectedRecordId) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-lg mx-auto shadow-xl relative print-container">
      {/* Header - Hidden on print */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md no-print">
        {currentView !== 'dashboard' ? (
          <button onClick={() => setCurrentView('dashboard')} className="p-1 hover:bg-blue-700 rounded-full">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-6" />
        )}
        <h1 className="text-lg font-bold tracking-tight">
          {currentView === 'dashboard' && '首頁看板'}
          {currentView === 'form' && '新增自主檢查'}
          {currentView === 'history' && '歷史查驗紀錄'}
          {currentView === 'view-record' && '查驗詳情'}
        </h1>
        <div className="w-6" />
      </header>

      {/* Main Content */}
      <main className="p-4">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <FileText size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-800">{records.length}</div>
                <div className="text-xs text-gray-500">總查驗件數</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {records.filter(r => r.items.some(i => i.status === CheckStatus.FAIL)).length}
                </div>
                <div className="text-xs text-gray-500">待改善項目</div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">快速功能</h2>
              <button 
                onClick={handleCreateNew}
                className="w-full flex items-center justify-between bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle size={24} />
                  <span className="font-medium">開始新鋼筋查驗</span>
                </div>
                <ChevronLeft className="rotate-180" size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">最近紀錄</h2>
                <button onClick={() => setCurrentView('history')} className="text-sm text-blue-600 font-medium">查看全部</button>
              </div>
              <div className="space-y-3">
                {records.slice(0, 3).map(record => (
                  <div 
                    key={record.id}
                    onClick={() => { setSelectedRecordId(record.id); setCurrentView('view-record'); }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer active:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{record.location}</div>
                      <div className="text-xs text-gray-500">{record.timestamp}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.items.some(i => i.status === CheckStatus.FAIL) ? (
                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold">不合格</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold">合格</span>
                      )}
                      <ChevronLeft className="rotate-180 text-gray-400" size={16} />
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm italic">尚無查驗紀錄</div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-center text-blue-800 py-2 border-b-4 border-blue-600 mb-2">柱筋施工自主檢查表</h2>
            
            {/* Basic Info */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <h3 className="font-bold text-gray-800 border-b pb-2">基本資訊</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">檢查位置</label>
                  <input 
                    type="text" 
                    placeholder="例如: 1F 柱 C1-C5"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">檢查時機</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.values(InspectionTiming).map(s => (
                      <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={`py-2 px-1 text-center text-[10px] rounded-lg border transition-colors leading-tight min-h-[44px] flex items-center justify-center ${stage === s ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Checklist */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <h3 className="font-bold text-gray-800 border-b pb-2">檢查項目</h3>
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="space-y-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[60%]">
                        <div className="font-bold text-sm text-gray-800">{item.label}</div>
                        <div className="text-[10px] text-gray-500 leading-tight">{item.standard}</div>
                      </div>
                      <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        {[CheckStatus.OK, CheckStatus.FAIL, CheckStatus.NA].map(status => (
                          <button
                            key={status}
                            onClick={() => updateItemStatus(item.id, status)}
                            className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-all ${
                              item.status === status 
                                ? status === CheckStatus.OK ? 'bg-green-500 text-white' : status === CheckStatus.FAIL ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Inspection Result Input */}
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0">檢查結果</div>
                      <input 
                        type="text" 
                        placeholder={item.placeholder || "請輸入數據或說明"}
                        className="flex-1 text-xs p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50/50"
                        value={item.result}
                        onChange={(e) => updateItemResult(item.id, e.target.value)}
                      />
                    </div>

                    {item.status === CheckStatus.FAIL && (
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded shrink-0">不合備註</div>
                        <input 
                          type="text" 
                          placeholder="請詳述不合格原因..."
                          className="flex-1 text-xs p-2 border border-red-200 rounded-lg bg-red-50 text-red-700 outline-none"
                          value={item.remark}
                          onChange={(e) => updateItemRemark(item.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Photos */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4 border border-gray-100">
              <h3 className="font-bold text-gray-800 border-b pb-2">多媒體附件</h3>
              
              <div className="space-y-4">
                {/* Panorama Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 block">全景照 (可多張)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {panoramaList.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removePhoto(idx, setPanoramaList)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer active:bg-gray-200">
                      <Camera className="text-gray-400" size={24} />
                      <span className="text-[10px] text-gray-500 mt-1">新增全景</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleMultipleFilesChange(e, setPanoramaList)} />
                    </label>
                  </div>
                </div>

                {/* Detail Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 block">細部照 (可多張，捲尺測量)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {detailList.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removePhoto(idx, setDetailList)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer active:bg-gray-200">
                      <Camera className="text-gray-400" size={24} />
                      <span className="text-[10px] text-gray-500 mt-1">新增細部</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleMultipleFilesChange(e, setDetailList)} />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Signatures */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 border-b pb-2">電子簽名</h3>
              <SignaturePad label="現場工程師簽名" onSave={setEngineerSign} initialValue={engineerSign} />
            </section>

            <button
              onClick={handleSaveRecord}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 no-print ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? (
                '儲存中...'
              ) : (
                <>
                  <Save size={20} />
                  儲存查驗結果
                </>
              )}
            </button>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <History size={20} />
              <span className="text-sm">按時間排序，點擊查看完整報表</span>
            </div>
            {records.map(record => (
              <div 
                key={record.id}
                onClick={() => { setSelectedRecordId(record.id); setCurrentView('view-record'); }}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-2 h-10 rounded-full ${record.items.some(i => i.status === CheckStatus.FAIL) ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="font-bold text-gray-900">{record.location}</div>
                    <div className="text-xs text-gray-500">{record.timestamp}</div>
                    <div className="text-[10px] text-blue-600 mt-1">{record.stage}</div>
                  </div>
                </div>
                <ChevronLeft className="rotate-180 text-gray-300" size={20} />
              </div>
            ))}
            {records.length === 0 && (
              <div className="text-center py-20 text-gray-400">尚無歷史紀錄</div>
            )}
          </div>
        )}

        {currentView === 'view-record' && selectedRecord && (
          <div className="space-y-6 pb-12">
            {/* 僅列印顯示的報表頁首 */}
            <div className="print-only text-center border-b-2 border-blue-800 pb-4 mb-6">
              <h1 className="text-3xl font-black text-blue-800 mb-2">施工自主檢查報告</h1>
              <div className="flex justify-between text-sm text-gray-600 px-2 mt-4">
                <div className="text-left">
                  <p><strong>工程名稱：</strong>柱筋施工自主檢查</p>
                  <p><strong>查驗位置：</strong>{selectedRecord.location}</p>
                </div>
                <div className="text-right">
                  <p><strong>查驗時機：</strong>{selectedRecord.stage}</p>
                  <p><strong>查驗日期：</strong>{selectedRecord.timestamp}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 print-block">
              <div className="flex justify-between items-start">
                <div className="no-print">
                  <h2 className="text-2xl font-black text-blue-700">{selectedRecord.location}</h2>
                  <p className="text-sm text-gray-500 font-medium">{selectedRecord.timestamp}</p>
                </div>
                <div className="flex flex-col items-end gap-2 no-print">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{selectedRecord.stage}</span>
                  <button onClick={() => handleDelete(selectedRecord.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* 查驗結果清單 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 print:bg-transparent print:p-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 print:text-black">查驗清單與結果</h4>
                {selectedRecord.items.map(item => (
                  <div key={item.id} className="space-y-1 py-2 border-b border-gray-100 last:border-0 print:border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">{item.label}</span>
                      <span className={`font-black ${item.status === CheckStatus.OK ? 'text-green-600' : item.status === CheckStatus.FAIL ? 'text-red-600' : 'text-gray-400'}`}>
                        {item.status}
                      </span>
                    </div>
                    {item.result && (
                      <div className="text-xs bg-white px-2 py-1 rounded border border-gray-100 text-gray-600 italic print:bg-gray-50">
                        數據/結果：{item.result}
                      </div>
                    )}
                    {item.remark && (
                      <div className="text-[10px] text-red-500 font-medium bg-red-50 px-2 py-1 rounded print:bg-red-50">
                        異常備註：{item.remark}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI 改善建議 */}
              {selectedRecord.aiAnalysis && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 print:bg-gray-50 print:border-gray-200 print-block">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm print:text-black">
                    <Sparkles size={16} className="no-print" />
                    <span>AI 改善建議與技術指導</span>
                  </div>
                  <div className="text-xs text-indigo-900 leading-relaxed whitespace-pre-line print:text-black">
                    {selectedRecord.aiAnalysis}
                  </div>
                </div>
              )}

              {/* 多媒體附件區塊 */}
              <div className="space-y-4 print-block">
                {selectedRecord.photos.panorama.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase print:text-black">全景照片</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRecord.photos.panorama.map((img, i) => (
                        <img key={i} src={img} className="w-full aspect-video object-cover rounded-lg border shadow-sm print:shadow-none" />
                      ))}
                    </div>
                  </div>
                )}
                {selectedRecord.photos.detail.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase print:text-black">細部量測照片</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRecord.photos.detail.map((img, i) => (
                        <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg border shadow-sm print:shadow-none" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 簽名區塊 */}
              <div className="grid grid-cols-1 gap-3 border-t pt-6 print:mt-8">
                {selectedRecord.signatures.engineer && (
                  <div className="text-right pr-4">
                    <p className="text-sm font-bold text-gray-700 mb-2 print:text-black">現場工程師簽署：</p>
                    <img src={selectedRecord.signatures.engineer} className="max-h-20 ml-auto inline-block" />
                    <p className="text-[10px] text-gray-400 mt-1 print:text-black">{selectedRecord.timestamp}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 功能按鈕 */}
            <div className="flex gap-3 no-print">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-all"
              >
                <FileText size={18} />
                匯出 PDF / 列印
              </button>
              <button 
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
              >
                <Share2 size={18} />
                分享 LINE
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部導覽列 - Hidden on print */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 no-print">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">看板</span>
        </button>
        <button 
          onClick={handleCreateNew}
          className="flex flex-col items-center gap-1 -mt-8"
        >
          <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-white active:scale-90 transition-transform">
            <PlusCircle size={28} />
          </div>
          <span className="text-[10px] font-bold text-blue-600 mt-1">新增查驗</span>
        </button>
        <button 
          onClick={() => setCurrentView('history')}
          className={`flex flex-col items-center gap-1 ${currentView === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <History size={20} />
          <span className="text-[10px] font-medium">紀錄</span>
        </button>
      </nav>

      {/* Loading Overlay */}
      {aiLoading && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8 text-center no-print">
          <div className="bg-white p-6 rounded-2xl space-y-4 max-w-[280px]">
            <div className="animate-spin text-blue-600 mx-auto">
              <Sparkles size={40} />
            </div>
            <div className="font-bold text-gray-800">AI 正在分析查驗結果...</div>
            <p className="text-xs text-gray-500">我們正針對不合格項目生成具體的專業改善建議，請稍候。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
