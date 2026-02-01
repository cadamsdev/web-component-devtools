// CSS Variable Tracker for Web Component Dev Tools
// Tracks and displays CSS custom properties affecting components

export interface CSSVariableInfo {
  name: string;
  value: string;
  computedValue: string;
  source: 'element' | 'shadow-root' | 'inherited' | 'root';
  specificity: number;
  selector?: string;
  inheritedFrom?: Element;
}

export interface CSSVariableCascade {
  variables: CSSVariableInfo[];
  totalCount: number;
}

/**
 * Get all CSS custom properties affecting an element
 */
export function getCSSVariables(element: Element): CSSVariableCascade {
  const variables: CSSVariableInfo[] = [];
  const seen = new Set<string>();

  // Get computed styles
  const computedStyle = window.getComputedStyle(element);

  // 1. Check element's inline style
  if (element instanceof HTMLElement && element.style.length > 0) {
    for (let i = 0; i < element.style.length; i++) {
      const propName = element.style[i];
      if (propName.startsWith('--')) {
        const value = element.style.getPropertyValue(propName).trim();
        const computedValue = computedStyle.getPropertyValue(propName).trim();

        variables.push({
          name: propName,
          value,
          computedValue,
          source: 'element',
          specificity: 1000, // Inline styles have highest specificity
        });
        seen.add(propName);
      }
    }
  }

  // 2. Check shadow root styles (if element is a custom element with shadow DOM)
  if (element.shadowRoot) {
    const shadowVars = extractCSSVariablesFromShadowRoot(element.shadowRoot, computedStyle, seen);
    variables.push(...shadowVars);
  }

  // 3. Check element's own stylesheet rules
  const elementVars = extractCSSVariablesFromElement(element, computedStyle, seen);
  variables.push(...elementVars);

  // 4. Walk up the DOM tree to find inherited variables
  let currentElement: Element | null = element.parentElement;
  let inheritanceLevel = 1;

  while (currentElement) {
    const inheritedVars = extractInheritedVariables(
      currentElement,
      computedStyle,
      seen,
      inheritanceLevel,
    );
    variables.push(...inheritedVars);

    currentElement = currentElement.parentElement;
    inheritanceLevel++;
  }

  // 5. Check :root variables
  const rootVars = extractRootVariables(computedStyle, seen);
  variables.push(...rootVars);

  // Sort by specificity (highest first)
  variables.sort((a, b) => b.specificity - a.specificity);

  return {
    variables,
    totalCount: variables.length,
  };
}

/**
 * Extract CSS variables from shadow root
 */
function extractCSSVariablesFromShadowRoot(
  shadowRoot: ShadowRoot,
  computedStyle: CSSStyleDeclaration,
  seen: Set<string>,
): CSSVariableInfo[] {
  const variables: CSSVariableInfo[] = [];

  // Check adopted stylesheets
  try {
    shadowRoot.adoptedStyleSheets?.forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--') && !seen.has(prop)) {
                const value = style.getPropertyValue(prop).trim();
                const computedValue = computedStyle.getPropertyValue(prop).trim();

                variables.push({
                  name: prop,
                  value,
                  computedValue,
                  source: 'shadow-root',
                  specificity: 900,
                  selector: rule.selectorText,
                });
                seen.add(prop);
              }
            }
          }
        });
      } catch {
        // Cross-origin or security errors
      }
    });
  } catch {
    // Handle errors gracefully
  }

  // Check style elements in shadow root
  const styleElements = shadowRoot.querySelectorAll('style');
  styleElements.forEach((styleEl) => {
    try {
      const sheet = styleEl.sheet;
      if (sheet) {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--') && !seen.has(prop)) {
                const value = style.getPropertyValue(prop).trim();
                const computedValue = computedStyle.getPropertyValue(prop).trim();

                variables.push({
                  name: prop,
                  value,
                  computedValue,
                  source: 'shadow-root',
                  specificity: 900,
                  selector: rule.selectorText,
                });
                seen.add(prop);
              }
            }
          }
        });
      }
    } catch {
      // Handle errors gracefully
    }
  });

  return variables;
}

/**
 * Extract CSS variables from element's matching stylesheet rules
 */
