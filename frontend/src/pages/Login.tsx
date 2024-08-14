"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Input, { ExInput } from "../extra/Input";
import Logo from "../assets/images/logo.png";
import Image from "next/image";
import Button from "../extra/Button";
import { useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { login } from "@/store/adminSlice";

interface RootState {
  admin: {
    isAuth: boolean;
    admin: Object;
  };
}

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuth, admin } = useSelector((state: RootState) => state.admin);

  const [email, setEmail] = useState("demo@admin.com");
  const [password, setPassword] = useState("123456");
  const [demoLogin, setDemoLogin] = useState<boolean>(false);

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (demoLogin) {
      setEmail("demo@admin.com");
      setPassword("123456");
      setError({
        email: "",
        password: "",
      });
      setDemoLogin(false);
    }
  }, [demoLogin]);

  const handleDemoLogin = () => {
    const details: any = {
      email: "demo@admin.com",
      password: "123456",
    };

    dispatch(login(details));
  };

  const handleSubmit = () => {
    if (!email || !password) {
      let errorObj: any = {};
      if (!email) errorObj = { ...errorObj, email: "Email Is Required !" };
      if (!password)
        errorObj = { ...errorObj, password: "Password is required !" };
      return setError(errorObj);
    } else {
      let payload: any = {
        email,
        password,
      };
      dispatch(login(payload));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (email === "demo@admin.com" || password === "123456") {
      if (event.key === "Enter") {
        event.preventDefault();
        handleDemoLogin();
      }
    } else {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv" style={{ width: "100%" }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3  d-flex " style={{ width: "60px" }}>
              <Image src={Logo} width={60} height={60} alt="logo" />
            </div>
            <div className="fw-bold text-theme  me-auto my-auto welComeTitle">
              Welcome Back
            </div>
            <h1>Log In !</h1>
            <h6 className="fw-bold text-theme  me-auto my-auto fs-15 py-2 title">
              Please,Enter Your Email id and Password
            </h6>
            <div>
              <div className="col-12 ">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  label={`Email`}
                  value={email}
                  placeholder={`Email`}
                  errorMessage={error.email && error.email}
                  onChange={(e: any) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `email Id is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 ">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `password is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        password: "",
                      });
                    }
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type={`submit`}
                  className={`bg-theme text-nowrap text-light cursor m10-top col-6 mx-2 `}
                  text={`Demo login`}
                  onClick={demoLogin}
                  style={{ borderRadius: "30px" }}
                />
                <Button
                  type={`submit`}
                  className={`bg-theme text-light cursor m10-top col-6 mx-2`}
                  text={`Log In`}
                  onClick={handleSubmit}
                  style={{ borderRadius: "30px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
