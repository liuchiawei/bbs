"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { toast } from "sonner";

const registerSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .max(12, "User ID must be 12 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "User ID can only contain English letters and numbers"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const userId = watch("userId");
  const gender = watch("gender");

  // Debounced userId availability check
  useEffect(() => {
    const checkUserId = async () => {
      if (!userId || userId.length === 0) {
        setUserIdError(null);
        return;
      }

      // Check format first (client-side validation)
      if (!/^[a-zA-Z0-9]{1,12}$/.test(userId)) {
        setUserIdError(null); // Let Zod validation handle format errors
        return;
      }

      setIsCheckingUserId(true);
      setUserIdError(null);

      try {
        const response = await fetch(`/api/auth/check-userid?userId=${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (response.ok && !data.available) {
          setUserIdError("This User ID is already taken");
        }
      } catch (error) {
        console.error("Error checking userId:", error);
      } finally {
        setIsCheckingUserId(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(checkUserId, 500);

    return () => clearTimeout(timeoutId);
  }, [userId]);

  const onSubmit = async (data: RegisterFormData) => {
    // Prevent submission if userId is already taken
    if (userIdError) {
      toast.error(userIdError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.userId,
          name: data.name,
          nickname: data.nickname,
          email: data.email,
          password: data.password,
          gender: data.gender,
          birthDate: data.birthDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast.success("Registration successful!");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="relative">
                <Input
                  id="userId"
                  placeholder="Max 12 alphanumeric characters"
                  maxLength={12}
                  {...register("userId", {
                    onChange: () => trigger("userId"),
                  })}
                />
                {isCheckingUserId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {errors.userId && (
                <p className="text-sm text-destructive">{errors.userId.message}</p>
              )}
              {!errors.userId && userIdError && (
                <p className="text-sm text-destructive">{userIdError}</p>
              )}
              {!errors.userId && !userIdError && userId && userId.length > 0 && !isCheckingUserId && (
                <p className="text-sm text-green-600">User ID is available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input id="nickname" {...register("nickname")} />
              {errors.nickname && (
                <p className="text-sm text-destructive">{errors.nickname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender (Optional)</Label>
              <Tabs value={gender || ""} onValueChange={(value) => setValue("gender", value)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="male">Male</TabsTrigger>
                  <TabsTrigger value="female">Female</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date (Optional)</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
