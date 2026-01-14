import prisma from '../lib/prisma.js';

class UserService {
  /**
   * Create or update user from Kafka event
   * @param {Object} userEvent - User created event from auth service
   */
  async handleUserCreatedEvent(userEvent) {
    try {
      const { userId, email, username, name, createdAt } = userEvent;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (existingUser) {
        console.log(`User with ID ${userId} already exists, skipping...`);
        return existingUser;
      }


      // Create new user
      const user = await prisma.user.create({
        data: {
          id: userId,
          name,
          username,
          email,
          joinDate: createdAt ? new Date(createdAt) : new Date()
        }
      });

      console.log(`✓ User created successfully: ${username} (ID: ${userId})`);
      return user;
    } catch (error) {
      console.error('Error handling user created event:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        socialLinks: true,
        skills: true,
        companies: {
          include: {
            positions: true
          }
        },
        projects: true,
        achievements: true,
        education: true,
        publications: true,
        recommendations: true,
        codingProfiles: true
      }
    });
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        socialLinks: true,
        skills: true,
        companies: {
          include: {
            positions: true
          }
        },
        projects: true,
        achievements: true,
        education: true,
        publications: true,
        recommendations: true,
        codingProfiles: true
      }
    });
  }
}

export default new UserService();
