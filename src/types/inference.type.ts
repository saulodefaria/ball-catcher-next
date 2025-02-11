export type Prediction = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type InferencejsPrediction = {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
};
