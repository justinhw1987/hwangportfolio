import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import type { Project, ProjectImage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id;

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: images, isLoading: imagesLoading } = useQuery<ProjectImage[]>({
    queryKey: ["/api/projects", projectId, "images"],
    enabled: !!projectId,
  });

  const { data: allProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (projectLoading || imagesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link href="/">
            <a>
              <Button data-testid="button-back-home">Back to Home</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const beforeImages = images?.filter(img => img.imageType === 'before').sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const afterImages = images?.filter(img => img.imageType === 'after').sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const galleryImages = images?.filter(img => img.imageType === 'gallery').sort((a, b) => a.sortOrder - b.sortOrder) || [];

  const publishedProjects = allProjects?.filter(p => p.status === 'published' && p.id !== projectId) || [];
  const nextProject = publishedProjects[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <a>
            <Button variant="outline" size="sm" className="backdrop-blur-md bg-background/80" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </a>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-end">
        {project.heroImageUrl ? (
          <div className="absolute inset-0">
            <img 
              src={project.heroImageUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        )}
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pb-16 w-full">
          <h1 className="text-6xl lg:text-8xl font-bold font-display tracking-tight text-white mb-8" data-testid="text-project-title">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm uppercase tracking-wide text-white/90">
            {project.client && (
              <div data-testid="text-client">
                <span className="text-white/60">Client:</span> {project.client}
              </div>
            )}
            {project.category && (
              <div data-testid="text-category">
                <span className="text-white/60">Type:</span> {project.category}
              </div>
            )}
            {project.year && (
              <div data-testid="text-year">
                <span className="text-white/60">Year:</span> {project.year}
              </div>
            )}
            {project.role && (
              <div data-testid="text-role">
                <span className="text-white/60">Role:</span> {project.role}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Overview */}
      {project.description && (
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed text-foreground" data-testid="text-description">
              {project.description}
            </p>
            
            {project.tools && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">Tools & Technologies</h3>
                <p className="text-base" data-testid="text-tools">{project.tools}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Before/After Section */}
      {(beforeImages.length > 0 || afterImages.length > 0) && (
        <section className="py-20 px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide" data-testid="badge-before">Before</Badge>
                </div>
                {beforeImages.length > 0 ? (
                  beforeImages.map((image, idx) => (
                    <Card key={image.id} className="overflow-hidden" data-testid={`card-before-${idx}`}>
                      <div className="aspect-[4/3]">
                        <img 
                          src={image.imageUrl} 
                          alt={image.caption || `Before ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {image.caption && (
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground" data-testid={`text-before-caption-${idx}`}>{image.caption}</p>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No before images</p>
                  </Card>
                )}
              </div>

              {/* After Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="default" className="text-xs uppercase tracking-wide" data-testid="badge-after">After</Badge>
                </div>
                {afterImages.length > 0 ? (
                  afterImages.map((image, idx) => (
                    <Card key={image.id} className="overflow-hidden" data-testid={`card-after-${idx}`}>
                      <div className="aspect-[4/3]">
                        <img 
                          src={image.imageUrl} 
                          alt={image.caption || `After ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {image.caption && (
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground" data-testid={`text-after-caption-${idx}`}>{image.caption}</p>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No after images</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold font-display tracking-tight mb-12" data-testid="text-gallery-heading">
              Gallery
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, idx) => (
                <Card key={image.id} className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid={`card-gallery-${idx}`}>
                  <div className="aspect-[4/3]">
                    <img 
                      src={image.imageUrl} 
                      alt={image.caption || `Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {image.caption && (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground" data-testid={`text-gallery-caption-${idx}`}>{image.caption}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Next Project */}
      {nextProject && (
        <section className="relative h-96 group overflow-hidden">
          <Link href={`/project/${nextProject.id}`}>
            <a className="block h-full">
              {nextProject.thumbnailUrl ? (
                <div className="absolute inset-0">
                  <img 
                    src={nextProject.thumbnailUrl} 
                    alt={nextProject.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
              )}
              
              <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
                <p className="text-sm uppercase tracking-wider mb-4" data-testid="text-next-label">Next Project</p>
                <h3 className="text-4xl font-bold font-display mb-2" data-testid="text-next-title">{nextProject.title}</h3>
                <Button variant="outline" className="mt-6 backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-view-next">
                  View Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </a>
          </Link>
        </section>
      )}
    </div>
  );
}
