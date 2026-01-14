export type ChatMessage = {
  id: string;
  author: string;
  name?: string;
  initials?: string;
  text: string;
  ts: number;
};

// Supported languages for the code editor
export type Lang = 'typescript' | 'javascript' | 'python' | 'cpp';

export const languages: Lang[] = ['typescript', 'javascript', 'python', 'cpp'];

export function sampleCode(lang: Lang): string {
  switch (lang) {
    case 'javascript':
      return `// JavaScript sample\n// Use the switcher buttons below to toggle between Code and Canvas\nfunction greet(name){\n  return 'Hello, ' + name + '!';\n}\nconsole.log(greet('World'));`;
    case 'python':
      return `# Python sample\n# Use the switcher buttons below to toggle between Code and Canvas\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet('World'))`;
    case 'cpp':
      return `// C++ sample\n// Use the switcher buttons below to toggle between Code and Canvas\n#include <iostream>\n#include <string>\nint main(){\n  std::string name = "World";\n  std::cout << "Hello, " << name << "!" << std::endl;\n  return 0;\n}`;
      case 'typescript':
      default:
        return `// TypeScript sample\n// Use the switcher buttons below to toggle between Code and Canvas\nfunction greet(name: string){\n  return 'Hello, ' + name + '!';\n}\nconsole.log(greet('World'));`;
  }
}
