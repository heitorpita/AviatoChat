// FriendRequest model is defined in backend/prisma/schema.prisma
// Use the Prisma client from src/config/prisma.js to access the database.
//
// Equivalent Mongoose → Prisma:
//   sender    (ObjectId ref User) → sender   User @relation("Sender")
//   recipient (ObjectId ref User) → receiver User @relation("Receiver")
//   status    "pending|accepted"  → FriendRequestStatus PENDING|ACCEPTED|REJECTED
//   timestamps: true              → createdAt / updatedAt automáticos
//
// Exemplos de uso:
//   prisma.friendRequest.create({ data: { senderId, receiverId } })
//   prisma.friendRequest.findMany({ where: { receiverId, status: "PENDING" } })
//   prisma.friendRequest.update({ where: { id }, data: { status: "ACCEPTED" } })
