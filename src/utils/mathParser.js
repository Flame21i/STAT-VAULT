/**
 * Safe Mathematical Expression Parser and Evaluator
 * Evaluates inline arithmetic and math functions without eval() or Function().
 */

// Clean floating-point precision issues (e.g., 0.1 + 0.2 = 0.3)
export function cleanFloat(num) {
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) return num;
  return Math.round(num * 1e8) / 1e8;
}

const MATH_FUNCTIONS = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  pow: Math.pow,
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  avg: (...args) => args.length === 0 ? 0 : args.reduce((a, b) => a + b, 0) / args.length,
  sum: (...args) => args.reduce((a, b) => a + b, 0),
  median: (...args) => {
    if (args.length === 0) return 0;
    const sorted = [...args].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },
  delta: (a, b) => a - b,
  diff: (a, b) => Math.abs(a - b),
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
};

const MATH_CONSTANTS = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
};

/**
 * Tokenize input math expression string.
 */
function tokenize(input) {
  const tokens = [];
  let i = 0;
  const str = input.trim();

  while (i < str.length) {
    const char = str[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Handle @ prefix for variable/stat references (e.g., @STAT_01 or @ENT_01.STAT_01)
    if (char === '@') {
      i++;
      let idStr = '';
      while (i < str.length && (/[a-zA-Z0-9_]/.test(str[i]) || (str[i] === '.' && /[a-zA-Z_]/.test(str[i + 1] || '')))) {
        idStr += str[i];
        i++;
      }
      if (idStr) {
        tokens.push({ type: 'identifier', value: idStr });
      }
      continue;
    }

    // Handle bracketed variable/stat references (e.g., [STAT_01] or [ATK SPEED])
    if (char === '[') {
      i++;
      let idStr = '';
      while (i < str.length && str[i] !== ']') {
        idStr += str[i];
        i++;
      }
      if (i < str.length && str[i] === ']') {
        i++; // consume ']'
      }
      if (idStr.trim()) {
        tokens.push({ type: 'identifier', value: idStr.trim() });
      }
      continue;
    }

    // Number (including decimals and scientific notation like 1e3)
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(str[i + 1] || ''))) {
      let numStr = '';
      while (i < str.length && /[0-9.]/.test(str[i])) {
        numStr += str[i];
        i++;
      }
      if (i < str.length && (str[i] === 'e' || str[i] === 'E') && /[0-9+-]/.test(str[i + 1] || '')) {
        numStr += str[i++];
        if (str[i] === '+' || str[i] === '-') {
          numStr += str[i++];
        }
        while (i < str.length && /[0-9]/.test(str[i])) {
          numStr += str[i++];
        }
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }

    // Identifier or shorthand multiplication
    if (/[a-zA-Z_]/.test(char)) {
      // Check if it's a standalone 'x' or 'X' acting as multiplication between numbers/expressions
      if ((char === 'x' || char === 'X') && (i + 1 >= str.length || /[\s0-9.(]/.test(str[i + 1]))) {
        if (tokens.length > 0 && (tokens[tokens.length - 1].type === 'number' || tokens[tokens.length - 1].type === 'rparen')) {
          tokens.push({ type: 'operator', value: '*' });
          i++;
          continue;
        }
      }

      let idStr = '';
      while (i < str.length && (/[a-zA-Z0-9_]/.test(str[i]) || (str[i] === '.' && /[a-zA-Z_]/.test(str[i + 1] || '')))) {
        idStr += str[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: idStr });
      continue;
    }

    // Operators
    if (char === '*' && str[i + 1] === '*') {
      tokens.push({ type: 'operator', value: '^' });
      i += 2;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/' || char === '%' || char === '^') {
      tokens.push({ type: 'operator', value: char });
      i++;
      continue;
    }

    // Shorthand multiplication 'x' or 'X' between numbers or parentheses
    if ((char === 'x' || char === 'X') && tokens.length > 0 && (tokens[tokens.length - 1].type === 'number' || tokens[tokens.length - 1].type === 'rparen')) {
      tokens.push({ type: 'operator', value: '*' });
      i++;
      continue;
    }

    // Parentheses and commas
    if (char === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character: '${char}'`);
  }

  return tokens;
}

/**
 * Safe Recursive Descent Parser
 * Grammar:
 * Expression   := Additive
 * Additive     := Multiplicative (('+' | '-') Multiplicative)*
 * Multiplicative := Exponent (('*' | '/' | '%') Exponent)*
 * Exponent     := Unary ('^' Exponent)?
 * Unary        := ('+' | '-')? Primary
 * Primary      := Number | Identifier | FunctionCall | '(' Expression ')'
 */
class ExpressionParser {
  constructor(tokens, currentVal = 0, context = {}) {
    this.tokens = tokens;
    this.pos = 0;
    this.currentVal = currentVal;
    this.context = context || {};
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume() {
    return this.tokens[this.pos++];
  }

  parse() {
    if (this.tokens.length === 0) {
      throw new Error('Empty expression');
    }
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token '${this.tokens[this.pos].value}'`);
    }
    return result;
  }

  parseExpression() {
    return this.parseAdditive();
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'operator' && (token.value === '+' || token.value === '-')) {
        this.consume();
        const right = this.parseMultiplicative();
        if (token.value === '+') {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parseExponent();

    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'operator' && (token.value === '*' || token.value === '/' || token.value === '%')) {
        this.consume();
        const right = this.parseExponent();
        if (token.value === '*') {
          left = left * right;
        } else if (token.value === '/') {
          if (right === 0) throw new Error('Division by zero');
          left = left / right;
        } else if (token.value === '%') {
          if (right === 0) throw new Error('Modulo by zero');
          left = left % right;
        }
      } else {
        break;
      }
    }

    return left;
  }

  parseExponent() {
    const left = this.parseUnary();

    const token = this.peek();
    if (token && token.type === 'operator' && token.value === '^') {
      this.consume();
      const right = this.parseExponent(); // Right-associative
      return Math.pow(left, right);
    }

    return left;
  }

  parseUnary() {
    const token = this.peek();
    if (token && token.type === 'operator' && (token.value === '+' || token.value === '-')) {
      this.consume();
      const operand = this.parseUnary();
      return token.value === '-' ? -operand : operand;
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    // Number
    if (token.type === 'number') {
      this.consume();
      return token.value;
    }

    // Parentheses (Expression)
    if (token.type === 'lparen') {
      this.consume();
      const result = this.parseExpression();
      const closing = this.peek();
      if (!closing || closing.type !== 'rparen') {
        throw new Error('Missing closing parenthesis');
      }
      this.consume();
      return result;
    }

    // Identifier (Variable, Constant, or Function Call)
    if (token.type === 'identifier') {
      this.consume();
      const name = token.value;
      const lower = name.toLowerCase();

      // Check for function call
      if (this.peek() && this.peek().type === 'lparen') {
        this.consume(); // consume '('
        const args = [];
        if (!this.peek() || this.peek().type !== 'rparen') {
          while (true) {
            args.push(this.parseExpression());
            const next = this.peek();
            if (next && next.type === 'comma') {
              this.consume();
            } else {
              break;
            }
          }
        }
        const closing = this.peek();
        if (!closing || closing.type !== 'rparen') {
          throw new Error(`Missing closing parenthesis for function ${name}`);
        }
        this.consume(); // consume ')'

        if (MATH_FUNCTIONS[lower]) {
          return MATH_FUNCTIONS[lower](...args);
        }
        throw new Error(`Unknown function: '${name}'`);
      }

      // Check for constants
      if (MATH_CONSTANTS[name] !== undefined) {
        return MATH_CONSTANTS[name];
      }

      // Check for variables referencing current value
      if (lower === 'x' || lower === 'val' || lower === 'ans' || lower === 'current') {
        return this.currentVal;
      }

      // Check in provided context (variables/stats lookup)
      if (this.context) {
        if (this.context[name] !== undefined) {
          const val = this.context[name];
          return typeof val === 'number' ? val : parseFloat(val) || 0;
        }
        if (this.context[lower] !== undefined) {
          const val = this.context[lower];
          return typeof val === 'number' ? val : parseFloat(val) || 0;
        }
        // Case/underscore/space-insensitive match (e.g. "STAT 01" matches "STAT_01")
        const normalized = lower.replace(/[\s_-]+/g, '');
        for (const key of Object.keys(this.context)) {
          if (key.toLowerCase().replace(/[\s_-]+/g, '') === normalized) {
            const val = this.context[key];
            return typeof val === 'number' ? val : parseFloat(val) || 0;
          }
        }
      }

      throw new Error(`Unknown identifier: '${name}'`);
    }

    throw new Error(`Unexpected token: '${token.value}'`);
  }
}

