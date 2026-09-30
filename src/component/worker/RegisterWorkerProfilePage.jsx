import { useState } from "react";

import { RegisterSuccess } from "./RegisterSuccess";
import { RegisterWorkerProfileForm } from "./RegisterWorkerProfileForm";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { StepProgress } from "./StepProgress";
import { RegisterWorkerDocumentsForm } from "./RegisterWorkerDocumentForm";

export default function RegisterWorkerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = (values) => {
    setBasicInfo(values);
    setStep(2);
  };
  const handleSuccess = (data) => {
    const profileObj = data?.data || data;
    setProfile(profileObj);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setProfile(null);
    setBasicInfo(null);
    setStep(1);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="mb-8 text-center">
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: "#F5820D" }}
          >
            Đăng ký gia nhập
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Đối tác Thợ Nhà
          </h1>
          <p className="mt-3 text-sm text-gray-400 max-w-md mx-auto">
            Hoàn tất hồ sơ nghề nghiệp để bắt đầu nhận việc trên Thợ Nhà.
          </p>
        </div>

        <div
          className="max-w-[860px] mx-auto rounded-2xl p-8 md:p-12"
          style={{ background: "#F5F5F5" }}
        >
          {isSuccess ? (
            <RegisterSuccess profile={profile} onDong={handleClose} />
          ) : (
            <>
              <StepProgress current={step} />
              {step === 1 && (
                <RegisterWorkerProfileForm
                  initialValues={basicInfo}
                  onNext={handleNext}
                />
              )}
              {step === 2 && (
                <RegisterWorkerDocumentsForm
                  basicInfo={basicInfo}
                  onBack={() => setStep(1)}
                  onSuccess={handleSuccess}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
