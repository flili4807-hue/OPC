export type DsiDimensionKey =
  | "goals"
  | "planning"
  | "engineering"
  | "collaboration"
  | "metrics";

export type ContactInfo = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
  title: string;
  projectType: string;
  employeeScale: string;
  projectStage: string;
  source?: string;
};

export type DsiAnswers = Record<DsiDimensionKey, number[]>;

export type DimensionScore = {
  key: DsiDimensionKey;
  name: string;
  score: number;
  max: number;
  advice: string;
};

export type DsiResult = {
  total: number;
  level: "优秀" | "健康" | "亚健康" | "高风险";
  dimensions: DimensionScore[];
  risks: string[];
  suggestions: string[];
};

export type CmmiAnswers = Record<string, number>;

export type CmmiResult = {
  level: number;
  levelName: string;
  average: number;
  summary: string;
  suggestions: string[];
};

export type LeadRecord = {
  id: string;
  createdAt: string;
  contact: ContactInfo;
  dsiAnswers?: DsiAnswers;
  dsiResult?: DsiResult;
  cmmiAnswers?: CmmiAnswers;
  cmmiResult?: CmmiResult;
  purchaseStatus: "未购买" | "待支付" | "已支付";
  salesStatus: "新客户" | "已联系" | "需求沟通" | "方案报价" | "成交" | "失败";
  paymentAmount?: number;
  notes: string[];
};
