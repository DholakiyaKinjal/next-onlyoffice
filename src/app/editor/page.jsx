"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StandaloneEditor from "../components/StandaloneEditor";

// Static file data - same as home page
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

function EditorContent() {
  const searchParams = useSearchParams();
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    const fileId = searchParams.get("id");
    if (fileId) {
      const file = files.find((f) => f.id === fileId);
      if (file) {
        setFileData(file);
      }
    }
  }, [searchParams]);

  return <StandaloneEditor fileData={fileData} />;
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading editor...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
