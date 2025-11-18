"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Loader2, X } from "lucide-react";
import { SignJWT } from "jose";

function Editor({ isModalOpen, setIsModalOpen, item }) {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!item?.id || isLoading) return;

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
      const fileUrl = item.url;
      const fileType = item.fileType;
      const documentType = getDocumentType(fileType);

      const secretKey = new TextEncoder().encode(
        "4f5e6eef675c4ed79ba5c56b421cd6d2"
      );

      const tokenPayload = {
        document: {
          fileType: fileType,
          key: item.id,
          title: item.name,
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
          onRequestClose: function () {
            console.log("Editor closed");
            if (editorRef.current && editorRef.current.destroyEditor) {
              editorRef.current.destroyEditor();
            }
          },
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
        console.log("🔹 Destroying old editor instance...", editorRef.current);
        editorRef.current.destroyEditor();
      }

      console.log("editor.current Before", editorRef.current);
      console.log("token", token);

      // Initialize new editor instance
      editorRef.current = new window.DocsAPI.DocEditor("onlyoffice-editor", {
        ...tokenPayload,
        token,
        height: "100%",
        width: "100%",
      });

      console.log("editor.current", editorRef.current);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading file:", error);
      setIsLoading(false);
    }
  }, [item, isLoading]);

  const handleClose = () => {
    if (editorRef.current?.destroyEditor) {
      console.log("🔹 Destroying old editor instance...", editorRef.current);
      editorRef.current.destroyEditor();
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && item) {
      getFile();
    }
  }, [isModalOpen, item, getFile]);

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

  return (
    <>
      {isModalOpen && (
        <div className="relative z-50">
          {/* Modal Background */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-[95vw] h-[90vh] overflow-auto bg-white rounded-lg shadow-lg flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center border-b px-6 py-4">
                <h2 className="text-xl text-gray-800 font-semibold">
                  Edit &quot;{item?.name}&quot;
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Editor Section */}
              <div className="flex-1 overflow-hidden min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div
                    id="onlyoffice-editor"
                    className="h-full w-full"
                    style={{ minHeight: "600px" }}
                  ></div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t px-6 py-4 space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Editor;
