// Reference: javascript_object_storage blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertProjectSchema, insertProjectImageSchema, loginSchema, insertSiteSettingsSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/login', (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({ message: validationError.message });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json(req.user);
  });

  // Object Storage Routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/images", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Project Routes
  app.get("/api/projects", async (req, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      res.json(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const result = insertProjectSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const project = await storage.updateProject(req.params.id, result.data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Image Routes
  app.get("/api/projects/:id/images", async (req, res) => {
    try {
      const images = await storage.getProjectImages(req.params.id);
      res.json(images);
    } catch (error) {
      console.error("Error fetching project images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  app.post("/api/projects/:id/images", isAuthenticated, async (req, res) => {
    try {
      const result = insertProjectImageSchema.safeParse({
        ...req.body,
        projectId: req.params.id,
      });
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const image = await storage.createProjectImage(result.data);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating project image:", error);
      res.status(500).json({ message: "Failed to create image" });
    }
  });

  app.delete("/api/projects/:projectId/images/:imageId", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProjectImage(req.params.imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  app.patch("/api/projects/:projectId/images/:imageId", isAuthenticated, async (req, res) => {
    try {
      const { sortOrder } = req.body;
      if (typeof sortOrder !== 'number') {
        return res.status(400).json({ message: "sortOrder must be a number" });
      }
      await storage.updateProjectImageOrder(req.params.imageId, sortOrder);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating project image order:", error);
      res.status(500).json({ message: "Failed to update image order" });
    }
  });

  // Site settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || { heroImageUrl: null });
    } catch (error) {
      console.error("Error getting site settings:", error);
      res.status(500).json({ message: "Failed to get site settings" });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const result = insertSiteSettingsSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const settings = await storage.updateSiteSettings(result.data);
      res.json(settings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
