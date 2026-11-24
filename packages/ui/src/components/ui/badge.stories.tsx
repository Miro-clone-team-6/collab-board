import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Компактные метки для статусов, тегов и категорий. Поддерживает 4 варианта оформления.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const StatusTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="destructive">Archived</Badge>
      <Badge variant="outline">Pending</Badge>
    </div>
  ),
};

export const WorkspaceTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-tag-strategy text-tag-strategy-text hover:bg-tag-strategy/80">
        Strategy
      </Badge>
      <Badge className="bg-tag-design text-tag-design-text hover:bg-tag-design/80">
        Design Team
      </Badge>
      <Badge className="bg-tag-engineering text-tag-engineering-text hover:bg-tag-engineering/80">
        Engineering
      </Badge>
      <Badge className="bg-tag-roadmap text-tag-roadmap-text hover:bg-tag-roadmap/80">
        Roadmap
      </Badge>
      <Badge className="bg-tag-scrum text-tag-scrum-text hover:bg-tag-scrum/80">
        Scrum & Agile
      </Badge>
    </div>
  ),
};
