import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta: Meta<typeof Sheet> = {
  title: "UI/Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Inspector</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Card Inspector</SheetTitle>
          <SheetDescription>View and edit properties of the selected card.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium">Title</h4>
            <p className="text-sm text-muted-foreground">Sprint 42 retrospective</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Assignees</h4>
            <p className="text-sm text-muted-foreground">John Doe, Alex Chen</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left Panel</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Quick access to your boards.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
