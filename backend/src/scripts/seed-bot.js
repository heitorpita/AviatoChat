import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BOT_ID = process.env.AI_BOT_USER_ID || 'ai-professor-ava-001'

async function main() {
  const existing = await prisma.user.findUnique({ where: { id: BOT_ID } })

  if (existing) {
    console.log(`[seed-bot] Bot já existe: ${existing.fullName} (${existing.id})`)
    return
  }

  const bot = await prisma.user.create({
    data: {
      id: BOT_ID,
      fullName: 'Prof. Ava',
      email: 'ava@aviato.bot',
      password: 'bot-account-no-login',
      bio: 'Professora de idiomas com IA. Estou aqui para te ajudar a praticar e aprender! 🌍',
      profilePic: '',
      nativeLanguage: 'English',
      learningLanguage: 'Portuguese',
      location: 'AviatoChat',
      isOnboarded: true,
      isBot: true,
    },
  })

  console.log(`[seed-bot] Bot criado: ${bot.fullName} (${bot.id})`)
}

main()
  .catch((e) => {
    console.error('[seed-bot] Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
