export type ChatMessage = {
  id: string;
  author: string;
  name?: string;
  initials?: string;
  text: string;
  ts: number;
};

export function sampleCode(lang: string): string {
  switch (lang) {
    case 'javascript':
      return `// Switch buttons toggle this stage between Code and Canvas\nfunction greet(name){\n  return 'Hello, ' + name + '!';\n}\nconsole.log(greet('World'));`;
    case 'python':
      return `# Click Code/Canvas buttons below to switch views\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet('World'))`;
    case 'json':
      return `{"hello": "world", "answer": 42}`;
    case 'html':
      return `<!doctype html>\n<html>\n  <body>\n    <h1>Hello Talenthium</h1>\n  </body>\n</html>`;
    case 'css':
      return `:root { --accent: #19fb9b; }\n.button { background: var(--accent); }`;
    case 'markdown':
      return `# Monaco + Talenthium\n\n- Code\n- Canvas`;
    case 'java':
      return `class Main {\n  public static void main(String[] args){\n    System.out.println("Hello World");\n  }\n}`;
    case 'csharp':
      return `using System;\nclass Program{\n  static void Main(){\n    Console.WriteLine("Hello World");\n  }\n}`;
    case 'cpp':
      return `#include <iostream>\nint main(){ std::cout << "Hello World\n"; }`;
    case 'go':
      return `package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello World") }`;
    case 'rust':
      return `fn main(){ println!("Hello World"); }`;
    case 'sql':
      return `SELECT 'Hello World' AS greeting;`;
    case 'typescript':
    default:
      return `// Use the switcher buttons below to toggle between Code and Canvas\nfunction greet(name: string){\n  return ` + "`Hello, ${name}!`" + `;\n}\nconsole.log(greet('World'));`;
  }
}

export const languages = [
    'typescript','javascript','python','json','html','css','markdown','java','csharp','cpp','go','rust','sql'
  ] as const;
export type Lang = typeof languages[number];