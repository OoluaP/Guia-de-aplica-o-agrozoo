/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RotateCcw,
  FlaskConical,
  Truck,
  Plane,
  Cpu
} from 'lucide-react';
import { KitType, AppMode, FLOW_RATES, KIT_PRODUCTS, Product } from './constants';

type Step = 
  | 'HOME' 
  | 'SELECT_KIT' 
  | 'SELECT_MODE' 
  | 'WATER_QUALITY_INFO' 
  | 'JAR_TEST_START'
  | 'JAR_TEST_MIXING'
  | 'JAR_TEST_FINAL_WATER'
  | 'STABILITY_CHECK'
  | 'TANK_VOLUME'
  | 'FULL_TANK_MIXING'
  | 'FULL_TANK_FINAL_WATER'
  | 'FINAL';

export default function App() {
  const [step, setStep] = useState<Step>('HOME');
  const [selectedKit, setSelectedKit] = useState<KitType | null>(null);
  const [selectedMode, setSelectedMode] = useState<AppMode | null>(null);
  const [tankVolume, setTankVolume] = useState<number>(200);
  const [customVolume, setCustomVolume] = useState<string>('');
  const [mixingIndex, setMixingIndex] = useState(0);
  const [isJarTest, setIsJarTest] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Constants for Jar Test
  const JAR_TEST_HECTARES = 0.3;

  // Timer logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const products = useMemo(() => {
    if (!selectedKit || !selectedMode) return [];
    return KIT_PRODUCTS[selectedKit][selectedMode];
  }, [selectedKit, selectedMode]);

  const totalProductVolumePerHa = useMemo(() => {
    return products.reduce((sum, p) => sum + p.dosePerHa, 0);
  }, [products]);

  const flowRate = useMemo(() => {
    if (!selectedMode) return 0;
    return FLOW_RATES[selectedMode];
  }, [selectedMode]);

  const waterVolumePerHa = useMemo(() => {
    return Math.max(0, flowRate - totalProductVolumePerHa);
  }, [flowRate, totalProductVolumePerHa]);

  const effectiveTankVolume = useMemo(() => {
    if (selectedMode === AppMode.DRONE) {
      return tankVolume * 0.6;
    }
    return tankVolume;
  }, [tankVolume, selectedMode]);

  const hectaresPerTank = useMemo(() => {
    if (flowRate === 0) return 0;
    return effectiveTankVolume / flowRate;
  }, [effectiveTankVolume, flowRate]);

  // Jar Test Volumes
  const jarTestWaterTotal = waterVolumePerHa * JAR_TEST_HECTARES;
  const jarTestWaterInitial = jarTestWaterTotal * 0.6;
  const jarTestWaterFinal = jarTestWaterTotal * 0.4;

  // Full Tank Volumes
  const fullTankWaterTotal = waterVolumePerHa * hectaresPerTank;
  const fullTankWaterInitial = fullTankWaterTotal * 0.6;
  const fullTankWaterFinal = fullTankWaterTotal * 0.4;

  const resetApp = () => {
    setStep('HOME');
    setSelectedKit(null);
    setSelectedMode(null);
    setTankVolume(200);
    setCustomVolume('');
    setMixingIndex(0);
    setIsJarTest(false);
    setTimerSeconds(300);
    setIsTimerRunning(false);
  };

  const nextStep = () => {
    if (step === 'HOME') setStep('SELECT_KIT');
    else if (step === 'SELECT_KIT') setStep('SELECT_MODE');
    else if (step === 'SELECT_MODE') {
      if (selectedMode === AppMode.DRONE || selectedMode === AppMode.AVIAO) {
        setStep('WATER_QUALITY_INFO');
      } else {
        setStep('TANK_VOLUME');
      }
    }
    else if (step === 'WATER_QUALITY_INFO') {
      setIsJarTest(true);
      setStep('JAR_TEST_START');
    }
    else if (step === 'JAR_TEST_START') {
      setMixingIndex(0);
      setStep('JAR_TEST_MIXING');
    }
    else if (step === 'JAR_TEST_MIXING') {
      if (mixingIndex < products.length - 1) {
        setMixingIndex(mixingIndex + 1);
      } else {
        setStep('JAR_TEST_FINAL_WATER');
      }
    }
    else if (step === 'JAR_TEST_FINAL_WATER') {
      setStep('STABILITY_CHECK');
      setTimerSeconds(300);
      setIsTimerRunning(true);
    }
    else if (step === 'STABILITY_CHECK') {
      setStep('TANK_VOLUME');
      setIsTimerRunning(false);
    }
    else if (step === 'TANK_VOLUME') {
      setIsJarTest(false);
      setMixingIndex(0);
      setStep('FULL_TANK_MIXING');
    }
    else if (step === 'FULL_TANK_MIXING') {
      if (mixingIndex < products.length - 1) {
        setMixingIndex(mixingIndex + 1);
      } else {
        setStep('FULL_TANK_FINAL_WATER');
      }
    }
    else if (step === 'FULL_TANK_FINAL_WATER') {
      setStep('FINAL');
    }
  };

  const prevStep = () => {
    if (step === 'SELECT_KIT') setStep('HOME');
    else if (step === 'SELECT_MODE') setStep('SELECT_KIT');
    else if (step === 'WATER_QUALITY_INFO') setStep('SELECT_MODE');
    else if (step === 'JAR_TEST_START') setStep('WATER_QUALITY_INFO');
    else if (step === 'JAR_TEST_MIXING') {
      if (mixingIndex > 0) setMixingIndex(mixingIndex - 1);
      else setStep('JAR_TEST_START');
    }
    else if (step === 'JAR_TEST_FINAL_WATER') {
      setMixingIndex(products.length - 1);
      setStep('JAR_TEST_MIXING');
    }
    else if (step === 'STABILITY_CHECK') setStep('JAR_TEST_FINAL_WATER');
    else if (step === 'TANK_VOLUME') {
      if (selectedMode === AppMode.DRONE || selectedMode === AppMode.AVIAO) {
        setStep('STABILITY_CHECK');
      } else {
        setStep('SELECT_MODE');
      }
    }
    else if (step === 'FULL_TANK_MIXING') {
      if (mixingIndex > 0) setMixingIndex(mixingIndex - 1);
      else setStep('TANK_VOLUME');
    }
    else if (step === 'FULL_TANK_FINAL_WATER') {
      setMixingIndex(products.length - 1);
      setStep('FULL_TANK_MIXING');
    }
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-emerald-700 mt-2 font-medium">{subtitle}</p>}
    </div>
  );

  const formatVolume = (val: number, unit: string = "L") => {
    if (unit === "kg") {
      if (val < 1) return `${(val * 1000).toFixed(0)} g`;
      return `${val.toFixed(2)} kg`;
    }
    if (val < 1) return `${(val * 1000).toFixed(0)} ml`;
    return `${val.toFixed(2)} L`;
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950 font-sans selection:bg-emerald-200">
      <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
        
        <AnimatePresence mode="wait">
          {step === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
                <Droplets className="text-white w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black text-emerald-900 mb-4 leading-tight">
                Guia de Aplicação<br/>AGROZOO
              </h1>
              <p className="text-emerald-700 mb-12 text-lg font-medium">
                Orientação técnica para preparo de calda e aplicação de herbicidas.
              </p>
              <button 
                onClick={nextStep}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-xl"
              >
                Iniciar Aplicação
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}

          {step === 'SELECT_KIT' && (
            <motion.div 
              key="select-kit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {renderHeader("Selecione o Kit", "Escolha o tratamento desejado")}
              <div className="grid gap-4">
                {Object.values(KitType).map((kit) => (
                  <button
                    key={kit}
                    onClick={() => setSelectedKit(kit)}
                    className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 ${
                      selectedKit === kit 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-white border-emerald-100 text-emerald-900 hover:border-emerald-300'
                    }`}
                  >
                    {kit}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button 
                  disabled={!selectedKit}
                  onClick={nextStep}
                  className="flex-[2] bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'SELECT_MODE' && (
            <motion.div 
              key="select-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {renderHeader("Modo de Aplicação", "Como será feita a pulverização?")}
              <div className="grid gap-4">
                {[
                  { mode: AppMode.DRONE, icon: Cpu, desc: "Vazão: 30 L/ha" },
                  { mode: AppMode.TERRESTRE, icon: Truck, desc: "Vazão: 200 L/ha" },
                  { mode: AppMode.AVIAO, icon: Plane, desc: "Vazão: 50 L/ha" },
                ].map(({ mode, icon: Icon, desc }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`w-full p-6 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${
                      selectedMode === mode 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-white border-emerald-100 text-emerald-900 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${selectedMode === mode ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
                      <Icon className={`w-6 h-6 ${selectedMode === mode ? 'text-white' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{mode}</div>
                      <div className={`text-sm ${selectedMode === mode ? 'text-emerald-100' : 'text-emerald-600'}`}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button 
                  disabled={!selectedMode}
                  onClick={nextStep}
                  className="flex-[2] bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md"
                >
                  Iniciar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'WATER_QUALITY_INFO' && (
            <motion.div 
              key="water-info"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 flex-1">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                  <Info className="text-amber-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">Qualidade da Água</h2>
                <div className="space-y-4 text-emerald-800 leading-relaxed font-medium">
                  <p>Antes de iniciar a mistura, é importante verificar a qualidade da água.</p>
                  <p>Em muitas regiões do Brasil, como Mato Grosso, Pará e Minas Gerais, as águas possuem alta concentração de minerais como ferro, cálcio e magnésio.</p>
                  <p>Esses minerais podem causar instabilidade na calda, reduzindo a eficiência da aplicação.</p>
                  <p className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-900 font-bold">
                    Por isso recomendamos realizar um teste de jarra (teste de balde) antes de preparar o tanque completo.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button 
                  onClick={nextStep}
                  className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md"
                >
                  Iniciar Teste
                </button>
              </div>
            </motion.div>
          )}

          {step === 'JAR_TEST_START' && (
            <motion.div 
              key="jar-start"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Teste de Jarra", "Dose proporcional para 0,3 hectare")}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <FlaskConical className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Passo 1</h3>
                    <p className="text-emerald-600 text-sm">Preparação Inicial</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-emerald-900 mb-4">
                  Adicione {formatVolume(jarTestWaterInitial)} de água.
                </p>
                <p className="text-emerald-700 font-medium">
                  (60% do volume de água total do teste).
                </p>
                <div className="mt-6 flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-bold text-sm">Mantenha agitação constante.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button onClick={nextStep} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md">Próximo</button>
              </div>
            </motion.div>
          )}

          {step === 'JAR_TEST_MIXING' && (
            <motion.div 
              key={`jar-mix-${mixingIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Ordem de Mistura", `Produto ${mixingIndex + 1} de ${products.length}`)}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8">
                <div className="text-emerald-600 font-bold mb-2 uppercase tracking-wider text-xs">Adicione agora:</div>
                <h2 className="text-3xl font-black text-emerald-900 mb-4">{products[mixingIndex].name}</h2>
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 mb-6">
                  <div className="text-emerald-600 text-sm font-bold mb-1">Dose para o teste (0,3 ha):</div>
                  <div className="text-4xl font-black text-emerald-600">
                    {formatVolume(products[mixingIndex].dosePerHa * JAR_TEST_HECTARES, products[mixingIndex].unit)}
                  </div>
                </div>
                <p className="text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  Misture bem após adicionar.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button onClick={nextStep} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md">
                  {mixingIndex === products.length - 1 ? 'Próximo' : 'Pronto'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'JAR_TEST_FINAL_WATER' && (
            <motion.div 
              key="jar-final-water"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Finalizar Calda", "Completar volume do teste")}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Droplets className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Passo Final</h3>
                    <p className="text-emerald-600 text-sm">Completar Água</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-emerald-900 mb-4">
                  Adicione os {formatVolume(jarTestWaterFinal)} restantes de água.
                </p>
                <p className="text-emerald-700 font-medium">
                  (40% do volume de água total do teste).
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('JAR_TEST_MIXING')} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button onClick={() => {
                  setStep('STABILITY_CHECK');
                  setTimerSeconds(300);
                  setIsTimerRunning(true);
                }} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md">Iniciar Estabilidade</button>
              </div>
            </motion.div>
          )}

          {step === 'STABILITY_CHECK' && (
            <motion.div 
              key="stability"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {renderHeader("Verificação", "Teste de Estabilidade")}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8 text-center">
                <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <RotateCcw className={`text-emerald-200 w-24 h-24 ${isTimerRunning ? 'animate-spin-slow' : ''}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-emerald-600 font-mono">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Aguarde 5 minutos</h2>
                <p className="text-emerald-800 font-medium leading-relaxed mb-6">
                  Se a calda permanecer homogênea e estável, a mistura está adequada para aplicação.
                </p>
                
                {!isTimerRunning && timerSeconds > 0 && (
                  <button 
                    onClick={() => setIsTimerRunning(true)}
                    className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-200 transition-colors"
                  >
                    Iniciar Cronômetro
                  </button>
                )}
                {timerSeconds === 0 && (
                  <div className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm animate-pulse">
                    Tempo Esgotado! Verifique a calda.
                  </div>
                )}
              </div>
              <p className="text-center font-bold text-emerald-900 mb-6">A calda permaneceu estável?</p>
              <div className="grid gap-4">
                <button 
                  onClick={nextStep}
                  className="w-full bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-md flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Sim, permaneceu estável
                </button>
                <button 
                  onClick={() => {
                    setStep('WATER_QUALITY_INFO');
                    setIsTimerRunning(false);
                  }}
                  className="w-full bg-white border-2 border-rose-200 text-rose-600 font-bold py-5 rounded-2xl flex flex-col items-center justify-center"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Não permaneceu estável
                  </div>
                  <span className="text-xs mt-1 font-medium opacity-80">Trocar água e refazer teste</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'TANK_VOLUME' && (
            <motion.div 
              key="tank-volume"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Volume do Tanque", "Informe a capacidade do seu misturador")}
              
              {selectedMode === AppMode.DRONE && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6 flex gap-3">
                  <Info className="text-amber-600 w-6 h-6 flex-shrink-0" />
                  <p className="text-amber-900 text-sm font-medium">
                    <span className="font-bold">Atenção:</span> Para Drone, utilizaremos apenas 60% do volume para garantir agitação adequada.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[200, 400, 600].map((vol) => (
                  <button
                    key={vol}
                    onClick={() => {
                      setTankVolume(vol);
                      setCustomVolume('');
                    }}
                    className={`p-5 rounded-2xl font-bold text-xl transition-all border-2 ${
                      tankVolume === vol && !customVolume
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-white border-emerald-100 text-emerald-900'
                    }`}
                  >
                    {vol} L
                  </button>
                ))}
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="Outro"
                    value={customVolume}
                    onChange={(e) => {
                      setCustomVolume(e.target.value);
                      setTankVolume(Number(e.target.value) || 0);
                    }}
                    className={`w-full p-5 rounded-2xl font-bold text-xl transition-all border-2 outline-none ${
                      customVolume
                        ? 'bg-emerald-600 border-emerald-600 text-white placeholder:text-emerald-200' 
                        : 'bg-white border-emerald-100 text-emerald-900 placeholder:text-emerald-300'
                    }`}
                  />
                </div>
              </div>

              <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl mb-8">
                <div className="flex justify-between items-center mb-2 opacity-80 text-sm font-bold uppercase tracking-wider">
                  Resumo da Aplicação
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Modo:</span>
                    <span className="font-bold">{selectedMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vazão:</span>
                    <span className="font-bold">{flowRate} L/ha</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-800 pt-3">
                    <span className="font-medium">Volume Útil:</span>
                    <span className="font-bold text-xl text-emerald-400">{effectiveTankVolume} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Área por Tanque:</span>
                    <span className="font-bold text-xl text-emerald-400">{hectaresPerTank.toFixed(2)} ha</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button 
                  disabled={tankVolume <= 0}
                  onClick={nextStep} 
                  className="flex-[2] bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'FULL_TANK_MIXING' && (
            <motion.div 
              key={`full-mix-${mixingIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Mistura do Tanque", `Produto ${mixingIndex + 1} de ${products.length}`)}
              
              {mixingIndex === 0 && (
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-6">
                   <div className="text-emerald-600 font-bold mb-2 uppercase tracking-wider text-xs">Passo 1:</div>
                   <h2 className="text-2xl font-black text-emerald-900 mb-4">Adicionar 60% da Água</h2>
                   <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100">
                    <div className="text-4xl font-black text-emerald-600">
                      {formatVolume(fullTankWaterInitial)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8">
                <div className="text-emerald-600 font-bold mb-2 uppercase tracking-wider text-xs">Adicione agora:</div>
                <h2 className="text-3xl font-black text-emerald-900 mb-4">{products[mixingIndex].name}</h2>
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 mb-6">
                  <div className="text-emerald-600 text-sm font-bold mb-1">Dose para o tanque total:</div>
                  <div className="text-4xl font-black text-emerald-600">
                    {formatVolume(products[mixingIndex].dosePerHa * hectaresPerTank, products[mixingIndex].unit)}
                  </div>
                </div>
                <p className="text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  Mantenha agitação constante.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button onClick={nextStep} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md">
                  {mixingIndex === products.length - 1 ? 'Próximo' : 'Pronto'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'FULL_TANK_FINAL_WATER' && (
            <motion.div 
              key="tank-final-water"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {renderHeader("Finalizar Mistura", "Completar volume do tanque")}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-emerald-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Droplets className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Passo Final</h3>
                    <p className="text-emerald-600 text-sm">Completar Água</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-emerald-900 mb-4">
                  Adicione os {formatVolume(fullTankWaterFinal)} restantes de água.
                </p>
                <p className="text-emerald-700 font-medium">
                  (40% do volume de água total do tanque).
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('FULL_TANK_MIXING')} className="flex-1 py-4 font-bold text-emerald-700">Voltar</button>
                <button onClick={() => setStep('FINAL')} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md">Finalizar</button>
              </div>
            </motion.div>
          )}

          {step === 'FINAL' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="text-emerald-600 w-16 h-16" />
              </div>
              <h1 className="text-4xl font-black text-emerald-900 mb-4">Mistura Finalizada!</h1>
              <p className="text-xl text-emerald-800 font-bold mb-8">
                Calda pronta para aplicação.
              </p>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-emerald-100 mb-12 text-left w-full">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-600" />
                  Recomendações:
                </h3>
                <ul className="text-emerald-800 space-y-2 font-medium">
                  <li>• Complete com água até o volume final.</li>
                  <li>• Mantenha agitação constante no tanque.</li>
                  <li>• Siga as recomendações técnicas de segurança.</li>
                </ul>
              </div>
              <button 
                onClick={resetApp}
                className="w-full bg-emerald-900 text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-xl"
              >
                Nova Aplicação
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
