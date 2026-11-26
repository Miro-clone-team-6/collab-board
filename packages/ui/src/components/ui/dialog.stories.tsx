import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Dialog> = {
  title: "UI/Overlays/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new board</DialogTitle>
          <DialogDescription>
            Enter a name and description for your new collaborative board.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Board name</Label>
            <Input id="name" placeholder="Q4 Planning" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create board</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete board</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this board?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All cards, comments and history will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
