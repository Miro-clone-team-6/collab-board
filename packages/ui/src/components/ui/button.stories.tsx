// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI Kit/Button",
  component: Button,
  tags: ["autodocs"],
  // 👇 ЭТО добавляет интерактивную панель "Controls" внизу
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive"],
      description: "Визуальный стиль кнопки",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Размер кнопки",
    },
    disabled: {
      control: "boolean",
      description: "Блокирует кнопку",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. Основная кнопка
export const Default: Story = {
  args: {
    children: "Создать доску",
    variant: "default",
    size: "default",
  },
};

// 2. Второстепенная
export const Secondary: Story = {
  args: {
    children: "Отмена",
    variant: "secondary",
  },
};

// 3. Контурная
export const Outline: Story = {
  args: {
    children: "Поделиться",
    variant: "outline",
  },
};

// 4. Призрачная (для меню и тулбаров)
export const Ghost: Story = {
  args: {
    children: "Подробнее",
    variant: "ghost",
  },
};

// 5. Опасное действие
export const Destructive: Story = {
  args: {
    children: "Удалить workspace",
    variant: "destructive",
  },
};

// 6. С иконкой
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="mr-2 h-4 w-4" />
        Новый элемент
      </>
    ),
  },
};

// 7. Только иконка (размер icon)
export const IconOnly: Story = {
  args: {
    variant: "ghost",
    size: "icon",
    children: <Trash2 className="h-4 w-4" />,
  },
};

// 8. Состояние загрузки
export const Loading: Story = {
  args: {
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Сохранение...
      </>
    ),
    disabled: true,
  },
};
