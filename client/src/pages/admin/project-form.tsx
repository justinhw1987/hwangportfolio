import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, Trash2, Loader2, Plus } from "lucide-react";
import type { UploadResult } from "@uppy/core";
import type { Project, ProjectImage, InsertProject, InsertProjectImage } from "@shared/schema";
import { insertProjectSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ObjectUploader } from "@/components/ObjectUploader";
import { z } from "zod";

const formSchema = insertProjectSchema.extend({
  year: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ProjectForm() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/projects/:id");
  const projectId = params?.id;
  const isNewProject = projectId === 'new';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      year: "",
      client: "",
      role: "",
      tools: "",
      status: "draft",
      featured: 0,
      thumbnailUrl: "",
      heroImageUrl: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !isNewProject && !!projectId && isAuthenticated,
  });

  const { data: images } = useQuery<ProjectImage[]>({
    queryKey: ["/api/projects", projectId, "images"],
    enabled: !isNewProject && !!projectId && isAuthenticated,
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        year: project.year?.toString() || "",
        client: project.client || "",
        role: project.role || "",
        tools: project.tools || "",
        status: project.status || "draft",
        featured: project.featured || 0,
        thumbnailUrl: project.thumbnailUrl || "",
        heroImageUrl: project.heroImageUrl || "",
        sortOrder: project.sortOrder || 0,
      });
    }
  }, [project, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const projectData: InsertProject = {
        ...data,
        year: data.year ? parseInt(data.year) : null,
        description: data.description || null,
        category: data.category || null,
        client: data.client || null,
        role: data.role || null,
        tools: data.tools || null,
        thumbnailUrl: data.thumbnailUrl || null,
        heroImageUrl: data.heroImageUrl || null,
      };

      if (isNewProject) {
        return await apiRequest("POST", "/api/projects", projectData);
      } else {
        return await apiRequest("PUT", `/api/projects/${projectId}`, projectData);
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: isNewProject ? "Project created successfully" : "Project updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (isNewProject && data.id) {
        setLocation(`/admin/projects/${data.id}`);
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        setLocation("/login");
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (
    type: 'thumbnail' | 'hero' | 'before' | 'after' | 'gallery'
  ): Promise<{ method: "PUT"; url: string }> => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }
      
      const data = await response.json();
      return {
        method: "PUT",
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImageComplete = async (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>,
    type: 'thumbnail' | 'hero' | 'before' | 'after' | 'gallery'
  ) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      
      try {
        const response = await fetch("/api/images", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageURL: uploadURL }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save image");
        }
        
        const data = await response.json();
        
        if (type === 'thumbnail') {
          form.setValue('thumbnailUrl', data.objectPath);
        } else if (type === 'hero') {
          form.setValue('heroImageUrl', data.objectPath);
        } else if (!isNewProject && projectId) {
          const imageData: InsertProjectImage = {
            projectId: projectId,
            imageUrl: data.objectPath,
            imageType: type,
            caption: null,
            sortOrder: 0,
          };
          
          await apiRequest("POST", `/api/projects/${projectId}/images`, imageData);
          queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "images"] });
        }
        
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save image",
          variant: "destructive",
        });
      }
    }
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await apiRequest("DELETE", `/api/projects/${projectId}/images/${imageId}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "images"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        setLocation("/login");
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  if (authLoading || (!isNewProject && projectLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const beforeImages = images?.filter(img => img.imageType === 'before') || [];
  const afterImages = images?.filter(img => img.imageType === 'after') || [];
  const galleryImages = images?.filter(img => img.imageType === 'gallery') || [];

  const thumbnailUrl = form.watch('thumbnailUrl');
  const heroImageUrl = form.watch('heroImageUrl');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <a>
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </a>
          </Link>
          <h1 className="text-4xl font-bold font-display tracking-tight" data-testid="text-page-title">
            {isNewProject ? 'New Project' : 'Edit Project'}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Project title" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Project description" rows={4} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Interior Design" data-testid="input-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="2024" data-testid="input-year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Client name" data-testid="input-client" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Lead Designer" data-testid="input-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tools"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tools & Technologies</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Photoshop, Illustrator, Figma" data-testid="input-tools" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value === 1}
                              onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                              data-testid="checkbox-featured"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer mb-0">
                            Featured Project
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Images */}
            <Card>
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Thumbnail Image</FormLabel>
                  <div className="flex gap-4 items-start">
                    {thumbnailUrl && (
                      <div className="relative w-40 h-40">
                        <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => form.setValue('thumbnailUrl', '')}
                          data-testid="button-delete-thumbnail"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      onGetUploadParameters={() => handleImageUpload('thumbnail')}
                      onComplete={(result) => handleImageComplete(result, 'thumbnail')}
                      buttonClassName="data-testid-upload-thumbnail"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Thumbnail
                    </ObjectUploader>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Hero Image</FormLabel>
                  <div className="flex gap-4 items-start">
                    {heroImageUrl && (
                      <div className="relative w-40 h-40">
                        <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => form.setValue('heroImageUrl', '')}
                          data-testid="button-delete-hero"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      onGetUploadParameters={() => handleImageUpload('hero')}
                      onComplete={(result) => handleImageComplete(result, 'hero')}
                      buttonClassName="data-testid-upload-hero"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Hero Image
                    </ObjectUploader>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isNewProject && (
              <>
                {/* Before/After Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Before & After Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>Before Images</FormLabel>
                        <ObjectUploader
                          maxNumberOfFiles={5}
                          onGetUploadParameters={() => handleImageUpload('before')}
                          onComplete={(result) => handleImageComplete(result, 'before')}
                          buttonClassName="data-testid-upload-before"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Before
                        </ObjectUploader>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {beforeImages.map((image) => (
                          <div key={image.id} className="relative" data-testid={`image-before-${image.id}`}>
                            <img src={image.imageUrl} alt="Before" className="w-full aspect-square object-cover rounded" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              data-testid={`button-delete-before-${image.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>After Images</FormLabel>
                        <ObjectUploader
                          maxNumberOfFiles={5}
                          onGetUploadParameters={() => handleImageUpload('after')}
                          onComplete={(result) => handleImageComplete(result, 'after')}
                          buttonClassName="data-testid-upload-after"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add After
                        </ObjectUploader>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {afterImages.map((image) => (
                          <div key={image.id} className="relative" data-testid={`image-after-${image.id}`}>
                            <img src={image.imageUrl} alt="After" className="w-full aspect-square object-cover rounded" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              data-testid={`button-delete-after-${image.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gallery Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Additional Photos</FormLabel>
                      <ObjectUploader
                        maxNumberOfFiles={10}
                        onGetUploadParameters={() => handleImageUpload('gallery')}
                        onComplete={(result) => handleImageComplete(result, 'gallery')}
                        buttonClassName="data-testid-upload-gallery"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Gallery Images
                      </ObjectUploader>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative" data-testid={`image-gallery-${image.id}`}>
                          <img src={image.imageUrl} alt="Gallery" className="w-full aspect-square object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                            data-testid={`button-delete-gallery-${image.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Project'
                )}
              </Button>
              <Link href="/admin">
                <a>
                  <Button type="button" variant="outline" data-testid="button-cancel">Cancel</Button>
                </a>
              </Link>
            </div>

            {isNewProject && (
              <p className="text-sm text-muted-foreground">
                Save the project first to upload before/after and gallery images.
              </p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
