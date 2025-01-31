import { Injectable, inject } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private messageService = inject(MessageService);

  show(message: string, title: string, severity: string, key: string) {
    this.messageService.add({
      key: key,
      detail: message,
      severity: severity,
      summary: title,
    });
  }

  success(message: string, title: string = "Success") {
    this.show(message, title, "success", "global");
  }

  info(message: string, title: string = "Info") {
    this.show(message, title, "info", "global");
  }

  error(message: string, title: string = "Error") {
    this.show(message, title, "error", "global");
  }

  warn(message: string, title: string = "Warning") {
    this.show(message, title, "warn", "global");
  }
}
