import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Form/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="john@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="req">
        Board name <span className="text-destructive">*</span>
      </Label>
      <Input id="req" placeholder="Q4 Planning" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="err" className="text-destructive">
        Workspace email
      </Label>
      <Input id="err" defaultValue="invalid" className="border-destructive" />
      <p className="text-xs text-destructive">Please enter a valid address</p>
    </div>
  ),
};
