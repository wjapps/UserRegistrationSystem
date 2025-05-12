import { Link } from "wouter";
import RegisterForm from "@/components/RegisterForm";
import { useState } from "react";
import SuccessModal from "@/components/SuccessModal";

export default function RegisterPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegistrationSuccess = () => {
    setSuccessMessage("Registration completed successfully!");
    setShowSuccess(true);
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">User Registration System</h1>
          <Link href="/login">
            <a className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition">
              Admin Login
            </a>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Registration Form</h2>
          <RegisterForm onSuccess={handleRegistrationSuccess} />
        </div>
      </main>

      <SuccessModal 
        message={successMessage}
        isOpen={showSuccess}
        onClose={closeSuccessModal}
      />
    </div>
  );
}
