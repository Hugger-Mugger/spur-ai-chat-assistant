import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const databaseService = {
  async createConversation() {
    return await prisma.conversation.create({ data: {} });
  },

  async addMessage(conversationId: string, sender: 'USER' | 'AI', text: string) {
    return await prisma.message.create({
      data: { conversationId, sender, text }
    });
  },

  async getConversationHistory(conversationId: string) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' }
    });
  }
};
