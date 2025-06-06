import {
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  Navbar as NextUINavbar,
  DropdownSection,
  User,
  NavbarMenuToggle,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";

import NextLink from "next/link";

import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import router from "next/router";
import { createClient } from "@/utils/supabase/components";
import { ProfileDataProps } from "@/pages/admin";

interface NavbarProps {
  option: string;
  userID: string;
  profileData: ProfileDataProps;
}

export const Navbar: React.FC<NavbarProps> = ({
  option,
  userID,
  profileData,
}) => {
  const { theme, setTheme } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<any>(undefined);
  const [feedbackModalSize, setFeedbackModalSize] = useState<
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "full"
    | "xs"
    | "3xl"
    | "4xl"
    | "5xl"
    | undefined
  >("lg");
  const supabase = createClient();

  useEffect(() => {
    function updateFeedbackModal() {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 768) {
        setFeedbackModalSize("lg");
      } else {
        setFeedbackModalSize("full");
      }
    }

    // Update scale factor initially
    updateFeedbackModal();

    // Add event listener for resize to update scale factor when screen size changes
    window.addEventListener("resize", updateFeedbackModal);
    return () => {
      window.removeEventListener("resize", updateFeedbackModal);
    };
  }, []); // empty dependency array ensures the effect runs only once after mount

  const handleSignOut = async () => {
    try {
      await axios.post("/api/signout");
      router.push("/login");
    } catch (error) {
      // Handle error response
      console.error("Error:", error);
    }
  };

  const sendFeedback = async () => {
    const { error } = await supabase.from("feedback").insert({
      user_id: userID,
      content: feedbackContent,
    });
    if (error) {
      console.error("Error sending feedback", error);
      setFeedbackSuccess(false);
    } else {
      console.log("Feedback sent successfully");
      setFeedbackContent("");
      setFeedbackSuccess(true);
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedbackContent(e.target.value);
  };

  return (
    <NextUINavbar maxWidth="xl" isBordered>
      <NavbarContent
        className="basis-1/5 hidden sm:flex sm:basis-full"
        justify="start"
      >
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <span className={`text-3xl font-extrabold bg-gradient-to-r from-[#844ABE] to-[#9B6FD3] bg-clip-text text-transparent hover:from-[#6B3B98] hover:to-[#844ABE] transition-all duration-300 tracking-tight drop-shadow-sm`}>
              Twiggle
            </span>
          </NextLink>
        </NavbarBrand>
        <NavbarItem>
          <NextLink href="/admin">
            <Button
              radius="full"
              size="lg"
              variant="light"
              startContent={<i className="ri-stacked-view"></i>}
              className={`flex items-center text-default-500 gap-2 ${
                option === "Links" ? "font-bold text-default-foreground" : ""
              }`}
            >
              <span className="">Links</span>
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink href="/admin/appearance">
            <Button
              radius="full"
              size="lg"
              variant="light"
              startContent={<i className="ri-shapes-line"></i>}
              className={`flex items-center text-default-500 gap-2 ${
                option === "Appearance"
                  ? "font-bold text-default-foreground"
                  : ""
              }`}
            >
              <span className="">Appearance</span>
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink href="/admin/settings">
            <Button
              radius="full"
              size="lg"
              variant="light"
              startContent={<i className="ri-settings-line"></i>}
              className={`flex items-center text-default-500 gap-2 ${
                option === "Settings" ? "font-bold text-default-foreground" : ""
              }`}
            >
              <span className="">Settings</span>
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink href="/admin/marketplace">
            <Button
              radius="full"
              size="lg"
              variant="light"
              startContent={<i className="ri-store-2-line"></i>}
              className={`flex items-center text-default-500 gap-2 ${
                option === "Marketplace" ? "font-bold text-default-foreground" : ""
              }`}
            >
              <span className="">Marketplace</span>
            </Button>
          </NextLink>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Snippet
            symbol=""
            variant="flat"
            color="secondary"
            size="lg"
            codeString={`https://twgl.link/${profileData.username}`}
          >
            Share me
          </Snippet>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                isBordered
                name={profileData.profileTitle[0]?.toUpperCase() || "@"}
                as="button"
                className="bg-black text-white"
                src={profileData.avatarUrl}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              className="p-5"
              disabledKeys={["user"]}
            >
              <DropdownItem isReadOnly key="user" className="w-80 opacity-100">
                <User
                  name={`@${
                    profileData.profileTitle.replace(/\b\w/g, (c: string) =>
                      c.toUpperCase()
                    ) ||
                    profileData.profileTitle ||
                    ""
                  }`}
                  description={`twgl.link/${profileData.username}`}
                  classNames={{
                    name: "font-semibold mb-1 ml-2",
                    description: "text-default-500 ml-2",
                  }}
                  avatarProps={{
                    size: "md",
                    src: profileData.avatarUrl,
                    className: "bg-black text-white",
                  }}
                />
              </DropdownItem>
              <DropdownSection
                title="Account"
                className="mt-4 font-bold"
                classNames={{
                  heading: "text-md",
                }}
              >
                <DropdownItem
                  key="my-account"
                  className="w-80"
                  startContent={<i className="ri-account-box-line text-xl"></i>}
                  onPress={() => {
                    router.push("/admin/account");
                  }}
                >
                  <span className="text-md ml-4">My account</span>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection
                title="Support"
                className="mt-4 font-bold"
                classNames={{
                  heading: "text-md",
                }}
              >
                <DropdownItem
                  key="submit-feedback"
                  className="w-80"
                  startContent={<i className="ri-feedback-line text-xl"></i>}
                  onPress={() => {
                    setFeedbackSuccess(undefined);
                    onOpen();
                  }}
                >
                  <span className="text-md ml-4">Submit feedback</span>
                </DropdownItem>
              </DropdownSection>
              <DropdownItem
                key="delete"
                className="text-danger w-80"
                color="danger"
                startContent={<i className="ri-logout-box-line text-xl"></i>}
                onPress={() => {
                  handleSignOut();
                }}
              >
                <span className="text-md ml-4">Sign out </span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden items-center" justify="center">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/admin">
            <Image
              src={`/images/logo-alt-${theme === "dark" ? "white" : "black"}.svg`}
              width={50}
              height={50}
              alt="Twiggle logo"
              className="md:hidden"
            />
            <Image
              src={`/images/twiggle-logo-${theme === "dark" ? "white" : "black"}.png`}
              width={200}
              height={50}
              alt="Twiggle logo"
              className="hidden md:inline"
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent
        className="sm:hidden gap-8 w-full justify-between items-center"
        justify="end"
      >
        <Snippet
          symbol=""
          variant="flat"
          size="lg"
          color="secondary"
          codeString={`https://twgl.link/${profileData.username}`}
        >
          Share me
        </Snippet>
        <Dropdown>
          <DropdownTrigger>
            <Avatar
              isBordered
              name={profileData.profileTitle[0]?.toUpperCase() || "@"}
              as="button"
              className="bg-black text-white"
              src={profileData.avatarUrl}
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
            className="p-5"
            disabledKeys={["user"]}
          >
            <DropdownItem isReadOnly key="user" className="w-60 opacity-100">
              <User
                name={`@${
                  profileData.profileTitle.replace(/\b\w/g, (c: string) =>
                    c.toUpperCase()
                  ) ||
                  profileData.profileTitle ||
                  ""
                }`}
                description={`twgl.link/${profileData.username}`}
                classNames={{
                  name: "font-semibold mb-1 ml-2",
                  description: "text-default-500 ml-2",
                }}
                avatarProps={{
                  size: "md",
                  src: profileData.avatarUrl,
                }}
              />
            </DropdownItem>
            <DropdownSection
              title="Account"
              className="mt-4 font-bold"
              classNames={{
                heading: "text-md",
              }}
            >
              <DropdownItem
                key="my-account"
                className="w-60"
                startContent={<i className="ri-account-box-line text-xl"></i>}
                onPress={() => {
                  router.push("/admin/account");
                }}
              >
                <span className="text-md ml-4">My account</span>
              </DropdownItem>
            </DropdownSection>
            <DropdownSection
              title="Support"
              className="mt-4 font-bold"
              classNames={{
                heading: "text-md",
              }}
            >
              <DropdownItem
                key="submit-feedback"
                className="w-60"
                startContent={<i className="ri-feedback-line text-xl"></i>}
                onPress={() => {
                  setFeedbackSuccess(undefined);
                  onOpen();
                }}
              >
                <span className="text-md ml-4">Submit feedback</span>
              </DropdownItem>
            </DropdownSection>
            <DropdownItem
              key="delete"
              className="text-danger w-60"
              color="danger"
              startContent={<i className="ri-logout-box-line text-xl"></i>}
              onPress={() => {
                handleSignOut();
              }}
            >
              <span className="text-md ml-4">Sign out </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <NavbarMenuToggle />
      </NavbarContent>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={feedbackModalSize}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Submit a feedback
              </ModalHeader>
              <ModalBody>
                <span className="text-default-500 mt-5 mb-3 text-justify">
                  Please tell us your concerns! There is no wrong feedback.
                </span>
                <Textarea
                  placeholder="Type here..."
                  value={feedbackContent}
                  className="col-span-12 md:col-span-6 mb-6 md:mb-3"
                  onChange={handleFeedbackChange}
                  autoFocus
                />
                {feedbackSuccess === true && (
                  <span className="text-success-600">
                    Your feedback has been sent!
                  </span>
                )}
                {feedbackSuccess === false && (
                  <span className="text-danger-600">
                    Error sending feedback! Please try again!
                  </span>
                )}
              </ModalBody>
              <ModalFooter>
                <div className="w-full flex gap-5">
                  <Button
                    color="success"
                    variant="ghost"
                    fullWidth
                    radius="full"
                    size="lg"
                    onPress={sendFeedback}
                  >
                    Send
                  </Button>
                  <Button
                    onPress={onClose}
                    variant="ghost"
                    fullWidth
                    radius="full"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <NavbarMenu>
        <NavbarContent
          className="basis-1/5 sm:basis-full flex flex-col"
          justify="start"
        >
          <NavbarItem>
            <NextLink href="/admin">
              <Button
                radius="full"
                size="lg"
                variant="light"
                startContent={<i className="ri-stacked-view"></i>}
                className={`flex items-center text-default-500 gap-2 ${
                  option === "Links" ? "font-bold text-default-foreground" : ""
                }`}
              >
                <span className="">Links</span>
              </Button>
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink href="/admin/appearance">
              <Button
                radius="full"
                size="lg"
                variant="light"
                startContent={<i className="ri-shapes-line"></i>}
                className={`flex items-center text-default-500 gap-2 ${
                  option === "Appearance"
                    ? "font-bold text-default-foreground"
                    : ""
                }`}
              >
                <span className="">Appearance</span>
              </Button>
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink href="/admin/settings">
              <Button
                radius="full"
                size="lg"
                variant="light"
                startContent={<i className="ri-settings-line"></i>}
                className={`flex items-center text-default-500 gap-2 ${
                  option === "Settings"
                    ? "font-bold text-default-foreground"
                    : ""
                }`}
              >
                <span className="">Settings</span>
              </Button>
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink href="/admin/marketplace">
              <Button
                radius="full"
                size="lg"
                variant="light"
                startContent={<i className="ri-store-2-line"></i>}
                className={`flex items-center text-default-500 gap-2 ${
                  option === "Marketplace"
                    ? "font-bold text-default-foreground"
                    : ""
                }`}
              >
                <span className="">Marketplace</span>
              </Button>
            </NextLink>
          </NavbarItem>
        </NavbarContent>
      </NavbarMenu>
    </NextUINavbar>
  );
};
