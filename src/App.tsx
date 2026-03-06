/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  ChevronRight,
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
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutos
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Constantes do teste de jarra
  const JAR_TEST_HECTARES = 0.3;

  // Lógica do cronômetro
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

  // Volumes do teste de jarra
  const jarTestWaterTotal = waterVolumePerHa * JAR_TEST_HECTARES;
  const jarTestWaterInitial = jarTestWaterTotal * 0.6;
  const jarTestWaterFinal = jarTestWaterTotal * 0.4;

  // Volumes do tanque completo
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
    } else if (step === 'WATER_QUALITY_INFO') {
      setIsJarTest(true);
      setStep('JAR_TEST_START');
    } else if (step === 'JAR_TEST_START') {
      setMixingIndex(0);
      setStep('JAR_TEST_MIXING');
    } else if (step === 'JAR_TEST_MIXING') {
      if (mixingIndex < products.length - 1) {
        setMixingIndex(mixingIndex + 1);
      } else {
        setStep('JAR_TEST_FINAL_WATER');
      }
    } else if (step === 'JAR_TEST_FINAL_WATER') {
      setStep('STABILITY_CHECK');
      setTimerSeconds(300);
      setIsTimerRunning(true);
    } else if (step === 'STABILITY_CHECK') {
      setStep('TANK_VOLUME');
      setIsTimerRunning(false);
    } else if (step === 'TANK_VOLUME') {
      setIsJarTest(false);
      setMixingIndex(0);
      setStep('FULL_TANK_MIXING');
    } else if (step === 'FULL_TANK_MIXING') {
      if (mixingIndex < products.length - 1) {
        setMixingIndex(mixingIndex + 1);
      } else {
        setStep('FULL_TANK_FINAL_WATER');
      }
    } else if (step === 'FULL_TANK_FINAL_WATER') {
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
    } else if (step === 'JAR_TEST_FINAL_WATER') {
      setMixingIndex(products.length - 1);
      setStep('JAR_TEST_MIXING');
    } else if (step === 'STABILITY_CHECK') {
      setStep('JAR_TEST_FINAL_WATER');
      setIsTimerRunning(false);
    } else if (step === 'TANK_VOLUME') {
      if (selectedMode === AppMode.DRONE || selectedMode === AppMode.AVIAO) {
        setStep('STABILITY_CHECK');
      } else {
        setStep('SELECT_MODE');
      }
    } else if (step === 'FULL_TANK_MIXING') {
      if (mixingIndex > 0) setMixingIndex(mixingIndex - 1);
      else setStep('TANK_VOLUME');
    } else if (step === 'FULL_TANK_FINAL_WATER') {
      setMixingIndex(products.length - 1);
      setStep('FULL_TANK_MIXING');
    }
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 font-medium text-emerald-700">{subtitle}</p>}
    </div>
  );

  const formatVolume = (val: number, unit: string = 'L') => {
    if (unit === 'kg') {
      if (val < 1) return `${(val * 1000).toFixed(0)} g`;
      return `${val.toFixed(2)} kg`;
    }
    if (val < 1) return `${(val * 1000).toFixed(0)} mL`;
    return `${val.toFixed(2)} L`;
  };

  return (
    <div
      translate="no"
      className="min-h-screen bg-emerald-50 text-emerald-950 font-sans selection:bg-emerald-200"
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600 shadow-xl shadow-emerald-200">
                <Droplets className="h-12 w-12 text-white" />
              </div>

              <h1 className="mb-4 text-4xl font-black leading-tight text-emerald-900">
                Guia de Aplicação
                <br />
                AGROZOO
              </h1>

              <p className="mb-12 text-lg font-medium text-emerald-700">
                Orientação técnica para preparo de calda e aplicação de herbicidas.
              </p>

              <button
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 text-xl font-bold text-white shadow-lg shadow-emerald-200 transition-all active:scale-95 hover:bg-emerald-700"
              >
                Iniciar aplicação
                <ChevronRight className="h-6 w-6" />
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
              {renderHeader('Selecione o kit', 'Escolha o tratamento desejado')}

              <div className="grid gap-4">
                {Object.values(KitType).map((kit) => (
                  <button
                    key={kit}
                    onClick={() => setSelectedKit(kit)}
                    className={`w-full rounded-2xl border-2 p-5 text-left font-bold transition-all ${
                      selectedKit === kit
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
                        : 'border-emerald-100 bg-white text-emerald-900 hover:border-emerald-300'
                    }`}
                  >
                    {kit}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  disabled={!selectedKit}
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md disabled:opacity-50"
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
              {renderHeader('Modo de aplicação', 'Como a pulverização será feita?')}

              <div className="grid gap-4">
                {[
                  { mode: AppMode.DRONE, icon: Cpu, desc: 'Vazão: 30 L/ha' },
                  { mode: AppMode.TERRESTRE, icon: Truck, desc: 'Vazão: 200 L/ha' },
                  { mode: AppMode.AVIAO, icon: Plane, desc: 'Vazão: 50 L/ha' }
                ].map(({ mode, icon: Icon, desc }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all ${
                      selectedMode === mode
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
                        : 'border-emerald-100 bg-white text-emerald-900 hover:border-emerald-300'
                    }`}
                  >
                    <div
                      className={`rounded-xl p-3 ${
                        selectedMode === mode ? 'bg-emerald-500' : 'bg-emerald-50'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          selectedMode === mode ? 'text-white' : 'text-emerald-600'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="text-lg font-bold">{mode}</div>
                      <div
                        className={`text-sm ${
                          selectedMode === mode ? 'text-emerald-100' : 'text-emerald-600'
                        }`}
                      >
                        {desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  disabled={!selectedMode}
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md disabled:opacity-50"
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
              className="flex flex-1 flex-col"
            >
              <div className="flex-1 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                  <Info className="h-8 w-8 text-amber-600" />
                </div>

                <h2 className="mb-4 text-2xl font-bold text-emerald-900">Qualidade da água</h2>

                <div className="space-y-4 font-medium leading-relaxed text-emerald-800">
                  <p>
                    Antes de iniciar a mistura, é importante verificar a qualidade da água.
                  </p>
                  <p>
                    Em muitas regiões do Brasil, como Mato Grosso, Pará e Minas Gerais, a água
                    pode apresentar alta concentração de minerais, como ferro, cálcio e magnésio.
                  </p>
                  <p>
                    Esses minerais podem causar instabilidade na calda, reduzindo a eficiência da
                    aplicação.
                  </p>
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 font-bold text-emerald-900">
                    Por isso, recomendamos realizar um teste de jarra (teste de balde) antes de
                    preparar o tanque completo.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
                  Iniciar teste
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
              {renderHeader('Teste de jarra', 'Dose proporcional para 0,3 hectare')}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <FlaskConical className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Passo 1</h3>
                    <p className="text-sm text-emerald-600">Preparação inicial</p>
                  </div>
                </div>

                <p className="mb-4 text-xl font-bold text-emerald-900">
                  Adicione {formatVolume(jarTestWaterInitial)} de água.
                </p>

                <p className="font-medium text-emerald-700">
                  (60% do volume total de água do teste).
                </p>

                <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-600">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-bold">Mantenha a agitação constante.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
                  Próximo
                </button>
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
              {renderHeader('Ordem de mistura', `Produto ${mixingIndex + 1} de ${products.length}`)}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                <div
                  className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600"
                  translate="no"
                >
                  ADICIONE AGORA:
                </div>

                <h2 className="mb-4 text-3xl font-black text-emerald-900" translate="no">
                  {products[mixingIndex].name}
                </h2>

                <div className="mb-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6">
                  <div className="mb-1 text-sm font-bold text-emerald-600">
                    Dose para o teste (0,3 ha):
                  </div>
                  <div className="text-4xl font-black text-emerald-600" translate="no">
                    {formatVolume(
                      products[mixingIndex].dosePerHa * JAR_TEST_HECTARES,
                      products[mixingIndex].unit
                    )}
                  </div>
                </div>

                <p className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Misture bem após a adição.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
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
              {renderHeader('Finalizar calda', 'Completar o volume do teste')}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Droplets className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Passo final</h3>
                    <p className="text-sm text-emerald-600">Completar com água</p>
                  </div>
                </div>

                <p className="mb-4 text-xl font-bold text-emerald-900">
                  Adicione os {formatVolume(jarTestWaterFinal)} restantes de água.
                </p>

                <p className="font-medium text-emerald-700">
                  (40% do volume total de água do teste).
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('JAR_TEST_MIXING')}
                  className="flex-1 py-4 font-bold text-emerald-700"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setStep('STABILITY_CHECK');
                    setTimerSeconds(300);
                    setIsTimerRunning(true);
                  }}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
                  Iniciar estabilidade
                </button>
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
              {renderHeader('Verificação', 'Teste de estabilidade')}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg">
                <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50">
                  <RotateCcw
                    className={`h-24 w-24 text-emerald-200 ${isTimerRunning ? 'animate-spin-slow' : ''}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-3xl font-black text-emerald-600">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-emerald-900">Aguarde 5 minutos</h2>

                <p className="mb-6 font-medium leading-relaxed text-emerald-800">
                  Se a calda permanecer homogênea e estável, a mistura estará adequada para
                  aplicação.
                </p>

                {!isTimerRunning && timerSeconds > 0 && (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="rounded-full bg-emerald-100 px-6 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
                  >
                    Iniciar cronômetro
                  </button>
                )}

                {timerSeconds === 0 && (
                  <div className="animate-pulse rounded-full bg-emerald-600 px-6 py-2 text-sm font-bold text-white">
                    Tempo esgotado. Verifique a calda.
                  </div>
                )}
              </div>

              <p className="mb-6 text-center font-bold text-emerald-900">
                A calda permaneceu estável?
              </p>

              <div className="grid gap-4">
                <button
                  onClick={nextStep}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 font-bold text-white shadow-md"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Sim, permaneceu estável
                </button>

                <button
                  onClick={() => {
                    setStep('WATER_QUALITY_INFO');
                    setIsTimerRunning(false);
                  }}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-rose-200 bg-white py-5 font-bold text-rose-600"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Não permaneceu estável
                  </div>
                  <span className="mt-1 text-xs font-medium opacity-80">
                    Troque a água e refaça o teste
                  </span>
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
              {renderHeader('Volume do tanque', 'Informe a capacidade do seu misturador')}

              {selectedMode === AppMode.DRONE && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <Info className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <p className="text-sm font-medium text-amber-900">
                    <span className="font-bold">Atenção:</span> para aplicação com drone,
                    utilizaremos apenas 60% do volume, para garantir agitação adequada.
                  </p>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4">
                {[200, 400, 600].map((vol) => (
                  <button
                    key={vol}
                    onClick={() => {
                      setTankVolume(vol);
                      setCustomVolume('');
                    }}
                    className={`rounded-2xl border-2 p-5 text-xl font-bold transition-all ${
                      tankVolume === vol && !customVolume
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
                        : 'border-emerald-100 bg-white text-emerald-900'
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
                    className={`w-full rounded-2xl border-2 p-5 text-xl font-bold outline-none transition-all ${
                      customVolume
                        ? 'border-emerald-600 bg-emerald-600 text-white placeholder:text-emerald-200'
                        : 'border-emerald-100 bg-white text-emerald-900 placeholder:text-emerald-300'
                    }`}
                  />
                </div>
              </div>

              <div className="mb-8 rounded-3xl bg-emerald-900 p-6 text-white shadow-xl">
                <div className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wider opacity-80">
                  Resumo da aplicação
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
                    <span className="font-medium">Volume útil:</span>
                    <span className="text-xl font-bold text-emerald-400">{effectiveTankVolume} L</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Área por tanque:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {hectaresPerTank.toFixed(2)} ha
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  disabled={tankVolume <= 0}
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md disabled:opacity-50"
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
              {renderHeader('Mistura do tanque', `Produto ${mixingIndex + 1} de ${products.length}`)}

              {mixingIndex === 0 && (
                <div className="mb-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Passo 1:
                  </div>
                  <h2 className="mb-4 text-2xl font-black text-emerald-900">
                    Adicionar 60% da água
                  </h2>
                  <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6">
                    <div className="text-4xl font-black text-emerald-600">
                      {formatVolume(fullTankWaterInitial)}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                <div
                  className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600"
                  translate="no"
                >
                  ADICIONE AGORA:
                </div>

                <h2 className="mb-4 text-3xl font-black text-emerald-900" translate="no">
                  {products[mixingIndex].name}
                </h2>

                <div className="mb-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6">
                  <div className="mb-1 text-sm font-bold text-emerald-600">
                    Dose para o tanque completo:
                  </div>
                  <div className="text-4xl font-black text-emerald-600" translate="no">
                    {formatVolume(
                      products[mixingIndex].dosePerHa * hectaresPerTank,
                      products[mixingIndex].unit
                    )}
                  </div>
                </div>

                <p className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Mantenha a agitação constante.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 font-bold text-emerald-700">
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
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
              {renderHeader('Finalizar mistura', 'Completar o volume do tanque')}

              <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Droplets className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Passo final</h3>
                    <p className="text-sm text-emerald-600">Completar com água</p>
                  </div>
                </div>

                <p className="mb-4 text-xl font-bold text-emerald-900">
                  Adicione os {formatVolume(fullTankWaterFinal)} restantes de água.
                </p>

                <p className="font-medium text-emerald-700">
                  (40% do volume total de água do tanque).
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('FULL_TANK_MIXING')}
                  className="flex-1 py-4 font-bold text-emerald-700"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep('FINAL')}
                  className="flex-[2] rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md"
                >
                  Finalizar
                </button>
              </div>
            </motion.div>
          )}

          {step === 'FINAL' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>

              <h1 className="mb-4 text-4xl font-black text-emerald-900">Mistura finalizada!</h1>

              <p className="mb-8 text-xl font-bold text-emerald-800">
                Calda pronta para aplicação.
              </p>

              <div className="mb-12 w-full rounded-3xl border border-emerald-100 bg-white p-6 text-left shadow-lg">
                <h3 className="mb-2 flex items-center gap-2 font-bold text-emerald-900">
                  <Info className="h-5 w-5 text-emerald-600" />
                  Recomendações:
                </h3>

                <ul className="space-y-2 font-medium text-emerald-800">
                  <li>• Complete com água até o volume final.</li>
                  <li>• Mantenha a agitação constante no tanque.</li>
                  <li>• Siga as recomendações técnicas de segurança.</li>
                </ul>
              </div>

              <button
                onClick={resetApp}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-900 py-5 text-xl font-bold text-white shadow-lg"
              >
                Nova aplicação
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
