import React from "react";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./index.scss";

const LoginPage: React.FC = () => {
  return (
    <main className="login-page">
      <LoginForm />
    </main>
  );
};

export default LoginPage;
