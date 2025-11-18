"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { SignJWT } from "jose";
import { useRouter } from "next/navigation";

function StandaloneEditor({ fileData }) {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getDocumentType = (fileType) => {
    const fileMappings = {
      word: ["doc", "docx", "odt", "rtf", "txt"],
      cell: ["xls", "xlsx", "ods", "csv"],
      slide: ["ppt", "pptx", "odp"],
    };
    return (
      Object.keys(fileMappings).find((type) =>
        fileMappings[type].includes(fileType)
      ) || "pdf"
    );
  };

  const getFile = useCallback(async () => {
    if (!fileData?.id || isLoading) return;

    // Wait for OnlyOffice API to be available
    if (typeof window !== "undefined" && !window.DocsAPI) {
      // Wait for script to load
      let attempts = 0;
      while (!window.DocsAPI && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (!window.DocsAPI) {
        console.error("OnlyOffice API failed to load");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Static data - no API calls
      const fileUrl = fileData.url;
      const fileType = fileData.fileType;
      const documentType = getDocumentType(fileType);

      const secretKey = new TextEncoder().encode(
        "4f5e6eef675c4ed79ba5c56b421cd6d2"
      );

      const tokenPayload = {
        document: {
          fileType: fileType,
          key: fileData.id,
          title: fileData.name,
          url: fileUrl,
          permissions: { edit: true, download: true },
        },
        documentType: documentType,
        editorConfig: {
          user: { id: "user-1", name: "Demo User" },
          customization: {
            autoSave: true,
            uiTheme: "default-light",
            features: { tabBackground: { mode: "toolbar" } },
          },
        },
        events: {
          // onRequestClose: function () {
          //   console.log("Editor closed");
          //   if (editorRef.current && editorRef.current.destroyEditor) {
          //     editorRef.current.destroyEditor();
          //   }
          // },
        },
      };

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secretKey);

      // Destroy existing editor instance if it exists
      if (
        editorRef.current &&
        typeof editorRef.current.destroyEditor === "function"
      ) {
        editorRef.current.destroyEditor();
      }

      // Initialize new editor instance
      editorRef.current = new window.DocsAPI.DocEditor("onlyoffice-editor", {
        ...tokenPayload,
        token,
        height: "100%",
        width: "100%",
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading file:", error);
      setIsLoading(false);
    }
  }, [fileData, isLoading]);

  useEffect(() => {
    if (fileData) {
      getFile();
    }
  }, [fileData, getFile]);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        if (editorRef.current.destroyEditor) {
          editorRef.current.destroyEditor();
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    if (editorRef.current?.destroyEditor) {
      editorRef.current.destroyEditor();
    }
    router.push("/");
  };

  if (!fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No file selected
          </h2>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {fileData.name}
          </h2>
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        ) : (
          <div
            id="onlyoffice-editor"
            className="h-full w-full"
            style={{ minHeight: "100%" }}
          ></div>
        )}
      </div>
    </div>
  );
}

export default StandaloneEditor;
