import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Auth from "./Auth";

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setSearchParams({ mode: "register" });
      setInitialized(true);
    }
  }, [initialized, setSearchParams]);

  return <Auth />;
};

export default Register;
