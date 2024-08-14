import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";

const WithdrawDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const [mongoId, setMongoId] = useState<any>();

  console.log("mongoId", mongoId);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData);
    }
  }, [dialogueData]);

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-3 col-md-4 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">Bank Details</h4>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
              <form id="expertForm">
                <div className="row align-items-start formBody">

                  {
                    mongoId?.upiId && mongoId?.upiId !== "" &&
                      <div className="col-12">
                        <ExInput
                          type={`text`}
                          id={`upiId`}
                          name={`upiId`}
                          label={`upiId`}
                          placeholder={`upiId`}
                          value={mongoId?.upiId}
                          disabled={true}
                        />
                      </div> 
                    
                  }
                  {
                    mongoId?.bankDetails && 
                    <>
                    <div className="col-12">
                      <ExInput
                        type={`text`}
                        id={`IFSCCode`}
                        name={`IFSCCode`}
                        label={`IFSCCode`}
                        placeholder={`IFSCCode`}
                        value={mongoId?.bankDetails?.IFSCCode}
                        disabled={true}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type={`text`}
                        id={`accountNumber`}
                        name={`accountNumber`}
                        label={`accountNumber`}
                        placeholder={`accountNumber`}
                        value={mongoId?.bankDetails?.accountNumber}
                        disabled={true}
                      />
                    </div>
                    <div className="col-12">
                      <ExInput
                        type={`text`}
                        id={`bankName`}
                        name={`bankName`}
                        label={`bankName`}
                        placeholder={`bankName`}
                        value={mongoId?.bankDetails?.bankName}
                        disabled={true}
                      />
                    </div>

                    <div className="col-12">
                      <ExInput
                        type={`text`}
                        id={`branchName`}
                        name={`branchName`}
                        label={`branchName`}
                        placeholder={`branchName`}
                        value={mongoId?.bankDetails?.branchName}
                        disabled={true}
                      />
                    </div>
                  </>
                  }
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WithdrawDialog;
