// src/core/LogicEngine.js
import { chipsData } from './chipsData';

export const extractVariables = (equation) => {
  if (!equation) return [];
  const matches = equation.match(/[A-Z]/g) || [];
  return [...new Set(matches)].sort();
};

export const generateTruthTableInputs = (numVars) => {
  const rows = Math.pow(2, numVars);
  const table = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = numVars - 1; j >= 0; j--) {
      row.push((i >> j) & 1);
    }
    table.push(row);
  }
  return table;
};

export const getSubExpressions = (equation) => {
  if (!equation) return [];
  
  const cleanEq = equation.replace(/\s+/g, '');
  const tokens = cleanEq.match(/([A-Z]|[*+^()'])/g);
  if (!tokens) return [];

  const precedence = { "'": 3, "*": 2, "^": 2, "+": 1 };
  const output = [], opStack = [];

  tokens.forEach(t => {
    if (/[A-Z]/.test(t)) output.push(t);
    else if (t === '(') opStack.push(t);
    else if (t === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') output.push(opStack.pop());
      opStack.pop(); 
    } else {
      while (opStack.length && precedence[opStack[opStack.length - 1]] >= precedence[t]) {
        if (t === "'" && opStack[opStack.length - 1] === "'") break; 
        output.push(opStack.pop());
      }
      opStack.push(t);
    }
  });
  while (opStack.length) output.push(opStack.pop());

  const evalStack = [];
  const subExprs = new Set();

  output.forEach(t => {
    if (/[A-Z]/.test(t)) {
      evalStack.push(t);
    } else if (t === "'") {
      const operand = evalStack.pop();
      if (operand) {
         const isComplex = operand.length > 1 && !operand.startsWith('(');
         const inner = isComplex ? `(${operand})` : operand;
         const exp = `${inner}'`;
         subExprs.add(exp);
         evalStack.push(exp);
      }
    } else {
      const right = evalStack.pop();
      const left = evalStack.pop();
      if (left && right) {
         const exp = `(${left}${t}${right})`;
         subExprs.add(exp);
         evalStack.push(exp);
      }
    }
  });

  const stripParens = (str) => {
    if (str.startsWith('(') && str.endsWith(')')) {
      let depth = 0;
      for (let i = 0; i < str.length - 1; i++) {
        if (str[i] === '(') depth++;
        if (str[i] === ')') depth--;
        if (depth === 0) return str; 
      }
      return str.slice(1, -1);
    }
    return str;
  };

  const finalEqStripped = stripParens(cleanEq);
  const results = Array.from(subExprs).map(stripParens).filter(ex => 
    ex !== finalEqStripped && ex.length > 1
  );
  
  return [...new Set(results)].sort((a, b) => a.length - b.length);
};

export const evaluateEquation = (expr, variables, values) => {
  try {
    const cleanEq = expr.replace(/\s+/g, '');
    const tokens = cleanEq.match(/([A-Z]|[*+^()'])/g);
    if (!tokens) return null;

    const precedence = { "'": 3, "*": 2, "^": 2, "+": 1 };
    const output = [], opStack = [];

    // 1. Convertir a notación Polaca Inversa
    tokens.forEach(t => {
      if (/[A-Z]/.test(t)) output.push(t);
      else if (t === '(') opStack.push(t);
      else if (t === ')') {
        while (opStack.length && opStack[opStack.length - 1] !== '(') output.push(opStack.pop());
        opStack.pop(); 
      } else {
        while (opStack.length && precedence[opStack[opStack.length - 1]] >= precedence[t]) {
          if (t === "'" && opStack[opStack.length - 1] === "'") break; 
          output.push(opStack.pop());
        }
        opStack.push(t);
      }
    });
    while (opStack.length) output.push(opStack.pop());

    // 2. Evaluador de pila (Stack) hiper-rápido
    const stack = [];
    output.forEach(t => {
      if (/[A-Z]/.test(t)) {
        const idx = variables.indexOf(t);
        stack.push(idx !== -1 ? values[idx] : 0);
      } else if (t === "'") {
        const val = stack.pop();
        stack.push(val === 0 ? 1 : 0);
      } else {
        const right = stack.pop();
        const left = stack.pop();
        if (t === '*') stack.push(left & right);
        else if (t === '+') stack.push(left | right);
        else if (t === '^') stack.push(left ^ right);
      }
    });

    return stack[0] !== undefined ? (stack[0] ? 1 : 0) : null;
  } catch {
    return null;
  }
};

export const calculateRequiredChips = (equation) => {
  if (!equation) return [];
  const andCount = (equation.match(/\*/g) || []).length;
  const orCount = (equation.match(/\+/g) || []).length;
  const notCount = (equation.match(/'/g) || []).length;
  const xorCount = (equation.match(/\^/g) || []).length;
  const materials = [];

  const registerChip = (chipId, gatesNeeded) => {
    if (gatesNeeded > 0 && chipsData[chipId]) {
      const chip = chipsData[chipId];
      materials.push({
        code: chipId, name: chip.name, gatesNeeded: gatesNeeded,
        chipsNeeded: Math.ceil(gatesNeeded / chip.gatesPerChip),
        unusedGates: (Math.ceil(gatesNeeded / chip.gatesPerChip) * chip.gatesPerChip) - gatesNeeded
      });
    }
  };

  registerChip("7404", notCount);
  registerChip("7408", andCount);
  registerChip("7432", orCount);
  registerChip("7486", xorCount);
  return materials;
};