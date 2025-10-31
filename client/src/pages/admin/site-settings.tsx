import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { SiteSettings } from "@shared/schema";

export default function SiteSettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { heroImageUrl: string | null }) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        setLocation("/login");
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update site settings",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory: "public" }),
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImageComplete = async (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      
      try {
        const response = await fetch("/api/images", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadURL }),
        });
        
        if (!response.ok) throw new Error("Failed to process upload");
        
        const data = await response.json();
        setHeroImageUrl(data.objectPath);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process uploaded image",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = () => {
    saveMutation.mutate({ heroImageUrl: heroImageUrl || null });
  };

  const handleClearImage = () => {
    setHeroImageUrl("");
    saveMutation.mutate({ heroImageUrl: null });
  };

  const currentHeroImage = heroImageUrl || settings?.heroImageUrl || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin")}
            data-testid="button-back-to-admin"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold font-display tracking-tight mb-2" data-testid="text-site-settings-heading">
              Site Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your portfolio site configuration
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hero Background Image</CardTitle>
              <CardDescription>
                Upload an image to display behind the "Design and build" text on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentHeroImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Image:</p>
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                    <img
                      src={currentHeroImage}
                      alt="Hero background"
                      className="w-full h-full object-cover"
                      data-testid="img-hero-preview"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  onGetUploadParameters={handleImageUpload}
                  onComplete={handleImageComplete}
                  buttonClassName="data-testid-upload-hero"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Hero Image
                </ObjectUploader>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending || !heroImageUrl}
                    data-testid="button-save-settings"
                  >
                    {saveMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Settings
                  </Button>

                  {currentHeroImage && (
                    <Button
                      variant="outline"
                      onClick={handleClearImage}
                      disabled={saveMutation.isPending}
                      data-testid="button-clear-image"
                    >
                      Clear Image
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
