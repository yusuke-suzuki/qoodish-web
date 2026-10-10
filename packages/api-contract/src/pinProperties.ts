export type PinPropertyOption = {
  id: number;
  name: string;
  position: number;
};

export type PinProperty = {
  id: number;
  name: string;
  multiple: boolean;
  position: number;
  options: PinPropertyOption[];
};
