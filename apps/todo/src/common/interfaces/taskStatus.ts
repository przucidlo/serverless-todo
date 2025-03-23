export enum TaskStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export const toTaskStatus = (value: string) => {
  switch (value) {
    case "NEW":
      return TaskStatus.NEW;
    case "IN_PROGRESS":
      return TaskStatus.IN_PROGRESS;
    case "DONE":
      return TaskStatus.DONE;
    default:
      throw new Error("Value does not match TaskStatus");
  }
}
