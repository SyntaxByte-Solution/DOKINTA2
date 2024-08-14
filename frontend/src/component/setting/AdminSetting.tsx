import Button from "@/extra/Button";
import { ExInput, Textarea } from "@/extra/Input";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { getSetting, handleSetting, updateSetting } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/utils/Alert";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ErrorState {
  privacyPolicyLinkText: string;
  currencyNameText: string;
  currencySymbolText: string;
  tncText: any;
  taxText: any;
  commissionPercentText: any;
  firebaseKeyText: string;
  minWithdrawText: string;
}

const AdminSetting = () => {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const hasPermission = useSelector((state: RootStore) => state?.setting);

  console.log("hasPermission", hasPermission);

  const [privacyPolicyLinkText, setPrivacyPolicyLinkText] = useState<any>();
  const [currencyNameText, setCurrencyNameText] = useState<any>();
  const [currencySymbolText, setcurrencySymbolText] = useState<any>();
  const [tncText, setTncText] = useState<any>();
  const [taxText, setTaxText] = useState<any>();
  const [commissionPercentText, setCommissionPercentText] = useState<any>();
  const [firebaseKeyText, setFirebaseKeyText] = useState<any>();
  const [minWithdrawText, setmMinWithdrawText] = useState<any>();
  const [data, setData] = useState<any>();

  const [error, setError] = useState<any>({
    privacyPolicyLinkText: "",
    currencyNameText: "",
    currencySymbolText: "",
    tncText: "",
    taxText: "",
    commissionPercentText: "",
    firebaseKey: "",
    minWithdrawText: "",
  });

  console.log("setting", setting);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    setData(setting);
  }, [setting]);

  useEffect(() => {
    setPrivacyPolicyLinkText(setting?.privacyPolicyLink);
    setCurrencyNameText(setting?.currencyName);
    setcurrencySymbolText(setting?.currencySymbol);
    setTncText(setting?.tnc);
    setTaxText(setting?.tax);
    setCommissionPercentText(setting?.commissionPercent);
    setFirebaseKeyText(JSON.stringify(setting?.firebaseKey));
    setmMinWithdrawText(setting?.minWithdraw);
  }, [setting]);

  const handleSettingSwitch: any = (id: any, type: any) => {
    console.log("id", id, type);

    // if (!hasPermission) return permissionError();
    const payload = {
      id,
      type,
    };
    dispatch(handleSetting(payload));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!hasPermission) return permissionError();

    if (
      !privacyPolicyLinkText ||
      !currencyNameText ||
      !currencySymbolText ||
      !tncText ||
      !taxText ||
      !commissionPercentText ||
      !firebaseKeyText ||
      !minWithdrawText
    ) {
      {
        let error = {} as ErrorState;
        if (!privacyPolicyLinkText)
          error.privacyPolicyLinkText = "privacyPolicyLink Is Required !";
        if (!currencyNameText)
          error.currencyNameText = "currencyName Is Required !";

        if (!currencySymbolText)
          error.currencySymbolText = "Currency Symbol Text is Required!";
        if (!tncText) error.tncText = "Terms and Condition Is Required !";
        if (!taxText) error.taxText = "Tax Is Required !";
        if (!commissionPercentText)
          error.commissionPercentText = "CommisionPenrcent Is Required !";
        if (!firebaseKeyText)
          error.firebaseKeyText = "FirbaseKey Is Required !";
        if (!minWithdrawText)
          error.minWithdrawText = "Minimum Withdraw Is Required !";

        return setError({ ...error });
      }
    } else {
      let settingDataSubmit = {
        settingId: data?._id,
        privacyPolicyLink: privacyPolicyLinkText,
        currencySymbol: currencySymbolText,
        currencyName: currencyNameText,
        tax: taxText,
        tnc: tncText,
        commissionPercent: commissionPercentText,
        firebaseKey: firebaseKeyText,
        minWithdraw: minWithdrawText,
      };
      dispatch(updateSetting(settingDataSubmit));
    }
  };

  return (
    <div className="mainSetting">
      <form onSubmit={handleSubmit} id="expertForm">
        <div className=" d-flex justify-content-end">
          <div className="  formFooter">
            <Button
              type={`submit`}
              className={`text-light m10-left fw-bold`}
              text={`Submit`}
              style={{ backgroundColor: "#1ebc1e" }}
            />
          </div>
        </div>
        <div className="settingBox row">
          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>App Setting</h4>
              </div>
              <div>
                <div className="row d-flex justify-content-center d-flex align-items-baseline">
                  <div className="col-8">
                    <ExInput
                      type={`text`}
                      id={`privacyPolicyLink`}
                      name={`privacyPolicyLink`}
                      label={`Privacy Policy Link`}
                      value={privacyPolicyLinkText}
                      errorMessage={
                        error.privacyPolicyLinkText &&
                        error.privacyPolicyLinkText
                      }
                      placeholder={`Privacy Policy Link`}
                      onChange={(e: any) => {
                        setPrivacyPolicyLinkText(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            privacyPolicyLinkText: `PrivacyPolicyLink Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            privacyPolicyLinkText: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-4 inputData">
                    <div>
                      <label className="my-3">MaintenanceMode Active</label>
                    </div>
                    <ToggleSwitch
                      onClick={() => handleSettingSwitch(setting?._id, 3)}
                      value={setting?.MaintenanceMode}
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`tnc`}
                  name={`tnc`}
                  label={`Terms and Condition`}
                  placeholder={`Terms and Condition`}
                  errorMessage={error.tncText && error.tncText}
                  value={tncText}
                  onChange={(e: any) => {
                    setTncText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        tncText: `Terms and Condition is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        tncText: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`tax`}
                  name={`tax`}
                  label={`Tax(%)`}
                  placeholder={`Tax`}
                  errorMessage={error.taxText && error.taxText}
                  value={taxText}
                  onChange={(e: any) => {
                    setTaxText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        taxText: `Tax Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        taxText: "",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Currency Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`currencyName`}
                  name={`currencyName`}
                  label={`Currency Name`}
                  placeholder={`Currency Name`}
                  errorMessage={
                    error.currencyNameText && error.currencyNameText
                  }
                  value={currencyNameText}
                  onChange={(e: any) => {
                    setCurrencyNameText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        currencyNameText: `Currency Name Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        currencyNameText: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12">
                <ExInput
                  type={`text`}
                  id={`currencySymbol`}
                  name={`currencySymbol`}
                  label={`Currency Symbol`}
                  placeholder={`Currency Symbol`}
                  errorMessage={
                    error.currencySymbolText && error.currencySymbolText
                  }
                  value={currencySymbolText}
                  onChange={(e: any) => {
                    setcurrencySymbolText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        currencySymbolText: `Currency Symbol Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        currencySymbolText: "",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Financial Setting</h4>
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`commissionPercent`}
                  name={`commissionPercent`}
                  label={`commission Percent`}
                  placeholder={`commission Percent`}
                  errorMessage={
                    error.commissionPercentText && error.commissionPercentText
                  }
                  value={commissionPercentText}
                  onChange={(e: any) => {
                    setCommissionPercentText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        commissionPercentText: `Commision Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        commissionPercentText: "",
                      });
                    }
                  }}
                />

                <ExInput
                  type={`text`}
                  id={`minWithdraw`}
                  name={`minWithdraw`}
                  label={`minWithdraw (Doctor)`}
                  placeholder={`minWithdraw`}
                  errorMessage={error.minWithdrawText && error.minWithdrawText}
                  value={minWithdrawText}
                  onChange={(e: any) => {
                    setmMinWithdrawText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        minWithdrawText: `Withdraw Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        minWithdrawText: "",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 mt-3 ">
            <div className="settingBoxOuter">
              <div className="settingBoxHeader">
                <h4>Firebase Notification Setting</h4>
              </div>
              <div className="col-12 ">
                <Textarea
                  row={10}
                  type={`text`}
                  id={`firebaseKey`}
                  name={`firebaseKey`}
                  label={`Private Key JSON`}
                  placeholder={`Enter firebaseKey`}
                  errorMessage={error.firebaseKeyText && error.firebaseKeyText}
                  value={firebaseKeyText}
                  onChange={(e: any) => {
                    setFirebaseKeyText(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        firebaseKeyText: `Private Key Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        firebaseKeyText: "",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSetting;
