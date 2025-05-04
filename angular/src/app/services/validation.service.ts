import { EventEmitter } from "@angular/core";

export interface Validatable {
    validationChanged: EventEmitter<ValidationState>;
    runValidation(): void;
}
export enum ValidationState {
    VALID, INVALID, OPTIONAL
}