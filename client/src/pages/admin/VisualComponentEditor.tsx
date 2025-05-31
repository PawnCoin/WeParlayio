
import React from "react";
import VisualComponentEditor from "@/components/admin/VisualComponentEditor";

const VisualComponentEditorPage: React.FC = () => {
  // Test Card Component with your specified props
  const TestCard = ({ 
    title = "Card Title", 
    content = "This is sample card content", 
    backgroundColor = "#0f172a", 
    borderColor = "", 
    padding = "medium" 
  }) => {
    const paddingClasses = {
      small: "p-3",
      medium: "p-6",
      large: "p-8"
    };

    return (
      <div
        className={`rounded-lg border ${paddingClasses[padding]} shadow-sm`}
        style={{ 
          backgroundColor, 
          borderColor: borderColor || "#e5e7eb",
          color: backgroundColor === "#0f172a" ? "#ffffff" : "#000000"
        }}
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="opacity-80">{content}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Test your card */}
      <div className="p-8">
        <h2 className="text-white text-xl mb-4">Test Card Preview:</h2>
        <TestCard 
          title="Card Title" 
          content="This is sample card content" 
          backgroundColor="#0f172a" 
          borderColor="" 
          padding="medium" 
        />
      </div>
      
      <VisualComponentEditor />
    </div>
  );
};

export default VisualComponentEditorPage;
