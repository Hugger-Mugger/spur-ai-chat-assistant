import Groq from 'groq-sdk';

const STORE_KNOWLEDGE = `
You are a premium corporate customer support AI agent for Spur's e-commerce ecosystem.
Use the following official store knowledge to answer customer questions accurately, politely, and clearly.
If the answer cannot be answered using this knowledge, politely inform the customer to connect with our human support tier at support@spurecommerce.com.

OFFICIAL STORE KNOWLEDGE:
1. Shipping Policy: We support worldwide delivery. Local domestic packages take 2-3 business days. International transit takes 7-10 business days. Shipping is fully free for all orders valued above $50.
2. Return & Refund Policy: We offer a strict 30-day money-back guarantee. Items must be unused, unaltered, and retained in their original packaging. Approved refunds take 5-7 bank working days to process back to the original payment method.
3. Support Hours: Our operations run seamlessly from Monday to Friday, 9:00 AM to 6:00 PM EST.
`;

export class LLMService {
  static async generateReply(
    history: Array<{ sender: string; text: string }>,
    userMessage: string
  ): Promise<string> {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error('❌ GROQ_API_KEY is missing in .env configuration');
        return "System Error: Support agent config mismatch. Please audit environment variables.";
      }

      // Initialize Groq instead of problematic Gemini
      const groq = new Groq({ apiKey });
      
      let formattedHistory = "";
      history.forEach(msg => {
        const roleName = msg.sender === 'USER' ? 'Customer' : 'AI Support Agent';
        formattedHistory += `${roleName}: ${msg.text}\n`;
      });

      const productionPrompt = `
      ${STORE_KNOWLEDGE}
      
      CONVERSATION HISTORY CONTEXT:
      ${formattedHistory || 'No previous messages in this session.'}
      
      Customer's Current Query: ${userMessage}
      
      Response (Maintain context, clear prose, absolute professionalism):`;

      // Using Llama 3 8B - High speed, completely free, fits perfect in memory window
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: productionPrompt }],
        model: 'llama-3.1-8b-instant',
      });

      const reply = chatCompletion.choices[0]?.message?.content;
      if (reply) {
        return reply.trim();
      }

      return "I apologize, but I am unable to parse a valid response right now. Please try again shortly.";
    } catch (error) {
      console.error('❌ Groq Pipeline Failure Exception:', error);
      return "I'm experiencing a temporary network delay. Don't worry, your message is saved—please try typing your message once more.";
    }
  }
}

export default LLMService;