import { useState, useEffect } from "react";
import { ChevronLeft, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('auth/me/');
        setUser(response.data);
        setFormData({
          username: response.data.username || "",
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
        });
        setAvatarPreview(response.data.avatar || "");
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast({
          title: "错误",
          description: "无法加载用户信息",
          variant: "destructive",
        });
      }
    };
    fetchUserData();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      await api.patch('auth/me/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "保存成功",
        description: "个人信息已更新",
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMsg = error.response?.data?.error || "更新失败，请重试";
      toast({
        title: "更新失败",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">编辑个人资料</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <Card className="p-6 rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                {avatarPreview && <AvatarImage src={avatarPreview} />}
                <AvatarFallback className="text-3xl font-bold">
                  {user ? getInitials(user.username) : <User className="h-16 w-16" />}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-5 w-5" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              点击相机图标更换头像
            </p>
          </div>
        </Card>

        {/* Form Fields */}
        <Card className="p-6 rounded-2xl space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_name">名字</Label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="请输入名字"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">姓氏</Label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="请输入姓氏"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
              className="rounded-xl"
              required
            />
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 rounded-full font-semibold"
          disabled={loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;