/**
 * Pre-process string for shorthand relative operations:
 * - "+10" => currentVal + 10
 * - "+15%" => currentVal + (currentVal * 0.15)
 * - "-20%" => currentVal - (currentVal * 0.20)
 * - "*2" => currentVal * 2
 * - "/2" => currentVal / 2
 * - "50 + 10%" => 50 + (50 * 0.10)
 */
function preprocessShorthands(rawInput, currentVal) {
  let str = rawInput.trim();

  // Strip leading '=' if user used excel-style formula syntax
  if (str.startsWith('=')) {
    str = str.slice(1).trim();
  }

  // Shorthand relative adjustments on currentVal:
  // e.g. "+15%" or "-20%"
  const percentDeltaMatch = str.match(/^([+-])\s*([0-9.]+)\s*%$/);
  if (percentDeltaMatch) {
    const sign = percentDeltaMatch[1] === '-' ? -1 : 1;
    const pct = parseFloat(percentDeltaMatch[2]) / 100;
    return `${currentVal} * (1 ${sign === 1 ? '+' : '-'} ${pct})`;
  }

  // e.g. "*1.5" or "* 2"
  if (/^[*xX]\s*[0-9.]+/.test(str)) {
    return `${currentVal} * ${str.replace(/^[*xX]\s*/, '')}`;
  }

  // e.g. "/2"
  if (/^[/]\s*[0-9.]+/.test(str)) {
    return `${currentVal} / ${str.replace(/^[/]\s*/, '')}`;
  }

  // e.g. "+10" (starts explicitly with '+')
  if (/^\+\s*[0-9.]+/.test(str)) {
    return `${currentVal} + ${str.replace(/^\+\s*/, '')}`;
  }

  // Bracketed cross-entity reference: [ENT_01].[STAT_01] => ENT_01.STAT_01
  str = str.replace(/\[([a-zA-Z0-9_]+)\]\.\[([a-zA-Z0-9_]+)\]/g, '$1.$2');

  // Global aggregate function shorthand: AVG(STAT_01) => AVG_ALL_STAT_01
  str = str.replace(/\b(AVG|MAX|MIN|SUM|MEDIAN)\s*\(\s*\[?([a-zA-Z0-9_]+)\]?\s*\)/gi, (match, fn, arg) => {
    return `${fn.toUpperCase()}_ALL_${arg}`;
  });

  // Percentage expressions inside formula, e.g. "100 + 20%" => "100 + (100 * 0.20)"
  str = str.replace(/([0-9.]+)\s*([+-])\s*([0-9.]+)\s*%/g, '($1 $2 ($1 * ($3 / 100)))');

  // Simple multiplication percentage, e.g. "50 * 20%" => "50 * (20 / 100)"
  str = str.replace(/([0-9.]+)\s*%/g, '($1 / 100)');

  return str;
}

