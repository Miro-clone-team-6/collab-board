import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Form/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Кастомный чекбокс с поддержкой промежуточного состояния (indeterminate).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="default" />
      <Label htmlFor="default">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Already accepted</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled">Disabled</Label>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex items-start space-x-2">
      <Checkbox id="desc" className="mt-1" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="desc">Enable notifications</Label>
        <p className="text-sm text-muted-foreground">Receive daily digests about board activity.</p>
      </div>
    </div>
  ),
};
