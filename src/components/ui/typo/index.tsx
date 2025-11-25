import React from "react";

import styles from "./styles.module.scss";

type TypographyVariant =
  | "display"
  | "headline"
  | "bodyLarge"
  | "body"
  | "subtext"
  | "caption";

type TypoProps<T extends React.ElementType = "span"> = {
  as?: T;
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "variant" | "children" | "className"
>;

const Typo = <T extends React.ElementType = "span">({
  as,
  variant = "body",
  children,
  className,
  ...props
}: TypoProps<T>) => {
  const Component = as || "span";

  const variantClass = styles[variant];
  const combinedClassName = `${variantClass} ${className || ""}`.trim();

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

Typo.Display = (props: any) => <Typo variant="display" {...props} />;
Typo.Headline = (props: any) => <Typo variant="headline" {...props} />;
Typo.BodyLarge = (props: any) => <Typo variant="bodyLarge" {...props} />;
Typo.Body = (props: any) => <Typo variant="body" {...props} />;
Typo.Subtext = (props: any) => <Typo variant="subtext" {...props} />;
Typo.Caption = (props: any) => <Typo variant="caption" {...props} />;

export default Typo;
