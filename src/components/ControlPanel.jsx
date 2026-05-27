// src/components/ControlPanel.jsx
import { useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { 
  extractVariables, 
  generateTruthTableInputs, 
  evaluateEquation, 
  getSubExpressions 
} from '../core/LogicEngine';

export const ControlPanel = () => {
  // Selectores individuales para optimizar el rendimiento y evitar advertencias de ESLint
  const equation = useSimulatorStore(state => state.equation);
  const setEquation = useSimulatorStore(state => state.setEquation);
  const setVariables = useSimulatorStore(state => state.setVariables);
  const setTruthTable = useSimulatorStore(state => state.setTruthTable);

  useEffect(() => {
    // 1. Extraemos las variables únicas de la ecuación actual
    const vars = extractVariables(equation);
    setVariables(vars);

    if (vars.length > 0) {
      // 2. Generamos las combinaciones de 0s y 1s
      const inputs = generateTruthTableInputs(vars.length);
      
      // 3. Desglosamos la ecuación en pasos intermedios (sub-columnas)
      const subs = getSubExpressions(equation);

      // 4. Procesamos cada fila de la tabla de verdad
      const tableData = inputs.map(row => {
        // Evaluamos cada sub-expresión individualmente
        const subEvaluations = subs.map(sub => ({
          expression: sub,
          val: evaluateEquation(sub, vars, row)
        }));

        // Evaluamos el resultado final
        const finalResult = evaluateEquation(equation, vars, row);
        
        return { 
          inputs: row, 
          subEvaluations, 
          result: finalResult 
        };
      });

      // 5. Inyectamos los datos procesados al estado global
      setTruthTable(tableData);
      // Usamos setState directo para inyectar un valor que no necesita su propia función 'set'
      useSimulatorStore.setState({ subExpressions: subs });
      
    } else {
      // Si el input está vacío, limpiamos la tabla y las columnas
      setTruthTable([]);
      useSimulatorStore.setState({ subExpressions: [] });
    }
  }, [equation, setVariables, setTruthTable]);

  return (
    <div className="panel-section">
      <h2 className="section-title">Ecuación de Entrada</h2>
      <input 
        type="text" 
        className="equation-input"
        value={equation}
        onChange={(e) => setEquation(e.target.value.toUpperCase())}
        placeholder="Ej: A * B + C'"
        autoComplete="off"
        spellCheck="false"
      />
      <p className="help-text" style={{ marginTop: '12px' }}>
        Operadores: <b>*</b> (AND) · <b>+</b> (OR) · <b>'</b> (NOT) · <b>^</b> (XOR)
      </p>
    </div>
  );
};