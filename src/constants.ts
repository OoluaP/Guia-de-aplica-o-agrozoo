
export enum KitType {
  CAPIM_CAPETA = "Capim Capeta",
  CAPIM_NAVALHA = "Capim Navalha",
  CAPIM_CAPETA_NAVALHA = "Capim Capeta + Navalha",
  CORRENTAO_QUIMICO = "Correntão Químico",
}

export enum AppMode {
  DRONE = "Drone",
  TERRESTRE = "Terrestre",
  AVIAO = "Avião / Helicóptero",
}

export interface Product {
  name: string;
  dosePerHa: number; // in Liters or Kg
  unit: string;
}

export const FLOW_RATES: Record<AppMode, number> = {
  [AppMode.DRONE]: 30,
  [AppMode.TERRESTRE]: 200,
  [AppMode.AVIAO]: 50,
};

export const KIT_PRODUCTS: Record<KitType, Record<AppMode, Product[]>> = {
  [KitType.CAPIM_CAPETA]: {
    [AppMode.DRONE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Atrazina", dosePerHa: 2.4, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.45, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.AVIAO]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Atrazina", dosePerHa: 2.4, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.45, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.TERRESTRE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Atrazina", dosePerHa: 2.0, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.35, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.5, unit: "L" },
      { name: "Top Fix", dosePerHa: 0.5, unit: "L" },
    ],
  },
  [KitType.CAPIM_NAVALHA]: {
    [AppMode.DRONE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.2, unit: "kg" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.AVIAO]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.2, unit: "kg" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.TERRESTRE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.0, unit: "kg" },
      { name: "Top Ultra", dosePerHa: 0.5, unit: "L" },
      { name: "Top Fix", dosePerHa: 0.5, unit: "L" },
    ],
  },
  [KitType.CAPIM_CAPETA_NAVALHA]: {
    [AppMode.DRONE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.2, unit: "kg" },
      { name: "Atrazina", dosePerHa: 2.4, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.45, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.AVIAO]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.2, unit: "kg" },
      { name: "Atrazina", dosePerHa: 2.4, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.45, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.65, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.TERRESTRE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Imazetapir", dosePerHa: 1.0, unit: "kg" },
      { name: "Atrazina", dosePerHa: 2.0, unit: "kg" },
      { name: "Mesotriona", dosePerHa: 0.35, unit: "L" },
      { name: "Top Ultra", dosePerHa: 0.5, unit: "L" },
      { name: "Top Fix", dosePerHa: 0.5, unit: "L" },
    ],
  },
  [KitType.CORRENTAO_QUIMICO]: {
    [AppMode.DRONE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Power Drone", dosePerHa: 0.1, unit: "L" },
      { name: "Triclopir", dosePerHa: 1.5, unit: "L" },
      { name: "Fluroxipir", dosePerHa: 1.2, unit: "L" },
      { name: "Picloram", dosePerHa: 3.0, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
      { name: "Correntão Químico", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.AVIAO]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Power Drone", dosePerHa: 0.1, unit: "L" },
      { name: "Triclopir", dosePerHa: 1.5, unit: "L" },
      { name: "Fluroxipir", dosePerHa: 1.2, unit: "L" },
      { name: "Picloram", dosePerHa: 3.0, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
      { name: "Correntão Químico", dosePerHa: 1.0, unit: "L" },
    ],
    [AppMode.TERRESTRE]: [
      { name: "Top Drop", dosePerHa: 0.1, unit: "L" },
      { name: "Power Drone", dosePerHa: 0.1, unit: "L" },
      { name: "Triclopir", dosePerHa: 1.5, unit: "L" },
      { name: "Fluroxipir", dosePerHa: 1.2, unit: "L" },
      { name: "Picloram", dosePerHa: 3.0, unit: "L" },
      { name: "Top Fix", dosePerHa: 1.0, unit: "L" },
      { name: "Correntão Químico", dosePerHa: 1.0, unit: "L" },
    ],
  },
};
