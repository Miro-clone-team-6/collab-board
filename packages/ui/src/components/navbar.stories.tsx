import type { Meta, StoryObj } from "@storybook/react";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Navbar } from "./navbar";
import { Button } from "./ui/button";

const meta: Meta<typeof Navbar> = {
  title: "Layout/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Верхняя панель приложения. Содержит поиск, селектор воркспейса, статус синхронизации, уведомления и профиль пользователя.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    workspaceName: "Workspace: Design Team",
    syncStatus: { connected: true, label: "Live sync connected | v1.0.0" },
    notificationCount: 3,
    userInitials: "JD",
    userAvatar: "https://github.com/shadcn.png",
    rightActions: (
      <Button variant="ghost" size="icon">
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
      </Button>
    ),
  },
  render: (args) => {
    const [search, setSearch] = useState("");
    return <Navbar {...args} search={{ value: search, onChange: setSearch }} />;
  },
};

export const Disconnected: Story = {
  args: {
    ...Default.args,
    syncStatus: { connected: false, label: "Sync paused" },
    notificationCount: 0,
  },
  render: (args) => {
    const [search, setSearch] = useState("");
    return <Navbar {...args} search={{ value: search, onChange: setSearch }} />;
  },
};
