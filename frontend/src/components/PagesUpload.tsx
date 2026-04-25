"use client";

import { File, Trash } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

export default function PagesUpload() {
  const [file, setFile] = React.useState<globalThis.File | null>(null);

  async function createSplat(url: string, { arg: file }: { arg: File }) {
    const loadingId = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload image");

      const data = (await response.json()) as { splat_id: string };

      const splatId = data["splat_id"];

      toast.success("Image uploaded successfully!", { id: loadingId });
      setFile(null);
      window.location.href =
        process.env.NODE_ENV == "developoment"
          ? `http://localhost:3301/splats/${splatId}`
          : `https://remember.theneocorner.com/splats/${splatId}`;
    } catch (error) {
      toast.error("Failed to upload image", { id: loadingId });
    }
  }

  const { trigger } = useSWRMutation(
    "https://api-remember.theneocorner.com/splats",
    createSplat,
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0] ?? null),
  });

  return (
    <div className="flex items-center justify-center p-10">
      <Card className="shadow-none sm:mx-auto sm:max-w-xl">
        <CardHeader>
          <CardTitle>Remember Me</CardTitle>
          <CardDescription>
            Remember Your Pictures in an Immersive Experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (file) trigger(file);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <Label htmlFor="file-upload-2" className="font-medium">
                  Image
                </Label>

                <div
                  {...getRootProps()}
                  className={cn(
                    isDragActive
                      ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                      : "border-border",
                    "mt-2 flex justify-center rounded-md border border-dashed px-6 py-20 transition-colors duration-200",
                  )}
                >
                  <div>
                    <File
                      className="text-muted-foreground/80 mx-auto h-12 w-12"
                      aria-hidden={true}
                    />
                    <div className="text-muted-foreground mt-4 flex">
                      <p>Drag and drop or</p>
                      <label className="text-primary hover:text-primary/80 relative cursor-pointer rounded-sm pl-1 font-medium hover:underline hover:underline-offset-4">
                        <span>choose file</span>
                        <input
                          {...getInputProps()}
                          id="file-upload-2"
                          name="file-upload-2"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1 text-pretty">to upload</p>
                    </div>
                  </div>
                </div>

                {file && (
                  <div className="mt-4">
                    <Card className="relative p-4 shadow-none">
                      <div className="absolute top-1/2 right-4 -translate-y-1/2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove file"
                          onClick={() => setFile(null)}
                        >
                          <Trash className="h-5 w-5" aria-hidden={true} />
                        </Button>
                      </div>
                      <CardContent className="flex items-center space-x-3 p-0">
                        <span className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                          <File
                            className="text-foreground h-5 w-5"
                            aria-hidden={true}
                          />
                        </span>
                        <div>
                          <p className="text-foreground font-medium text-pretty">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
                            {file.size} bytes
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />
            <div className="flex items-center justify-end space-x-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={!file}>
                Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
