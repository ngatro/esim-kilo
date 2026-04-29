import { PrismaClient } from './node_modules/@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT to_regclass('public."BlogPost"')`;
    console.log("BlogPost table exists:", result);
    
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'BlogPost' ORDER BY ordinal_position`;
    console.log("Columns:", columns.map((c) => c.column_name));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
