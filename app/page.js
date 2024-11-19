"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { ThemeToggle } from "@/components/ui/theme";
import { Database, Eye, EyeClosed } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [anyMessage, setAnyMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  // Check if the user is already logged in
  useEffect(() => {
    if (localStorage.getItem("isChief") === "true") {
      router.replace("/admin");
    }
  }, [router]);

  const onSubmit = async (data) => {
    if (data.username === "admin" && data.password === "admin") {
      localStorage.setItem("isChief", "true");
      router.replace("/admin");
    } else {
      setAnyMessage("You are not my chief, good bye");
      setTimeout(() => {
        window.location.href = "https://google.com";
      }, 2000);
    }
  };

  return (
    <div className="w-full h-dvh lg:h-screen flex justify-center items-center">
      {anyMessage ? (
        <p className="h-screen lg:h-auto text-6xl font-medium px-10 py-16">
          {anyMessage}
        </p>
      ) : (
        <div className="w-full lg:w-96 p-8">
          <div className="flex items-center mb-4 gap-3">
            <Database size={32} weight="fill" className="fill-primary" />
            <h1 className="text-4xl font-semibold">Inventory</h1>
          </div>
          <p className="mb-8 opacity-50">Login to your store.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSmall"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye /> : <EyeClosed />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-6">
                Login
              </Button>
            </form>
          </Form>
          {/* Footer Section */}
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
            <p className="text-sm">Created by</p>
            <a href="https://x.com/01_kartic">
              <img
                src="https://pbs.twimg.com/profile_images/1835770849833721856/YuDddRAV_400x400.jpg"
                alt="Kartic"
                width={28}
                height={28}
                className="rounded-full border"
              />
            </a>
          </div>
        </div>
      )}
      <ThemeToggle className="fixed top-4 right-4" />
    </div>
  );
}
