import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, LayoutDashboard, FolderOpen, Settings, LogOut, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold font-display" data-testid="text-admin-title">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin">
            <a className="flex items-center gap-3 px-4 py-3 rounded-md bg-sidebar-accent text-sidebar-accent-foreground" data-testid="link-dashboard">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/admin/projects/new">
            <a className="flex items-center gap-3 px-4 py-3 rounded-md hover-elevate active-elevate-2" data-testid="link-new-project">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </a>
          </Link>
        </nav>

        <div className="space-y-2 pt-6 border-t">
          <Link href="/">
            <a className="flex items-center gap-3 px-4 py-3 rounded-md hover-elevate active-elevate-2" data-testid="link-view-site">
              <FolderOpen className="h-4 w-4" />
              <span>View Site</span>
            </a>
          </Link>
          <a 
            href="/api/logout" 
            className="flex items-center gap-3 px-4 py-3 rounded-md hover-elevate active-elevate-2 text-destructive"
            data-testid="link-logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tight" data-testid="text-page-title">Projects</h1>
              <p className="text-muted-foreground mt-2">Manage your portfolio projects</p>
            </div>
            <Link href="/admin/projects/new">
              <a>
                <Button data-testid="button-create-project">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </a>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-projects">{projects?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-published-projects">
                  {projects?.filter(p => p.status === 'published').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-draft-projects">
                  {projects?.filter(p => p.status === 'draft').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : projects && projects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                        <TableCell>
                          {project.thumbnailUrl ? (
                            <img 
                              src={project.thumbnailUrl} 
                              alt={project.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-title-${project.id}`}>{project.title}</TableCell>
                        <TableCell data-testid={`text-category-${project.id}`}>{project.category || '-'}</TableCell>
                        <TableCell data-testid={`text-year-${project.id}`}>{project.year || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'published' ? 'default' : 'secondary'} data-testid={`badge-status-${project.id}`}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/admin/projects/${project.id}`}>
                            <a>
                              <Button variant="outline" size="sm" data-testid={`button-edit-${project.id}`}>
                                Edit
                              </Button>
                            </a>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            data-testid={`button-delete-${project.id}`}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4" data-testid="text-no-projects-admin">No projects yet</p>
                  <Link href="/admin/projects/new">
                    <a>
                      <Button data-testid="button-create-first">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Project
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
