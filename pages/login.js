import { h, app } from "hyperapp";
import './login.css';
import { InstallMetaMask } from "./installMetaMask";
import { config } from "../config";

const Login = () => {
  const handleBtnLoginClick = () => {
    if (typeof web3 !== "undefined") {
      if (localStorage.getItem(config.loginStoreKey)) {
        location.reload();
      } else {
        loginMetaMask();
      }

    } else {
      return <InstallMetaMask />;
    }
  };

  const loginMetaMask = async () => {
    try {
      const result = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = result[0];
      localStorage.setItem(config.loginStoreKey, account.toLowerCase());
      location.reload();
    } catch (error) {
      localStorage.removeItem(config.loginStoreKey);
      console.log(error);
    }
  };

  return (
    <div class='d-flex w-100 h-100'>
      <div class='bg-white border-right products-list'>
        <div class="login" style="height: 100vh; display: flex; justify-content: center; align-items: center;">
          <button onclick={() => handleBtnLoginClick()} class="btn btn-login">
            <i class="fa-solid fa-plug"></i> Login using MetaMask
          </button>
        </div>
      </div>
    </div>
  );
};

export { Login };
