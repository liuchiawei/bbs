"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  registerSchema as baseRegisterSchema,
  USER_ID_REGEX,
  USER_ID_MAX_LENGTH,
} from "@/lib/validations";
import { t } from "@/lib/constants";

// Extend base schema with client-only field
const registerSchema = baseRegisterSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("PASSWORDS_DO_NOT_MATCH"),
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [userIdError, setUserIdError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const userId = watch("userId");
  const gender = watch("gender");

  // Debounced userId availability check with abort controller
  useEffect(() => {
    const checkUserId = async () => {
      if (!userId || userId.length === 0) {
        setUserIdError(null);
        return;
      }

      // Check format first (client-side validation)
      if (!USER_ID_REGEX.test(userId)) {
        setUserIdError(null); // Let Zod validation handle format errors
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsCheckingUserId(true);
      setUserIdError(null);

      try {
        const response = await fetch(
          `/api/auth/check-userid?userId=${encodeURIComponent(userId)}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );
        const data = await response.json();

        if (response.ok && !data.available) {
          setUserIdError(t("USER_ID_TAKEN"));
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error checking userId:", error);
        }
      } finally {
        setIsCheckingUserId(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(checkUserId, 500);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  const onSubmit = async (data: RegisterFormData) => {
    // Prevent submission if userId is already taken
    if (userIdError) {
      toast.error(userIdError);
      return;
    }

    setIsLoading(true);
    try {
      // Exclude confirmPassword from submission
      const { confirmPassword, ...registerData } = data;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("ERROR_GENERIC"));
      }

      toast.success(t("SUCCESS_CREATED"));
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("ERROR_GENERIC")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // React Compiler automatically optimizes this computation
  const userIdStatus = (() => {
    if (errors.userId) {
      return { type: "error", message: errors.userId.message };
    }
    if (userIdError) {
      return { type: "error", message: userIdError };
    }
    if (userId && userId.length > 0 && !isCheckingUserId) {
      return { type: "success", message: t("USER_ID_AVAILABLE") };
    }
    return null;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t("CREATE_ACCOUNT")}</CardTitle>
          <CardDescription>{t("ENTER_DETAILS_TO_REGISTER")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">{t("USERNAME")}</Label>
              <div className="relative">
                <Input
                  id="userId"
                  placeholder={t("USERNAME_PLACEHOLDER")}
                  maxLength={USER_ID_MAX_LENGTH}
                  {...register("userId")}
                />
                {isCheckingUserId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {userIdStatus?.type === "error" && (
                <p className="text-sm text-destructive">
                  {userIdStatus.message}
                </p>
              )}
              {userIdStatus?.type === "success" && (
                <p className="text-sm text-green-600">{userIdStatus.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("NAME_LABEL")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">{t("NICKNAME_LABEL")}</Label>
              <Input id="nickname" {...register("nickname")} />
              {errors.nickname && (
                <p className="text-sm text-destructive">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("EMAIL")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("PASSWORD")}</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("CONFIRM_PASSWORD")}</Label>
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
              <Label>{t("GENDER_OPTIONAL")}</Label>
              <Tabs
                value={gender || ""}
                onValueChange={(value) => setValue("gender", value)}
              >
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="male">{t("MALE")}</TabsTrigger>
                  <TabsTrigger value="female">{t("FEMALE")}</TabsTrigger>
                  <TabsTrigger value="other">{t("OTHER")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t("BIRTH_DATE_OPTIONAL")}</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("LOADING") : t("REGISTER")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