/**
 * Main evaluation function:
 * Takes input expression, current value, and optional context of variables/stats.
 * Returns evaluated result or error.
 */
export function evaluateMathExpression(input, currentVal = 0, context = {}) {
  if (input === null || input === undefined) {
    return { success: false, error: 'Empty input' };
  }

  const trimmed = String(input).trim();
  if (trimmed === '') {
    return { success: false, error: 'Empty input' };
  }

  // Check if it's already a simple pure number and no context lookups needed
  if (/^-?[0-9]+(\.[0-9]+)?$/.test(trimmed) && (!context || Object.keys(context).length === 0)) {
    const num = parseFloat(trimmed);
    return { success: true, result: cleanFloat(num), isFormula: false };
  }

  try {
    const processed = preprocessShorthands(trimmed, currentVal);
    const tokens = tokenize(processed);
    const parser = new ExpressionParser(tokens, currentVal, context);
    const rawResult = parser.parse();

    if (typeof rawResult !== 'number' || isNaN(rawResult) || !isFinite(rawResult)) {
      return { success: false, error: 'Invalid calculation result' };
    }

    return {
      success: true,
      result: cleanFloat(rawResult),
      isFormula: true,
      formula: trimmed,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Syntax error',
    };
  }
}

/**
 * Extract all stat/variable names referenced inside a formula.
 * Ignores function names, constants, and built-in aliases.
 */
export function extractFormulaVariables(formula) {
  if (!formula || typeof formula !== 'string') return [];
  try {
    const processed = preprocessShorthands(formula, 0);
    const tokens = tokenize(processed);
    const vars = new Set();
    const reserved = new Set([
      ...Object.keys(MATH_FUNCTIONS),
      ...Object.keys(MATH_CONSTANTS).map(k => k.toLowerCase()),
      'x', 'val', 'ans', 'current',
    ]);

    for (let idx = 0; idx < tokens.length; idx++) {
      const tok = tokens[idx];
      if (tok.type === 'identifier') {
        const next = tokens[idx + 1];
        // If followed by '(', it's a function call
        if (next && next.type === 'lparen') continue;
        const lower = tok.value.toLowerCase();
        if (!reserved.has(lower)) {
          vars.add(tok.value);
        }
      }
    }
    return Array.from(vars);
  } catch {
    return [];
  }
}

