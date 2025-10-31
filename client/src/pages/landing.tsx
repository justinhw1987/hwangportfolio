import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Project, SiteSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const publishedProjects = projects?.filter(p => p.status === 'published') || [];
  const featuredProject = publishedProjects.find(p => p.featured === 1);
  const otherProjects = publishedProjects.filter(p => p.featured !== 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="text-xl font-bold font-display hover-elevate active-elevate-2 px-2 py-1 rounded-md cursor-pointer" data-testid="link-home">
                hwang portfolio
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-8">
                <Link href="/">
                  <span className="text-sm uppercase tracking-wider hover:underline decoration-2 underline-offset-8 transition-all cursor-pointer" data-testid="link-nav-work">
                    Work
                  </span>
                </Link>
                <Link href="/admin">
                  <span className="text-sm uppercase tracking-wider hover:underline decoration-2 underline-offset-8 transition-all cursor-pointer" data-testid="link-nav-admin">
                    Admin
                  </span>
                </Link>
              </div>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 min-h-[80vh] flex items-center">
        {settings?.heroImageUrl && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </>
        )}
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h1 className={`text-6xl lg:text-7xl font-bold font-display tracking-tight ${settings?.heroImageUrl ? 'text-white' : ''}`} data-testid="text-hero-title">
                  Design and build
                </h1>
                <p className={`text-lg lg:text-xl leading-relaxed max-w-lg ${settings?.heroImageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
                  Documenting projects we have completed over the years
                </p>
              </div>
              <a href="#projects">
                <Button size="lg" className="rounded-full px-8 group" data-testid="button-view-projects">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>

            {featuredProject && (
              <div className="lg:col-span-7">
                <Link href={`/project/${featuredProject.id}`}>
                  <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-500 hover:scale-[1.02] cursor-pointer" data-testid={`card-featured-project-${featuredProject.id}`}>
                      <div className="aspect-[4/5] relative">
                        {featuredProject.thumbnailUrl ? (
                          <img 
                            src={featuredProject.thumbnailUrl} 
                            alt={featuredProject.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <Badge className="mb-2 bg-white/20 backdrop-blur-sm" data-testid={`badge-featured-category-${featuredProject.id}`}>
                              {featuredProject.category || 'Project'}
                            </Badge>
                            <h3 className="text-2xl font-bold font-display" data-testid={`text-featured-title-${featuredProject.id}`}>{featuredProject.title}</h3>
                            {featuredProject.year && (
                              <p className="text-sm mt-1" data-testid={`text-featured-year-${featuredProject.id}`}>{featuredProject.year}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-24 px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight" data-testid="text-projects-heading">
              Featured Work
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : otherProjects.length === 0 && !featuredProject ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground" data-testid="text-no-projects">
                No projects yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {otherProjects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-500 hover:scale-105 group cursor-pointer" data-testid={`card-project-${project.id}`}>
                      <div className="aspect-[3/2] relative overflow-hidden">
                        {project.thumbnailUrl ? (
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            {project.category && (
                              <Badge className="mb-2 text-xs uppercase tracking-wide bg-white/20 backdrop-blur-sm" data-testid={`badge-category-${project.id}`}>
                                {project.category}
                              </Badge>
                            )}
                            <h3 className="text-2xl font-bold font-display" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
                            {project.year && (
                              <p className="text-sm mt-1" data-testid={`text-project-year-${project.id}`}>{project.year}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold font-display mb-2">hwang portfolio</h3>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
