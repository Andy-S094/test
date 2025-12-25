
import { GoogleGenAI } from "@google/genai";
import { InspectionRecord, CheckStatus } from "../types";

export const getAIReview = async (record: InspectionRecord): Promise<string> => {
  try {
    // Initialize Gemini API using named parameter as required
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const failingItems = record.items.filter(item => item.status === CheckStatus.FAIL);
    
    if (failingItems.length === 0) {
      return "本次查驗項目皆合格，施工品質優良。";
    }

    const prompt = `
      身為專業資深營造主任，請針對以下鋼筋工程自主檢查的不合格項目提供改善建議：
      查驗位置：${record.location}
      不合格項目：
      ${failingItems.map(item => `- ${item.label}: ${item.standard} (備註: ${item.remark})`).join('\n')}
      
      請給予具體的施工改善指令，並提醒現場工程師需要特別注意的風險。請以條列式回答。
    `;

    // Use gemini-3-pro-preview for complex reasoning tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Access the text property directly from the response object (not a method call)
    return response.text || "無法生成 AI 建議。";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI 助理暫時無法使用，請確認網路連接。";
  }
};
