import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import { useForm, Controller } from "react-hook-form";
import Cookies from "js-cookie";
import { useEffect } from "react";
import axios from "axios";
import useNexora from "../hooks/useNexora";
import AlertBox from "../../components/common/AlertBox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  role: yup.string().oneOf(["user", "admin"]).required("Role is required"),
});

const Login = () => {
  const navigate = useNavigate();

  // alert message
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } =
    useNexora();

  // form validation — use Controller for MUI RadioGroup so the value is captured correctly
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "user",
    },
    resolver: yupResolver(schema),
  });

  // form submit
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/login`,
        data
      );
      if (response.data.status) {
        // Store token and role in cookies
        Cookies.set(import.meta.env.VITE_TOKEN_KEY, response.data.token, {
          expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
          path: "/",
        });
        Cookies.set(import.meta.env.VITE_USER_ROLE, response.data.user.role, {
          expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
          path: "/",
        });
        // Role-based redirect
        if (response.data.user.role === "user") {
          navigate("/profile");
        } else if (response.data.user.role === "admin") {
          navigate("/dashboard");
        } else {
          setAlertBoxOpenStatus(true);
          setAlertSeverity("error");
          setAlertMessage("Something Went Wrong");
        }
      } else {
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      // Surface exact backend error messages (invalid email, wrong password, invalid role)
      if (error.response && error.response.data && error.response.data.message) {
        setAlertMessage(error.response.data.message);
      } else {
        setAlertMessage(error.message || "Something Went Wrong");
      }
    }
  };

  // If user is already logged in, redirect away from the login page
  useEffect(() => {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (token && role) {
      if (role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    }
  }, [navigate]);

  return (
    <>
      <Box height="100vh" sx={{ display: "flex" }}>
        {/* Left illustration panel */}
        <Box
          sx={{
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <img src="/images/auth.jpg" alt="" />
          </Box>
        </Box>

        {/* Right login panel */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#1b2e35",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AlertBox />
          <Box width={1 / 2} mx="auto" my="auto">
            <Typography
              variant="h2"
              component="h1"
              sx={{ color: "white", fontSize: "2.25rem", fontWeight: "bold" }}
            >
              Welcome Back
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ mt: 4 }}
            >
              {/* Login As selector — uses Controller so RadioGroup value is properly tracked */}
              <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
                <FormLabel
                  component="legend"
                  sx={{
                    color: "white",
                    mb: 1,
                    "&.Mui-focused": { color: "white" },
                  }}
                >
                  Login As
                </FormLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel
                        value="user"
                        control={
                          <Radio
                            sx={{
                              color: "white",
                              "&.Mui-checked": { color: "#59e3a7" },
                            }}
                          />
                        }
                        label={<Typography color="white">User</Typography>}
                      />
                      <FormControlLabel
                        value="admin"
                        control={
                          <Radio
                            sx={{
                              color: "white",
                              "&.Mui-checked": { color: "#59e3a7" },
                            }}
                          />
                        }
                        label={<Typography color="white">Admin</Typography>}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.role && (
                  <Typography component="p" sx={{ color: "red" }}>
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>

              {/* Email field */}
              <TextField
                fullWidth
                placeholder="Enter Email"
                sx={{
                  mb: 1,
                  color: "white",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputLabel-outlined": { color: "white" },
                  "& .MuiInputBase-input": {
                    "&::placeholder": { color: "white" },
                  },
                }}
                {...register("email")}
              />
              {errors.email && (
                <Typography component="p" sx={{ color: "red", mb: 2 }}>
                  {errors.email.message}
                </Typography>
              )}

              {/* Password field */}
              <TextField
                fullWidth
                placeholder="Enter Password"
                type="password"
                sx={{
                  mb: 1,
                  color: "white",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputLabel-outlined": { color: "white" },
                  "& .MuiInputBase-input": {
                    "&::placeholder": { color: "white" },
                  },
                }}
                {...register("password")}
              />
              {errors.password && (
                <Typography component="p" sx={{ color: "red" }}>
                  {errors.password.message}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="Remember me"
                  sx={{ mt: 1, color: "gray" }}
                />
                <Link style={{ color: "white" }} to="/forgot-password">
                  <Typography variant="body2">Forgot Password</Typography>
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 4 }}
              >
                Log In
              </Button>
            </Box>

            <Divider sx={{ my: 1, color: "white" }}>OR</Divider>

            <Box>
              <Button
                type="button"
                variant="contained"
                fullWidth
                startIcon={<GoogleIcon />}
              >
                Continue With Google
              </Button>
            </Box>

            <Box>
              <Typography variant="body2" color="white" sx={{ mt: 4 }}>
                {`Don't`} Have an Account?
                <Link
                  to="/registration"
                  style={{ color: "white", marginLeft: "5px" }}
                >
                  Join Now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Login;
