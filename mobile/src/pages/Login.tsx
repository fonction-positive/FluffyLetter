import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import api from "@/lib/api";

const Login = () => {
    const navigate = useNavigate();
    const [loginMode, setLoginMode] = useState<"password" | "email">("password");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Password login form
    const [passwordForm, setPasswordForm] = useState({
        username: "",
        password: "",
    });

    // Email login form
    const [emailForm, setEmailForm] = useState({
        email: "",
        code: "",
    });

    const [countdown, setCountdown] = useState(0);
    const [codeSending, setCodeSending] = useState(false);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset error when switching modes
    useEffect(() => {
        setErrorMessage("");
    }, [loginMode]);

    // Cleanup countdown timer
    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
        };
    }, []);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        // Validation
        if (!passwordForm.username) {
            setErrorMessage("请输入用户名或邮箱");
            return;
        }

        if (!passwordForm.password) {
            setErrorMessage("请输入密码");
            return;
        }

        if (passwordForm.password.length < 6) {
            setErrorMessage("密码至少6位");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('auth/login/', passwordForm);
            const { access, refresh } = response.data;
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            navigate("/");
        } catch (err: any) {
            let errorMsg = "登录失败";
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMsg = Array.isArray(detail) ? detail[0] : detail;
            } else if (err.response?.data?.message) {
                const message = err.response.data.message;
                errorMsg = Array.isArray(message) ? message[0] : message;
            }
            setErrorMessage(errorMsg);
            // Clear form on error
            setPasswordForm({ username: "", password: "" });
        } finally {
            setLoading(false);
        }
    };

    const sendCode = async () => {
        if (!emailForm.email) {
            setErrorMessage("请输入邮箱地址");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailForm.email)) {
            setErrorMessage("邮箱格式不正确");
            return;
        }

        setCodeSending(true);
        setErrorMessage("");

        try {
            await api.post('auth/send_email_code/', { email: emailForm.email });

            // Start countdown
            setCountdown(60);
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
            countdownTimerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownTimerRef.current) {
                            clearInterval(countdownTimerRef.current);
                            countdownTimerRef.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            let errorMsg = "发送失败";
            if (err.response?.data?.detail) {
                errorMsg = err.response.data.detail;
            }
            setErrorMessage(errorMsg);
        } finally {
            setCodeSending(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        // Validation
        if (!emailForm.email) {
            setErrorMessage("请输入邮箱地址");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailForm.email)) {
            setErrorMessage("邮箱格式不正确");
            return;
        }

        if (!emailForm.code) {
            setErrorMessage("请输入验证码");
            return;
        }

        if (emailForm.code.length !== 6) {
            setErrorMessage("验证码应为6位");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('auth/email_login/', emailForm);
            const { access, refresh } = response.data;
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            navigate("/");
        } catch (err: any) {
            let errorMsg = "登录失败";
            if (err.response?.data?.detail) {
                errorMsg = err.response.data.detail;
            }
            setErrorMessage(errorMsg);
            setEmailForm({ ...emailForm, code: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4 py-6">
            <Card className="w-full max-w-[440px] p-12 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-white border-0">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-[72px] h-[72px] bg-[#1d1d1f] rounded-[18px] flex items-center justify-center">
                        <span className="text-white text-[32px] font-bold tracking-tight">F</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-[28px] font-bold text-center text-[#1d1d1f] mb-2 tracking-tight">
                    欢迎回来
                </h1>
                <p className="text-[15px] text-center text-[#86868b] mb-6">
                    登录您的账户以继续
                </p>

                {/* Forms with transition */}
                <div className="relative">
                    {/* Password Login Form */}
                    {loginMode === "password" && (
                        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                                <Input
                                    type="text"
                                    placeholder="请输入用户名或邮箱"
                                    value={passwordForm.username}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, username: e.target.value })
                                    }
                                    className="pl-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="请输入密码"
                                    value={passwordForm.password}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, password: e.target.value })
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin(e)}
                                    className="pl-12 pr-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <div className="space-y-3 mt-6">
                                {errorMessage && (
                                    <Alert variant="destructive" className="mb-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] bg-[#1d1d1f] hover:bg-[#1d1d1f] text-white rounded-xl text-base font-semibold shadow-[0_4px_16px_rgba(29,29,31,0.3)] hover:shadow-[0_8px_24px_rgba(29,29,31,0.4)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-[100%]"
                                >
                                    {loading ? "登录中..." : "登录"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/register")}
                                    className="w-full h-[52px] bg-white/80 border-[#d2d2d7] hover:bg-white/80 hover:border-[#d2d2d7] text-[#1d1d1f] rounded-xl text-base font-medium hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-300"
                                >
                                    注册新账户
                                </Button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 my-3">
                                    <div className="flex-1 h-px bg-[#d2d2d7]" />
                                    <span className="text-sm text-[#86868b]">或</span>
                                    <div className="flex-1 h-px bg-[#d2d2d7]" />
                                </div>

                                {/* Switch to Email */}
                                <button
                                    type="button"
                                    onClick={() => setLoginMode("email")}
                                    className="w-full flex items-center justify-center gap-2 text-[#1d1d1f] text-[15px] hover:scale-105 transition-transform"
                                >
                                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>使用邮箱验证码登录</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Email Login Form */}
                    {loginMode === "email" && (
                        <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                                <Input
                                    type="email"
                                    placeholder="请输入邮箱地址"
                                    value={emailForm.email}
                                    onChange={(e) =>
                                        setEmailForm({ ...emailForm, email: e.target.value })
                                    }
                                    className="pl-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                                    <Input
                                        type="text"
                                        placeholder="请输入验证码"
                                        maxLength={6}
                                        value={emailForm.code}
                                        onChange={(e) =>
                                            setEmailForm({ ...emailForm, code: e.target.value })
                                        }
                                        onKeyDown={(e) => e.key === "Enter" && handleEmailLogin(e)}
                                        className="pl-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={sendCode}
                                    disabled={countdown > 0 || codeSending}
                                    className="min-w-[120px] h-[52px] bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] border-0 rounded-xl text-sm font-medium disabled:bg-[#f5f5f7] disabled:text-[#86868b] disabled:cursor-not-allowed transition-all"
                                >
                                    {countdown > 0 ? `${countdown}秒后重试` : codeSending ? "发送中" : "发送验证码"}
                                </Button>
                            </div>

                            <div className="space-y-3 mt-6">
                                {errorMessage && (
                                    <Alert variant="destructive" className="mb-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] bg-[#1d1d1f] hover:bg-[#1d1d1f] text-white rounded-xl text-base font-semibold shadow-[0_4px_16px_rgba(29,29,31,0.3)] hover:shadow-[0_8px_24px_rgba(29,29,31,0.4)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-[100%]"
                                >
                                    {loading ? "登录中..." : "登录"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/register")}
                                    className="w-full h-[52px] bg-white/80 border-[#d2d2d7] hover:bg-white/80 hover:border-[#d2d2d7] text-[#1d1d1f] rounded-xl text-base font-medium hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-300"
                                >
                                    注册新账户
                                </Button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 my-3">
                                    <div className="flex-1 h-px bg-[#d2d2d7]" />
                                    <span className="text-sm text-[#86868b]">或</span>
                                    <div className="flex-1 h-px bg-[#d2d2d7]" />
                                </div>

                                {/* Switch to Password */}
                                <button
                                    type="button"
                                    onClick={() => setLoginMode("password")}
                                    className="w-full flex items-center justify-center gap-2 text-[#1d1d1f] text-[15px] hover:scale-105 transition-transform"
                                >
                                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>使用密码登录</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Login;
