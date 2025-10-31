import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

export async function initializeAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // In production, require ADMIN_PASSWORD to be set
  if (process.env.NODE_ENV === "production" && (!adminPassword || adminPassword === "admin123")) {
    console.error("\n❌ SECURITY ERROR: ADMIN_PASSWORD environment variable must be set to a strong password in production.");
    console.error("   Current value is either not set or using the default 'admin123' password.");
    console.error("   Please set a secure password using: ADMIN_PASSWORD=your_secure_password");
    console.error("\n   Example: ADMIN_PASSWORD=MyS3cur3P@ssw0rd!\n");
    process.exit(1);
  }

  // In development, use default password if not set (with warning)
  const password = adminPassword || "admin123";
  
  if (!adminPassword) {
    console.warn("\n⚠️  WARNING: Using default admin password 'admin123'");
    console.warn("   Set ADMIN_PASSWORD environment variable to use a custom password");
    console.warn("   This is only allowed in development mode\n");
  }

  try {
    // Check if admin user exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await hashPassword(password);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
      });
      console.log("✓ Admin user created successfully");
    } else {
      // Check if existing admin has default password
      const bcrypt = await import("bcryptjs");
      const hasDefaultPassword = await bcrypt.compare("admin123", existingAdmin[0].password);
      
      if (hasDefaultPassword && adminPassword && adminPassword !== "admin123") {
        // Update to new password
        const hashedPassword = await hashPassword(password);
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.username, "admin"));
        console.log("✓ Admin password updated from default to custom password");
      } else if (hasDefaultPassword && process.env.NODE_ENV === "production") {
        console.error("\n❌ SECURITY ERROR: Admin user exists with default password 'admin123'");
        console.error("   Set ADMIN_PASSWORD environment variable to update it to a secure password\n");
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
    throw error;
  }
}
