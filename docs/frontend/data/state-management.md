# 🧠 Управление состоянием (State Management)

В интерактивном приложении доски (Miro clone) состояние делится на принципиально разные категории. Неправильный выбор инструмента приводит к потере производительности и лишним ререндерам.

---

## 1. 🌲 Дерево решений: «Где хранить состояние?»

```text
Какое состояние вам нужно сохранить?
│
├── 1. Данные пришли с бэкенда (список досок, данные профиля, воркспейсы)?
│   └── ► TanStack Query (Server State в @packages/api)
│
├── 2. Интерактивное состояние холста (координаты зума/панорамы, курсоры, drag-and-drop, активный инструмент)?
│   └── ► Zustand (Client Real-time Canvas State)
│
├── 3. Состояние формы (ввод в текстовые поля, создание доски, ошибки валидации)?
│   └── ► React Hook Form + Zod (@packages/dto)
│
└── 4. Состояние нужно строго одному компоненту (открыт ли dropdown, hover, локальный тултип)?
    └── ► useState / useReducer (Local React State)
```

---

## 2. Сводная матрица инструментов

| Тип состояния | Инструмент | Где располагается | Примеры |
|---|---|---|---|
| **Серверные данные** | `TanStack Query` | `entities/<name>/model/` | Список досок, участники воркспейса |
| **Состояние холста** | `Zustand` | `widgets/board-canvas/model/` | Zoom, pan offset, selected element IDs, active drawing tool |
| **Формы** | `React Hook Form` | `features/<name>/ui/` | Форма логина, создание новой доски |
| **Валидация** | `Zod` | `@packages/dto` | `CreateBoardSchema`, `CreateUserSchema` |
| **Локальный UI стейт** | `useState` | Внутри компонента | Переключатель `isOpen` в выпадающем меню |

---

## 3. Пример: Zustand Store для состояния холста

Состояние зума, панорамирования и выбранного инструмента меняется очень часто (например, при движении мыши `60fps`). Оно выносится в Zustand с селекторами, чтобы не ререндерить всё дерево компонентов:

```ts
// widgets/board-canvas/model/canvas-store.ts
import { create } from "zustand";

interface CanvasViewportState {
  zoom: number;
  panX: number;
  panY: number;
  activeTool: "select" | "sticky" | "arrow" | "rectangle";
  selectedIds: string[];
  setViewport: (panX: number, panY: number, zoom: number) => void;
  setActiveTool: (tool: "select" | "sticky" | "arrow" | "rectangle") => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
}

export const useCanvasStore = create<CanvasViewportState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  activeTool: "select",
  selectedIds: [],
  setViewport: (panX, panY, zoom) => set({ panX, panY, zoom }),
  setActiveTool: (activeTool) => set({ activeTool }),
  selectElement: (id, multi = false) =>
    set((state) => ({
      selectedIds: multi ? [...state.selectedIds, id] : [id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
}));
```

Использование в компоненте тулбара с точечным селектором:
```tsx
// widgets/board-toolbar/ui/Toolbar.tsx
import { useCanvasStore } from "@/widgets/board-canvas";

export function BoardToolbar() {
  // Компонент перерендерится ТОЛЬКО при смене activeTool, игнорируя частые изменения panX/panY!
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);

  return (
    <div className="flex gap-2 p-2 bg-card border rounded-xl shadow-lg">
      <button
        onClick={() => setActiveTool("select")}
        className={activeTool === "select" ? "bg-primary text-primary-foreground" : ""}
      >
        Курсор
      </button>
      <button
        onClick={() => setActiveTool("sticky")}
        className={activeTool === "sticky" ? "bg-primary text-primary-foreground" : ""}
      >
        Стикер
      </button>
    </div>
  );
}
```

---

## 4. Пример: React Hook Form + Zod

```tsx
// features/create-board/ui/CreateBoardForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBoardSchema, type CreateBoardDto } from "@packages/dto";

export function CreateBoardForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBoardDto>({
    resolver: zodResolver(CreateBoardSchema),
  });

  const onSubmit = async (values: CreateBoardDto) => {
    // вызов мутации из @packages/api
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Название доски</label>
        <input
          {...register("title")}
          placeholder="Например: Спринт 42"
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        Создать доску
      </button>
    </form>
  );
}
```
