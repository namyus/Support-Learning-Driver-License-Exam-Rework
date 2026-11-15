import React from "react";
import "react-toastify/dist/ReactToastify.css";
import NewPassword from "../../components/NewPassword/NewPassword";
import "./index.scss";

const NewpasswordPage: React.FC = () => {
  return (
    <main className="newpassword">
      <NewPassword />
    </main>
  );
};

export default NewpasswordPage;
