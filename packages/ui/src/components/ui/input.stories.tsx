import type { Meta, StoryObj } from "@storybook/react";
import { EyeOff, Search } from "lucide-react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number", "file"] },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Текстовые поля высотой 44px (стандарт Figma). Поддерживают состояния default, hover, focused, error, disabled. Для иконок используйте относительное позиционирование обёртки.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter board name",
  },
};

export const Filled: Story = {
  args: {
    defaultValue: "Sprint Retrospective",
    placeholder: "Enter board name",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Archived Project",
    defaultValue: "Legacy Architecture",
  },
};

export const FileInput: Story = {
  args: {
    type: "file",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email-with-label" className="text-sm font-medium text-foreground">
        Workspace Email
      </label>
      <Input type="email" id="email-with-label" placeholder="invalid@team.com" />
      <p className="text-xs text-destructive">Please enter a valid email address</p>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input id="search-leading" className="pl-9" placeholder="Search templates, frames..." />
    </div>
  ),
};

export const WithTrailingIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Input
        id="password-trailing"
        type="password"
        defaultValue="secretpassword"
        className="pr-9"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label="Toggle password visibility"
      >
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email-error" className="text-sm font-medium text-destructive">
        Workspace Email
      </label>
      <Input
        id="email-error"
        type="email"
        defaultValue="invalid@team"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">Please enter a valid email address</p>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="state-default" className="text-sm font-medium">
          Default
        </label>
        <Input id="state-default" placeholder="Default state" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="state-filled" className="text-sm font-medium">
          Filled
        </label>
        <Input id="state-filled" defaultValue="Filled value" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="state-error" className="text-sm font-medium text-destructive">
          Error
        </label>
        <Input id="state-error" defaultValue="Error state" className="border-destructive" />
        <p className="text-xs text-destructive">Error message here</p>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="state-disabled" className="text-sm font-medium text-muted-foreground">
          Disabled
        </label>
        <Input id="state-disabled" disabled placeholder="Disabled state" />
      </div>
    </div>
  ),
};
