import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { User, Lock, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Username validation
        if (!form.username) {
            newErrors.username = "请输入用户名";
        } else if (form.username.length < 3 || form.username.length > 20) {
            newErrors.username = "用户名长度应在3-150个字符之间";
        } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
            newErrors.username = "用户名只能包含字母、数字和下划线";
        }

        // Email validation
        if (!form.email) {
            newErrors.email = "请输入邮箱";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "邮箱格式不正确";
        }

        // Password validation
        if (!form.password) {
            newErrors.password = "请输入密码";
        } else if (form.password.length < 6) {
            newErrors.password = "密码至少6位";
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = "请再次输入密码";
        } else if (form.confirmPassword !== form.password) {
            newErrors.confirmPassword = "两次密码输入不一致";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = form;

            await api.post('auth/register/', registerData);

            // Save registration data for email verification
            localStorage.setItem("registerData", JSON.stringify(registerData));

            // Navigate to email verification page
            navigate(`/verify-email?email=${encodeURIComponent(registerData.email)}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || "注册失败，请稍后重试";
            setErrors({ general: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
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
                <h1 className="text-[28px] font-bold text-center text-[#1d1d1f] mb-8 tracking-tight">
                    创建账户
                </h1>

                {/* Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                            <Input
                                type="text"
                                placeholder="请输入用户名 (3-150个字符)"
                                value={form.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                className={`pl-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all ${errors.username ? "ring-2 ring-red-500" : ""}`}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-[13px] text-[#ff3b30] mt-1.5">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                            <Input
                                type="email"
                                placeholder="请输入邮箱地址"
                                value={form.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className={`pl-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all ${errors.email ? "ring-2 ring-red-500" : ""}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[13px] text-[#ff3b30] mt-1.5">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="请输入密码 (至少6位)"
                                value={form.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className={`pl-12 pr-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all ${errors.password ? "ring-2 ring-red-500" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[13px] text-[#ff3b30] mt-1.5">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868b]" />
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="请再次输入密码"
                                value={form.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRegister(e)}
                                className={`pl-12 pr-12 h-[52px] bg-[#f5f5f7] border-0 rounded-xl text-[15px] hover:bg-[#ebebed] focus:bg-[#ebebed] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,122,255,0.1)] transition-all ${errors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-[13px] text-[#ff3b30] mt-1.5">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="space-y-3 mt-6">
                        {errors.general && (
                            <Alert variant="destructive" className="mb-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.general}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[52px] bg-[#1d1d1f] hover:bg-[#1d1d1f] text-white rounded-xl text-base font-semibold shadow-[0_4px_16px_rgba(29,29,31,0.3)] hover:shadow-[0_8px_24px_rgba(29,29,31,0.4)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-[left] before:duration-500 hover:before:left-[100%] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "注册中..." : "注册"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/login")}
                            className="w-full h-[52px] bg-white/80 border-[#d2d2d7] hover:bg-white/80 hover:border-[#d2d2d7] text-[#1d1d1f] rounded-xl text-base font-medium hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-300"
                        >
                            已有账户? 立即登录
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;
