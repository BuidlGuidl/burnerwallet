"use client";

import { useState } from "react";
import { InputBase } from "../scaffold-eth";

export const ImportPrivateKey = () => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="collapse collapse-arrow">
      <input type="checkbox" />
      <div className="collapse-title flex justify-between px-0">Import Private Key</div>
      <div className="collapse-content text-sm md:text-base px-0">
        <p>
          Import a private key into this burner wallet. Make sure the private key does not control a substantial amount
          of assets!
        </p>
        <InputBase
          value={value}
          onChange={newValue => {
            setValue(newValue);
          }}
        />
        <button className="btn btn-sm btn-primary mt-4">Import Private Key</button>
      </div>
    </div>
  );
};
