import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent>Account settings content.</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent>Password settings content.</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Segmented: Story = {
  render: () => (
    <Tabs defaultValue="day" className="w-[300px]">
      <TabsList>
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};
