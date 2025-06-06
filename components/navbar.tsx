import {
  Button,
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/react";

import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";

import Image from "next/image";
import { useTheme } from "next-themes";
import React from "react";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <span className={`text-3xl font-extrabold bg-gradient-to-r from-[#844ABE] to-[#9B6FD3] bg-clip-text text-transparent hover:from-[#6B3B98] hover:to-[#844ABE] transition-all duration-300 tracking-tight drop-shadow-sm`}>
              Twiggle
            </span>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <NextLink href="/login">
            <Button radius="sm" size="lg" variant={theme === "dark" ? "flat" : "solid"}>
              Log in
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <NextLink href="/register">
            <Button color="secondary" radius="full" size="lg">
              Sign up free
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 gap-2" justify="end">
        <NextLink href="/login" target="_blank">
          <Button radius="sm" size="lg" variant={theme === "dark" ? "flat" : "solid"}>
            Log in
          </Button>
        </NextLink>
        <NextLink href="/register" target="_blank">
          <Button color="secondary" radius="full" size="lg">
            Sign up free
          </Button>
        </NextLink>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <ThemeSwitch />
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
