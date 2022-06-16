import React, { useState } from 'react';
import Image from 'next/image';
import { ethers } from "ethers";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useConnect,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import checkoutAbi from '../checkout-abi.json';
import erc20Abi from '../erc20-abi.json';

const checkoutContractConfig = {
  addressOrName: '0xa2d35Fb9d126aAf80039a60E12B562b9eCB38452',
  contractInterface: checkoutAbi,
};

const erc20ContractConfig = {
  addressOrName: '0x28d1120AF8F7a0ebBC00e32e87476f63Ef87b96e',
  contractInterface: erc20Abi,
};

const Home: NextPage = () => {
  const { isConnected } = useConnect();
  const [isNativeCheckout, setNativeCheckout] = useState(true);


  const {
    data: nativeCheckoutData,
    write: nativeCheckout,
    isLoading: isNativeCheckoutLoading,
    isSuccess: isNativeCheckoutStarted,
    error: nativeCheckoutError,
  }  = useContractWrite(
    checkoutContractConfig,
    'nativeCheckout',
    {
      args: [
        "12345-abcdef-67890",
        ethers.utils.parseEther('0.1'),
        1686274626,
        "0x41357f3d9f90a4945c792111d38588a6538af77d5d5ac080dce9d859db8a533a5aa22ee187186942e2d799ef17c57adb1e6f50cfee48c9743a83af7428be21921c"
      ],
      overrides: {
        value: ethers.utils.parseEther('0.1')
      },
    }
  );

  const {
    data: erc20ApprovalData,
    write: erc20ApproveAndCheckout,
    isLoading: isErc20ApprovalLoading,
    isSuccess: isErc20ApprovalStarted,
    error: erc20TokenError,
  }  = useContractWrite(
    erc20ContractConfig,
    'approve',
    {
      args: [
        "0xa2d35Fb9d126aAf80039a60E12B562b9eCB38452",
        ethers.utils.parseEther('800.0'),
      ]
    }
  );


  const {
    data: erc20CheckoutData,
    write: erc20Checkout,
    isLoading: isErc20CheckoutLoading,
    isSuccess: isErc20CheckoutStarted,
    error: erc20CheckoutError,
  }  = useContractWrite(
    checkoutContractConfig,
    'erc20Checkout',
    {
      args: [
        "12345-abcdef-67890",
        "0x28d1120AF8F7a0ebBC00e32e87476f63Ef87b96e",
        ethers.utils.parseEther('800.0'),
        1686274626,
        "0x4bd8e3811bd9dfa6d9e9c54dd71a27f66148a1f4eec66e1bab973d3662cb28f6376f66ded1e0268b4b32a8fa64c1c33c71066540bff6e89ab7b1ac075f9335601b"
      ]
    }
  );

  const { isSuccess: isNativeCheckoutSuccess, error: nativeCheckoutTxError } = useWaitForTransaction({
    hash: nativeCheckoutData?.hash,
  });

  const { isSuccess: isErc20CheckoutSuccess, error: erc20CheckoutTxError } = useWaitForTransaction({
    hash: erc20CheckoutData?.hash,
  });

  const { isSuccess: isErc20ApprovalSuccess, error: erc20ApprovalTxError } = useWaitForTransaction({
    hash: erc20ApprovalData?.hash,
    onSuccess(data) {
      console.log("hahahaha");
      erc20Checkout();
    },
  });


  const isCheckoutSuccess = isNativeCheckoutSuccess || isErc20CheckoutSuccess;

  return (
    <div>
      <div>
        <div id="lol"
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >

          <div>
          {nativeCheckoutError && (
            <p style={{ maxWidth: '300px', marginTop: 24, color: '#FF6257' }}>
              Error: {nativeCheckoutError.message}
            </p>
          )}
          {nativeCheckoutTxError && (
            <p style={{ maxWidth: '300px', marginTop: 24, color: '#FF6257' }}>
              Error: {nativeCheckoutTxError.message}
            </p>
          )}
          {erc20CheckoutError && (
            <p style={{ maxWidth: '300px', marginTop: 24, color: '#FF6257' }}>
              Error: {erc20CheckoutError.message}
            </p>
          )}
          {erc20CheckoutTxError && (
            <p style={{ maxWidth: '300px', marginTop: 24, color: '#FF6257' }}>
              Error: {erc20CheckoutTxError.message}
            </p>
          )}


          {!isConnected && (
            <ConnectButton />
          )}

          {isConnected && !isCheckoutSuccess && (
            <div>
              <button
                style={{ marginTop: 24 }}
                disabled={isNativeCheckoutLoading || isNativeCheckoutStarted || isErc20CheckoutLoading || isErc20CheckoutStarted}
                className="button"
                onClick={() => setNativeCheckout(!isNativeCheckout)}
              >
                {isNativeCheckout && 'Switch to ERC20'}
                {!isNativeCheckout && 'Switch to ETH'}
              </button>
            </div>
          )}

          {isConnected && !isCheckoutSuccess && isNativeCheckout && (
            <div>
              <button
                style={{ marginTop: 24 }}
                disabled={isNativeCheckoutLoading || isNativeCheckoutStarted}
                className="button"
                data-checkout-loading={isNativeCheckoutLoading}
                data-checkout-started={isNativeCheckoutStarted}
                onClick={() => nativeCheckout()}
              >
                {isNativeCheckoutLoading && 'Waiting for approval'}
                {isNativeCheckoutStarted && 'Native Checking out...'}
                {!isNativeCheckoutLoading && !isNativeCheckoutStarted && 'Checkout'}
              </button>
              <div>Paying using ETH</div>
            </div>
          )}

          {isConnected && !isCheckoutSuccess && !isNativeCheckout && (
            <div>
              <button
                style={{ marginTop: 24 }}
                disabled={isErc20CheckoutLoading || isErc20CheckoutStarted}
                className="button"
                data-checkout-loading={isErc20CheckoutLoading || isErc20ApprovalLoading}
                data-checkout-started={isErc20CheckoutStarted || isErc20ApprovalStarted}
                onClick={() => erc20ApproveAndCheckout()}
              >
                {isErc20ApprovalLoading && 'Waiting for approval'}
                {isErc20ApprovalStarted && !isErc20CheckoutLoading && !isErc20CheckoutStarted && 'Approving token spending...'}
                {isErc20CheckoutLoading && 'Waiting for approval'}
                {isErc20CheckoutStarted && 'ERC20 Checking out...'}
                {!isErc20CheckoutLoading && !isErc20CheckoutStarted && !isErc20ApprovalLoading && !isErc20ApprovalStarted && 'Checkout'}
              </button>
              <div>Paying using ERC20</div>
            </div>
          )}

          {isConnected && isCheckoutSuccess && (
            <div>
            SUCCESS!
            </div>
          )}

          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      >
        {isConnected && (
          <ConnectButton />
        )}
      </div>
    </div>
  );
};

export default Home;
