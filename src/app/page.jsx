"use client";
import { useRouter } from "next/navigation";
import { FileText, File } from "lucide-react";
import Editor from "./components/Editor";
import { useState } from "react";

// Static file data
const files = [
  {
    id: "2042790920506",
    name: "sample1.pdf",
    fileType: "pdf",
    url: "https://mstrategygroup-demo.box.com/shared/static/qo7djekcu8qt1rquvnv8394v2a5flfzu.pdf",
    type: "pdf",
    lastModified: "2024-01-15",
  },
  {
    id: "2037342676165",
    name: "sample-files.com-basic-text.docx",
    fileType: "docx",
    url: "https://mstrategygroup-demo.box.com/shared/static/f06v9fqcrge1eep4obllmg1d2c6uginm.docx",
    type: "word",
    lastModified: "2024-01-20",
  },
];

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);

    // router.push(`/editor?id=${file.id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              OnlyOffice Document Editor
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
              Select a document to open in the editor
            </p>
          </div>

          {/* Files Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      {file.fileType === "docx" ? (
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <File className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Type: {file.fileType.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last modified: {file.lastModified}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Document Editor</h2>
            <p className="mb-4 opacity-90">
              Click on any document above to open it in the OnlyOffice editor.
              Edit, save, and manage your documents with ease.
            </p>
          </div>
        </div>
      </div>
      {/* Editor Modal */}
      {selectedFile && (
        <Editor
          isModalOpen={isModalOpen}
          setIsModalOpen={handleCloseModal}
          item={selectedFile}
        />
      )}
    </div>
  );
}
