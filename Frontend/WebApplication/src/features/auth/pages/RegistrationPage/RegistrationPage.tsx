import React from "react";
import "react-toastify/dist/ReactToastify.css";
import RegistrationForm from "../../components/RegisterForm/RegistrationForm";
import "./index.scss";

const RegistrationPage: React.FC = () => {
  return (
    <main className="registration-page">
      <RegistrationForm />
    </main>
  );
};

export default RegistrationPage;
