import React from "react";
import "react-toastify/dist/ReactToastify.css";
import RegistrationForm from "../../molecules/RegisterForm/RegistrationForm";
import "./index.scss";

const RegistrationPage: React.FC = () => {
  return (
    <main className="registration">
      <RegistrationForm />
    </main>
  );
};

export default RegistrationPage;

