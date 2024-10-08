import { NbGlobalPosition } from "@nebular/theme";

export interface ToastrModel {
    destroyByClick: boolean;
    duration: number;
    hasIcon: boolean;
    position: NbGlobalPosition;
    preventDuplicate: boolean;
}