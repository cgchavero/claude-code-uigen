import { anthropic } from "@ai-sdk/anthropic";
import {
  LanguageModelV1,
  LanguageModelV1StreamPart,
  LanguageModelV1Message,
} from "@ai-sdk/provider";

const MODEL = "claude-haiku-4-5";

export class MockLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const;
  readonly provider = "mock";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "tool" as const;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractUserPrompt(messages: LanguageModelV1Message[]): string {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "user") {
        const content = message.content;
        if (Array.isArray(content)) {
          // Extract text from content parts
          const textParts = content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text);
          return textParts.join(" ");
        } else if (typeof content === "string") {
          return content;
        }
      }
    }
    return "";
  }

  private getLastToolResult(messages: LanguageModelV1Message[]): any {
    // Find the last tool message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "tool") {
        const content = messages[i].content;
        if (Array.isArray(content) && content.length > 0) {
          return content[0];
        }
      }
    }
    return null;
  }

  private async *generateMockStream(
    messages: LanguageModelV1Message[],
    userPrompt: string
  ): AsyncGenerator<LanguageModelV1StreamPart> {
    // Count tool messages to determine which step we're on
    const toolMessageCount = messages.filter((m) => m.role === "tool").length;

    // Determine component type from the original user prompt
    const promptLower = userPrompt.toLowerCase();
    let componentType = "counter";
    let componentName = "Counter";

    if (promptLower.includes("form")) {
      componentType = "form";
      componentName = "ContactForm";
    } else if (promptLower.includes("card")) {
      componentType = "card";
      componentName = "Card";
    }

    // Step 1: Create component file
    if (toolMessageCount === 1) {
      const text = `I'll create a ${componentName} component for you.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(25);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_1`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "create",
          path: `/components/${componentName}.jsx`,
          file_text: this.getComponentCode(componentType),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 2: Enhance component
    if (toolMessageCount === 2) {
      const text = `Now let me enhance the component with better styling.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(25);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_2`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "str_replace",
          path: `/components/${componentName}.jsx`,
          old_str: this.getOldStringForReplace(componentType),
          new_str: this.getNewStringForReplace(componentType),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 3: Create App.jsx
    if (toolMessageCount === 0) {
      const text = `This is a static response. You can place an Anthropic API key in the .env file to use the Anthropic API for component generation. Let me create an App.jsx file to display the component.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(15);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_3`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "create",
          path: "/App.jsx",
          file_text: this.getAppCode(componentName),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 4: Final summary (no tool call)
    if (toolMessageCount >= 3) {
      const text = `Perfect! I've created:

1. **${componentName}.jsx** - A fully-featured ${componentType} component
2. **App.jsx** - The main app file that displays the component

The component is now ready to use. You can see the preview on the right side of the screen.`;

      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(30);
      }

      yield {
        type: "finish",
        finishReason: "stop",
        usage: {
          promptTokens: 50,
          completionTokens: 50,
        },
      };
      return;
    }
  }

  private getComponentCode(componentType: string): string {
    switch (componentType) {
      case "form":
        return `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="relative max-w-lg mx-auto">
      {/* Background decoration */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b9d] via-[#c06c84] to-[#6c5b7b] rounded-[2.5rem] blur opacity-20"></div>
      
      <div className="relative bg-[#f8f3f1] rounded-[2.5rem] shadow-[0_8px_30px_rgba(108,91,123,0.12)] border-2 border-[#e8dcd9] overflow-hidden">
        {/* Header section with gradient */}
        <div className="bg-gradient-to-br from-[#ff6b9d] to-[#c06c84] p-8 pb-12">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Let's Connect</h2>
          <p className="text-white/80 text-sm">We'd love to hear from you. Drop us a message!</p>
        </div>

        {/* Form section */}
        <div className="px-8 py-8 -mt-6 bg-[#f8f3f1] rounded-t-[2rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-semibold text-[#6c5b7b] mb-2 tracking-wide"
              >
                YOUR NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  required
                  className={\`w-full px-5 py-3.5 bg-white border-2 \${focused === 'name' ? 'border-[#ff6b9d] shadow-[0_0_0_3px_rgba(255,107,157,0.1)]' : 'border-[#e8dcd9]'} rounded-2xl focus:outline-none transition-all duration-200 text-[#6c5b7b] placeholder:text-[#c4b5b0]\`}
                  placeholder="Enter your full name"
                />
                <div className={\`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full \${formData.name ? 'bg-[#4ecca3]' : 'bg-[#e8dcd9]'} transition-colors\`}></div>
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-[#6c5b7b] mb-2 tracking-wide"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                  className={\`w-full px-5 py-3.5 bg-white border-2 \${focused === 'email' ? 'border-[#ff6b9d] shadow-[0_0_0_3px_rgba(255,107,157,0.1)]' : 'border-[#e8dcd9]'} rounded-2xl focus:outline-none transition-all duration-200 text-[#6c5b7b] placeholder:text-[#c4b5b0]\`}
                  placeholder="you@example.com"
                />
                <div className={\`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full \${formData.email ? 'bg-[#4ecca3]' : 'bg-[#e8dcd9]'} transition-colors\`}></div>
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="message" 
                className="block text-sm font-semibold text-[#6c5b7b] mb-2 tracking-wide"
              >
                YOUR MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused('')}
                required
                rows={4}
                className={\`w-full px-5 py-3.5 bg-white border-2 \${focused === 'message' ? 'border-[#ff6b9d] shadow-[0_0_0_3px_rgba(255,107,157,0.1)]' : 'border-[#e8dcd9]'} rounded-2xl focus:outline-none transition-all duration-200 text-[#6c5b7b] placeholder:text-[#c4b5b0] resize-none\`}
                placeholder="Tell us what's on your mind..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff6b9d] to-[#c06c84] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_16px_rgba(255,107,157,0.3)] hover:shadow-[0_12px_24px_rgba(255,107,157,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Send Message ✨
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;`;

      case "card":
        return `import React from 'react';

const Card = ({ 
  title = "Premium Plan", 
  description = "Unlock unlimited potential with our most advanced features and priority support.",
  price = "$29",
  features = ["Unlimited Projects", "Priority Support", "Advanced Analytics", "Custom Branding"]
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-[2rem] shadow-[0_20px_60px_rgba(15,52,96,0.4)] border border-[#2a4d6e]/30 backdrop-blur-sm">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#4ecca3]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#93b5e1]/20 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="px-4 py-1.5 bg-[#4ecca3]/10 border border-[#4ecca3]/30 rounded-full">
            <span className="text-[#4ecca3] text-sm font-medium tracking-wide">POPULAR</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ecca3] to-[#2d9a7c] flex items-center justify-center shadow-lg shadow-[#4ecca3]/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-[#93b5e1] text-base mb-8 leading-relaxed">{description}</p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-5xl font-extrabold text-white tracking-tight">{price}</span>
          <span className="text-[#93b5e1]/70 text-lg">/month</span>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-[#4ecca3]/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#4ecca3]"></div>
              </div>
              <span className="text-white/90 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="w-full py-4 px-6 bg-gradient-to-r from-[#4ecca3] to-[#2d9a7c] text-white font-semibold rounded-2xl shadow-lg shadow-[#4ecca3]/25 hover:shadow-xl hover:shadow-[#4ecca3]/35 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]">
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default Card;`;

      default:
        return `import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = (delta) => {
    setIsAnimating(true);
    setCount(count + delta);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const reset = () => {
    setIsAnimating(true);
    setCount(0);
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-[3rem] opacity-30 blur-xl"></div>
      
      <div className="relative bg-gradient-to-br from-[#1e1e2f] to-[#2a2a40] rounded-[3rem] shadow-[0_25px_50px_rgba(102,126,234,0.25)] border border-[#667eea]/20 p-10 backdrop-blur-sm">
        {/* Decorative circles */}
        <div className="absolute top-6 right-6 w-24 h-24 bg-[#667eea]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-6 left-6 w-20 h-20 bg-[#f093fb]/10 rounded-full blur-xl"></div>
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#f093fb] tracking-tight">
            Digital Counter
          </h2>
          <p className="text-[#a0a0c0] text-sm mt-1">Track your numbers in style</p>
        </div>

        {/* Counter Display */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/5 to-[#f093fb]/5 rounded-3xl blur-sm"></div>
          <div className="relative bg-[#16161f] rounded-3xl border-2 border-[#667eea]/30 p-8 shadow-inner">
            <div className={\`text-7xl font-black text-center transition-all duration-200 \${isAnimating ? 'scale-110' : 'scale-100'}\`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
                {count}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => handleChange(-1)}
            className="group relative px-6 py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-lg shadow-[#667eea]/30 hover:shadow-xl hover:shadow-[#667eea]/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative text-white font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
              </svg>
            </span>
          </button>

          <button 
            onClick={reset}
            className="group relative px-8 py-3.5 bg-[#2a2a40] border-2 border-[#667eea]/40 rounded-2xl hover:border-[#667eea] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/10 to-[#f093fb]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative text-[#667eea] font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          </button>
          
          <button 
            onClick={() => handleChange(1)}
            className="group relative px-6 py-3.5 bg-gradient-to-br from-[#764ba2] to-[#f093fb] rounded-2xl shadow-lg shadow-[#f093fb]/30 hover:shadow-xl hover:shadow-[#f093fb]/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative text-white font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </button>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-[#667eea]/20">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-[#a0a0c0] text-xs uppercase tracking-wider mb-1">Status</div>
              <div className="text-white text-sm font-semibold">
                {count === 0 ? 'Neutral' : count > 0 ? 'Positive' : 'Negative'}
              </div>
            </div>
            <div>
              <div className="text-[#a0a0c0] text-xs uppercase tracking-wider mb-1">Value</div>
              <div className="text-white text-sm font-semibold">{Math.abs(count)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;`;
    }
  }

  private getOldStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form":
        return "    console.log('Form submitted:', formData);";
      case "card":
        return '      <div className="p-6">';
      default:
        return "  const increment = () => setCount(count + 1);";
    }
  }

  private getNewStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form":
        return "    console.log('Form submitted:', formData);\n    alert('Thank you! We\\'ll get back to you soon.');";
      case "card":
        return '      <div className="p-6 hover:bg-gray-50 transition-colors">';
      default:
        return "  const increment = () => setCount(prev => prev + 1);";
    }
  }

  private getAppCode(componentName: string): string {
    if (componentName === "Card") {
      return `import Card from '@/components/Card';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Card />
      </div>
    </div>
  );
}`;
    }

    if (componentName === "ContactForm") {
      return `import ContactForm from '@/components/ContactForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f1] to-[#fde8e9] flex items-center justify-center p-8">
      <ContactForm />
    </div>
  );
}`;
    }

    return `import ${componentName} from '@/components/${componentName}';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <${componentName} />
      </div>
    </div>
  );
}`;
  }

  async doGenerate(
    options: Parameters<LanguageModelV1["doGenerate"]>[0]
  ): Promise<Awaited<ReturnType<LanguageModelV1["doGenerate"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);

    // Collect all stream parts
    const parts: LanguageModelV1StreamPart[] = [];
    for await (const part of this.generateMockStream(
      options.prompt,
      userPrompt
    )) {
      parts.push(part);
    }

    // Build response from parts
    const textParts = parts
      .filter((p) => p.type === "text-delta")
      .map((p) => (p as any).textDelta)
      .join("");

    const toolCalls = parts
      .filter((p) => p.type === "tool-call")
      .map((p) => ({
        toolCallType: "function" as const,
        toolCallId: (p as any).toolCallId,
        toolName: (p as any).toolName,
        args: (p as any).args,
      }));

    // Get finish reason from finish part
    const finishPart = parts.find((p) => p.type === "finish") as any;
    const finishReason = finishPart?.finishReason || "stop";

    return {
      text: textParts,
      toolCalls,
      finishReason: finishReason as any,
      usage: {
        promptTokens: 100,
        completionTokens: 200,
      },
      warnings: [],
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        },
      },
    };
  }

  async doStream(
    options: Parameters<LanguageModelV1["doStream"]>[0]
  ): Promise<Awaited<ReturnType<LanguageModelV1["doStream"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);
    const self = this;

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        try {
          const generator = self.generateMockStream(options.prompt, userPrompt);
          for await (const chunk of generator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return {
      stream,
      warnings: [],
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {},
      },
      rawResponse: { headers: {} },
    };
  }
}

export function getLanguageModel() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.log("No ANTHROPIC_API_KEY found, using mock provider");
    return new MockLanguageModel("mock-claude-sonnet-4-0");
  }

  return anthropic(MODEL);
}
