import { useState, useCallback } from 'react';

const useAITutorController = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Study Assistant. You can ask me any academic questions, upload text/PDFs, or ask for chapter summaries. What would you like to study today?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = {
      id: String(Date.now()),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Simulate API call for doubt solving
      setTimeout(() => {
        let aiResponseContent = '';
        if (content.toLowerCase().includes('solve') || content.toLowerCase().includes('question') || content.toLowerCase().includes('equation')) {
          aiResponseContent = `Sure! Let's solve this step-by-step:

**Step 1:** Identify the formula or principle required.
**Step 2:** Plug in the given values.
**Step 3:** Perform operations with algebraic simplification.
**Step 4:** State the final answer clearly with units.

Let me know if you want me to explain any of these steps in detail!`;
        } else if (content.toLowerCase().includes('summar') || content.toLowerCase().includes('explain')) {
          aiResponseContent = `Here is a structured summary of the topic:

*   **Key Concept:** Understanding the primary foundation and theoretical background.
*   **Important Terms:** Primary definitions and equations.
*   **Practical Applications:** How this theory is utilized in solving numericals and real-world examples.
*   **Common Mistakes:** Points to watch out for during examinations.`;
        } else {
          aiResponseContent = `That is an interesting question! Here is the explanation:
This concept refers to the core properties and behaviors observed. To understand this easily, think of it as an interactive system where changes to one variable influence outcomes directly. Let me know if you would like me to generate a quick practice quiz for you on this!`;
        }

        const assistantMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: aiResponseContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1200);

    } catch (error) {
      console.error('Error generating AI response:', error);
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat cleared. How can I help you study now?',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearChat
  };
};

export default useAITutorController;
