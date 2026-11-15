import React from "react";
import "react-toastify/dist/ReactToastify.css";
import ForgetPassword from "../../components/ForgetPassword/ForgetPassword";
import "./index.scss";

const ForgetPasswordPage: React.FC = () => {
  return (
    <main className="forgetpassword">
      <ForgetPassword />
    </main>
  );
};

export default ForgetPasswordPage;
