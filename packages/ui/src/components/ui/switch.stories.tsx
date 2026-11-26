import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Form/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Переключатель для бинарных настроек (вкл/выкл).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="default" />
      <Label htmlFor="default">Airplane mode</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="checked" defaultChecked />
      <Label htmlFor="checked">Notifications enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled" disabled />
      <Label htmlFor="disabled">Unavailable</Label>
    </div>
  ),
};

export const SettingsRow: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="email">Email notifications</Label>
          <p className="text-sm text-muted-foreground">Daily digests</p>
        </div>
        <Switch id="email" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="telegram">Telegram alerts</Label>
          <p className="text-sm text-muted-foreground">Instant messages</p>
        </div>
        <Switch id="telegram" />
      </div>
    </div>
  ),
};
