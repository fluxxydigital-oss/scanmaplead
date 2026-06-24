import db from "./db";

export async function getMockUser() {
  const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID || "cm1234567890user";
  
  try {
    const user = await db.user.upsert({
      where: { id: mockUserId },
      update: {},
      create: {
        id: mockUserId,
        email: "contato@scanleadmap.com",
        name: "Usuário MVP",
      },
    });
    return user;
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Se deu erro de constraint (email já existe para outro ID), apenas retorna o primeiro usuário
      const fallbackUser = await db.user.findFirst();
      if (fallbackUser) return fallbackUser;
    }
    throw err;
  }
}
