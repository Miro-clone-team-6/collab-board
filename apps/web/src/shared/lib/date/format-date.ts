const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

export function formatDate(date: Date | string) {
  return formatter.format(new Date(date));
}
