import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import { withdrawRequestDeclineUpdate, withdrawRequestPayUpdate } from "@/store/withdrawalSlice";
import { permissionError } from "@/utils/Alert";


interface ErrorState {
    reason: string
}

const WithdrawReasonDialog = () => {
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();
    const [mongoId, setMongoId] = useState<any>();
    const [reason, setReason] = useState<any>();
    const [error, setError] = useState({
        reason: ''
    })

    console.log('mongoId', mongoId)

    console.log('dialogueData', dialogueData)


    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData);
        }
    }, [dialogueData]);

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!dialogueData) return permissionError()

        if (!reason) {
            let error = {} as ErrorState

            if (!reason) error.reason = "Reason is Required"
            return setError({ ...error })
        } else {
            const id = mongoId._id

            console.log('id', id)

            const payload = {
                reason,
                id
            }
            dispatch(withdrawRequestDeclineUpdate(payload))
            dispatch(closeDialog())

        }
    }

    return (
        <div className="dialog">
            <div className="w-100">
                <div className="row justify-content-center">
                    <div className="col-xl-3 col-md-4 col-11">
                        <div className="mainDiaogBox">
                            <div className="row justify-content-between align-items-center formHead">
                                <div className="col-8">
                                    <h4 className="text-theme m0">Enter Your Reason</h4>
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
                                    <div className="col-12">
                                        <ExInput
                                            type={`text`}
                                            id={`reason`}
                                            name={`reason`}
                                            label={`reason`}
                                            placeholder={`reason`}
                                            errorMessage={error.reason && error.reason}
                                            onChange={(e) => {
                                                console.log("Selected Type:", e.target.value);
                                                setReason(e.target.value)
                                                if (!e.target.value) {
                                                    return setError({
                                                        ...error,
                                                        reason: "Reason is Required !",
                                                    });
                                                } else {
                                                    setError({
                                                        ...error,
                                                        reason: "",
                                                    });
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            className={`text-end btn bg-theme text-white ml-2`}
                                            text={`Submit`}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WithdrawReasonDialog;