function extractCSSVariablesFromElement(
  element: Element,
  computedStyle: CSSStyleDeclaration,
  seen: Set<string>,
): CSSVariableInfo[] {
  const variables: CSSVariableInfo[] = [];

  try {
    // Iterate through all stylesheets
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            // Check if this rule applies to the element
            if (element.matches(rule.selectorText)) {
              const style = rule.style;
              for (let i = 0; i < style.length; i++) {
                const prop = style[i];
                if (prop.startsWith('--') && !seen.has(prop)) {
                  const value = style.getPropertyValue(prop).trim();
                  const computedValue = computedStyle.getPropertyValue(prop).trim();

                  variables.push({
                    name: prop,
                    value,
                    computedValue,
                    source: 'element',
                    specificity: calculateSpecificity(rule.selectorText),
                    selector: rule.selectorText,
                  });
                  seen.add(prop);
                }
              }
            }
          }
        });
      } catch {
        // Cross-origin or security errors
      }
    });
  } catch {
    // Handle errors gracefully
  }

  return variables;
}

/**
 * Extract inherited CSS variables from parent elements
 */
function extractInheritedVariables(
  element: Element,
  computedStyle: CSSStyleDeclaration,
  seen: Set<string>,
  inheritanceLevel: number,
): CSSVariableInfo[] {
  const variables: CSSVariableInfo[] = [];

  if (!(element instanceof HTMLElement)) {
    return variables;
  }

  // Check inline styles of parent
  const style = element.style;
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    if (prop.startsWith('--') && !seen.has(prop)) {
      const value = style.getPropertyValue(prop).trim();
      const computedValue = computedStyle.getPropertyValue(prop).trim();

      variables.push({
        name: prop,
        value,
        computedValue,
        source: 'inherited',
        specificity: 1000 - inheritanceLevel,
        inheritedFrom: element,
      });
      seen.add(prop);
    }
  }

  return variables;
}

/**
 * Extract CSS variables from :root
 */
function extractRootVariables(
  computedStyle: CSSStyleDeclaration,
  seen: Set<string>,
): CSSVariableInfo[] {
  const variables: CSSVariableInfo[] = [];

  try {
    // Check :root in all stylesheets
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (
            rule instanceof CSSStyleRule &&
            (rule.selectorText === ':root' || rule.selectorText === 'html')
          ) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--') && !seen.has(prop)) {
                const value = style.getPropertyValue(prop).trim();
                const computedValue = computedStyle.getPropertyValue(prop).trim();

                variables.push({
                  name: prop,
                  value,
                  computedValue,
                  source: 'root',
                  specificity: 10,
                  selector: rule.selectorText,
                });
                seen.add(prop);
              }
            }
          }
        });
      } catch {
        // Cross-origin or security errors
      }
    });
  } catch {
    // Handle errors gracefully
  }

  return variables;
}

/**
 * Calculate CSS selector specificity
 * Returns a simple numeric value for sorting
 */
function calculateSpecificity(selector: string): number {
  if (!selector) return 0;

  // Simple specificity calculation
  // ID selectors: 100
  // Class selectors, attributes, pseudo-classes: 10
  // Element selectors: 1

  let specificity = 0;

  // Count IDs
  const idMatches = selector.match(/#/g);
  if (idMatches) specificity += idMatches.length * 100;

  // Count classes, attributes, pseudo-classes
  const classMatches = selector.match(/\.|:/g);
  if (classMatches) specificity += classMatches.length * 10;

  // Count elements (rough approximation)
  const elements = selector.split(/[\s>+~]/);
  specificity += elements.length;

  return specificity;
}

/**
 * Update a CSS variable value
 */
export function updateCSSVariable(
  element: Element,
  variableName: string,
  newValue: string,
): boolean {
  try {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    // Set the variable on the element's inline style
    element.style.setProperty(variableName, newValue);
    return true;
  } catch (e) {
    console.error('Failed to update CSS variable:', e);
    return false;
  }
}

/**
 * Remove a CSS variable from an element
 */
export function removeCSSVariable(element: Element, variableName: string): boolean {
  try {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element.style.removeProperty(variableName);
    return true;
  } catch (e) {
    console.error('Failed to remove CSS variable:', e);
    return false;
  }
}
