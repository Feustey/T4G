import { MouseEventHandler, ReactElement, ReactNode } from "react";

export namespace AvatarElement {
  export interface Props {
    size?: "small" | "medium" | "large" | "fit";
    user?: { id?: string; firstname: string; lastname: string; email: string };
    isHidden?: boolean;
    url?: string;
    fetchUrl?: string;
  }
}

export namespace ButtonElement {
  export interface Props {
    children: string | ReactElement;
    variant: {
      text: string;
      border: string;
      height: string;
      disabled?: string;
      active?: string;
      hover?: string;
      width?: string;
      margin?: string;
    };
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
  }
}

export namespace CardElement {
  export interface Props {
    components: {
      topLeft?: ReactNode;
      topRight?: ReactNode;
      bottomLeft?: ReactNode;
      body?: ReactNode;
    };
    title?: string;
    body?: string;
    variant?: "borderless" | "default";
    divider?: boolean;
  }
}

export namespace CheckboxElement {
  export interface Props {
    name: string;
    label: string | ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    onChange?: React.ChangeEventHandler; //(e.target as HTMLInputElement).checked;
    className?: string;
    checked?: boolean;
  }
}

export namespace DividerElement {
  export interface Props {
    bleeding?: boolean;
    spacing?: string;
  }
}

export namespace LinkCardElement {
  export interface Props {
    footerOffset?: number;
    components: {
      topLeft?: ReactNode;
      topRight?: ReactNode;
      bottomLeft?: ReactNode;
      body?: ReactNode;
    };
    link: {
      text: string;
      href: string;
    };
    title?: string;
    body?: string;
  }
}

export namespace LinkElement {
  export interface Props {
    href: string;
    children: string | ReactElement;
    variant?: "highlight" | "default" | { text: string; hover: string };
    onClick?: MouseEventHandler<HTMLDivElement>;
    disabled?: boolean;
    openNewTab?: boolean;
    truncate?: boolean;
  }
}

export namespace LogoElement {
  export interface Props {
    className?: string;
    variant?: "t4g" | "default";
  }
}
export namespace NavigationLinkElement {
  export interface Props {
    label: string;
    url: string;
    urlMatcher: string;
    divider?: boolean;
    onClick?: () => void;
  }
}
export namespace OverlayNotificationElement {
  export interface Props {
    className: string;
    timer?: number;
    position?: number;
  }
}
export namespace ToasterElement {
  export interface Props {
    className: string;
    timer?: number;
  }
}
export namespace SelectElement {
  export type Variant = {
    text: string;
    chevron: string;
    border: string;
    list: string;
    active: {
      text: string;
      chevron: string;
      border: string;
    };
  };
  export interface Props {
    value?: string;
    inline?: boolean;
    zIndex?: number;
    listHeight?: number;
    label: string;
    id?: string;
    options: Array<{ label?: string; value: string | number }>;
    variant?: "default" | "theme" | Variant;
    status?: "active" | "disabled" | "default";
    isOpen?: boolean;
    handleChange: (value: string) => void;
  }
}

export namespace SelectFilterElement {
  export interface Props {
    title: string;
    filters: Array<{
      label: string;
      options: Array<{ value: string; label: string }>;
    }>;
    labels?: Array<string>;
    onChangeState: (filter: string, value: string) => void;
  }
}

export namespace ServiceCardElement {
  export interface Props {
    components: {
      topLeft?: ReactNode;
      topRight?: ReactNode;
      bottomLeft?: ReactNode;
      body?: ReactNode;
    };
    link: {
      text: string;
      href: string;
    };
    title?: string;
    body?: string;
  }
}

export namespace StarRatingElement {
  export interface Props {
    className?: string;
    rating?: number[];
    color?: string;
    onChange?: any;
  }
}

export namespace TextAreaInputElement {
  export interface Props {
    testid?: string;
    rows?: number;
    name?: string;
    label?: string;
    description?: React.ReactNode | string;
    descriptionPosition?: "rightOfLabel" | "bottomOfLabel";
    placeholder?: string;
    initialValue?: string;
    onChange?: React.ChangeEventHandler;
    onBlur?: React.ChangeEventHandler;
    errorMessage?: string;
    showError?: boolean;
    disabled?: boolean;
    value?: string;
    truncate?: boolean;
    textOpacity?: "lighter";
    visible?: boolean;
    className?: string;
  }
}

export namespace MarkdownInputElement {
  export interface Props {
    label: string;
    name: string;
    showError?: boolean;
    errorMessage?: string;
    value?: string;
    onChange: (value: string) => void;
  }
}

export namespace TextElement {
  export interface Props {
    as?:
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "p"
      | "span"
      | "blockquote"
      | "q"
      | "div";
    className?: string;
    children: ReactNode;
    visible?: boolean;
    variant?: "link" | "default";
    color?: string;
  }
}

export namespace TextIconElement {
  export interface Props {
    icon: ReactNode;
    children: ReactNode;
    iconPosition?: "left" | "right";
  }
}

export namespace TextInputElement {
  export interface Props {
    testid?: string;
    name?: string;
    label?: string;
    description?: React.ReactNode | string;
    descriptionPosition?: "rightOfLabel" | "bottomOfLabel";
    placeholder?: string;
    initialValue?: string;
    type?: "email" | "text" | "number";
    onChange?: React.ChangeEventHandler;
    onBlur?: React.ChangeEventHandler;
    errorMessage?: string;
    showError?: boolean;
    disabled?: boolean;
    value?: string;
    truncate?: boolean;
    textOpacity?: "lighter";
    visible?: boolean;
    className?: string;
    min?: number;
    max?: number;
  }
}
