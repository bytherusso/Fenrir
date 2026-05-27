// src/store/useSimulatorStore.js
import { create } from 'zustand';

export const useSimulatorStore = create((set) => ({
  // Estado inicial
  equation: '',
  variables: [],
  truthTable: [],
  requiredChips: [], // Inicializado correctamente como arreglo
  
  // Acciones para actualizar el estado
  setEquation: (newEquation) => set({ equation: newEquation }),
  setVariables: (newVariables) => set({ variables: newVariables }),
  setTruthTable: (newTable) => set({ truthTable: newTable }),
  setRequiredChips: (newChips) => set({ requiredChips: newChips }),
  
  // Acción para limpiar todo el lienzo y empezar de cero
  resetSimulator: () => set({ 
    equation: '', 
    variables: [], 
    truthTable: [], 
    requiredChips: [] 
  })
}));