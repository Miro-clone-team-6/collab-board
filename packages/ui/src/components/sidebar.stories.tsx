import type { Meta, StoryObj } from "@storybook/react";
import {
  Clock,
  LayoutGrid,
  Plus,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Боковая панель навигации. Принимает секции с пунктами, кнопку главного действия и опциональный футер (например, для промо AI).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const mockLogo = (
  <div className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <LayoutGrid className="h-5 w-5" aria-hidden="true" />
    </div>
    BoardFlow
  </div>
);

const mockSections = [
  {
    title: "Workspaces",
    items: [
      {
        icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
        label: "All Boards",
        active: true,
      },
      { icon: <Clock className="h-4 w-4" aria-hidden="true" />, label: "Recent Activity" },
      { icon: <Star className="h-4 w-4" aria-hidden="true" />, label: "Starred" },
      { icon: <Users className="h-4 w-4" aria-hidden="true" />, label: "Shared Workspaces" },
    ],
  },
  {
    title: "Archive & Tools",
    items: [
      { icon: <Trash2 className="h-4 w-4" aria-hidden="true" />, label: "Trash" },
      { icon: <Settings className="h-4 w-4" aria-hidden="true" />, label: "Workspace Settings" },
    ],
  },
];

export const Default: Story = {
  args: {
    logo: mockLogo,
    primaryAction: (
      <Button className="w-full">
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        New Board
      </Button>
    ),
    sections: mockSections,
  },
};

export const WithAIFooter: Story = {
  args: {
    ...Default.args,
    footer: (
      <div className="flex items-start gap-3 rounded-lg bg-ai-background p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ai-accent text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">BoardFlow AI</p>
          <p className="text-xs text-muted-foreground">
            Generate mindmaps, diagrams, and auto-layouts instantly.
          </p>
        </div>
        <Zap className="h-4 w-4 text-ai-accent" aria-hidden="true" />
      </div>
    ),
  },
};
