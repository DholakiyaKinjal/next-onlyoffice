"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Loader2, X } from "lucide-react";
import { SignJWT } from "jose";

function Editor({ isModalOpen, setIsModalOpen, item, selectedItem }) {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [replaceReq, setReplaceReq] = useState(false);
  const [blobReq, setBlobReq] = useState(false);
  const [token, setToken] = useState("");
  const [fileType, setFileType] = useState("");

  // Helper function to get user data from localStorage or cookies
  const getUserData = () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
      // Fallback to default values
      return {
        email: "demo@example.com",
        boxFolderId: "308009672911",
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      return {
        email: "demo@example.com",
        boxFolderId: "308009672911",
      };
    }
  };

  // Helper function for API calls
  const fetchWrapper = async (url, options = {}) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwNUY4RDQ2LTgyRUYtRUYxMS05MEM5LTAwMjI0OEMwOTc2MCIsInBvcnRhbElkIjoiZG9vZGxlIiwiZW1haWwiOiJkb29kbGV1c2VyMkB5b3BtYWlsLmNvbSIsIm5hbWUiOiJUZXN0IEFkbWluIiwicm9sZSI6ImFkbWluIiwiY29tcGFueSI6eyJuYW1lIjoiZG9vZGxlIiwibG9nbyI6Imh0dHBzOi8vYm94cGFydG5lci5ibG9iLmNvcmUud2luZG93cy5uZXQvdXBsb2Fkcy9sb2dvLTE3NDAwNTI4MTc1MzAtNDA1MjAxMTA1LnBuZyJ9LCJpc09uYm9hcmRpbmdSZXF1aXJlZCI6ZmFsc2UsImJveFVzZXJJZCI6IjQwMjY5MDExMjY2IiwiY29sbGFib3JhdGlvbklkcyI6W3siZm9sZGVySWQiOiIxNzgyODg0MzIwNDQwIiwicm9sZSI6InZpZXdlciIsInR5cGUiOiJmaWxlIn1dLCJzaWduUmVxdWVzdHNJZHMiOlsiMTUxOTgwYTctNjRjNy00NTQzLWJmMjktODlhMjE4ZTQ4MmE3IiwiMWYzZGM5MzktYzNmOC00YWU3LTllZWItMjAxNWFjZTgwYTgxIiwiYzJmNDgyNmEtYWNhZi00YWExLTg1MTItZWQ2N2MxNzVhZWExIiwiNjc0ODYzMTQtNzdhZC00OTRkLWJjNTYtM2Y2YzA4ZmZiNmUzIl0sInBlcm1pc3Npb25zIjpbeyJwb3J0YWxJZCI6ImRvb2RsZSIsInJvbGUiOiJhZG1pbiJ9XSwiaXNUTkNBY2NlcHRlZCI6dHJ1ZSwidGl0bGUiOiJkZXYiLCJwaG9uZU5vIjpudWxsLCJib3hGb2xkZXJJZCI6IjMwODAwOTY3MjkxMSIsImlhdCI6MTc2MzQ2MTk4NSwiZXhwIjoxNzY0MDY2Nzg1fQ.MJcZoIBHXckAHf6ghe9Q55ZCMY0yXduVQT1G8AF_0eY`,
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include",
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return fetch(url, config);
  };

  const getBlobFromUrl = async (url, fileTypeParam) => {
    try {
      if (blobReq) {
        return;
      } else {
        setBlobReq(true);
      }
      console.log("FileType", fileTypeParam);
      const response = await fetchWrapper(
        `/api/box/files/proxy-file?url=${encodeURIComponent(
          url
        )}&fileType=${fileTypeParam}&token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file. Status: ${response.status}`);
      }

      const blob = await response.blob(); // ✅ Convert response to Blob
      console.log("✅ Blob received:", blob);

      setBlobReq(false);
      return blob;
    } catch (error) {
      console.error("❌ Error fetching blob:", error);
      setBlobReq(false);
      return null;
    }
  };

  const uploadFileToBox = async (blob) => {
    if (replaceReq) {
      return;
    } else {
      setReplaceReq(true);
    }
    if (!blob) {
      console.log("No blob");
      setReplaceReq(false);
      return;
    }
    try {
      setIsSaveLoading(true);
      const userData = getUserData();
      const formData = new FormData();
      formData.append("file", blob, item.name);
      if (!!selectedItem && selectedItem.type == "folder") {
        formData.append("boxFolderId", selectedItem.id);
      } else {
        formData.append("boxFolderId", userData.boxFolderId);
      }
      formData.append("email", userData.email);

      const response = await fetchWrapper("/api/box/files/replace", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const result = await response.json();
      console.log("File uploaded successfully:", result);

      if (editorRef.current?.destroyEditor) {
        editorRef.current.destroyEditor();
      }
      setIsModalOpen(false);
      setReplaceReq(false);
      setIsSaveLoading(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setIsModalOpen(false);
      setIsSaveLoading(false);
      setReplaceReq(false);
    }
  };

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

    const response = await fetch(`/api/box/editor?fileId=${item.id}`, {
      method: "GET",
      credentials: "include", // 🔥 REQUIRED to send cookies
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwNUY4RDQ2LTgyRUYtRUYxMS05MEM5LTAwMjI0OEMwOTc2MCIsInBvcnRhbElkIjoiZG9vZGxlIiwiZW1haWwiOiJkb29kbGV1c2VyMkB5b3BtYWlsLmNvbSIsIm5hbWUiOiJUZXN0IEFkbWluIiwicm9sZSI6ImFkbWluIiwiY29tcGFueSI6eyJuYW1lIjoiZG9vZGxlIiwibG9nbyI6Imh0dHBzOi8vYm94cGFydG5lci5ibG9iLmNvcmUud2luZG93cy5uZXQvdXBsb2Fkcy9sb2dvLTE3NDAwNTI4MTc1MzAtNDA1MjAxMTA1LnBuZyJ9LCJpc09uYm9hcmRpbmdSZXF1aXJlZCI6ZmFsc2UsImJveFVzZXJJZCI6IjQwMjY5MDExMjY2IiwiY29sbGFib3JhdGlvbklkcyI6W3siZm9sZGVySWQiOiIxNzgyODg0MzIwNDQwIiwicm9sZSI6InZpZXdlciIsInR5cGUiOiJmaWxlIn1dLCJzaWduUmVxdWVzdHNJZHMiOlsiMTUxOTgwYTctNjRjNy00NTQzLWJmMjktODlhMjE4ZTQ4MmE3IiwiMWYzZGM5MzktYzNmOC00YWU3LTllZWItMjAxNWFjZTgwYTgxIiwiYzJmNDgyNmEtYWNhZi00YWExLTg1MTItZWQ2N2MxNzVhZWExIiwiNjc0ODYzMTQtNzdhZC00OTRkLWJjNTYtM2Y2YzA4ZmZiNmUzIl0sInBlcm1pc3Npb25zIjpbeyJwb3J0YWxJZCI6ImRvb2RsZSIsInJvbGUiOiJhZG1pbiJ9XSwiaXNUTkNBY2NlcHRlZCI6dHJ1ZSwidGl0bGUiOiJkZXYiLCJwaG9uZU5vIjpudWxsLCJib3hGb2xkZXJJZCI6IjMwODAwOTY3MjkxMSIsImlhdCI6MTc2MzQ2MTk4NSwiZXhwIjoxNzY0MDY2Nzg1fQ.MJcZoIBHXckAHf6ghe9Q55ZCMY0yXduVQT1G8AF_0eY`,
        "Content-Type": "application/json",
      },
    });

    if (!response || !response.ok) throw new Error("Failed to fetch file");

    const { fileUrl, fileType: fetchedFileType } = await response.json();
    setFileType(fetchedFileType);

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
      const documentType = getDocumentType(fetchedFileType);
      // Capture fileType for use in event callbacks
      const currentFileType = fetchedFileType;

      const secretKey = new TextEncoder().encode(
        "4f5e6eef675c4ed79ba5c56b421cd6d2"
      );

      const tokenPayload = {
        document: {
          fileType: fetchedFileType,
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
          onRequestSaveAs: async function (event) {
            console.log("Saving document...");
            try {
              const data = event.data; // Get file data from ONLYOFFICE
              console.log("fileData", event);
              const blob = await getBlobFromUrl(data.url, currentFileType);
              console.log("blob", blob);
              if (blob) {
                await uploadFileToBox(blob);
              }
            } catch (error) {
              console.error("Error updating file:", error);
            }
          },
          onRequestClose: function () {
            console.log("Editor closed");
            if (editorRef.current && editorRef.current.destroyEditor) {
              editorRef.current.destroyEditor();
            }
          },
          onDownloadAs: async function (event) {
            console.log("Downloading document...");
            try {
              const data = event.data; // Get file data from ONLYOFFICE
              console.log("fileData", event);
              const blob = await getBlobFromUrl(data.url, currentFileType);
              console.log("blob", blob);
              if (blob) {
                await uploadFileToBox(blob);
              }
            } catch (error) {
              console.error("Error downloading file:", error);
            }
          },
        },
      };

      const jwtToken = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secretKey);
      
      setToken(jwtToken);

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
        token: jwtToken,
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
                  disabled={isSaveLoading}
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (editorRef.current?.downloadAs) {
                      setIsSaveLoading(true);
                      editorRef.current.downloadAs();
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaveLoading || isLoading}
                >
                  {isSaveLoading ? "Saving..." : "Save"}
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
