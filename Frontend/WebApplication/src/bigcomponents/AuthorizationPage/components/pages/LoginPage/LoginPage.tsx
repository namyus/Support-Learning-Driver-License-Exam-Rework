import React from "react";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "../../molecules/LoginForm/LoginForm";
import "./index.scss";

const LoginPage: React.FC = () => {
  return (
    <main className="login">
      <LoginForm />
    </main>
  );
};

export default LoginPage;

