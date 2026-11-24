import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Интерактивные кнопки с 4 основными вариантами (Primary, Secondary, Ghost, Destructive), 3 размерами и состояниями loading/disabled. Радиус 8px, transition 120ms.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Create Board",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Cancel",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "View All",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Link: Story = {
  args: {
    children: "Read more",
    variant: "link",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
        Login with Email
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "outline",
    size: "icon",
    children: <ArrowRight className="h-4 w-4" aria-hidden="true" />,
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Creating...
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="outline">
        <Mail className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex items-center gap-4 opacity-50">
        <Button variant="default" disabled>
          Default
        </Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
        <Button variant="destructive" disabled>
          Destructive
        </Button>
        <Button variant="link" disabled>
          Link
        </Button>
      </div>
    </div>
  ),
};
