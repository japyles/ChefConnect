'use client';

import { UploadButton } from "@/lib/uploadthing";
import { useCallback } from "react";

export function UploadForm() {
  const onUploadComplete = useCallback((res: { url: string }[]) => {
    if (res) {
      const json = JSON.stringify(res, null, 2);
      console.log("Files: ", json);
      alert("Upload Completed");
    }
  }, []);

  const onUploadError = useCallback((error: Error) => {
    // Log the full error object
    console.error("Full error object:", error);
    
    // Try to parse any additional error details
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    
    if (error instanceof Response) {
      error.json().then(data => {
        console.error("Response data:", data);
      }).catch(e => {
        console.error("Failed to parse response:", e);
      });
    }
    
    alert(`ERROR! ${error.message}`);
  }, []);

  return (
    <div className="w-full max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Test Image Upload</h1>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={onUploadComplete}
          onUploadError={onUploadError}
          appearance={{
            button: "bg-blue-500 hover:bg-blue-600 text-white",
            allowedContent: "text-gray-600",
          }}
        />
      </div>

      <div className="text-sm text-gray-500 text-center">
        Max file size: 4MB. Supported types: .jpg, .jpeg, .png, .gif
      </div>
    </div>
  );
}
