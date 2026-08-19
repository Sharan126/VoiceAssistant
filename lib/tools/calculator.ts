import { z } from "zod";
import type { AgentTool } from "./types";

export const calculatorSchema = z.object({
  expression: z
    .string()
    .min(1, "Expression cannot be empty")
    .describe("The mathematical expression to evaluate, e.g. '245 * 87' or 'sqrt(144) + 12'"),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;

/**
 * Safe Mathematical Expression Evaluator without using eval()
 */
function safeEvaluateMath(rawExpr: string): number {
  // Normalize symbols
  let expr = rawExpr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, `${Math.PI}`)
    .replace(/e(?![a-z])/gi, `${Math.E}`)
    .replace(/\s+/g, "");

  // Safe character check: only allow digits, operators, parentheses, decimal point, and standard math function names
  const allowedChars = /^[0-9+\-*/^%().,a-z]+$/i;
  if (!allowedChars.test(expr)) {
    throw new Error("Expression contains invalid or unsafe characters.");
  }

  // Handle common math functions
  expr = expr.replace(/sqrt\(([^()]+)\)/gi, (_, val) => `${Math.sqrt(safeEvaluateMath(val))}`);
  expr = expr.replace(/sin\(([^()]+)\)/gi, (_, val) => `${Math.sin(safeEvaluateMath(val))}`);
  expr = expr.replace(/cos\(([^()]+)\)/gi, (_, val) => `${Math.cos(safeEvaluateMath(val))}`);
  expr = expr.replace(/tan\(([^()]+)\)/gi, (_, val) => `${Math.tan(safeEvaluateMath(val))}`);
  expr = expr.replace(/log\(([^()]+)\)/gi, (_, val) => `${Math.log10(safeEvaluateMath(val))}`);
  expr = expr.replace(/abs\(([^()]+)\)/gi, (_, val) => `${Math.abs(safeEvaluateMath(val))}`);

  // Tokenize
  const tokens: (string | number)[] = [];
  let currentNum = "";

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (char && ((char >= "0" && char <= "9") || char === ".")) {
      currentNum += char;
    } else {
      if (currentNum) {
        tokens.push(parseFloat(currentNum));
        currentNum = "";
      }
      if (char === "-" && (i === 0 || expr[i - 1] === "(" || "+-*/^%".includes(expr[i - 1] || ""))) {
        currentNum = "-";
      } else if (char) {
        tokens.push(char);
      }
    }
  }
  if (currentNum) {
    tokens.push(parseFloat(currentNum));
  }

  // Recursive parsing helper using operator precedence
  let index = 0;

  function parseExpression(): number {
    let result = parseTerm();

    while (index < tokens.length) {
      const op = tokens[index];
      if (op === "+" || op === "-") {
        index++;
        const nextTerm = parseTerm();
        result = op === "+" ? result + nextTerm : result - nextTerm;
      } else {
        break;
      }
    }

    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();

    while (index < tokens.length) {
      const op = tokens[index];
      if (op === "*" || op === "/" || op === "%") {
        index++;
        const nextFactor = parseFactor();
        if (op === "*") result *= nextFactor;
        else if (op === "/") {
          if (nextFactor === 0) throw new Error("Division by zero");
          result /= nextFactor;
        } else if (op === "%") {
          result %= nextFactor;
        }
      } else {
        break;
      }
    }

    return result;
  }

  function parseFactor(): number {
    let result = parsePrimary();

    while (index < tokens.length && tokens[index] === "^") {
      index++;
      const exponent = parsePrimary();
      result = Math.pow(result, exponent);
    }

    return result;
  }

  function parsePrimary(): number {
    const token = tokens[index];

    if (token === "(") {
      index++;
      const result = parseExpression();
      if (tokens[index] === ")") {
        index++;
      } else {
        throw new Error("Mismatched parentheses");
      }
      return result;
    }

    if (typeof token === "number") {
      index++;
      return token;
    }

    throw new Error(`Unexpected token at position ${index}: ${token}`);
  }

  const finalResult = parseExpression();
  if (isNaN(finalResult) || !isFinite(finalResult)) {
    throw new Error("Evaluation resulted in NaN or Infinity");
  }

  return Math.round(finalResult * 1e10) / 1e10;
}

export const calculatorTool: AgentTool<CalculatorInput, { expression: string; result: number; formatted: string }> = {
  name: "calculator",
  description:
    "Evaluate arithmetic and mathematical calculations with precision. Use for arithmetic, percentages, powers, square roots, and basic functions.",
  schema: calculatorSchema,
  async execute(input) {
    try {
      const result = safeEvaluateMath(input.expression);
      return {
        expression: input.expression,
        result,
        formatted: `${input.expression} = ${result.toLocaleString()}`,
      };
    } catch (err: any) {
      throw new Error(`Calculator failed to evaluate '${input.expression}': ${err.message}`);
    }
  },
};
