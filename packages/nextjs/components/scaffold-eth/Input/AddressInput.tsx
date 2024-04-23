import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounce } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { CommonInputProps, InputBase, isENS } from "~~/components/scaffold-eth";

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const _debouncedValue = useDebounce(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;

  // If the user changes the input after an ENS name is already resolved, we want to remove the stale result
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: settledValue,
    enabled: isENS(debouncedValue),
    chainId: 1,
    cacheTime: 30_000,
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: settledValue as Address,
    enabled: isAddress(debouncedValue),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    enabled: Boolean(ensName),
    chainId: 1,
    cacheTime: 30_000,
  });

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(debouncedValue);
    onChange(ensAddress);
  }, [ensAddress, onChange, debouncedValue]);

  const handleChange = useCallback(
    (newValue: Address) => {
      setEnteredEnsName(undefined);
      onChange(newValue);
    },
    [onChange],
  );

  const avatarStyles = "rounded-full border-2 border-white shadow-md";

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {value && !ensAvatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className={avatarStyles} src={blo(value as `0x${string}`)} width={96} height={96} />
      )}
      {ensAvatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={`${ensAddress} avatar`} className={avatarStyles} src={ensAvatar} width={96} height={96} />
      )}
      {!value && !ensAvatar && <div className={`${avatarStyles} w-24 h-24 bg-slate-300`}></div>}
      <div className="w-full">
        <InputBase<Address>
          name={name}
          placeholder={placeholder}
          error={ensAddress === null}
          value={value as Address}
          onChange={handleChange}
          disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
          prefix={
            ensName && (
              <div className="flex bg-accent text-accent-content rounded-l-md items-center">
                <span className="px-2">{enteredEnsName ?? ensName}</span>
              </div>
            )
          }
        />
      </div>
    </div>
  );
};
