import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Аватары пользователей с fallback на инициалы. Поддерживает группировку в стек (Collaborator Stacks) с отрицательным отступом.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="broken-link.jpg" alt="Broken" />
      <AvatarFallback>ER</AvatarFallback>
    </Avatar>
  ),
};

export const CollaboratorStack: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
        <AvatarFallback>AP</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background bg-primary text-primary-foreground">
        <AvatarFallback>+4</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-sm">MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarFallback className="text-base">LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
