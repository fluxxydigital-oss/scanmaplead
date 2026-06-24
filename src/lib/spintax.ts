export function parseSpintax(text: string, variables: Record<string, string>): string {
  // 1. Resolve spintax primeiro {opção1|opção2}
  // Isso requer regex que não confunda com variáveis, ou apenas aplicamos a lógica: se tiver "|" é spintax.
  let parsed = text.replace(/\{([^{}]+)\}/g, (match, contents) => {
    if (contents.includes('|')) {
      const options = contents.split('|');
      return options[Math.floor(Math.random() * options.length)];
    }
    return match; // Se não for spintax, mantém para a próxima etapa
  });

  // 2. Resolve variáveis {nome}, {cidade}
  parsed = parsed.replace(/\{([^{}]+)\}/g, (match, contents) => {
    const varName = contents.trim().toLowerCase();
    if (variables[varName] !== undefined && variables[varName] !== null) {
      return variables[varName];
    }
    return match; // Se não tiver a variável, deixa o texto original
  });

  return parsed;
}
