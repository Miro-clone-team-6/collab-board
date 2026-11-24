import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/Navigation/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>
            <div className="text-sm">v1.2.0-beta.{i}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
