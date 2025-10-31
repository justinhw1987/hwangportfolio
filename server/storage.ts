// Reference: javascript_database blueprint
import {
  users,
  projects,
  projectImages,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type ProjectImage,
  type InsertProjectImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  findUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Project image operations
  getProjectImages(projectId: string): Promise<ProjectImage[]>;
  createProjectImage(image: InsertProjectImage): Promise<ProjectImage>;
  deleteProjectImage(id: string): Promise<void>;
  updateProjectImageOrder(id: string, sortOrder: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return project;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({
        ...projectData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Project image operations
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    return await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId))
      .orderBy(projectImages.sortOrder);
  }

  async createProjectImage(imageData: InsertProjectImage): Promise<ProjectImage> {
    const [image] = await db
      .insert(projectImages)
      .values(imageData)
      .returning();
    return image;
  }

  async deleteProjectImage(id: string): Promise<void> {
    await db.delete(projectImages).where(eq(projectImages.id, id));
  }

  async updateProjectImageOrder(id: string, sortOrder: number): Promise<void> {
    await db
      .update(projectImages)
      .set({ sortOrder })
      .where(eq(projectImages.id, id));
  }
}

export const storage = new DatabaseStorage();
