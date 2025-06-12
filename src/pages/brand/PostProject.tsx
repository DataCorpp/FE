import React, { useState } from "react";
import { Step1_SelectProduct, Step2_DefineProject, Step3_ReviewProjects, Step4_ProjectDetail } from "./PostProjects";
import type { ProductCategory } from "./PostProjects/types";
import BrandLayout from "@/components/layouts/BrandLayout";


const PostProject: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductCategory | null>(null);
  const [projectData, setProjectData] = useState<any>({});

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  
  // Reset to step 1 and clear any selected product data
  const goToNewProject = () => {
    setStep(1);
    setSelectedProduct(null);
    setProjectData({});
  };

  return (
    <BrandLayout>
      <div className="w-full min-h-[calc(100vh-64px)] flex items-stretch bg-background transition-colors">
        <div className="flex-1 flex flex-col justify-center">
          {step === 1 && (
            <Step1_SelectProduct
              onNext={nextStep}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
            />
          )}
          {step === 2 && (
            <Step2_DefineProject
              onNext={nextStep}
              onBack={prevStep}
              projectData={projectData}
              setProjectData={setProjectData}
            />
          )}
          {step === 3 && (
            <Step3_ReviewProjects
              onNext={nextStep}
              onBack={prevStep}
              onNewProject={goToNewProject}
            />
          )}
          {step === 4 && (
            <Step4_ProjectDetail
              onBack={prevStep}
            />
          )}
        </div>
      </div>
    </BrandLayout>
  );
};

export default PostProject;
