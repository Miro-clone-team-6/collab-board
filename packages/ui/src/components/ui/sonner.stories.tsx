import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

const meta: Meta = {
  title: "UI/Feedback/Toast (Sonner)",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster richColors position="top-right" />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
        })
      }
    >
      Show Toast
    </Button>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => toast.success("Board saved successfully")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Failed to connect to server")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Your session expires in 5 minutes")}>
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("New comment", {
            description: "Alex mentioned you in Sprint 42",
            action: {
              label: "View",
              onClick: () => console.log("View clicked"),
            },
          })
        }
      >
        With Action
      </Button>
    </div>
  ),
};
