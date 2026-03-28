export interface GeneralRoute {
    title: string;
    path: string;
    renderIcon: (isActive: boolean) => JSX.Element;
}

