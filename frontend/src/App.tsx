import { useState } from "react";
import classNames from "classnames";
import { ethers } from "ethers";
import axios from "axios";

const App = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const initMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        setSigner(signer);
        setAddress(address);
      } catch (error) {
        setSigner(signer);
      }
    } else {
      setError(
        "MetaMask not detected. Please install MetaMask to use this DApp."
      );
    }
  };

  const handleStake = async () => {
    try {
      if (!signer) {
        setError("Please connect your MetaMask wallet");
        return;
      }
      if (!Boolean(amount)) {
        setError("Please enter amount");
        return;
      }

      setMessage("Staking in progress. Please wait...");
      const response = await axios.post(
        `${baseUrl}/stake`,
        { amount },
        {
          headers: {
            "x-wallet-address": await signer.getAddress(),
          },
        }
      );
      setMessage(response.data.message);
      setError("");
      setAmount("");
    } catch (error) {
      setMessage("");
      setError("Staking error");
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!signer) {
        setError("Please connect your MetaMask wallet");
        return;
      }
      if (!Boolean(amount)) {
        setError("Please enter amount");
        return;
      }

      setMessage("Withdraw in progress. Please wait...");
      const response = await axios.post(
        `${baseUrl}/withdraw`,
        { amount },
        {
          headers: {
            "x-wallet-address": await signer.getAddress(),
          },
        }
      );
      setMessage(response.data.message);
      setError("");
      setAmount("");
    } catch (error) {
      setMessage("");
      setError("Withdrawal error");
    }
  };

  return (
    <div
      className={classNames(
        "background",
        "flex items-center justify-between h-screen flex-col"
      )}
    >
      <header className="flex justify-between items-center w-full px-16 py-6 bg ">
        <span className="text-gray-300 text-2xl">SELFKEY</span>
        <button
          type="button"
          onClick={initMetaMask}
          className={classNames(
            "button-primary",
            "bg-gradient-to-r",
            "from-blue-500 to-pink-500 hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800"
          )}
        >
          Connect to Wallet
        </button>
      </header>
      <main>
        <h1 className="text-6xl font-semibold text-white">Input your amount</h1>
        <form className="mt-16 max-w-[27rem] w-full ">
          <div className="flex flex-col">
            <div className="h-14 flex">
              {signer ? (
                <span className="text-slate-500 text-center">
                  You connected to wallet: {address}
                </span>
              ) : null}
            </div>
            <input
              type="number"
              id="success"
              className={classNames("input-base", {
                "border-green-500 text-green-900 placeholder-green-700 text-sm focus:ring-green-500 focus:border-green-500":
                  message,
                "border-red-500 text-red-900 placeholder-red-700 text-sm focus:ring-red-500 focus:border-red-500":
                  error,
              })}
              value={amount}
              onChange={(e) => {
                setError("");
                setMessage("");
                setAmount(e.target.value);
              }}
              placeholder="Success input"
            />
            <div className="h-8">
              {message ? (
                <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                  <span className="font-medium">Well done!</span> {message}
                </p>
              ) : null}
              {error ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oh, snapp!</span> {error}
                </p>
              ) : null}
            </div>

            <div className="flex my-10 gap-6 w-full justify-between">
              <button
                type="button"
                onClick={handleStake}
                className={classNames("button-primary", {
                  "bg-gradient-to-r from-blue-500 to-pink-500 hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800":
                    signer,
                })}
                disabled={!signer}
              >
                Stake
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                className={classNames("button-primary", {
                  "bg-gradient-to-r from-purple-600 to-blue-500 hover:bg-gradient-to-l focus:ring-blue-300 dark:focus:ring-blue-800":
                    signer,
                })}
                disabled={!signer}
              >
                Withdraw
              </button>
            </div>
          </div>
        </form>
      </main>
      <footer className="flex items-center flex-col justify-center w-full">
        <div className={classNames("divider", "h-1 w-full")} />
        <div
          className={classNames(
            "bg-footer",
            "flex items-center justify-center w-full"
          )}
        >
          <span className="py-8 text-gray-300 text-2xl">SELFKEY</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
